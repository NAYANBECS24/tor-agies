const EventEmitter = require('events');
const logger = require('../utils/logger');
const EncryptionManager = require('./encryptionManager');
const { getRedisClient } = require('../config/redis');

class FederatedATWCEngine extends EventEmitter {
  constructor() {
    super();
    this.correlationRules = new Map();
    this.threatIndicators = new Map();
    this.warningPatterns = new Map();
    this.federatedNodes = new Map();
    this.correlationWindow = 5 * 60 * 1000; // 5 minutes
    this.minConfidenceThreshold = 0.7;
    
    // Initialize correlation rules
    this.initCorrelationRules();
    this.initThreatIndicators();
    this.initWarningPatterns();
  }
  
  initCorrelationRules() {
    // Rule 1: Multiple port scans from same source in short time
    this.correlationRules.set('port_scan_correlation', {
      id: 'port_scan_correlation',
      name: 'Port Scan Correlation',
      description: 'Correlate multiple port scans from same source',
      conditions: [
        { type: 'event', eventType: 'port_scan', minCount: 3 },
        { type: 'time', window: 300000 }, // 5 minutes
        { type: 'source', same: true }
      ],
      action: 'raise_threat',
      severity: 'medium',
      confidence: 0.8
    });
    
    // Rule 2: DDoS pattern correlation
    this.correlationRules.set('ddos_correlation', {
      id: 'ddos_correlation',
      name: 'DDoS Pattern Correlation',
      description: 'Correlate multiple connection attempts to same target',
      conditions: [
        { type: 'event', eventType: 'connection_flood', minCount: 100 },
        { type: 'time', window: 60000 }, // 1 minute
        { type: 'target', same: true }
      ],
      action: 'raise_threat',
      severity: 'high',
      confidence: 0.9
    });
    
    // Rule 3: Malware command and control
    this.correlationRules.set('c2_correlation', {
      id: 'c2_correlation',
      name: 'C2 Server Correlation',
      description: 'Correlate connections to known C2 servers',
      conditions: [
        { type: 'event', eventType: 'c2_communication' },
        { type: 'reputation', blacklisted: true }
      ],
      action: 'raise_threat',
      severity: 'critical',
      confidence: 0.95
    });
    
    // Rule 4: Data exfiltration pattern
    this.correlationRules.set('data_exfil_correlation', {
      id: 'data_exfil_correlation',
      name: 'Data Exfiltration Correlation',
      description: 'Correlate large data transfers to suspicious destinations',
      conditions: [
        { type: 'data', minSize: 100000000 }, // 100MB
        { type: 'destination', suspicious: true },
        { type: 'time', window: 3600000 } // 1 hour
      ],
      action: 'raise_threat',
      severity: 'high',
      confidence: 0.85
    });
  }
  
  initThreatIndicators() {
    this.threatIndicators.set('tor_exit_abuse', {
      type: 'tor_exit_abuse',
      description: 'Tor exit node being used for abusive activities',
      weight: 0.8,
      indicators: [
        'high_bandwidth_usage',
        'multiple_complaints',
        'blacklisted_destinations'
      ]
    });
    
    this.threatIndicators.set('node_compromise', {
      type: 'node_compromise',
      description: 'Tor node potentially compromised',
      weight: 0.9,
      indicators: [
        'unusual_behavior',
        'version_mismatch',
        'suspicious_connections'
      ]
    });
    
    this.threatIndicators.set('network_sybil', {
      type: 'network_sybil',
      description: 'Sybil attack on Tor network',
      weight: 0.7,
      indicators: [
        'multiple_nodes_same_operator',
        'coordinated_behavior',
        'reputation_manipulation'
      ]
    });
  }
  
  initWarningPatterns() {
    this.warningPatterns.set('performance_degradation', {
      type: 'performance_degradation',
      description: 'Network performance degradation detected',
      severity: 'medium',
      patterns: [
        'high_latency',
        'packet_loss',
        'throughput_reduction'
      ]
    });
    
    this.warningPatterns.set('anomalous_traffic', {
      type: 'anomalous_traffic',
      description: 'Anomalous traffic patterns detected',
      severity: 'low',
      patterns: [
        'unusual_protocol_mix',
        'strange_timing',
        'irregular_volume'
      ]
    });
  }
  
  async correlateEvents(events) {
    try {
      const correlations = [];
      const eventGroups = this.groupEvents(events);
      
      for (const [ruleId, rule] of this.correlationRules) {
        for (const group of eventGroups) {
          const isMatch = this.evaluateRule(rule, group);
          
          if (isMatch) {
            const correlation = this.createCorrelation(rule, group);
            correlations.push(correlation);
            
            // Emit correlation event
            this.emit('correlation_detected', correlation);
            
            // Store in Redis for federated sharing
            await this.storeCorrelation(correlation);
          }
        }
      }
      
      // Check for threat indicator correlations
      const threatCorrelations = await this.correlateThreatIndicators(events);
      correlations.push(...threatCorrelations);
      
      // Check for warning pattern correlations
      const warningCorrelations = await this.correlateWarningPatterns(events);
      correlations.push(...warningCorrelations);
      
      return correlations;
      
    } catch (error) {
      logger.error(`Correlation failed: ${error.message}`);
      throw error;
    }
  }
  
  groupEvents(events) {
    const groups = new Map();
    
    // Group by source IP
    events.forEach(event => {
      const sourceKey = event.sourceIp || 'unknown';
      if (!groups.has(sourceKey)) {
        groups.set(sourceKey, []);
      }
      groups.get(sourceKey).push(event);
    });
    
    // Group by destination IP
    events.forEach(event => {
      const destKey = event.destinationIp || 'unknown';
      if (!groups.has(`dest_${destKey}`)) {
        groups.set(`dest_${destKey}`, []);
      }
      groups.get(`dest_${destKey}`).push(event);
    });
    
    // Group by event type
    events.forEach(event => {
      const typeKey = `type_${event.type}`;
      if (!groups.has(typeKey)) {
        groups.set(typeKey, []);
      }
      groups.get(typeKey).push(event);
    });
    
    return Array.from(groups.values());
  }
  
  evaluateRule(rule, events) {
    if (events.length === 0) return false;
    
    for (const condition of rule.conditions) {
      switch (condition.type) {
        case 'event':
          if (!this.evaluateEventCondition(condition, events)) return false;
          break;
        case 'time':
          if (!this.evaluateTimeCondition(condition, events)) return false;
          break;
        case 'source':
          if (!this.evaluateSourceCondition(condition, events)) return false;
          break;
        case 'target':
          if (!this.evaluateTargetCondition(condition, events)) return false;
          break;
        case 'data':
          if (!this.evaluateDataCondition(condition, events)) return false;
          break;
        case 'reputation':
          if (!this.evaluateReputationCondition(condition, events)) return false;
          break;
      }
    }
    
    return true;
  }
  
  evaluateEventCondition(condition, events) {
    const matchingEvents = events.filter(e => e.type === condition.eventType);
    return matchingEvents.length >= (condition.minCount || 1);
  }
  
  evaluateTimeCondition(condition, events) {
    if (events.length < 2) return true;
    
    const timestamps = events.map(e => new Date(e.timestamp).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    
    return (maxTime - minTime) <= condition.window;
  }
  
  evaluateSourceCondition(condition, events) {
    if (!condition.same) return true;
    
    const sources = new Set(events.map(e => e.sourceIp));
    return sources.size === 1;
  }
  
  evaluateTargetCondition(condition, events) {
    if (!condition.same) return true;
    
    const targets = new Set(events.map(e => e.destinationIp));
    return targets.size === 1;
  }
  
  evaluateDataCondition(condition, events) {
    const totalData = events.reduce((sum, e) => sum + (e.bytes || 0), 0);
    return totalData >= (condition.minSize || 0);
  }
  
  evaluateReputationCondition(condition, events) {
    // This would check against reputation databases
    // Simplified implementation
    return events.some(e => e.reputationScore < 0.3);
  }
  
  createCorrelation(rule, events) {
    const confidence = this.calculateConfidence(rule, events);
    
    return {
      id: `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      description: rule.description,
      events: events.map(e => ({ id: e.id, type: e.type, timestamp: e.timestamp })),
      severity: rule.severity,
      confidence: confidence,
      timestamp: new Date().toISOString(),
      metadata: {
        eventCount: events.length,
        sources: [...new Set(events.map(e => e.sourceIp))],
        destinations: [...new Set(events.map(e => e.destinationIp))]
      }
    };
  }
  
  calculateConfidence(rule, events) {
    let baseConfidence = rule.confidence || 0.5;
    
    // Adjust based on event count
    const eventCount = events.length;
    if (eventCount > 10) baseConfidence += 0.2;
    else if (eventCount > 5) baseConfidence += 0.1;
    
    // Adjust based on time concentration
    const timestamps = events.map(e => new Date(e.timestamp).getTime());
    const timeSpan = Math.max(...timestamps) - Math.min(...timestamps);
    if (timeSpan < 60000) baseConfidence += 0.15; // Within 1 minute
    else if (timeSpan < 300000) baseConfidence += 0.1; // Within 5 minutes
    
    // Cap at 0.95
    return Math.min(baseConfidence, 0.95);
  }
  
  async correlateThreatIndicators(events) {
    const correlations = [];
    
    for (const [indicatorId, indicator] of this.threatIndicators) {
      const matchingEvents = events.filter(event => {
        return indicator.indicators.some(ind => 
          event.tags?.includes(ind) || 
          event.description?.toLowerCase().includes(ind.toLowerCase())
        );
      });
      
      if (matchingEvents.length >= 2) {
        const correlation = {
          id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'threat_indicator_correlation',
          indicatorId: indicatorId,
          indicatorName: indicator.type,
          description: indicator.description,
          events: matchingEvents.map(e => ({ id: e.id, type: e.type })),
          severity: 'high',
          confidence: indicator.weight,
          timestamp: new Date().toISOString(),
          weight: indicator.weight,
          recommendations: this.generateThreatRecommendations(indicatorId)
        };
        
        correlations.push(correlation);
        this.emit('threat_correlation', correlation);
      }
    }
    
    return correlations;
  }
  
  async correlateWarningPatterns(events) {
    const correlations = [];
    
    for (const [patternId, pattern] of this.warningPatterns) {
      const matchingEvents = events.filter(event => {
        return pattern.patterns.some(p => 
          event.tags?.includes(p) || 
          event.description?.toLowerCase().includes(p.toLowerCase())
        );
      });
      
      if (matchingEvents.length >= 1) {
        const correlation = {
          id: `warning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'warning_pattern_correlation',
          patternId: patternId,
          patternName: pattern.type,
          description: pattern.description,
          events: matchingEvents.map(e => ({ id: e.id, type: e.type })),
          severity: pattern.severity,
          confidence: 0.6,
          timestamp: new Date().toISOString(),
          recommendations: this.generateWarningRecommendations(patternId)
        };
        
        correlations.push(correlation);
        this.emit('warning_correlation', correlation);
      }
    }
    
    return correlations;
  }
  
  generateThreatRecommendations(indicatorId) {
    const recommendations = {
      tor_exit_abuse: [
        'Monitor exit node traffic patterns',
        'Check for abuse reports',
        'Consider temporary exit node restriction',
        'Review destination IP reputation'
      ],
      node_compromise: [
        'Isolate node from network',
        'Analyze recent connections',
        'Check for unauthorized changes',
        'Consider node replacement'
      ],
      network_sybil: [
        'Analyze node operator patterns',
        'Check for coordinated behavior',
        'Review network consensus',
        'Implement sybil detection measures'
      ]
    };
    
    return recommendations[indicatorId] || ['Investigate further'];
  }
  
  generateWarningRecommendations(patternId) {
    const recommendations = {
      performance_degradation: [
        'Monitor network performance metrics',
        'Check for congestion points',
        'Review recent configuration changes',
        'Consider load balancing'
      ],
      anomalous_traffic: [
        'Analyze traffic patterns',
        'Check for misconfigurations',
        'Review firewall rules',
        'Monitor for escalation'
      ]
    };
    
    return recommendations[patternId] || ['Monitor situation'];
  }
  
  async storeCorrelation(correlation) {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) return;
      
      const correlationKey = `correlation:${correlation.id}`;
      const correlationData = JSON.stringify(correlation);
      
      // Store correlation
      await redisClient.set(correlationKey, correlationData, {
        EX: 86400 // 24 hours
      });
      
      // Add to correlation list
      await redisClient.lPush('correlations:recent', correlationKey);
      await redisClient.lTrim('correlations:recent', 0, 99);
      
      // Index by severity
      await redisClient.zAdd(`correlations:severity:${correlation.severity}`, {
        score: Date.now(),
        value: correlationKey
      });
      
      logger.debug(`Stored correlation ${correlation.id}`);
      
      // Federate to other nodes if configured
      await this.federateCorrelation(correlation);
      
    } catch (error) {
      logger.error(`Failed to store correlation: ${error.message}`);
    }
  }
  
  async federateCorrelation(correlation) {
    try {
      // Check if federation is enabled
      if (!process.env.FEDERATION_ENABLED || process.env.FEDERATION_ENABLED !== 'true') {
        return;
      }
      
      // Prepare federated message
      const federatedMessage = {
        type: 'correlation',
        source: process.env.NODE_ID || 'tor-sentinel-1',
        timestamp: new Date().toISOString(),
        correlation: {
          id: correlation.id,
          type: correlation.type,
          severity: correlation.severity,
          confidence: correlation.confidence,
          summary: correlation.description,
          metadata: {
            eventCount: correlation.metadata?.eventCount,
            sources: correlation.metadata?.sources?.slice(0, 3) // Limit data sharing
          }
        },
        signature: null
      };
      
      // Sign the message
      const signature = EncryptionManager.createDigitalSignature(
        federatedMessage,
        process.env.FEDERATION_PRIVATE_KEY
      );
      
      federatedMessage.signature = signature;
      
      // Encrypt for specific recipients if needed
      const encryptedMessage = EncryptionManager.encrypt(
        JSON.stringify(federatedMessage),
        process.env.FEDERATION_SHARED_KEY
      );
      
      // Send to federation endpoints
      const federationEndpoints = process.env.FEDERATION_ENDPOINTS?.split(',') || [];
      
      for (const endpoint of federationEndpoints) {
        try {
          await this.sendToFederationEndpoint(endpoint, encryptedMessage);
        } catch (error) {
          logger.warn(`Failed to send to federation endpoint ${endpoint}: ${error.message}`);
        }
      }
      
    } catch (error) {
      logger.error(`Federation failed: ${error.message}`);
    }
  }
  
  async sendToFederationEndpoint(endpoint, message) {
    // Implementation for sending to federation endpoints
    // This could be HTTP, WebSocket, or other protocols
    const axios = require('axios');
    
    await axios.post(`${endpoint}/api/federation/correlation`, message, {
      headers: {
        'Content-Type': 'application/json',
        'X-Federation-Key': process.env.FEDERATION_API_KEY
      },
      timeout: 5000
    });
  }
  
  async receiveFederatedCorrelation(message) {
    try {
      // Verify signature
      const isValid = EncryptionManager.verifyDigitalSignature(
        message,
        message.signature,
        process.env.FEDERATION_PUBLIC_KEY
      );
      
      if (!isValid) {
        throw new Error('Invalid signature');
      }
      
      // Process the correlation
      const correlation = message.correlation;
      correlation.federated = true;
      correlation.federatedFrom = message.source;
      
      // Store locally
      await this.storeCorrelation(correlation);
      
      // Emit event
      this.emit('federated_correlation_received', correlation);
      
      logger.info(`Received federated correlation ${correlation.id} from ${message.source}`);
      
    } catch (error) {
      logger.error(`Failed to process federated correlation: ${error.message}`);
    }
  }
  
  async getRecentCorrelations(limit = 50, severity = null) {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) return [];
      
      let correlationKeys;
      
      if (severity) {
        correlationKeys = await redisClient.zRange(
          `correlations:severity:${severity}`,
          0,
          limit - 1,
          { REV: true }
        );
      } else {
        correlationKeys = await redisClient.lRange('correlations:recent', 0, limit - 1);
      }
      
      const correlations = [];
      
      for (const key of correlationKeys) {
        const data = await redisClient.get(key);
        if (data) {
          correlations.push(JSON.parse(data));
        }
      }
      
      return correlations;
      
    } catch (error) {
      logger.error(`Failed to get correlations: ${error.message}`);
      return [];
    }
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
      const severityStats = {};
      const severities = ['critical', 'high', 'medium', 'low'];
      
      for (const severity of severities) {
        const count = await redisClient.zCount(
          `correlations:severity:${severity}`,
          startTime,
          now
        );
        severityStats[severity] = count;
      }
      
      // Get top correlation types
      const correlationTypes = await redisClient.lRange('correlations:recent', 0, 99);
      const typeCounts = {};
      
      for (const key of correlationTypes) {
        const data = await redisClient.get(key);
        if (data) {
          const correlation = JSON.parse(data);
          const type = correlation.type || 'unknown';
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        }
      }
      
      // Calculate average confidence
      let totalConfidence = 0;
      let confidenceCount = 0;
      
      for (const key of correlationTypes.slice(0, 20)) {
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
        severityDistribution: severityStats,
        typeDistribution: typeCounts,
        totalCorrelations: Object.values(severityStats).reduce((a, b) => a + b, 0),
        averageConfidence: confidenceCount > 0 ? totalConfidence / confidenceCount : 0,
        timeRange: timeRange
      };
      
    } catch (error) {
      logger.error(`Failed to get correlation statistics: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new FederatedATWCEngine();