const EventEmitter = require('events');
const logger = require('../utils/logger');
const { getRedisClient } = require('../config/redis');
const TrafficLog = require('../models/TrafficLog');
const Alert = require('../models/Alert');

class CorrelationEngine extends EventEmitter {
  constructor() {
    super();
    this.correlationRules = new Map();
    this.eventBuffer = new Map();
    this.correlationWindow = 300000; // 5 minutes
    this.maxBufferSize = 10000;
    
    this.initRules();
    this.startCleanupInterval();
  }
  
  initRules() {
    // Temporal correlation rules
    this.addRule({
      id: 'temp_port_scan',
      name: 'Temporal Port Scan Detection',
      description: 'Detect port scans over time',
      conditions: [
        { field: 'type', operator: 'equals', value: 'port_scan' },
        { field: 'sourceIp', operator: 'same' },
        { field: 'timestamp', operator: 'within', value: 600000 } // 10 minutes
      ],
      threshold: 5,
      severity: 'medium',
      action: 'create_alert'
    });
    
    this.addRule({
      id: 'geo_anomaly',
      name: 'Geographic Anomaly',
      description: 'Traffic from unusual geographic locations',
      conditions: [
        { field: 'geoData.sourceCountryCode', operator: 'not_in', value: ['US', 'DE', 'GB', 'CA', 'FR'] },
        { field: 'bytesSent', operator: 'greater', value: 1000000 } // 1MB
      ],
      threshold: 3,
      severity: 'high',
      action: 'create_alert'
    });
    
    this.addRule({
      id: 'data_exfil_pattern',
      name: 'Data Exfiltration Pattern',
      description: 'Pattern of data exfiltration',
      conditions: [
        { field: 'destinationIp', operator: 'same' },
        { field: 'bytesSent', operator: 'greater', value: 50000000 }, // 50MB
        { field: 'timestamp', operator: 'within', value: 3600000 } // 1 hour
      ],
      threshold: 2,
      severity: 'critical',
      action: 'create_alert'
    });
    
    this.addRule({
      id: 'protocol_mix_anomaly',
      name: 'Protocol Mix Anomaly',
      description: 'Unusual mix of protocols from same source',
      conditions: [
        { field: 'sourceIp', operator: 'same' },
        { field: 'protocol', operator: 'distinct_count', value: 5 }
      ],
      threshold: 1,
      severity: 'medium',
      action: 'create_alert'
    });
    
    this.addRule({
      id: 'tor_circuit_correlation',
      name: 'Tor Circuit Correlation',
      description: 'Correlate events in same Tor circuit',
      conditions: [
        { field: 'circuitId', operator: 'same' },
        { field: 'isMalicious', operator: 'equals', value: true }
      ],
      threshold: 2,
      severity: 'high',
      action: 'create_alert'
    });
  }
  
  addRule(rule) {
    this.correlationRules.set(rule.id, rule);
  }
  
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupOldEvents();
    }, 60000); // Clean up every minute
  }
  
  cleanupOldEvents() {
    const cutoff = Date.now() - this.correlationWindow;
    
    for (const [key, events] of this.eventBuffer.entries()) {
      const filtered = events.filter(event => 
        new Date(event.timestamp).getTime() > cutoff
      );
      
      if (filtered.length === 0) {
        this.eventBuffer.delete(key);
      } else {
        this.eventBuffer.set(key, filtered);
      }
    }
  }
  
  async processEvent(event) {
    try {
      // Add event to buffer
      await this.bufferEvent(event);
      
      // Check for correlations
      const correlations = await this.checkCorrelations(event);
      
      // Process correlations
      for (const correlation of correlations) {
        await this.handleCorrelation(correlation);
      }
      
      return correlations;
      
    } catch (error) {
      logger.error(`Event processing failed: ${error.message}`);
      throw error;
    }
  }
  
  async bufferEvent(event) {
    const bufferKey = this.getBufferKey(event);
    
    if (!this.eventBuffer.has(bufferKey)) {
      this.eventBuffer.set(bufferKey, []);
    }
    
    const buffer = this.eventBuffer.get(bufferKey);
    buffer.push(event);
    
    // Limit buffer size
    if (buffer.length > this.maxBufferSize) {
      buffer.shift();
    }
  }
  
  getBufferKey(event) {
    // Create a key based on event characteristics for efficient grouping
    if (event.sourceIp) {
      return `source:${event.sourceIp}`;
    } else if (event.destinationIp) {
      return `dest:${event.destinationIp}`;
    } else if (event.circuitId) {
      return `circuit:${event.circuitId}`;
    }
    
    return 'general';
  }
  
  async checkCorrelations(newEvent) {
    const correlations = [];
    
    for (const [ruleId, rule] of this.correlationRules) {
      try {
        const isCorrelated = await this.evaluateRule(rule, newEvent);
        
        if (isCorrelated) {
          const correlation = this.createCorrelation(rule, newEvent);
          correlations.push(correlation);
          
          this.emit('correlation_found', correlation);
        }
      } catch (error) {
        logger.error(`Rule evaluation failed for ${ruleId}: ${error.message}`);
      }
    }
    
    return correlations;
  }
  
  async evaluateRule(rule, newEvent) {
    const relevantEvents = this.getRelevantEvents(rule, newEvent);
    
    if (relevantEvents.length < rule.threshold) {
      return false;
    }
    
    // Check if all conditions are met
    for (const condition of rule.conditions) {
      if (!this.evaluateCondition(condition, relevantEvents)) {
        return false;
      }
    }
    
    return true;
  }
  
  getRelevantEvents(rule, newEvent) {
    const events = [];
    const cutoff = Date.now() - this.correlationWindow;
    
    // Get events from buffer
    for (const [key, bufferEvents] of this.eventBuffer) {
      for (const event of bufferEvents) {
        if (new Date(event.timestamp).getTime() < cutoff) {
          continue;
        }
        
        // Check if event matches rule characteristics
        let isRelevant = true;
        
        for (const condition of rule.conditions) {
          if (!this.eventMatchesCondition(event, condition)) {
            isRelevant = false;
            break;
          }
        }
        
        if (isRelevant) {
          events.push(event);
        }
      }
    }
    
    // Include the new event
    events.push(newEvent);
    
    return events;
  }
  
  eventMatchesCondition(event, condition) {
    const value = this.getFieldValue(event, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return value == condition.value;
      case 'not_equals':
        return value != condition.value;
      case 'greater':
        return Number(value) > Number(condition.value);
      case 'less':
        return Number(value) < Number(condition.value);
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'same':
        // For grouping conditions, this is handled differently
        return true;
      case 'within':
        // Temporal condition
        return true;
      case 'not_in':
        return !condition.value.includes(value);
      case 'distinct_count':
        // This needs to be evaluated across multiple events
        return true;
      default:
        return false;
    }
  }
  
  evaluateCondition(condition, events) {
    switch (condition.operator) {
      case 'same':
        return this.evaluateSameCondition(condition, events);
      case 'within':
        return this.evaluateWithinCondition(condition, events);
      case 'distinct_count':
        return this.evaluateDistinctCountCondition(condition, events);
      default:
        // For simple conditions, check if any event matches
        return events.some(event => this.eventMatchesCondition(event, condition));
    }
  }
  
  evaluateSameCondition(condition, events) {
    if (events.length === 0) return false;
    
    const firstValue = this.getFieldValue(events[0], condition.field);
    
    return events.every(event => 
      this.getFieldValue(event, condition.field) === firstValue
    );
  }
  
  evaluateWithinCondition(condition, events) {
    if (events.length < 2) return true;
    
    const timestamps = events.map(e => new Date(e.timestamp).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    
    return (maxTime - minTime) <= condition.value;
  }
  
  evaluateDistinctCountCondition(condition, events) {
    const distinctValues = new Set();
    
    for (const event of events) {
      const value = this.getFieldValue(event, condition.field);
      if (value) {
        distinctValues.add(value);
      }
    }
    
    return distinctValues.size >= condition.value;
  }
  
  getFieldValue(event, fieldPath) {
    const parts = fieldPath.split('.');
    let value = event;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }
  
  createCorrelation(rule, events) {
    const correlationId = `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: correlationId,
      ruleId: rule.id,
      ruleName: rule.name,
      description: rule.description,
      events: Array.isArray(events) ? events : [events],
      severity: rule.severity,
      timestamp: new Date().toISOString(),
      confidence: this.calculateConfidence(rule, events),
      metadata: {
        eventCount: Array.isArray(events) ? events.length : 1,
        sourceIps: this.extractUniqueValues(events, 'sourceIp'),
        destinationIps: this.extractUniqueValues(events, 'destinationIp'),
        protocols: this.extractUniqueValues(events, 'protocol')
      }
    };
  }
  
  calculateConfidence(rule, events) {
    let confidence = 0.5; // Base confidence
    
    // Adjust based on event count
    const eventCount = Array.isArray(events) ? events.length : 1;
    if (eventCount > rule.threshold) {
      confidence += 0.1 * (eventCount - rule.threshold);
    }
    
    // Adjust based on rule complexity
    confidence += rule.conditions.length * 0.05;
    
    // Adjust based on temporal concentration
    if (Array.isArray(events) && events.length > 1) {
      const timestamps = events.map(e => new Date(e.timestamp).getTime());
      const timeSpan = Math.max(...timestamps) - Math.min(...timestamps);
      
      if (timeSpan < 60000) confidence += 0.2; // Within 1 minute
      else if (timeSpan < 300000) confidence += 0.1; // Within 5 minutes
    }
    
    return Math.min(confidence, 0.95);
  }
  
  extractUniqueValues(events, field) {
    if (!Array.isArray(events)) {
      const value = this.getFieldValue(events, field);
      return value ? [value] : [];
    }
    
    const values = new Set();
    for (const event of events) {
      const value = this.getFieldValue(event, field);
      if (value) {
        values.add(value);
      }
    }
    
    return Array.from(values);
  }
  
  async handleCorrelation(correlation) {
    try {
      // Store correlation
      await this.storeCorrelation(correlation);
      
      // Create alert if rule specifies
      const rule = this.correlationRules.get(correlation.ruleId);
      if (rule && rule.action === 'create_alert') {
        await this.createAlertFromCorrelation(correlation);
      }
      
      // Emit for real-time processing
      this.emit('correlation_processed', correlation);
      
    } catch (error) {
      logger.error(`Failed to handle correlation: ${error.message}`);
    }
  }
  
  async storeCorrelation(correlation) {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) return;
      
      const correlationKey = `correlation:${correlation.id}`;
      await redisClient.set(correlationKey, JSON.stringify(correlation), {
        EX: 86400 // 24 hours
      });
      
      // Add to recent correlations list
      await redisClient.lPush('correlations:list', correlationKey);
      await redisClient.lTrim('correlations:list', 0, 999);
      
      // Index by severity
      await redisClient.zAdd(`correlations:by_severity`, {
        score: Date.now(),
        value: `${correlation.severity}:${correlation.id}`
      });
      
    } catch (error) {
      logger.error(`Failed to store correlation: ${error.message}`);
    }
  }
  
  async createAlertFromCorrelation(correlation) {
    try {
      const alert = new Alert({
        title: `Correlated Event: ${correlation.ruleName}`,
        description: correlation.description,
        type: 'correlation',
        severity: correlation.severity,
        source: 'correlation_engine',
        metadata: {
          correlationId: correlation.id,
          ruleId: correlation.ruleId,
          eventCount: correlation.metadata.eventCount,
          confidence: correlation.confidence
        },
        affectedNodes: await this.extractAffectedNodes(correlation.events),
        tags: ['correlated', correlation.ruleId]
      });
      
      await alert.save();
      
      logger.info(`Created alert from correlation ${correlation.id}`);
      
      // Emit alert event
      this.emit('alert_created', alert);
      
    } catch (error) {
      logger.error(`Failed to create alert from correlation: ${error.message}`);
    }
  }
  
  async extractAffectedNodes(events) {
    const nodeIds = new Set();
    
    if (!Array.isArray(events)) {
      events = [events];
    }
    
    for (const event of events) {
      if (event.sourceNode) {
        nodeIds.add(event.sourceNode.toString());
      }
      if (event.exitNode) {
        nodeIds.add(event.exitNode.toString());
      }
    }
    
    return Array.from(nodeIds);
  }
  
  async getCorrelationStatistics(timeRange = '24h') {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) return null;
      
      const now = Date.now();
      let startTime;
      
      switch (timeRange) {
        case '1h':
          startTime = now - 3600000;
          break;
        case '24h':
          startTime = now - 86400000;
          break;
        case '7d':
          startTime = now - 604800000;
          break;
        default:
          startTime = now - 86400000;
      }
      
      // Get correlations by severity
      const severityCounts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      };
      
      const severityKeys = await redisClient.zRange(
        'correlations:by_severity',
        startTime,
        now
      );
      
      for (const key of severityKeys) {
        const [severity] = key.split(':');
        if (severityCounts[severity] !== undefined) {
          severityCounts[severity]++;
        }
      }
      
      // Get top correlation rules
      const ruleCounts = {};
      const recentCorrelations = await redisClient.lRange('correlations:list', 0, 99);
      
      for (const key of recentCorrelations) {
        const data = await redisClient.get(key);
        if (data) {
          const correlation = JSON.parse(data);
          const ruleId = correlation.ruleId;
          ruleCounts[ruleId] = (ruleCounts[ruleId] || 0) + 1;
        }
      }
      
      // Calculate average confidence
      let totalConfidence = 0;
      let confidenceCount = 0;
      
      for (const key of recentCorrelations.slice(0, 20)) {
        const data = await redisClient.get(key);
        if (data) {
          const correlation = JSON.parse(data);
          if (correlation.confidence) {
            totalConfidence += correlation.confidence;
            confidenceCount++;
          }
        }
      }
      
      return {
        severityDistribution: severityCounts,
        ruleDistribution: ruleCounts,
        totalCorrelations: Object.values(severityCounts).reduce((a, b) => a + b, 0),
        averageConfidence: confidenceCount > 0 ? totalConfidence / confidenceCount : 0,
        bufferSize: this.eventBuffer.size,
        timeRange: timeRange
      };
      
    } catch (error) {
      logger.error(`Failed to get correlation statistics: ${error.message}`);
      throw error;
    }
  }
  
  async getRecentCorrelations(limit = 50) {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) return [];
      
      const correlationKeys = await redisClient.lRange('correlations:list', 0, limit - 1);
      const correlations = [];
      
      for (const key of correlationKeys) {
        const data = await redisClient.get(key);
        if (data) {
          correlations.push(JSON.parse(data));
        }
      }
      
      return correlations;
      
    } catch (error) {
      logger.error(`Failed to get recent correlations: ${error.message}`);
      return [];
    }
  }
  
  async searchCorrelations(query) {
    try {
      const { ruleId, severity, startTime, endTime, limit = 50 } = query;
      
      const filters = [];
      if (ruleId) filters.push(`ruleId:${ruleId}`);
      if (severity) filters.push(`severity:${severity}`);
      
      // In a production system, you would use a proper search engine
      // This is a simplified implementation
      const allCorrelations = await this.getRecentCorrelations(1000);
      
      return allCorrelations.filter(correlation => {
        if (ruleId && correlation.ruleId !== ruleId) return false;
        if (severity && correlation.severity !== severity) return false;
        if (startTime && new Date(correlation.timestamp) < new Date(startTime)) return false;
        if (endTime && new Date(correlation.timestamp) > new Date(endTime)) return false;
        return true;
      }).slice(0, limit);
      
    } catch (error) {
      logger.error(`Correlation search failed: ${error.message}`);
      throw error;
    }
  }
  
  async exportCorrelations(format = 'json', filters = {}) {
    const correlations = await this.searchCorrelations({ ...filters, limit: 1000 });
    
    switch (format) {
      case 'json':
        return JSON.stringify(correlations, null, 2);
      case 'csv':
        return this.convertCorrelationsToCSV(correlations);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
  
  convertCorrelationsToCSV(correlations) {
    const headers = [
      'id', 'ruleId', 'ruleName', 'severity', 'confidence',
      'timestamp', 'eventCount', 'sourceIps', 'destinationIps'
    ];
    
    const rows = correlations.map(corr => [
      corr.id,
      corr.ruleId,
      corr.ruleName,
      corr.severity,
      corr.confidence,
      new Date(corr.timestamp).toISOString(),
      corr.metadata?.eventCount || 0,
      (corr.metadata?.sourceIps || []).join(';'),
      (corr.metadata?.destinationIps || []).join(';')
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
}

module.exports = new CorrelationEngine();