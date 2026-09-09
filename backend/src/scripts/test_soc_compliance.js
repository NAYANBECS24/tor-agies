/**
 * test_soc_compliance.js — Automated SOC Integration & RFT 26/2026 Verification Suite
 * Tests all 10 core Operational SOC Integration components:
 *   1. Heterogeneous SIEM Log Ingestion & ECS Normalization
 *   2. Automated Threat Intel Matching on Ingested Logs
 *   3. MITRE ATT&CK Aligned Detection Engineering Engine
 *   4. Threat Intelligence IOC Registry & Fast Matcher
 *   5. Proactive Threat Hunting & 1-Click Rule Promotion
 *   6. Time Integrity, NTP Offset & Forensic Timestamp Signatures (A.8.17)
 *   7. Tamper-Evident Audit Trails & Non-Repudiation Verification
 *   8. 7-Phase Incident Response Lifecycle (A.5.24 - A.5.27)
 *   9. SOAR Automated Response Playbooks & Containment
 *   10. Tiered Log Retention (Hot, Warm, Archive) & Manifest Generation (A.8.15)
 */

const { connectDB, getDB } = require('../config/database');
const socSiemService = require('../services/socSiemService');
const socDetectionEngine = require('../services/socDetectionEngine');
const socThreatIntelService = require('../services/socThreatIntelService');
const socTimeIntegrityService = require('../services/socTimeIntegrityService');
const socAuditService = require('../services/socAuditService');
const socRetentionService = require('../services/socRetentionService');
const socHuntingService = require('../services/socHuntingService');
const caseService = require('../services/caseService');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log('═════════════════════════════════════════════════════════════════');
  console.log('  TOR Sentinel 2.0 — Operational SOC & RFT-26/2026 Verification  ');
  console.log('═════════════════════════════════════════════════════════════════\n');

  connectDB();
  const db = getDB();

  // ── TEST 1: SIEM-Lite Ingestion & Normalization ──────────────────────────────
  console.log('► Test 1: Heterogeneous SIEM Log Ingestion & ECS Normalization');
  const testLog = {
    sourceType: 'WAF',
    host: 'api-waf-prod-01',
    sourceIp: '185.220.101.5',
    destIp: '10.0.2.20',
    destPort: 443,
    protocol: 'HTTPS',
    action: 'BLOCK',
    severity: 'high',
    message: 'WAF Blocked SQL Injection attempt from external proxy'
  };

  const ingestRes = await socSiemService.ingestEvent(testLog);
  assert(ingestRes.success === true, 'SIEM log ingestion succeeded');
  assert(!!ingestRes.eventId, `Event assigned normalized ID: ${ingestRes.eventId}`);

  const savedEvt = db.prepare('SELECT * FROM soc_siem_events WHERE event_id = ?').get(ingestRes.eventId);
  assert(!!savedEvt, 'Event persisted in soc_siem_events table');
  assert(savedEvt.source_type === 'WAF', 'Normalized source_type is WAF');
  assert(savedEvt.protocol === 'HTTPS', 'Normalized protocol is HTTPS');

  // ── TEST 2: Automated Threat Intel Matching on Ingestion ─────────────────────
  console.log('\n► Test 2: Automated Threat Intel Matching on Ingested Telemetry');
  const tiLog = {
    sourceType: 'Firewall',
    host: 'edge-perimeter-fw',
    sourceIp: '185.220.101.47', // Matches IOC-001 in threat intel store
    destIp: '10.0.1.50',
    destPort: 8080,
    protocol: 'TCP',
    action: 'ALLOW',
    severity: 'medium',
    message: 'Outbound TCP connection to known ransomware exit node'
  };

  const tiRes = await socSiemService.ingestEvent(tiLog);
  assert(tiRes.threatIntelMatch === true, 'Threat Intel match automatically detected on IP 185.220.101.47');
  assert(tiRes.matchedIocId === 'IOC-001', 'Correctly linked to IOC-001 (ACTOR-001)');
  assert(tiRes.normalizedSeverity === 'critical', 'Severity automatically escalated to CRITICAL');

  // ── TEST 3: MITRE ATT&CK Detection Engineering Engine ────────────────────────
  console.log('\n► Test 3: MITRE ATT&CK Detection Engineering Engine');
  const rules = socDetectionEngine.getAllRules();
  assert(rules.length >= 5, `Detection library loaded with ${rules.length} active rules`);

  const torRule = rules.find(r => r.ruleId === 'RULE-TOR-001');
  assert(!!torRule, 'RULE-TOR-001 exists (T1090.003 Tor Multi-hop Proxy)');
  assert(torRule.tactic === 'Command and Control', 'RULE-TOR-001 mapped to Command and Control tactic');

  const evalRes = socDetectionEngine.evaluateEvents([
    { eventId: 'EVT-TEST-001', sourceType: 'Active Directory', action: 'LOGIN_FAILED', severity: 'high' },
    { eventId: 'EVT-TEST-002', sourceType: 'WAF', action: 'BLOCK', severity: 'critical', threatIntelMatch: true, destPort: 443 }
  ]);
  assert(evalRes.evaluatedCount === 2, 'Evaluated 2 test events');
  assert(evalRes.triggeredCount > 0, `Triggered ${evalRes.triggeredCount} detection findings`);

  // ── TEST 4: Threat Intelligence Feed & Fast Content Matching ──────────────────
  console.log('\n► Test 4: Threat Intelligence Feed & Fast IOC Matcher');
  const iocs = socThreatIntelService.getAllIocs();
  assert(iocs.length >= 5, `Retrieved ${iocs.length} IOC indicators from registry`);

  const payload = 'Observed hidden service rendezvous darkphantom-market.onion communicating with origin';
  const matches = socThreatIntelService.matchContent(payload);
  assert(matches.length > 0, 'Fast matcher detected darkphantom-market.onion in payload');
  assert(matches[0].threatActorId === 'ACTOR-001', 'Matched IOC correctly attributed to ACTOR-001');

  // ── TEST 5: Proactive Threat Hunting & 1-Click Rule Promotion ─────────────────
  console.log('\n► Test 5: Proactive Threat Hunting & 1-Click Rule Promotion');
  const hunts = socHuntingService.getAllHunts();
  assert(hunts.length >= 1, `Retrieved ${hunts.length} active threat hunts`);

  const huntQueryRes = socHuntingService.executeHuntQuery(hunts[0].huntId);
  assert(huntQueryRes.status === 'QUERY_EXECUTED', 'Threat hunt executed query against historical telemetry');

  const promoteRes = socHuntingService.promoteHuntToRule(hunts[0].huntId);
  assert(promoteRes.success === true, '1-Click rule promotion succeeded');
  assert(!!promoteRes.promotedRule.ruleId, `New detection rule registered: ${promoteRes.promotedRule.ruleId}`);

  // ── TEST 6: Time Integrity & NTP Drift Calibration (A.8.17) ───────────────────
  console.log('\n► Test 6: Time Integrity & Clock Synchronization Engine (A.8.17)');
  const timeStatus = socTimeIntegrityService.getSyncStatus();
  assert(timeStatus.status === 'SYNCHRONIZED', 'Clock synchronization status is SYNCHRONIZED');
  assert(timeStatus.primaryServer.includes('ntp'), `NTP Server verified: ${timeStatus.primaryServer}`);
  assert(typeof timeStatus.currentOffsetMs === 'number', `Clock offset calibrated: ${timeStatus.currentOffsetMs} ms`);

  const normTime = socTimeIntegrityService.normalizeTimestamp();
  assert(!!normTime.forensicSignature, 'Forensic timestamp signature generated (SHA-256)');
  assert(normTime.source.includes('NTP_SYNCED'), 'Timestamp provenance attributes NTP_SYNCED');

  // ── TEST 7: Tamper-Evident Audit Trails & Non-Repudiation ─────────────────────
  console.log('\n► Test 7: Tamper-Evident Audit Trails & Non-Repudiation');
  const auditRes = socAuditService.logAction({
    userId: 'ANALYST-TEST',
    username: 'Analyst-Alpha',
    role: 'INVESTIGATOR',
    action: 'CASE_EVIDENCE_ACCESSED',
    resource: 'cases/CASE-26151-001',
    details: { caseNumber: 'NTRO/CY/2024/001' }
  });
  assert(auditRes.success === true, 'Audit log entry recorded');
  assert(!!auditRes.signatureHash, `Cryptographic signature generated: ${auditRes.signatureHash.slice(0, 16)}...`);

  const verifyRes = socAuditService.verifyLogIntegrity(auditRes.auditId);
  assert(verifyRes.verified === true, 'Audit log cryptographic integrity verified');
  assert(verifyRes.tamperEvident === 'INTEGRITY_VERIFIED', 'Tamper-evident status confirmed');

  // ── TEST 8: 7-Phase Incident Response Lifecycle (A.5.24 - A.5.27) ─────────────
  console.log('\n► Test 8: 7-Phase Incident Response Lifecycle (A.5.24 - A.5.27)');
  const phaseRes = caseService.updateIncidentPhase('CASE-26151-001', 'RESPONSE', {
    author: 'Analyst-Alpha',
    notes: 'Escalated to RESPONSE following origin IP de-cloaking confirmation.',
    rootCause: 'TLS Certificate SAN leak on port 8443 exposed true Luxembourg host.'
  });
  assert(phaseRes.incidentPhase === 'RESPONSE', 'Case transitioned to incident phase: RESPONSE');
  assert(phaseRes.rootCause.includes('TLS Certificate SAN leak'), 'Root cause recorded in incident record');

  // ── TEST 9: SOAR Automated Response Playbooks & Containment ──────────────────
  console.log('\n► Test 9: SOAR Automated Response Playbooks & Containment');
  const playbookRes = caseService.executePlaybookAction('CASE-26151-001', 'BLOCK_IP_ON_FIREWALL', {
    targetIp: '185.220.101.47',
    firewallGroup: 'Perimeter-Edge-Blocked',
    analyst: 'Analyst-Alpha'
  });
  assert(playbookRes.success === true, 'SOAR Playbook BLOCK_IP_ON_FIREWALL executed');
  assert(playbookRes.case.containmentStatus === 'CONTAINED', 'Incident containment status updated to CONTAINED');
  assert(playbookRes.case.playbookActions.length > 0, 'Playbook execution logged in incident history');

  // ── TEST 10: Tiered Retention Architecture & Forensic Archive (A.8.15) ────────
  console.log('\n► Test 10: Tiered Retention Architecture & Forensic Archive (A.8.15)');
  const retention = socRetentionService.getRetentionStatus();
  assert(retention.tiers.hot.status === 'ACTIVE_ONLINE', 'Hot Tier active (< 30 days)');
  assert(retention.tiers.warm.status === 'SEARCHABLE_ONLINE', 'Warm Tier searchable (30d - 12mo)');
  assert(retention.tiers.cold.status === 'SEALED_VAULT', 'Cold Tier sealed (12 - 24+ mo)');

  const archivePkg = socRetentionService.createArchivePackage('Quarterly compliance archive');
  assert(!!archivePkg.archiveId, `Archive package created: ${archivePkg.archiveId}`);
  assert(!!archivePkg.manifestHash, `Cryptographic manifest hash: ${archivePkg.manifestHash.slice(0, 16)}...`);

  // ── SUMMARY ───────────────────────────────────────────────────────────────────
  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log(`  VERIFICATION RESULTS: ${passedTests} / ${totalTests} PASSED`);
  if (passedTests === totalTests) {
    console.log('  STATUS: ALL SOC INTEGRATION AUDIT TESTS PASSED WITH 100% SUCCESS');
  } else {
    console.log('  STATUS: SOME TESTS FAILED');
  }
  console.log('═════════════════════════════════════════════════════════════════\n');
}

runTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
