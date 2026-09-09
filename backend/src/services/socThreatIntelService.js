/**
 * socThreatIntelService.js — TOR Sentinel 2.0
 * Threat Intelligence Feed & IOC Store Management
 * Reference: RFT-26.2026 Terms of Reference (Threat Intelligence & Indicator Matching)
 *
 * Supported Indicator Types:
 *   - IP (Tor exit, C2 origin, bulletproof host)
 *   - Domain / Onion Address (.onion v3, clearnet mirror)
 *   - URL
 *   - Hash (SHA-256, MD5 malware dropper)
 *   - Email / PGP Key ID
 *   - Threat Actor / Campaign TTP
 */

const { getDB, toJson } = require('../config/database');
const logger = require('../utils/logger');

class SocThreatIntelService {
  constructor() {
    this.serviceVersion = '2.1.0';
  }

  uuid(prefix = 'IOC') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  /**
   * Fetch all IOCs with filtering and pagination
   */
  getAllIocs(filters = {}) {
    const db = getDB();
    let sql = 'SELECT * FROM soc_threat_intel_iocs WHERE 1=1';
    const params = [];

    if (filters.type && filters.type !== 'all') {
      sql += ' AND type = ?';
      params.push(filters.type);
    }
    if (filters.severity && filters.severity !== 'all') {
      sql += ' AND severity = ?';
      params.push(filters.severity);
    }
    if (filters.threatActorId) {
      sql += ' AND threat_actor_id = ?';
      params.push(filters.threatActorId);
    }
    if (filters.search) {
      sql += ' AND (value LIKE ? OR source LIKE ?)';
      const s = `%${filters.search}%`;
      params.push(s, s);
    }

    sql += ' ORDER BY confidence DESC, last_seen DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit, 10));
    }

    const rows = db.prepare(sql).all(...params);

    return rows.map(r => ({
      id: r.id,
      iocId: r.ioc_id,
      type: r.type,
      value: r.value,
      threatActorId: r.threat_actor_id,
      source: r.source,
      confidence: r.confidence,
      severity: r.severity,
      firstSeen: r.first_seen,
      lastSeen: r.last_seen,
      tags: JSON.parse(r.tags_json || '[]'),
      metadata: JSON.parse(r.metadata_json || '{}')
    }));
  }

  /**
   * Add new IOC indicator
   */
  addIoc(data) {
    const db = getDB();
    const iocId = data.iocId || this.uuid();

    db.prepare(`
      INSERT OR REPLACE INTO soc_threat_intel_iocs (
        ioc_id, type, value, threat_actor_id, source, confidence, severity, first_seen, last_seen, tags_json, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)
    `).run(
      iocId,
      data.type,
      data.value,
      data.threatActorId || null,
      data.source || 'Tor Sentinel Ingestion',
      data.confidence || 80,
      data.severity || 'high',
      data.firstSeen || new Date().toISOString(),
      toJson(data.tags || []),
      toJson(data.metadata || {})
    );

    logger.info(`[Threat Intel] Registered IOC: ${data.type}=${data.value} (Actor: ${data.threatActorId || 'Unlinked'})`);
    return this.getIocById(iocId);
  }

  getIocById(iocId) {
    const db = getDB();
    const r = db.prepare('SELECT * FROM soc_threat_intel_iocs WHERE ioc_id = ?').get(iocId);
    if (!r) return null;
    return {
      id: r.id,
      iocId: r.ioc_id,
      type: r.type,
      value: r.value,
      threatActorId: r.threat_actor_id,
      source: r.source,
      confidence: r.confidence,
      severity: r.severity,
      firstSeen: r.first_seen,
      lastSeen: r.last_seen,
      tags: JSON.parse(r.tags_json || '[]'),
      metadata: JSON.parse(r.metadata_json || '{}')
    };
  }

  /**
   * Match string/payload against all active IOCs
   */
  matchContent(text) {
    if (!text || typeof text !== 'string') return [];
    const allIocs = this.getAllIocs();
    const matches = [];

    for (const ioc of allIocs) {
      if (text.includes(ioc.value)) {
        matches.push(ioc);
      }
    }
    return matches;
  }

  /**
   * Summary stats for SOC dashboard
   */
  getStatistics() {
    const db = getDB();
    const total = db.prepare('SELECT COUNT(*) as c FROM soc_threat_intel_iocs').get().c;
    const byType = db.prepare('SELECT type, COUNT(*) as c FROM soc_threat_intel_iocs GROUP BY type').all();
    const bySeverity = db.prepare('SELECT severity, COUNT(*) as c FROM soc_threat_intel_iocs GROUP BY severity').all();
    const highConfidenceCount = db.prepare('SELECT COUNT(*) as c FROM soc_threat_intel_iocs WHERE confidence >= 90').get().c;

    return {
      totalIndicators: total,
      highConfidenceIndicators: highConfidenceCount,
      byType: byType.reduce((acc, r) => ({ ...acc, [r.type]: r.c }), {}),
      bySeverity: bySeverity.reduce((acc, r) => ({ ...acc, [r.severity]: r.c }), {})
    };
  }
}

module.exports = new SocThreatIntelService();
