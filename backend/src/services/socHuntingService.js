/**
 * socHuntingService.js — TOR Sentinel 2.0
 * Proactive Hypothesis-Driven Threat Hunting Workspace
 * Reference: RFT-26.2026 Terms of Reference (Proactive Threat Hunting & Attack Emulation)
 *
 * Hunting Flow:
 *   1. Formulate Threat Hypothesis (e.g. Asymmetric TLS SAN certificate reuse across clearnet mirrors)
 *   2. Map to MITRE ATT&CK Technique
 *   3. Execute Structured Hunt Query against historical SIEM events & Tor directory snapshots
 *   4. Record Findings & Correlated Evidence
 *   5. 1-Click Promotion of Verified Findings to a Permanent Detection Rule
 */

const { getDB, toJson } = require('../config/database');
const socDetectionEngine = require('./socDetectionEngine');
const socSiemService = require('./socSiemService');
const logger = require('../utils/logger');

class SocHuntingService {
  constructor() {
    this.version = '1.1.0';
  }

  uuid(prefix = 'HUNT') {
    return `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }

  /**
   * Fetch all threat hunts
   */
  getAllHunts(filters = {}) {
    const db = getDB();
    let sql = 'SELECT * FROM soc_threat_hunts WHERE 1=1';
    const params = [];

    if (filters.status && filters.status !== 'all') {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = db.prepare(sql).all(...params);

    return rows.map(r => ({
      id: r.id,
      huntId: r.hunt_id,
      title: r.title,
      hypothesis: r.hypothesis,
      techniqueId: r.technique_id,
      queryFilter: JSON.parse(r.query_filter_json || '{}'),
      status: r.status,
      leadAnalyst: r.lead_analyst,
      findingsCount: r.findings_count,
      findings: JSON.parse(r.findings_json || '[]'),
      createdAt: r.created_at,
      concludedAt: r.concluded_at
    }));
  }

  /**
   * Launch new threat hunt with hypothesis
   */
  createHunt(data) {
    const db = getDB();
    const huntId = data.huntId || this.uuid();

    db.prepare(`
      INSERT INTO soc_threat_hunts (
        hunt_id, title, hypothesis, technique_id, query_filter_json, status, lead_analyst, findings_count, findings_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      huntId,
      data.title,
      data.hypothesis,
      data.techniqueId || 'T1090',
      toJson(data.queryFilter || {}),
      data.status || 'ACTIVE',
      data.leadAnalyst || 'Analyst-Alpha',
      data.findings ? data.findings.length : 0,
      toJson(data.findings || [])
    );

    logger.info(`[Threat Hunting] Initiated hunt: ${huntId} - "${data.title}"`);
    return this.getHuntById(huntId);
  }

  getHuntById(huntId) {
    const db = getDB();
    const r = db.prepare('SELECT * FROM soc_threat_hunts WHERE hunt_id = ?').get(huntId);
    if (!r) return null;
    return {
      id: r.id,
      huntId: r.hunt_id,
      title: r.title,
      hypothesis: r.hypothesis,
      techniqueId: r.technique_id,
      queryFilter: JSON.parse(r.query_filter_json || '{}'),
      status: r.status,
      leadAnalyst: r.lead_analyst,
      findingsCount: r.findings_count,
      findings: JSON.parse(r.findings_json || '[]'),
      createdAt: r.created_at,
      concludedAt: r.concluded_at
    };
  }

  /**
   * Execute hunt query against SIEM historical events
   */
  executeHuntQuery(huntId) {
    const hunt = this.getHuntById(huntId);
    if (!hunt) return { error: 'Hunt not found' };

    // Query SIEM events using hunt filter
    const events = socSiemService.getEvents({
      sourceType: hunt.queryFilter?.sourceType,
      severity: hunt.queryFilter?.severity,
      limit: 100
    });

    const findings = events.slice(0, 5).map(e => `Observed match: ${e.sourceType} on ${e.host} (${e.sourceIp || 'Internal'} -> ${e.destIp || 'External'}): ${e.message}`);

    const db = getDB();
    db.prepare(`
      UPDATE soc_threat_hunts
      SET findings_count = ?, findings_json = ?
      WHERE hunt_id = ?
    `).run(findings.length, toJson(findings), huntId);

    return {
      huntId,
      matchedEventsCount: events.length,
      extractedFindings: findings,
      status: 'QUERY_EXECUTED'
    };
  }

  /**
   * 1-Click Promotion: Converts validated threat hunt query into a permanent detection rule
   */
  promoteHuntToRule(huntId, ruleOptions = {}) {
    const hunt = this.getHuntById(huntId);
    if (!hunt) throw new Error('Hunt not found');

    const ruleData = {
      ruleId: `RULE-HUNT-${Date.now().toString(36).toUpperCase()}`,
      title: ruleOptions.title || `Automated Detection: ${hunt.title}`,
      description: `Promoted from Threat Hunt ${hunt.huntId}. Hypothesis: ${hunt.hypothesis}`,
      techniqueId: hunt.techniqueId || 'T1090',
      tactic: ruleOptions.tactic || 'Command and Control',
      severity: ruleOptions.severity || 'high',
      queryLogic: hunt.queryFilter,
      responseAction: 'ALERT_AND_CONTAIN',
      enabled: true
    };

    const newRule = socDetectionEngine.createRule(ruleData);

    const db = getDB();
    db.prepare(`
      UPDATE soc_threat_hunts
      SET status = 'RULE_CONVERTED', concluded_at = datetime('now')
      WHERE hunt_id = ?
    `).run(huntId);

    logger.info(`[Threat Hunting] Promoted hunt ${huntId} to detection rule ${newRule.ruleId}`);
    return {
      success: true,
      huntId,
      promotedRule: newRule
    };
  }
}

module.exports = new SocHuntingService();
