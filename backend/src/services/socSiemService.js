/**
 * socSiemService.js — TOR Sentinel 2.0
 * SIEM-Lite Log Ingestion, Normalization & Enrichment Engine
 * Reference: RFT-26.2026 Terms of Reference (Centralized Log Management & 24x7 Monitoring)
 *
 * Supported Enterprise Log Sources:
 *   - WAF (Web Application Firewall)
 *   - Firewall / NetFlow
 *   - Active Directory / SSO (IAM)
 *   - AWS CloudTrail (Cloud Telemetry)
 *   - DNS (Resolver / Sinkhole)
 *   - VPN (Remote Access Gateway)
 *   - Endpoint EDR (Host Detection & Response)
 *   - Tor Sentinel Ingestion (Directory & Dark-Web Probes)
 */

const crypto = require('crypto');
const { getDB, toJson } = require('../config/database');
const logger = require('../utils/logger');

class SocSiemService {
  constructor() {
    this.parserVersion = '1.2.0';
  }

  uuid(prefix = 'EVT') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  /**
   * Ingest and normalize a single log event or batch
   */
  async ingestEvent(rawEvent, options = {}) {
    const db = getDB();
    const eventId = rawEvent.eventId || this.uuid();

    // 1. Normalize core ECS attributes
    const sourceType = rawEvent.sourceType || rawEvent.source_type || 'Unknown';
    const host = rawEvent.host || rawEvent.hostname || 'gateway-core-01';
    const sourceIp = rawEvent.sourceIp || rawEvent.source_ip || rawEvent.src_ip || null;
    const destIp = rawEvent.destIp || rawEvent.dest_ip || rawEvent.dst_ip || null;
    const sourcePort = parseInt(rawEvent.sourcePort || rawEvent.source_port || rawEvent.src_port, 10) || null;
    const destPort = parseInt(rawEvent.destPort || rawEvent.dest_port || rawEvent.dst_port, 10) || null;
    const protocol = (rawEvent.protocol || 'TCP').toUpperCase();
    const userIdentity = rawEvent.userIdentity || rawEvent.user || rawEvent.username || null;
    const action = (rawEvent.action || 'OBSERVE').toUpperCase();
    const severity = (rawEvent.severity || 'info').toLowerCase();
    const message = rawEvent.message || rawEvent.msg || `${sourceType} event observed on ${host}`;
    const eventTimestamp = rawEvent.timestamp ? new Date(rawEvent.timestamp).toISOString() : new Date().toISOString();

    // 2. Automated Threat Intel Matching (Cross-reference against IOC store)
    let threatIntelMatch = 0;
    let matchedIocId = null;

    if (sourceIp || destIp) {
      const matchStmt = db.prepare(`
        SELECT ioc_id, type, value, threat_actor_id, confidence, severity
        FROM soc_threat_intel_iocs
        WHERE value = ? OR value = ?
        LIMIT 1
      `);
      const matchedIoc = matchStmt.get(sourceIp, destIp);
      if (matchedIoc) {
        threatIntelMatch = 1;
        matchedIocId = matchedIoc.ioc_id;
        logger.info(`[SIEM] Threat Intel Match detected: ${matchedIoc.type}=${matchedIoc.value} (IOC: ${matchedIoc.ioc_id})`);
      }
    }

    // 3. Persist Normalized Event into soc_siem_events
    const stmt = db.prepare(`
      INSERT INTO soc_siem_events (
        event_id, source_type, host, source_ip, dest_ip, source_port, dest_port,
        protocol, user_identity, action, severity, message, raw_payload_json,
        normalized_fields_json, threat_intel_match, matched_ioc_id, event_timestamp, ingested_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(
      eventId,
      sourceType,
      host,
      sourceIp,
      destIp,
      sourcePort,
      destPort,
      protocol,
      userIdentity,
      action,
      threatIntelMatch ? 'critical' : severity,
      message,
      toJson(rawEvent.raw || rawEvent),
      toJson({
        parserVersion: this.parserVersion,
        geoCountry: rawEvent.country || (sourceIp?.startsWith('185.220.') ? 'LU' : 'US'),
        enrichedBy: 'TorSentinel-SIEM-Normalizer',
        ...options.extraMetadata
      }),
      threatIntelMatch,
      matchedIocId,
      eventTimestamp
    );

    // 4. Auto-escalate to System Alert if High/Critical or Threat Intel Match
    if (threatIntelMatch || severity === 'critical' || severity === 'high') {
      try {
        const Alert = require('../models/Alert');
        Alert.create({
          title: `[SIEM Alert] ${sourceType} Suspicious Activity on ${host}`,
          description: message,
          type: threatIntelMatch ? 'threat_intel_match' : 'siem_correlation',
          severity: threatIntelMatch ? 'critical' : severity,
          status: 'new',
          source: 'SOC-SIEM',
          metadata: {
            eventId,
            sourceType,
            sourceIp,
            destIp,
            matchedIocId,
            action
          },
          tags: ['siem', sourceType.toLowerCase(), severity]
        });
      } catch (err) {
        logger.warn(`[SIEM] Could not auto-generate alert: ${err.message}`);
      }
    }

    return {
      success: true,
      eventId,
      threatIntelMatch: Boolean(threatIntelMatch),
      matchedIocId,
      normalizedSeverity: threatIntelMatch ? 'critical' : severity
    };
  }

  /**
   * Batch log ingestion endpoint handler
   */
  async ingestBatch(events = []) {
    const results = [];
    for (const evt of events) {
      const res = await this.ingestEvent(evt);
      results.push(res);
    }
    return {
      success: true,
      ingestedCount: results.length,
      threatIntelHits: results.filter(r => r.threatIntelMatch).length,
      results
    };
  }

  /**
   * Query normalized SIEM events with filters and pagination
   */
  getEvents(filters = {}) {
    const db = getDB();
    let sql = 'SELECT * FROM soc_siem_events WHERE 1=1';
    const params = [];

    if (filters.sourceType && filters.sourceType !== 'all') {
      sql += ' AND source_type = ?';
      params.push(filters.sourceType);
    }
    if (filters.severity && filters.severity !== 'all') {
      sql += ' AND severity = ?';
      params.push(filters.severity);
    }
    if (filters.threatIntelMatch !== undefined) {
      sql += ' AND threat_intel_match = ?';
      params.push(filters.threatIntelMatch ? 1 : 0);
    }
    if (filters.search) {
      sql += ' AND (message LIKE ? OR source_ip LIKE ? OR dest_ip LIKE ? OR host LIKE ?)';
      const s = `%${filters.search}%`;
      params.push(s, s, s, s);
    }

    sql += ' ORDER BY event_timestamp DESC';

    const limit = parseInt(filters.limit, 10) || 50;
    const page = parseInt(filters.page, 10) || 1;
    const offset = (page - 1) * limit;

    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = db.prepare(sql).all(...params);

    return rows.map(r => ({
      id: r.id,
      eventId: r.event_id,
      sourceType: r.source_type,
      host: r.host,
      sourceIp: r.source_ip,
      destIp: r.dest_ip,
      sourcePort: r.source_port,
      destPort: r.dest_port,
      protocol: r.protocol,
      userIdentity: r.user_identity,
      action: r.action,
      severity: r.severity,
      message: r.message,
      threatIntelMatch: Boolean(r.threat_intel_match),
      matchedIocId: r.matched_ioc_id,
      eventTimestamp: r.event_timestamp,
      ingestedAt: r.ingested_at,
      rawPayload: JSON.parse(r.raw_payload_json || '{}'),
      normalizedFields: JSON.parse(r.normalized_fields_json || '{}')
    }));
  }

  /**
   * Generates realistic simulated enterprise logs if DB is empty or for demo sweeps
   */
  ensureSeedLogs() {
    const db = getDB();
    const count = db.prepare('SELECT COUNT(*) as c FROM soc_siem_events').get().c;
    if (count >= 15) return count;

    const sampleLogs = [
      { sourceType: 'WAF', host: 'api-gateway-edge01', sourceIp: '185.220.101.47', destIp: '10.0.4.15', destPort: 443, protocol: 'HTTPS', action: 'BLOCK', severity: 'critical', message: 'WAF Rule #942100 triggered: SQLi probe from Tor exit IP 185.220.101.47' },
      { sourceType: 'Active Directory', host: 'dc01.corp.internal', sourceIp: '185.220.101.47', destIp: '10.0.1.10', destPort: 389, protocol: 'LDAP', userIdentity: 'svc_backup', action: 'LOGIN_FAILED', severity: 'high', message: 'Multiple brute-force Kerberos pre-authentication failures detected from Tor exit node' },
      { sourceType: 'Firewall', host: 'paloalto-core-fw', sourceIp: '10.0.8.22', destIp: '198.51.100.42', destPort: 9001, protocol: 'TCP', action: 'ALERT', severity: 'high', message: 'Unusual outbound session to known Tor Directory Authority port 9001' },
      { sourceType: 'AWS CloudTrail', host: 'cloudtrail-us-east-1', sourceIp: '185.220.101.5', destIp: '169.254.169.254', protocol: 'HTTPS', userIdentity: 'deploy-role', action: 'AssumeRoleWithWebIdentity', severity: 'medium', message: 'STS AssumeRole executed from foreign AS60729 Tor Exit Relay' },
      { sourceType: 'DNS', host: 'infoblox-dns01', sourceIp: '10.0.12.88', destIp: '8.8.8.8', destPort: 53, protocol: 'DNS', action: 'SINKHOLE', severity: 'high', message: 'Query for malicious C2 rendezvous darkphantom-market.onion.to routed to SOC sinkhole' },
      { sourceType: 'VPN', host: 'cisco-anyconnect-gw', sourceIp: '109.70.100.25', destIp: '10.0.0.1', destPort: 443, protocol: 'SSL-VPN', userIdentity: 'admin_sys', action: 'DENY', severity: 'high', message: 'Geo-velocity impossible travel alert: Login attempt within 4 mins of session in New Delhi' },
      { sourceType: 'Endpoint EDR', host: 'srv-db-finance01', sourceIp: '10.0.4.15', destIp: '185.220.101.47', destPort: 8443, protocol: 'TCP', userIdentity: 'SYSTEM', action: 'PROCESS_BLOCKED', severity: 'critical', message: 'CrowdStrike Falcon detected suspicious certutil download matching LockBit3 dropper hash' },
      { sourceType: 'Tor Sentinel Ingestion', host: 'sentinel-crawler-01', sourceIp: '185.220.101.47', destIp: '10.0.0.1', protocol: 'TLS', action: 'SAN_LEAK_DETECTED', severity: 'high', message: 'Asymmetric TLS SAN leak identified linking .onion hidden service to clearnet mirror' },
      { sourceType: 'Firewall', host: 'paloalto-core-fw', sourceIp: '10.0.4.15', destIp: '185.165.169.88', destPort: 443, protocol: 'HTTPS', action: 'ALLOW', severity: 'info', message: 'Standard HTTPS egress traffic permitted through gateway' },
      { sourceType: 'Active Directory', host: 'dc01.corp.internal', sourceIp: '10.0.8.10', destIp: '10.0.1.10', destPort: 88, protocol: 'Kerberos', userIdentity: 'analyst_alpha', action: 'LOGIN_SUCCESS', severity: 'info', message: 'Normal interactive workstation login' }
    ];

    for (const log of sampleLogs) {
      this.ingestEvent(log);
    }

    logger.info(`[SIEM] Seeded ${sampleLogs.length} simulated enterprise log events.`);
    return sampleLogs.length;
  }
}

module.exports = new SocSiemService();
