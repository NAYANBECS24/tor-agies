/**
 * alert.controller.js — SQLite-backed Alert controller
 */

const Alert = require('../models/Alert');
const User = require('../models/User');
const logger = require('../utils/logger');
const { getDB } = require('../config/database');

const alertController = {
  // Get all alerts with filtering and pagination
  getAlerts: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 50,
        status,
        severity,
        type
      } = req.query;
      
      const filters = {};
      if (status && status !== 'all') filters.status = status;
      if (severity && severity !== 'all') filters.severity = severity;
      if (type && type !== 'all') filters.type = type;
      filters.limit = parseInt(limit);
      
      const alerts = Alert.find(filters);
      const total = Alert.count(filters);
      const stats = Alert.getStatistics();
      
      const totalPages = Math.ceil(total / parseInt(limit)) || 1;
      
      res.json({
        success: true,
        data: {
          alerts,
          statistics: stats,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1
          }
        }
      });
      
    } catch (error) {
      logger.error(`Get alerts error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to get alerts',
        error: error.message
      });
    }
  },
  
  // Get alert by ID
  getAlertById: async (req, res) => {
    try {
      const { id } = req.params;
      const alert = Alert.findById(id);
      
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }
      
      res.json({
        success: true,
        data: alert
      });
      
    } catch (error) {
      logger.error(`Get alert by ID error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to get alert',
        error: error.message
      });
    }
  },
  
  // Create new alert
  createAlert: async (req, res) => {
    try {
      const {
        title,
        description,
        type,
        severity,
        affectedNodes,
        metadata,
        tags
      } = req.body;
      
      if (!title || !description || !type || !severity) {
        return res.status(400).json({
          success: false,
          message: 'Title, description, type, and severity are required'
        });
      }
      
      const alert = Alert.create({
        title,
        description,
        type,
        severity,
        source: 'user',
        metadata: metadata || {},
        tags: tags || [],
        affectedNodes: affectedNodes || []
      });
      
      res.status(201).json({
        success: true,
        message: 'Alert created successfully',
        data: alert
      });
      
    } catch (error) {
      logger.error(`Create alert error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to create alert',
        error: error.message
      });
    }
  },
  
  // Update alert
  updateAlert: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const alert = Alert.updateById(id, updateData);
      
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Alert updated successfully',
        data: alert
      });
      
    } catch (error) {
      logger.error(`Update alert error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to update alert',
        error: error.message
      });
    }
  },
  
  // Acknowledge alert
  acknowledgeAlert: async (req, res) => {
    try {
      const { id } = req.params;
      const alert = Alert.updateById(id, { status: 'acknowledged' });
      
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Alert acknowledged successfully',
        data: alert
      });
      
    } catch (error) {
      logger.error(`Acknowledge alert error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to acknowledge alert',
        error: error.message
      });
    }
  },
  
  // Resolve alert
  resolveAlert: async (req, res) => {
    try {
      const { id } = req.params;
      const alert = Alert.updateById(id, { status: 'resolved' });
      
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Alert resolved successfully',
        data: alert
      });
      
    } catch (error) {
      logger.error(`Resolve alert error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to resolve alert',
        error: error.message
      });
    }
  },
  
  // Close alert
  closeAlert: async (req, res) => {
    try {
      const { id } = req.params;
      const alert = Alert.updateById(id, { status: 'closed', isActive: false });
      
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Alert closed successfully',
        data: alert
      });
      
    } catch (error) {
      logger.error(`Close alert error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to close alert',
        error: error.message
      });
    }
  },
  
  // Add note to alert
  addNote: async (req, res) => {
    try {
      const { id } = req.params;
      const { note } = req.body;
      
      if (!note) {
        return res.status(400).json({
          success: false,
          message: 'Note is required'
        });
      }
      
      const db = getDB();
      const alertRow = db.prepare('SELECT notes_json FROM alerts WHERE alert_id = ?').get(id);
      if (!alertRow) {
        return res.status(404).json({ success: false, message: 'Alert not found' });
      }
      
      let notes = [];
      try { notes = JSON.parse(alertRow.notes_json || '[]'); } catch {}
      const newNote = {
        user: req.user?.username || 'Analyst',
        note,
        timestamp: new Date().toISOString()
      };
      notes.push(newNote);
      db.prepare('UPDATE alerts SET notes_json = ?, updated_at = ? WHERE alert_id = ?').run(JSON.stringify(notes), new Date().toISOString(), id);
      
      res.json({
        success: true,
        message: 'Note added successfully',
        data: newNote
      });
      
    } catch (error) {
      logger.error(`Add note error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to add note',
        error: error.message
      });
    }
  },
  
  // Assign alert to user
  assignAlert: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      const alert = Alert.updateById(id, { status: 'investigating' });
      if (!alert) {
        return res.status(404).json({ success: false, message: 'Alert not found' });
      }
      
      res.json({
        success: true,
        message: 'Alert assigned successfully',
        data: alert
      });
      
    } catch (error) {
      logger.error(`Assign alert error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to assign alert',
        error: error.message
      });
    }
  },
  
  // Get alert statistics
  getAlertStatistics: async (req, res) => {
    try {
      const stats = Alert.getStatistics();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error(`Get alert statistics error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to get alert statistics',
        error: error.message
      });
    }
  },
  
  // Bulk update alerts
  bulkUpdateAlerts: async (req, res) => {
    try {
      const { alertIds, updates } = req.body;
      if (!alertIds || !Array.isArray(alertIds) || alertIds.length === 0) {
        return res.status(400).json({ success: false, message: 'Alert IDs are required' });
      }
      
      for (const id of alertIds) {
        Alert.updateById(id, updates);
      }
      
      res.json({
        success: true,
        message: `Updated ${alertIds.length} alerts`
      });
    } catch (error) {
      logger.error(`Bulk update alerts error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk update alerts',
        error: error.message
      });
    }
  }
};

module.exports = alertController;