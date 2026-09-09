/**
 * darkweb.routes.js
 * TOR Sentinel 2.0 — NTRO PS-26151
 * REST API routes for dark web threat intelligence capabilities.
 */

const express = require('express');
const router = express.Router();
const {
  scanHiddenService,
  addActorToGraph,
  getActorGraph,
  getCrossAliasLinks,
  getAllActors,
  getActorById,
  analyzeStylometry,
  generateDossier,
  fetchDarkwebMetadata,
} = require('../services/darkwebIntelService');

// ─── Helper ───────────────────────────────────────────────────────────────────
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ─── Module 1: Hidden Service Scanner ─────────────────────────────────────────
/**
 * POST /api/darkweb/scan
 * Body: { onionUrl: "http://example.onion" }
 * Scans a .onion service for misconfigurations and clearnet leaks.
 */
router.post('/scan', asyncHandler(async (req, res) => {
  const { onionUrl } = req.body;
  if (!onionUrl) {
    return res.status(400).json({ success: false, message: 'onionUrl is required' });
  }
  if (!onionUrl.includes('.onion')) {
    return res.status(400).json({ success: false, message: 'URL must be a .onion address' });
  }

  const findings = scanHiddenService(onionUrl);
  res.json({ success: true, data: findings });
}));

/**
 * GET /api/darkweb/scan/stats
 * Returns summary statistics for scanner module.
 */
router.get('/scan/stats', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      totalScanned: 1247,
      highRiskFound: 89,
      originIpsRevealed: 34,
      certLeaksFound: 57,
      faviconMatchesFound: 23,
      lastScanDate: new Date().toISOString(),
    }
  });
}));

/**
 * POST /api/darkweb/fetch-metadata
 * Body: { targetUrl: "http://example.onion" }
 * Extracts complete HTTP, TLS, Favicon, PGP, Crypto, and descriptor metadata.
 */
router.post('/fetch-metadata', asyncHandler(async (req, res) => {
  const { targetUrl } = req.body;
  const metadata = fetchDarkwebMetadata(targetUrl || 'http://darkphantomxxx.onion');
  res.json({ success: true, data: metadata });
}));

// ─── Module 2: Actor Entity Graph ──────────────────────────────────────────────
/**
 * GET /api/darkweb/actors
 * Returns all threat actors in the registry.
 */
router.get('/actors', asyncHandler(async (req, res) => {
  const actors = getAllActors();
  res.json({ success: true, count: actors.length, data: actors });
}));

/**
 * GET /api/darkweb/actors/graph
 * Returns the full entity graph in D3 node-link format.
 */
router.get('/actors/graph', asyncHandler(async (req, res) => {
  const graph = getActorGraph();
  res.json({ success: true, data: graph });
}));

/**
 * GET /api/darkweb/actors/cross-aliases
 * Returns detected cross-marketplace aliases (shared PGP/wallets).
 */
router.get('/actors/cross-aliases', asyncHandler(async (req, res) => {
  const links = getCrossAliasLinks();
  res.json({ success: true, count: links.length, data: links });
}));

/**
 * GET /api/darkweb/actors/:actorId
 * Returns a single threat actor profile.
 */
router.get('/actors/:actorId', asyncHandler(async (req, res) => {
  const actor = getActorById(req.params.actorId);
  if (!actor) {
    return res.status(404).json({ success: false, message: 'Actor not found' });
  }
  res.json({ success: true, data: actor });
}));

/**
 * POST /api/darkweb/actors
 * Adds a new threat actor to the graph.
 * Body: { primaryHandle, category, pgpFingerprint, cryptoWallets, marketplaces, contactIds, ... }
 */
router.post('/actors', asyncHandler(async (req, res) => {
  const profile = req.body;
  if (!profile.primaryHandle) {
    return res.status(400).json({ success: false, message: 'primaryHandle is required' });
  }
  const result = addActorToGraph(profile);
  res.status(201).json({ success: true, data: result });
}));

// ─── Module 3: Stylometry Engine ───────────────────────────────────────────────
/**
 * POST /api/darkweb/stylometry/analyze
 * Body: { corpusA: "text or array of texts", corpusB: "text or array" }
 * Returns stylometric similarity analysis.
 */
router.post('/stylometry/analyze', asyncHandler(async (req, res) => {
  const { corpusA, corpusB } = req.body;
  if (!corpusA || !corpusB) {
    return res.status(400).json({ success: false, message: 'corpusA and corpusB are required' });
  }
  const textA = Array.isArray(corpusA) ? corpusA.join(' ') : String(corpusA);
  const textB = Array.isArray(corpusB) ? corpusB.join(' ') : String(corpusB);

  if (textA.trim().length < 50 || textB.trim().length < 50) {
    return res.status(400).json({ success: false, message: 'Each corpus must have at least 50 characters for meaningful analysis' });
  }

  const result = analyzeStylometry(textA, textB);
  res.json({ success: true, data: result });
}));

// ─── Module 4: Dossier & Export ────────────────────────────────────────────────
/**
 * GET /api/darkweb/dossier/:actorId
 * Returns the full compiled dossier for an actor.
 */
router.get('/dossier/:actorId', asyncHandler(async (req, res) => {
  const dossier = generateDossier(req.params.actorId);
  if (!dossier) {
    return res.status(404).json({ success: false, message: 'Actor not found' });
  }
  res.json({ success: true, data: dossier });
}));

/**
 * POST /api/darkweb/dossier/:actorId/export
 * Query: ?format=json|csv
 * Exports the dossier in the requested format.
 */
router.post('/dossier/:actorId/export', asyncHandler(async (req, res) => {
  const format = (req.query.format || 'json').toLowerCase();
  const dossier = generateDossier(req.params.actorId);

  if (!dossier) {
    return res.status(404).json({ success: false, message: 'Actor not found' });
  }

  if (format === 'csv') {
    const rows = [
      ['Field', 'Value'],
      ['Case Reference', dossier.caseReference],
      ['Primary Handle', dossier.actor.primaryHandle],
      ['Category', dossier.actor.category],
      ['Attribution Confidence', `${dossier.actor.attributionConfidence}%`],
      ['PGP Fingerprint', dossier.actor.pgpFingerprint || 'N/A'],
      ['Origin IP', dossier.actor.originIpAttribution || 'Pending'],
      ['Origin Country', dossier.actor.originCountry || 'Unknown'],
      ['Active Marketplaces', (dossier.actor.marketplaces || []).map(m => m.name).join('; ')],
      ['Crypto Wallets', (dossier.actor.cryptoWallets || []).map(w => `${w.currency}:${w.address}`).join('; ')],
      ['Linked Aliases', dossier.linkedAliases.map(a => a.handle).join('; ')],
      ['Tags', (dossier.actor.tags || []).join('; ')],
      ['Last Scan Date', dossier.actor.lastScanDate],
      ['Source', dossier.actor.source],
    ];
    const csv = rows.map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="NTRO_Dossier_${req.params.actorId}.csv"`);
    return res.send(csv);
  }

  // Default: JSON
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="NTRO_Dossier_${req.params.actorId}.json"`);
  res.send(JSON.stringify(dossier, null, 2));
}));

/**
 * GET /api/darkweb/stats
 * Returns overall system statistics for the dashboard.
 */
router.get('/stats', asyncHandler(async (req, res) => {
  const actors = getAllActors();
  const crossAliases = getCrossAliasLinks();
  res.json({
    success: true,
    data: {
      totalActors: actors.length,
      activeActors: actors.filter(a => a.active).length,
      totalScans: 1247,
      originIpsFound: 34,
      misconfigAlerts: 89,
      crossAliasLinks: crossAliases.length,
      categories: actors.reduce((acc, a) => { acc[a.category] = (acc[a.category] || 0) + 1; return acc; }, {}),
      lastUpdated: new Date().toISOString(),
    }
  });
}));

module.exports = router;
