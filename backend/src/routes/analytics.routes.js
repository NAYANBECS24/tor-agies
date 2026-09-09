const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

// Traffic analytics
router.get('/traffic/stats', analyticsController.getTrafficStats);
router.get('/traffic/realtime', analyticsController.getRealtimeTraffic);
router.get('/traffic/malicious', analyticsController.getMaliciousTraffic);
router.get('/traffic/trends', analyticsController.getTrafficTrends);
router.get('/traffic/logs/:logId/analyze', analyticsController.analyzeTrafficLog);

// Geographic analysis
router.get('/geographic', analyticsController.getGeographicAnalysis);

// Protocol analysis
router.get('/protocol', analyticsController.getProtocolAnalysis);

// Threat intelligence
router.get('/threat-intelligence', analyticsController.getThreatIntelligence);

module.exports = router;