const logger = require('../utils/logger');
const TrafficLog = require('../models/TrafficLog');
const Alert = require('../models/Alert');
const { getRedisClient } = require('../config/redis');

class TrafficAnalyzer {
  constructor() {
    this.anomalyThresholds = {
      bandwidthSpike: 3.0, // 3x average
      connectionRate: 100, // connections per minute
      dataExfiltration: 100000000, // 100MB
      geographicAnomaly: 0.1 // 10% from unusual location
    };
    
    this.threatPatterns = {
      portScanning: [22, 23, 25, 53, 80, 443, 3389, 8080],
      ddosPatterns: ['SYN flood', 'UDP flood', 'ICMP flood'],
      malwareIndicators: ['exploit', 'shellcode', 'command', 'control']
    };
  }
  
  async analyzeTraffic(trafficLog) {
    try {
      const analysis = {
        isMalicious: false,
        threatLevel: 'low',
        threatTypes: [],
        confidence: 0,
        anomalies: []
      };
      
      // Check for port scanning
      if (this.isPortScanning(trafficLog)) {
        analysis.threatTypes.push('scanning');
        analysis.threatLevel = 'medium';
        analysis.confidence += 0.6;
        analysis.anomalies.push('port_scanning');
      }
      
      // Check for DDoS patterns
      if (this.isDDoSPattern(trafficLog)) {
        analysis.threatTypes.push('ddos');
        analysis.threatLevel = 'high';
        analysis.confidence += 0.8;
        analysis.anomalies.push('ddos_pattern');
      }
      
      // Check for data exfiltration
      if (this.isDataExfiltration(trafficLog)) {
        analysis.threatTypes.push('data_exfiltration');
        analysis.threatLevel = 'high';
        analysis.confidence += 0.7;
        analysis.anomalies.push('large_data_transfer');
      }
      
      // Check geographic anomalies
      if (await this.isGeographicAnomaly(trafficLog)) {
        analysis.threatTypes.push('geo_anomaly');
        analysis.threatLevel = 'medium';
        analysis.confidence += 0.5;
        analysis.anomalies.push('unusual_geographic_pattern');
      }
      
      // Check for protocol violations
      if (this.isProtocolViolation(trafficLog)) {
        analysis.threatTypes.push('protocol_violation');
        analysis.threatLevel = 'medium';
        analysis.confidence += 0.4;
        analysis.anomalies.push('protocol_anomaly');
      }
      
      // Check for known malware indicators
      if (this.hasMalwareIndicators(trafficLog)) {
        analysis.threatTypes.push('malware');
        analysis.threatLevel = 'critical';
        analysis.confidence += 0.9;
        analysis.anomalies.push('malware_indicators');
      }
      
      // Determine if malicious based on analysis
      analysis.isMalicious = analysis.threatTypes.length > 0 && analysis.confidence > 0.3;
      
      // Update threat level based on multiple indicators
      if (analysis.threatTypes.includes('malware')) {
        analysis.threatLevel = 'critical';
      } else if (analysis.threatTypes.includes('ddos') || analysis.threatTypes.includes('data_exfiltration')) {
        analysis.threatLevel = 'high';
      } else if (analysis.threatTypes.length >= 2) {
        analysis.threatLevel = 'medium';
      }
      
      return analysis;
      
    } catch (error) {
      logger.error(`Traffic analysis failed: ${error.message}`);
      throw error;
    }
  }
  
  isPortScanning(trafficLog) {
    // Check if traffic is targeting multiple well-known ports
    const targetPort = trafficLog.destinationPort;
    return this.threatPatterns.portScanning.includes(targetPort);
  }
  
  isDDoSPattern(trafficLog) {
    // Check for high connection rate to same destination
    const redisClient = getRedisClient();
    
    if (!redisClient) return false;
    
    // Implementation would check connection rates
    // This is a simplified version
    const connectionRate = this.getConnectionRate(trafficLog);
    return connectionRate > this.anomalyThresholds.connectionRate;
  }
  
  isDataExfiltration(trafficLog) {
    // Check for large data transfers
    const totalBytes = trafficLog.bytesSent + trafficLog.bytesReceived;
    return totalBytes > this.anomalyThresholds.dataExfiltration;
  }
  
  async isGeographicAnomaly(trafficLog) {
    try {
      // Get normal geographic patterns for the source node
      const normalPatterns = await this.getGeographicPatterns(trafficLog.sourceNode);
      
      if (!normalPatterns || normalPatterns.length === 0) {
        return false;
      }
      
      const currentGeo = trafficLog.geoData?.destCountryCode;
      
      // Check if current destination is unusual
      const isUnusual = !normalPatterns.includes(currentGeo);
      const frequency = this.getGeoFrequency(currentGeo, normalPatterns);
      
      return isUnusual && frequency < this.anomalyThresholds.geographicAnomaly;
      
    } catch (error) {
      logger.error(`Geographic anomaly check failed: ${error.message}`);
      return false;
    }
  }
  
  isProtocolViolation(trafficLog) {
    // Check for unusual protocol usage patterns
    const protocol = trafficLog.protocol;
    const port = trafficLog.destinationPort;
    
    // Example checks
    if (protocol === 'HTTP' && port !== 80 && port !== 8080) {
      return true;
    }
    
    if (protocol === 'HTTPS' && port !== 443) {
      return true;
    }
    
    if (protocol === 'DNS' && port !== 53) {
      return true;
    }
    
    return false;
  }
  
  hasMalwareIndicators(trafficLog) {
    // Check user agent for malware indicators
    const userAgent = trafficLog.userAgent || '';
    const requestedDomain = trafficLog.requestedDomain || '';
    
    for (const indicator of this.threatPatterns.malwareIndicators) {
      if (userAgent.toLowerCase().includes(indicator) || 
          requestedDomain.toLowerCase().includes(indicator)) {
        return true;
      }
    }
    
    return false;
  }
  
  async getGeographicPatterns(nodeId) {
    try {
      const redisClient = getRedisClient();
      const cacheKey = `geo_patterns:${nodeId}`;
      
      if (redisClient) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }
      
      // Get recent traffic patterns
      const recentTraffic = await TrafficLog.aggregate([
        {
          $match: {
            sourceNode: nodeId,
            timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: '$geoData.destCountryCode',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      
      const patterns = recentTraffic.map(item => item._id).filter(Boolean);
      
      if (redisClient) {
        await redisClient.set(cacheKey, JSON.stringify(patterns), {
          EX: 3600 // 1 hour
        });
      }
      
      return patterns;
      
    } catch (error) {
      logger.error(`Failed to get geographic patterns: ${error.message}`);
      return [];
    }
  }
  
  getGeoFrequency(countryCode, patterns) {
    if (!patterns || patterns.length === 0) return 0;
    
    const total = patterns.length;
    const count = patterns.filter(code => code === countryCode).length;
    
    return count / total;
  }
  
  getConnectionRate(trafficLog) {
    // This would normally query recent connections
    // Simplified implementation
    return 0;
  }
  
  async createAlertForTraffic(trafficLog, analysis) {
    try {
      if (!analysis.isMalicious || analysis.threatLevel === 'low') {
        return null;
      }
      
      const alertData = {
        title: this.generateAlertTitle(analysis),
        description: this.generateAlertDescription(trafficLog, analysis),
        type: this.getAlertType(analysis),
        severity: analysis.threatLevel,
        source: 'system',
        affectedNodes: [trafficLog.sourceNode],
        affectedTraffic: [trafficLog._id],
        metadata: {
          analysis,
          trafficDetails: {
            destinationIp: trafficLog.destinationIp,
            destinationPort: trafficLog.destinationPort,
            protocol: trafficLog.protocol,
            bytesTransferred: trafficLog.bytesSent + trafficLog.bytesReceived
          }
        },
        tags: analysis.threatTypes
      };
      
      const alert = new Alert(alertData);
      await alert.save();
      
      // Emit real-time alert
      const io = require('../server').io;
      if (io) {
        io.to('alerts').emit('new_alert', {
          alert: alert.getSummary(),
          type: alertData.type,
          severity: alertData.severity
        });
      }
      
      logger.info(`Alert created for malicious traffic: ${alert.title}`);
      
      return alert;
      
    } catch (error) {
      logger.error(`Failed to create alert: ${error.message}`);
      throw error;
    }
  }
  
  generateAlertTitle(analysis) {
    const threatTypes = analysis.threatTypes;
    
    if (threatTypes.includes('malware')) {
      return 'Malware Activity Detected';
    } else if (threatTypes.includes('ddos')) {
      return 'Potential DDoS Attack Detected';
    } else if (threatTypes.includes('data_exfiltration')) {
      return 'Suspicious Data Exfiltration';
    } else if (threatTypes.includes('scanning')) {
      return 'Port Scanning Activity Detected';
    } else if (threatTypes.includes('geo_anomaly')) {
      return 'Unusual Geographic Pattern';
    } else {
      return 'Suspicious Network Activity';
    }
  }
  
  generateAlertDescription(trafficLog, analysis) {
    const dest = trafficLog.destinationIp || 'unknown';
    const port = trafficLog.destinationPort || 'unknown';
    const bytes = trafficLog.bytesSent + trafficLog.bytesReceived;
    
    return `Suspicious traffic detected to ${dest}:${port}. ` +
           `Transferred ${this.formatBytes(bytes)}. ` +
           `Threat types: ${analysis.threatTypes.join(', ')}. ` +
           `Confidence: ${Math.round(analysis.confidence * 100)}%`;
  }
  
  getAlertType(analysis) {
    const threatTypes = analysis.threatTypes;
    
    if (threatTypes.includes('malware')) {
      return 'security_breach';
    } else if (threatTypes.includes('ddos')) {
      return 'performance_degradation';
    } else if (threatTypes.includes('data_exfiltration')) {
      return 'malicious_traffic';
    } else if (threatTypes.includes('scanning')) {
      return 'malicious_traffic';
    } else if (threatTypes.includes('geo_anomaly')) {
      return 'geo_anomaly';
    } else {
      return 'malicious_traffic';
    }
  }
  
  formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
  
  async analyzeBulkTraffic(trafficLogs) {
    try {
      const results = [];
      
      for (const trafficLog of trafficLogs) {
        try {
          const analysis = await this.analyzeTraffic(trafficLog);
          
          if (analysis.isMalicious) {
            // Update the traffic log with analysis results
            trafficLog.isMalicious = true;
            trafficLog.threatLevel = analysis.threatLevel;
            trafficLog.threatType = analysis.threatTypes;
            
            await trafficLog.save();
            
            // Create alert
            await this.createAlertForTraffic(trafficLog, analysis);
          }
          
          results.push({
            trafficId: trafficLog._id,
            analysis
          });
          
        } catch (error) {
          logger.error(`Error analyzing traffic log ${trafficLog._id}: ${error.message}`);
          results.push({
            trafficId: trafficLog._id,
            error: error.message
          });
        }
      }
      
      return {
        success: true,
        analyzed: results.length,
        malicious: results.filter(r => r.analysis?.isMalicious).length,
        results
      };
      
    } catch (error) {
      logger.error(`Bulk traffic analysis failed: ${error.message}`);
      throw error;
    }
  }
  
  async getTrafficStatistics(timeRange = '24h') {
    try {
      let timeFilter;
      const now = new Date();
      
      switch (timeRange) {
        case '1h':
          timeFilter = new Date(now - 60 * 60 * 1000);
          break;
        case '24h':
          timeFilter = new Date(now - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          timeFilter = new Date(now - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          timeFilter = new Date(now - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          timeFilter = new Date(now - 24 * 60 * 60 * 1000);
      }
      
      const stats = await TrafficLog.aggregate([
        {
          $match: {
            timestamp: { $gte: timeFilter }
          }
        },
        {
          $facet: {
            totalTraffic: [
              {
                $group: {
                  _id: null,
                  totalBytes: { $sum: { $add: ['$bytesSent', '$bytesReceived'] } },
                  totalConnections: { $sum: 1 },
                  avgDuration: { $avg: '$duration' }
                }
              }
            ],
            maliciousTraffic: [
              {
                $match: { isMalicious: true }
              },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  bytes: { $sum: { $add: ['$bytesSent', '$bytesReceived'] } }
                }
              }
            ],
            byProtocol: [
              {
                $group: {
                  _id: '$protocol',
                  count: { $sum: 1 },
                  bytes: { $sum: { $add: ['$bytesSent', '$bytesReceived'] } }
                }
              },
              { $sort: { count: -1 } }
            ],
            byThreatLevel: [
              {
                $match: { isMalicious: true }
              },
              {
                $group: {
                  _id: '$threatLevel',
                  count: { $sum: 1 }
                }
              }
            ],
            topSources: [
              {
                $lookup: {
                  from: 'tornodes',
                  localField: 'sourceNode',
                  foreignField: '_id',
                  as: 'sourceNodeInfo'
                }
              },
              { $unwind: '$sourceNodeInfo' },
              {
                $group: {
                  _id: '$sourceNodeInfo.nickname',
                  count: { $sum: 1 },
                  totalBytes: { $sum: { $add: ['$bytesSent', '$bytesReceived'] } }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 10 }
            ],
            hourlyTrend: [
              {
                $group: {
                  _id: {
                    hour: { $hour: '$timestamp' },
                    day: { $dayOfMonth: '$timestamp' },
                    month: { $month: '$timestamp' },
                    year: { $year: '$timestamp' }
                  },
                  count: { $sum: 1 },
                  maliciousCount: {
                    $sum: { $cond: [{ $eq: ['$isMalicious', true] }, 1, 0] }
                  },
                  totalBytes: { $sum: { $add: ['$bytesSent', '$bytesReceived'] } }
                }
              },
              { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
            ]
          }
        }
      ]);
      
      return stats[0];
      
    } catch (error) {
      logger.error(`Failed to get traffic statistics: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new TrafficAnalyzer();