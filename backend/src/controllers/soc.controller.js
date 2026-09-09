/**
 * soc.controller.js — TOR Sentinel 2.0
 * Unified Controller for Operational SOC Integration Layer (RFT 26/2026)
 */

const socSiemService = require('../services/socSiemService');
const socDetectionEngine = require('../services/socDetectionEngine');
const socThreatIntelService = require('../services/socThreatIntelService');
const socTimeIntegrityService = require('../services/socTimeIntegrityService');
const socAuditService = require('../services/socAuditService');
const socRetentionService = require('../services/socRetentionService');
const socHuntingService = require('../services/socHuntingService');
const caseService = require('../services/caseService');
const { getDB } = require('../config/database');
const logger = require('../utils/logger');

const socController = {
  /**
   * High-level operational SOC executive overview
   */
  getOverview: async (req, res) => {
    try {
      const db = getDB();
      // Ensure seed logs exist
      socSiemService.ensureSeedLogs();

      const siemTotal = db.prepare('SELECT COUNT(*) as c FROM soc_siem_events').get().c;
      const criticalEvents = db.prepare("SELECT COUNT(*) as c FROM soc_siem_events WHERE severity = 'critical'").get().c;
      const tiMatches = db.prepare('SELECT COUNT(*) as c FROM soc_siem_events WHERE threat_intel_match = 1').get().c;
      const rules = socDetectionEngine.getAllRules();
      const iocStats = socThreatIntelService.getStatistics();
      const timeSync = socTimeIntegrityService.getSyncStatus();
      const retention = socRetentionService.getRetentionStatus();
      const hunts = socHuntingService.getAllHunts();

      res.json({
        success: true,
        data: {
          socProfile: {
            title: 'TOR Sentinel — Co-Managed SOC Operations Center',
            complianceStandard: 'RFT-26.2026 / ISO 27001:2022',
            slaTargetMonthly: '≥ 98.0%',
            slaAchievedPoc: '99.4%*',
            slaAttainmentNote: '*Synthetic/demo measurement pending continuous 30-day operational telemetry logging.',
            monitoringStatus: '24x7x365 AUTOMATED_ACTIVE',
            timeSynchronization: timeSync.status
          },
          siemMetrics: {
            totalEvents: siemTotal,
            criticalEvents,
            threatIntelMatches: tiMatches,
            supportedSourcesCount: 8
          },
          detectionEngineering: {
            totalRules: rules.length,
            activeRules: rules.filter(r => r.enabled).length,
            totalTriggers: rules.reduce((sum, r) => sum + (r.triggerCount || 0), 0)
          },
          threatIntelligence: iocStats,
          threatHunting: {
            totalHunts: hunts.length,
            activeHunts: hunts.filter(h => h.status === 'ACTIVE').length,
            concludedHunts: hunts.filter(h => h.status === 'CONCLUDED').length,
            rulesPromoted: hunts.filter(h => h.status === 'RULE_CONVERTED').length
          },
          timeIntegrity: {
            server: timeSync.primaryServer,
            offsetMs: timeSync.currentOffsetMs,
            driftPpm: timeSync.driftPpm,
            lastSyncHuman: timeSync.lastSyncHuman
          },
          retentionTiers: retention.tiers
        }
      });
    } catch (err) {
      logger.error(`SOC Overview error: ${err.message}`);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * SIEM Events
   */
  getSiemEvents: async (req, res) => {
    try {
      socSiemService.ensureSeedLogs();
      const events = socSiemService.getEvents(req.query);
      res.json({ success: true, count: events.length, data: events });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  ingestSiemLog: async (req, res) => {
    try {
      const result = Array.isArray(req.body)
        ? await socSiemService.ingestBatch(req.body)
        : await socSiemService.ingestEvent(req.body);

      // Record in audit log
      socAuditService.logAction({
        action: 'SIEM_LOG_INGESTED',
        resource: 'soc_siem_events',
        details: { count: Array.isArray(req.body) ? req.body.length : 1 }
      });

      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * MITRE ATT&CK Detection Rules
   */
  getDetectionRules: async (req, res) => {
    try {
      const rules = socDetectionEngine.getAllRules();
      res.json({ success: true, count: rules.length, data: rules });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  evaluateDetectionRules: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const evaluation = socDetectionEngine.evaluateRecentSiem(limit);
      res.json({ success: true, evaluation });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  toggleDetectionRule: async (req, res) => {
    try {
      const { id } = req.params;
      const { enabled } = req.body;
      const updated = socDetectionEngine.toggleRule(id, enabled);
      res.json({ success: true, rule: updated });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * Threat Intelligence IOCs
   */
  getThreatIntelIocs: async (req, res) => {
    try {
      const iocs = socThreatIntelService.getAllIocs(req.query);
      const stats = socThreatIntelService.getStatistics();
      res.json({ success: true, count: iocs.length, statistics: stats, data: iocs });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  addThreatIntelIoc: async (req, res) => {
    try {
      const ioc = socThreatIntelService.addIoc(req.body);
      socAuditService.logAction({
        action: 'IOC_REGISTERED',
        resource: `soc_threat_intel_iocs/${ioc.iocId}`,
        details: { type: ioc.type, value: ioc.value }
      });
      res.json({ success: true, ioc });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  matchThreatIntel: async (req, res) => {
    try {
      const { text } = req.body;
      const matches = socThreatIntelService.matchContent(text);
      res.json({ success: true, matchesCount: matches.length, matches });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * Threat Hunting Workspace
   */
  getThreatHunts: async (req, res) => {
    try {
      const hunts = socHuntingService.getAllHunts(req.query);
      res.json({ success: true, count: hunts.length, data: hunts });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  createThreatHunt: async (req, res) => {
    try {
      const hunt = socHuntingService.createHunt(req.body);
      res.json({ success: true, hunt });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  executeThreatHunt: async (req, res) => {
    try {
      const { id } = req.params;
      const result = socHuntingService.executeHuntQuery(id);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  promoteHuntToRule: async (req, res) => {
    try {
      const { id } = req.params;
      const result = socHuntingService.promoteHuntToRule(id, req.body);
      socAuditService.logAction({
        action: 'HUNT_PROMOTED_TO_RULE',
        resource: `soc_detection_rules/${result.promotedRule.ruleId}`,
        details: { huntId: id }
      });
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * Time Integrity
   */
  getTimeIntegrity: async (req, res) => {
    try {
      const status = socTimeIntegrityService.getSyncStatus();
      res.json({ success: true, data: status });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  triggerNtpSync: async (req, res) => {
    try {
      const syncResult = socTimeIntegrityService.performNtpSync(req.body.server);
      res.json({ success: true, syncResult });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * Audit Trails & RBAC
   */
  getAuditLogs: async (req, res) => {
    try {
      const logs = socAuditService.getAuditLogs(req.query);
      const roleMatrix = socAuditService.getRoleMatrix();
      res.json({ success: true, count: logs.length, roleMatrix, data: logs });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  verifyAuditLog: async (req, res) => {
    try {
      const { id } = req.params;
      const verification = socAuditService.verifyLogIntegrity(id);
      res.json({ success: true, verification });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * Tiered Retention
   */
  getRetentionStatus: async (req, res) => {
    try {
      const status = socRetentionService.getRetentionStatus();
      res.json({ success: true, data: status });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  createArchivePackage: async (req, res) => {
    try {
      const pkg = socRetentionService.createArchivePackage(req.body.notes);
      res.json({ success: true, package: pkg });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * Incident Response 7-Phase Lifecycle & Playbooks
   */
  updateCasePhase: async (req, res) => {
    try {
      const { id } = req.params;
      const { phase, notes, containmentStatus, rootCause, lessonsLearned } = req.body;
      const updatedCase = caseService.updateIncidentPhase(id, phase, { notes, containmentStatus, rootCause, lessonsLearned });
      socAuditService.logAction({
        action: 'INCIDENT_PHASE_UPDATED',
        resource: `cases/${id}`,
        details: { phase, containmentStatus }
      });
      res.json({ success: true, case: updatedCase });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  executeCasePlaybook: async (req, res) => {
    try {
      const { id } = req.params;
      const { action, parameters } = req.body;
      const result = caseService.executePlaybookAction(id, action, parameters);
      socAuditService.logAction({
        action: 'SOAR_PLAYBOOK_EXECUTED',
        resource: `cases/${id}`,
        details: { playbook: action, parameters }
      });
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * Operational Runbooks (RFT 26/2026 Process Layer)
   */
  getRunbooks: async (req, res) => {
    const runbooks = [
      {
        id: 'RUNBOOK-001',
        title: 'Dark-Web Threat Actor De-Anonymization & Infrastructure Triage',
        category: 'Threat Actor Attribution',
        classification: 'SECRET',
        targetThreats: ['T1090.003 Tor Multi-hop', 'T1584 Infrastructure Compromise'],
        steps: [
          'Verify target hidden service .onion availability and descriptor consistency via Onionoo /details.',
          'Execute TLS Certificate SAN sweep using crt.sh and Shodan to identify shared clearnet certificates.',
          'Cross-reference identified IP against Tor consensus to verify whether IP acts as a relay, bridge, or direct backend.',
          'Initiate Adaptive ATWC Latency Window calculation using current congestion factor Ct and rolling baseline B0.',
          'Ingest lawful network ingress/egress netflows and execute Gaussian correlation to narrow candidate origin servers.',
          'Generate and sign an Evidentiary Case Dossier preserving SHA-256 raw snapshot hashes for legal submission.'
        ]
      },
      {
        id: 'RUNBOOK-002',
        title: 'Adaptive ATWC Latency Correlation & Packet Timing Analysis',
        category: 'Network State Analytics',
        classification: 'RESTRICTED',
        targetThreats: ['T1048 Exfiltration Over Alternative Protocol'],
        steps: [
          'Verify Data Freshness Engine status for /details (ensure age < 10m).',
          'Calculate current congestion factor Ct = min(1, 0.6(Ot/Nt) + 0.4 max(0, 1 - Bt/B0)).',
          'Derive Estimated Network-State Latency Prior μ_prior = μ0(1 + 0.85 Ct) and σ_prior = σ0 √(1 + 1.25 Ct).',
          'Define adaptive correlation search window W = [μ_prior - 2.5σ_prior, μ_prior + 3.0σ_prior].',
          'Correlate suspect packet burst timestamps against ISP egress flow records within window W.',
          'Record attribution confidence percentage and attach forensic timestamp signature.'
        ]
      },
      {
        id: 'RUNBOOK-003',
        title: 'High-Bandwidth Tor Relay Flapping & Churn Investigation',
        category: 'Continuous Monitoring',
        classification: 'RESTRICTED',
        targetThreats: ['T1562 Impair Defenses', 'Denial of Service'],
        steps: [
          'Inspect Relay Delta Engine for relays categorized under STATUS_CHANGED or NOT_OBSERVED.',
          'Check canonical exit policy diffing (Pt1 != Pt2) for sudden port 80/443 restriction shifts.',
          'Verify if overload_general_timestamp has been newly populated, indicating authority-detected memory/CPU starvation.',
          'Correlate relay departure with active case targets to determine if adversary is rotating infrastructure.'
        ]
      },
      {
        id: 'RUNBOOK-004',
        title: 'SOC Incident Containment & Evidentiary Dossier Legal Packaging',
        category: 'Incident Response & Governance',
        classification: 'TOP SECRET',
        targetThreats: ['Critical Ransomware / APT Compromise'],
        steps: [
          'Escalate Incident Case through 7-phase lifecycle: Detection -> Assessment -> Classification -> Response.',
          'Trigger automated SOAR Playbook: ISOLATE_HOST or BLOCK_IP_ON_FIREWALL with analyst authorization.',
          'Verify clock synchronization status (A.8.17) to ensure sub-millisecond timeline integrity.',
          'Export evidence bundle with non-repudiation SHA-256 signatures and chain-of-custody metadata compliant with Section 65B of the Indian Evidence Act.'
        ]
      }
    ];

    res.json({ success: true, count: runbooks.length, data: runbooks });
  }
};

module.exports = socController;
