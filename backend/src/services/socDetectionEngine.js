/**
 * socDetectionEngine.js — TOR Sentinel 2.0
 * MITRE ATT&CK Aligned Detection Engineering Engine
 * Reference: RFT-26.2026 Terms of Reference (Detection Engineering & Use Case Development)
 *
 * Capabilities:
 *   - Maintained library of detection rules mapped to MITRE ATT&CK tactics/techniques
 *   - Batch & real-time rule evaluation across normalized SIEM events
 *   - Auto-escalation to System Alerts & Incident Cases
 *   - 1-Click Rule Generation from Threat Hunting Findings
 */

const { getDB, toJson } = require('../config/database');
const logger = require('../utils/logger');

class SocDetectionEngine {
  constructor() {
    this.engineVersion = '2.0.0';
  }

  uuid(prefix = 'RULE') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  /**
   * Fetch all detection rules with trigger stats
   */
  getAllRules() {
    const db = getDB();
    const rows = db.prepare(`
      SELECT * FROM soc_detection_rules
      ORDER BY trigger_count DESC, created_at DESC
    `).all();

    return rows.map(r => ({
      id: r.id,
      ruleId: r.rule_id,
      title: r.title,
      description: r.description,
      techniqueId: r.technique_id,
      tactic: r.tactic,
      severity: r.severity,
      queryLogic: JSON.parse(r.query_logic_json || '{}'),
      responseAction: r.response_action,
      enabled: Boolean(r.enabled),
      triggerCount: r.trigger_count,
      lastTriggeredAt: r.last_triggered_at,
      createdAt: r.created_at
    }));
  }

  /**
   * Fetch a single rule by ruleId
   */
  getRuleById(ruleId) {
    const db = getDB();
    const r = db.prepare('SELECT * FROM soc_detection_rules WHERE rule_id = ?').get(ruleId);
    if (!r) return null;
    return {
      id: r.id,
      ruleId: r.rule_id,
      title: r.title,
      description: r.description,
      techniqueId: r.technique_id,
      tactic: r.tactic,
      severity: r.severity,
      queryLogic: JSON.parse(r.query_logic_json || '{}'),
      responseAction: r.response_action,
      enabled: Boolean(r.enabled),
      triggerCount: r.trigger_count,
      lastTriggeredAt: r.last_triggered_at,
      createdAt: r.created_at
    };
  }

  /**
   * Create new detection rule (e.g. promoted from Threat Hunting)
   */
  createRule(data) {
    const db = getDB();
    const ruleId = data.ruleId || this.uuid();

    db.prepare(`
      INSERT INTO soc_detection_rules (
        rule_id, title, description, technique_id, tactic, severity, query_logic_json, response_action, enabled, trigger_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(
      ruleId,
      data.title,
      data.description || 'Promoted detection rule',
      data.techniqueId || 'T1090',
      data.tactic || 'Command and Control',
      data.severity || 'high',
      toJson(data.queryLogic || {}),
      data.responseAction || 'ALERT',
      data.enabled !== undefined ? (data.enabled ? 1 : 0) : 1
    );

    logger.info(`[Detection Engine] Created rule: ${ruleId} (${data.title})`);
    return this.getRuleById(ruleId);
  }

  /**
   * Enable or disable a detection rule
   */
  toggleRule(ruleId, enabled) {
    const db = getDB();
    db.prepare('UPDATE soc_detection_rules SET enabled = ? WHERE rule_id = ?').run(enabled ? 1 : 0, ruleId);
    return this.getRuleById(ruleId);
  }

  /**
   * Evaluate a set of events against active detection rules
   */
  evaluateEvents(events = []) {
    const db = getDB();
    const activeRules = this.getAllRules().filter(r => r.enabled);
    const triggeredFindings = [];

    const updateTriggerStmt = db.prepare(`
      UPDATE soc_detection_rules
      SET trigger_count = trigger_count + 1, last_triggered_at = datetime('now')
      WHERE rule_id = ?
    `);

    for (const event of events) {
      for (const rule of activeRules) {
        let isMatch = false;

        // Specialized rule matching logic
        switch (rule.ruleId) {
          case 'RULE-TOR-001':
            // Dark-Web / Tor Relay Exit to Critical Clearnet Asset
            if (event.threatIntelMatch || (event.destPort && [22, 3389, 443, 8080, 8443].includes(event.destPort) && event.severity === 'critical')) {
              isMatch = true;
            }
            break;

          case 'RULE-AUTH-002':
            // Credential Abuse from Flagged Sources
            if (event.sourceType === 'Active Directory' && event.action === 'LOGIN_FAILED') {
              isMatch = true;
            }
            break;

          case 'RULE-EXFIL-003':
            // Burst Data Outflow / High Severity Protocol Activity
            if (event.severity === 'high' && (event.protocol === 'HTTPS' || event.sourceType === 'Firewall')) {
              isMatch = true;
            }
            break;

          case 'RULE-SAN-004':
            // TLS Certificate SAN Leakage / Tor Sentinel Ingestion
            if (event.sourceType === 'Tor Sentinel Ingestion' || event.action === 'SAN_LEAK_DETECTED') {
              isMatch = true;
            }
            break;

          case 'RULE-CHURN-005':
            // Abrupt Churn / Status Changes
            if (event.action === 'STATUS_CHANGED' || event.action === 'BLOCK') {
              isMatch = true;
            }
            break;

          default:
            // Generic query match fallback
            if (rule.queryLogic?.sourceType && rule.queryLogic.sourceType === event.sourceType) {
              isMatch = true;
            }
            break;
        }

        if (isMatch) {
          updateTriggerStmt.run(rule.ruleId);
          triggeredFindings.push({
            ruleId: rule.ruleId,
            ruleTitle: rule.title,
            techniqueId: rule.techniqueId,
            tactic: rule.tactic,
            severity: rule.severity,
            eventId: event.eventId,
            sourceType: event.sourceType,
            sourceIp: event.sourceIp,
            destIp: event.destIp,
            action: event.action,
            message: event.message,
            timestamp: event.eventTimestamp || new Date().toISOString()
          });
        }
      }
    }

    return {
      evaluatedCount: events.length,
      rulesChecked: activeRules.length,
      triggeredCount: triggeredFindings.length,
      findings: triggeredFindings
    };
  }

  /**
   * Run evaluation against recent SIEM events in SQLite
   */
  evaluateRecentSiem(limit = 100) {
    const socSiemService = require('./socSiemService');
    const events = socSiemService.getEvents({ limit });
    return this.evaluateEvents(events);
  }
}

module.exports = new SocDetectionEngine();
