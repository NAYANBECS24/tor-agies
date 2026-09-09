/**
 * analytics.controller.js — SQLite-backed Analytics controller
 */

const TrafficLog = require('../models/TrafficLog');
const TorNode = require('../models/TorNode');
const trafficAnalyzer = require('../services/trafficAnalyzer');
const logger = require('../utils/logger');
const { getDB } = require('../config/database');

const analyticsController = {
  // Get traffic statistics
  getTrafficStats: async (req, res) => {
    try {
      const { timeRange = '24h' } = req.query;
      const stats = TrafficLog.getStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error(`Get traffic stats error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to get traffic statistics',
        error: error.message
      });
    }
  },
  
  // Get real-time traffic data
  getRealtimeTraffic: async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      const recentTraffic = TrafficLog.find({ limit: parseInt(limit) });
      res.json({
        success: true,
        data: recentTraffic
      });
    } catch (error) {
      logger.error(`Get realtime traffic error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to get real-time traffic',
        error: error.message
      });
    }
  },
  
  // Get malicious traffic analysis
  getMaliciousTraffic: async (req, res) => {
    try {
      const { limit = 50, threatLevel } = req.query;
      const filters = { isAnomalous: true, limit: parseInt(limit) };
      if (threatLevel && threatLevel !== 'all') filters.threatLevel = threatLevel;
      const logs = TrafficLog.find(filters);
      res.json({
        success: true,
        data: {
          logs,
          total: logs.length
        }
      });
    } catch (error) {
      logger.error(`Get malicious traffic error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to get malicious traffic',
        error: error.message
      });
    }
  },
  
  // Get bandwidth statistics
  getBandwidthStats: async (req, res) => {
    try {
      const db = getDB();
      const nodeStats = TorNode.getStats();
      res.json({
        success: true,
        data: {
          nodeStats,
          totalNodes: nodeStats.total
        }
      });
    } catch (error) {
      logger.error(`Get bandwidth stats error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to get bandwidth statistics',
        error: error.message
      });
    }
  },
  
  // Get protocol distribution
  getProtocolDistribution: async (req, res) => {
    try {
      const stats = TrafficLog.getStats();
      res.json({
        success: true,
        data: stats.byProtocol
      });
    } catch (error) {
      logger.error(`Get protocol distribution error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to get protocol distribution',
        error: error.message
      });
    }
  },
  
  // Get geographic traffic distribution
  getGeoDistribution: async (req, res) => {
    try {
      const nodeStats = TorNode.getStats();
      res.json({
        success: true,
        data: nodeStats.byCountry
      });
    } catch (error) {
      logger.error(`Get geo distribution error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to get geographic distribution',
        error: error.message
      });
    }
  },
  
  // Get network health metrics
  getNetworkHealth: async (req, res) => {
    try {
      const nodeStats = TorNode.getStats();
      const trafficStats = TrafficLog.getStats();
      res.json({
        success: true,
        data: {
          totalNodes: nodeStats.total,
          exitNodes: nodeStats.exitNodes,
          guardNodes: nodeStats.guardNodes,
          totalTrafficLogs: trafficStats.totalLogs,
          anomaliesDetected: trafficStats.anomalousCount,
          status: 'HEALTHY'
        }
      });
    } catch (error) {
      logger.error(`Get network health error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to get network health',
        error: error.message
      });
    }
  }
};

module.exports = analyticsController;