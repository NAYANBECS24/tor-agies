const express = require('express');
const router = express.Router();
const torController = require('../controllers/tor.controller');

// ─── Unified Dashboard KPIs (all numbers from DB — no hardcoded values) ────────
router.get('/dashboard-kpis', torController.getDashboardKPIs);

// ─── Public Tor Network Intelligence & Metrics ─────────────────────────────────
router.get('/overview', torController.getNetworkOverview);
router.get('/metrics', torController.getLiveMetrics);
router.get('/onionoo/live', torController.getLiveOnionoo);
router.get('/deltas', torController.getRelayDeltas);
router.get('/bandwidth', torController.getBandwidthHistory);
router.get('/uptime', torController.getUptimeHistory);
router.get('/freshness', torController.getDataFreshness);

// ─── Adaptive ATWC Network-State Estimator & Federation ─────────────────────────
router.get('/network-state', torController.getAdaptiveAtwcState);
router.post('/atwc/correlate', torController.testAtwcCorrelation);
router.get('/atwc/federation-status', torController.getFederationStatus);
router.post('/atwc/train', torController.triggerFederationTraining);
router.get('/atwc/correlations', torController.getAtwcCorrelations);
router.get('/atwc/export-model', torController.exportGlobalModel);

// ─── SOC Co-Managed Security Compliance (RFT-26.2026 Aligned) ──────────────────
router.get('/soc-compliance', torController.getSocCoManagedStatus);

// ─── On-Demand Sync ───────────────────────────────────────────────────────────
router.post('/sync', torController.triggerSnapshotSync);

// ─── Relay Nodes ──────────────────────────────────────────────────────────────
router.get('/nodes', torController.getNodes);
router.get('/nodes/search', torController.searchNodes);
router.get('/nodes/:id', torController.getNodeById);

module.exports = router;