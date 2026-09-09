/**
 * soc.routes.js — TOR Sentinel 2.0
 * API Routes for Operational SOC Integration Layer (RFT 26/2026)
 */

const express = require('express');
const router = express.Router();
const socController = require('../controllers/soc.controller');

// Overview & Executive Metrics
router.get('/overview', socController.getOverview);

// SIEM-Lite Log Ingestion & Querying
router.get('/siem/events', socController.getSiemEvents);
router.post('/siem/ingest', socController.ingestSiemLog);

// MITRE ATT&CK Detection Engineering
router.get('/detection-rules', socController.getDetectionRules);
router.post('/detection-rules/evaluate', socController.evaluateDetectionRules);
router.patch('/detection-rules/:id/toggle', socController.toggleDetectionRule);

// Threat Intelligence Feed & IOC Store
router.get('/threat-intel/iocs', socController.getThreatIntelIocs);
router.post('/threat-intel/iocs', socController.addThreatIntelIoc);
router.post('/threat-intel/match', socController.matchThreatIntel);

// Threat Hunting Workspace
router.get('/hunting', socController.getThreatHunts);
router.post('/hunting', socController.createThreatHunt);
router.post('/hunting/:id/execute', socController.executeThreatHunt);
router.post('/hunting/:id/convert-to-rule', socController.promoteHuntToRule);

// Time Integrity & Clock Synchronization (A.8.17)
router.get('/time-integrity', socController.getTimeIntegrity);
router.post('/time-integrity/sync', socController.triggerNtpSync);

// Tamper-Evident Audit Trails & RBAC
router.get('/audit-logs', socController.getAuditLogs);
router.get('/audit-logs/:id/verify', socController.verifyAuditLog);

// Tiered Retention & Forensic Archive (A.8.15)
router.get('/retention-status', socController.getRetentionStatus);
router.post('/retention/archive', socController.createArchivePackage);

// 7-Phase Incident Lifecycle & SOAR Playbooks (A.5.24 - A.5.27)
router.patch('/cases/:id/lifecycle', socController.updateCasePhase);
router.post('/cases/:id/playbook', socController.executeCasePlaybook);

// Operational Runbooks
router.get('/runbooks', socController.getRunbooks);

module.exports = router;
