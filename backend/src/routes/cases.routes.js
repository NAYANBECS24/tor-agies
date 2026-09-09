/**
 * cases.routes.js — TOR Sentinel 2.0
 * NTRO PS-26151 — Case Management, Correlation, and NTRO Report API
 */

const express = require('express');
const router = express.Router();
const {
  getAllCases, getCaseById, createCase, updateCase,
  addNoteToCase, linkActorToCase, getCaseStats, exportCasePackage,
  correlateActors, generateNTROReport,
  updateIncidentPhase, executePlaybookAction,
  getEvidenceForCase, addEvidenceToCase, getCustodyForCase
} = require('../services/caseService');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ═══════════════════════════════════════════════════════════════════
// CASE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

// GET /api/cases — List all cases with optional filters
router.get('/', asyncHandler(async (req, res) => {
  const { status, priority, classification, investigator, search } = req.query;
  const cases = getAllCases({ status, priority, classification, investigator, search });
  res.json({ success: true, count: cases.length, data: cases });
}));

// GET /api/cases/stats — Case registry statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const stats = getCaseStats();
  res.json({ success: true, data: stats });
}));

// GET /api/cases/:caseId — Full case detail with actors, timeline, aliases
router.get('/:caseId', asyncHandler(async (req, res) => {
  const caseData = getCaseById(req.params.caseId);
  if (!caseData) {
    return res.status(404).json({ success: false, message: `Case ${req.params.caseId} not found` });
  }
  res.json({ success: true, data: caseData });
}));

// POST /api/cases — Create new investigation case
router.post('/', asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'title is required' });
  const newCase = createCase(req.body);
  res.status(201).json({ success: true, data: newCase });
}));

// PATCH /api/cases/:caseId — Update case status, priority, classification
router.patch('/:caseId', asyncHandler(async (req, res) => {
  const updated = updateCase(req.params.caseId, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Case not found' });
  res.json({ success: true, data: updated });
}));

// POST /api/cases/:caseId/notes — Add investigator note to case
router.post('/:caseId/notes', asyncHandler(async (req, res) => {
  const { text, author, classification } = req.body;
  if (!text) return res.status(400).json({ success: false, message: 'note text is required' });
  const note = addNoteToCase(req.params.caseId, { text, author, classification });
  if (!note) return res.status(404).json({ success: false, message: 'Case not found' });
  res.status(201).json({ success: true, data: note });
}));

// POST /api/cases/:caseId/link-actor — Link a threat actor to a case
router.post('/:caseId/link-actor', asyncHandler(async (req, res) => {
  const { actorId } = req.body;
  if (!actorId) return res.status(400).json({ success: false, message: 'actorId is required' });
  const updated = linkActorToCase(req.params.caseId, actorId);
  if (!updated) return res.status(404).json({ success: false, message: 'Case not found' });
  res.json({ success: true, data: updated });
}));

// GET /api/cases/:caseId/export — Export full case package as JSON
router.get('/:caseId/export', asyncHandler(async (req, res) => {
  const pkg = exportCasePackage(req.params.caseId);
  if (!pkg) return res.status(404).json({ success: false, message: 'Case not found' });

  const format = req.query.format || 'json';
  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="NTRO_Case_${req.params.caseId}_${Date.now()}.json"`);
    return res.send(JSON.stringify(pkg, null, 2));
  }
  res.json({ success: true, data: pkg });
}));

// PATCH /api/cases/:caseId/phase — Update Incident Lifecycle Phase
router.patch('/:caseId/phase', asyncHandler(async (req, res) => {
  const { phase, notes, containmentStatus, rootCause, lessonsLearned, author } = req.body;
  if (!phase) return res.status(400).json({ success: false, message: 'phase is required' });
  const updated = updateIncidentPhase(req.params.caseId, phase, { notes, containmentStatus, rootCause, lessonsLearned, author });
  if (!updated) return res.status(404).json({ success: false, message: 'Case not found' });
  res.json({ success: true, data: updated });
}));

// POST /api/cases/:caseId/playbook — Execute Containment / Remediation Playbook Action
router.post('/:caseId/playbook', asyncHandler(async (req, res) => {
  const { actionName, parameters } = req.body;
  if (!actionName) return res.status(400).json({ success: false, message: 'actionName is required' });
  const result = executePlaybookAction(req.params.caseId, actionName, parameters || {});
  if (!result) return res.status(404).json({ success: false, message: 'Case not found' });
  res.json({ success: true, data: result });
}));

// GET /api/cases/:caseId/evidence — Retrieve Digital Evidence Exhibits
router.get('/:caseId/evidence', asyncHandler(async (req, res) => {
  const evidence = getEvidenceForCase(req.params.caseId);
  res.json({ success: true, count: evidence.length, data: evidence });
}));

// POST /api/cases/:caseId/evidence — Attach New Digital Evidence Exhibit
router.post('/:caseId/evidence', asyncHandler(async (req, res) => {
  const evidence = addEvidenceToCase(req.params.caseId, req.body);
  if (!evidence) return res.status(404).json({ success: false, message: 'Failed to attach evidence' });
  res.status(201).json({ success: true, data: evidence });
}));

// GET /api/cases/:caseId/custody — Retrieve Chain-of-Custody Logs
router.get('/:caseId/custody', asyncHandler(async (req, res) => {
  const custody = getCustodyForCase(req.params.caseId);
  res.json({ success: true, count: custody.length, data: custody });
}));

// ═══════════════════════════════════════════════════════════════════
// CORRELATION ENGINE
// ═══════════════════════════════════════════════════════════════════

// POST /api/cases/correlate — Cross-actor attribute correlation matrix
router.post('/correlate/actors', asyncHandler(async (req, res) => {
  const { actorIds } = req.body;
  if (!actorIds || !Array.isArray(actorIds) || actorIds.length < 2) {
    return res.status(400).json({ success: false, message: 'actorIds array with at least 2 entries required' });
  }
  const result = correlateActors(actorIds);
  if (result.error) return res.status(400).json({ success: false, message: result.error });
  res.json({ success: true, data: result });
}));

// GET /api/cases/correlate/all — Auto-correlate all known actors
router.get('/correlate/all', asyncHandler(async (req, res) => {
  const { getAllActors } = require('../services/darkwebIntelService');
  const actors = getAllActors();
  const actorIds = actors.map(a => a.actorId);
  if (actorIds.length < 2) {
    return res.json({ success: true, data: { message: 'Need at least 2 actors for correlation' } });
  }
  const result = correlateActors(actorIds);
  res.json({ success: true, data: result });
}));

// ═══════════════════════════════════════════════════════════════════
// NTRO INTELLIGENCE REPORT GENERATOR & FORENSIC VAULT API
// ═══════════════════════════════════════════════════════════════════
const {
  getAllReports, getReportStats, getReportById,
  generateAndSaveReport, updateReportStatus, deleteReport,
  verifyDigitalSeal, exportReport,
  compareReports, signReport, redactReport
} = require('../services/reportService');

// GET /api/cases/reports/all — List all saved reports with query filters
router.get('/reports/all', asyncHandler(async (req, res) => {
  const { status, classification, reportType, caseId, search, limit, offset } = req.query;
  const reports = getAllReports({ status, classification, reportType, caseId, search, limit, offset });
  res.json({ success: true, count: reports.length, data: reports });
}));

// GET /api/cases/reports/stats — Summary metrics of Report Vault
router.get('/reports/stats', asyncHandler(async (req, res) => {
  const stats = getReportStats();
  res.json({ success: true, data: stats });
}));

// GET /api/cases/reports/compare — Compare two reports (Revision Diff Engine)
router.get('/reports/compare', asyncHandler(async (req, res) => {
  const { reportA, reportB } = req.query;
  if (!reportA || !reportB) {
    return res.status(400).json({ success: false, message: 'reportA and reportB query params required' });
  }
  const diff = compareReports(reportA, reportB);
  if (diff.error) return res.status(400).json({ success: false, message: diff.error });
  res.json({ success: true, data: diff });
}));

// GET /api/cases/reports/:reportId — Fetch single report
router.get('/reports/:reportId', asyncHandler(async (req, res) => {
  const report = getReportById(req.params.reportId, req.query.analyst || 'Analyst-Alpha');
  if (!report) return res.status(404).json({ success: false, message: `Report ${req.params.reportId} not found` });
  res.json({ success: true, data: report });
}));

// GET /api/cases/reports/:reportId/redacted — Fetch dynamically sanitized copy
router.get('/reports/:reportId/redacted', asyncHandler(async (req, res) => {
  const report = getReportById(req.params.reportId, req.query.analyst || 'Analyst-Alpha');
  if (!report) return res.status(404).json({ success: false, message: `Report ${req.params.reportId} not found` });
  const redacted = redactReport(report, req.query.level || 'LAW_ENFORCEMENT_SANITIZED');
  res.json({ success: true, data: redacted });
}));

// POST /api/cases/reports/:reportId/sign — Co-sign report with digital signature
router.post('/reports/:reportId/sign', asyncHandler(async (req, res) => {
  const signed = signReport(req.params.reportId, req.body);
  if (!signed) return res.status(404).json({ success: false, message: 'Report not found' });
  res.json({ success: true, data: signed });
}));

// POST /api/cases/reports/generate — Synthesize and persist a new forensic report
router.post('/reports/generate', asyncHandler(async (req, res) => {
  const report = generateAndSaveReport(req.body);
  res.status(201).json({ success: true, data: report });
}));

// POST /api/cases/reports/:reportId/verify — Verify SHA-256 digital seal integrity
router.post('/reports/:reportId/verify', asyncHandler(async (req, res) => {
  const verification = verifyDigitalSeal(req.params.reportId);
  res.json({ success: true, data: verification });
}));

// PATCH /api/cases/reports/:reportId/status — Update report status (DRAFT/FINALIZED/COURT_SUBMITTED)
router.patch('/reports/:reportId/status', asyncHandler(async (req, res) => {
  const { status, approvingOfficer, notes } = req.body;
  if (!status) return res.status(400).json({ success: false, message: 'status is required' });
  const updated = updateReportStatus(req.params.reportId, status, { approvingOfficer, notes });
  if (!updated) return res.status(404).json({ success: false, message: 'Report not found' });
  res.json({ success: true, data: updated });
}));

// DELETE /api/cases/reports/:reportId — Delete report
router.delete('/reports/:reportId', asyncHandler(async (req, res) => {
  const deleted = deleteReport(req.params.reportId, req.query.analyst || 'Analyst-Alpha');
  if (!deleted) return res.status(404).json({ success: false, message: 'Report not found' });
  res.json({ success: true, message: `Report ${req.params.reportId} deleted successfully` });
}));

// GET /api/cases/reports/:reportId/export — Export report in json/csv/txt/html
router.get('/reports/:reportId/export', asyncHandler(async (req, res) => {
  const format = (req.query.format || 'json').toLowerCase();
  const exported = exportReport(req.params.reportId, format);
  if (!exported) return res.status(404).json({ success: false, message: 'Report not found' });

  res.setHeader('Content-Type', exported.contentType);
  if (format === 'html') {
    return res.send(exported.data);
  }
  res.setHeader('Content-Disposition', `attachment; filename="${exported.filename}"`);
  res.send(exported.data);
}));

// Legacy / Compatibility endpoints:
// GET /api/cases/:caseId/report?type=SITREP|ACTOR_PROFILE|FINANCIAL_INTEL|INFRASTRUCTURE
router.get('/:caseId/report', asyncHandler(async (req, res) => {
  const reportType = (req.query.type || 'SITREP').toUpperCase();
  const report = generateAndSaveReport({
    caseId: req.params.caseId,
    reportType,
    authorName: req.query.author || 'Analyst-Alpha'
  });
  if (!report) return res.status(404).json({ success: false, message: 'Case not found' });

  if (req.query.download === 'true') {
    const exported = exportReport(report.reportId, req.query.format || 'json');
    res.setHeader('Content-Type', exported.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${exported.filename}"`);
    return res.send(exported.data);
  }

  res.json({ success: true, data: report });
}));

// POST /api/cases/:caseId/report — Generate and persist report
router.post('/:caseId/report', asyncHandler(async (req, res) => {
  const { type, classification, authorName, authorBadge, approvingOfficer, customNotes } = req.body;
  const report = generateAndSaveReport({
    caseId: req.params.caseId,
    reportType: (type || 'SITREP').toUpperCase(),
    classification: classification || 'SECRET',
    authorName,
    authorBadge,
    approvingOfficer,
    customNotes
  });
  if (!report) return res.status(404).json({ success: false, message: 'Case not found' });
  res.status(201).json({ success: true, data: report });
}));

module.exports = router;
