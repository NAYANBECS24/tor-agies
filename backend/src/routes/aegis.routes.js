/**
 * aegis.routes.js — Project A.E.G.I.S. REST API
 * NTRO PS-26151 — Next-Level Deep Cyber Threat Attribution Endpoints
 */

const express = require('express');
const router = express.Router();
const {
  runFullAegisInvestigation,
  analyzeGhostServer,
  analyzeCryptoTimeTravel,
  analyzePersonaDNA,
  detectAIEvasion,
  analyzeTarpitHoneypot,
  logTarpitHit,
} = require('../services/aegisEngine');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// POST /api/aegis/investigate — Full 3-Layer Master Attribution Pipeline
router.post('/investigate', asyncHandler(async (req, res) => {
  const { target } = req.body;
  const result = runFullAegisInvestigation(target || 'DarkPhantom_v2');
  res.json({ success: true, data: result });
}));

// POST /api/aegis/ghost-server — Layer 1: JA3 TLS Handshake + Favicon MMH3 Shodan
router.post('/ghost-server', asyncHandler(async (req, res) => {
  const { onionUrl, actorHandle } = req.body;
  const result = analyzeGhostServer(onionUrl, actorHandle);
  res.json({ success: true, data: result });
}));

// POST /api/aegis/crypto-time-travel — Layer 2: PGP Metadata + Git API + Alias Predictor
router.post('/crypto-time-travel', asyncHandler(async (req, res) => {
  const { pgpKey, handle } = req.body;
  const result = analyzeCryptoTimeTravel(pgpKey, handle);
  res.json({ success: true, data: result });
}));

// POST /api/aegis/persona-dna — Layer 3: Circadian Chrono-Location + 768-D Vector
router.post('/persona-dna', asyncHandler(async (req, res) => {
  const { actorData } = req.body;
  const result = analyzePersonaDNA(actorData || {});
  res.json({ success: true, data: result });
}));

// POST /api/aegis/ai-evasion — Reverse Stylometry / ChatGPT Detector
router.post('/ai-evasion', asyncHandler(async (req, res) => {
  const { text } = req.body;
  const result = detectAIEvasion(text || '');
  res.json({ success: true, data: result });
}));

// GET /api/aegis/tarpit — Get Honeypot Intercept Logs & Hardware IDs
router.get('/tarpit', asyncHandler(async (req, res) => {
  const { handle } = req.query;
  const result = analyzeTarpitHoneypot(handle || 'DarkPhantom_v2');
  res.json({ success: true, data: result });
}));

// POST /api/aegis/tarpit/log — Log client hardware fingerprint from Honeypot
router.post('/tarpit/log', asyncHandler(async (req, res) => {
  const entry = logTarpitHit(req.body);
  res.json({ success: true, message: 'Hardware fingerprint logged', data: entry });
}));

// GET /api/aegis/presets — Quick investigation test presets
router.get('/presets', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'PRESET-1',
        title: 'Operation DarkPhantom (Ransomware-as-a-Service)',
        target: 'DarkPhantom_v2',
        onionUrl: 'http://darkphantomxxx.onion',
        category: 'Ransomware',
        quickHook: 'TLS JA3 Match + PGP Commit Timestamp + IST Chrono-Location'
      },
      {
        id: 'PRESET-2',
        title: 'SilkReborn Market Syndicate (DNM Narcotics)',
        target: 'SilkReborn_Admin',
        onionUrl: 'http://silkreborn777.onion',
        category: 'Drug Trafficking',
        quickHook: 'Favicon Hash Match + Child Wallet UTXO Clustered'
      },
      {
        id: 'PRESET-3',
        title: 'BreachSyndicate Data Merchant',
        target: 'BreachKing_v4',
        onionUrl: 'http://breachforumsxxx.onion',
        category: 'Data Breach',
        quickHook: 'AI-Evasion Detection + Generative Alias Prediction'
      }
    ]
  });
}));

module.exports = router;
