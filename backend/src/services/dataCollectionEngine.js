const EventEmitter = require('events');
const logger = require('../utils/logger');
const { getRedisClient } = require('../config/redis');
const TorNode = require('../models/TorNode');
const TrafficLog = require('../models/TrafficLog');
const Alert = require('../models/Alert');

class DataCollectionEngine extends EventEmitter {
  constructor() {
    super();
    this.collectors = new Map();
    this.dataBuffers = new Map();
    this.aggregationIntervals = new Map();
    this.collectionStats = {
      totalEvents: 0,
      lastCollection: null,
      activeCollectors: 0,
      errors: 0
    };
    
    this.initCollectors();
    this.startAggregationTasks();
  }
  
  initCollectors() {
    // Real-time traffic collector
    this.addCollector({
      id: 'realtime_traffic',
      name: 'Real-time Traffic Collector',
      interval: 10000, // 10 seconds
      collector: this.collectRealtimeTraffic.bind(this),
      bufferSize: 1000
    });
    
    // Node status collector
    this.addCollector({
      id: 'node_status',
      name: 'Node Status Collector',
      interval: 30000, // 30 seconds
      collector: this.collectNodeStatus.bind(this),
      bufferSize: 500
    });
    
    // Performance metrics collector
    this.addCollector({
      id: 'performance_metrics',
      name: 'Performance Metrics Collector',
      interval: 60000, // 1 minute
      collector: this.collectPerformanceMetrics.bind(this),
      bufferSize: 100
    });
    
    // Threat intelligence collector
    this.addCollector({
      id: 'threat_intel',
      name: 'Threat Intelligence Collector',
      interval: 300000, // 5 minutes
      collector: this.collectThreatIntelligence.bind(this),
      bufferSize: 50
    });
    
    // Network statistics collector
    this.addCollector({
      id: 'network_stats',
      name: 'Network Statistics Collector',
      interval: 60000, // 1 minute
      collector: this.collectNetworkStatistics.bind(this),
      bufferSize: 100
    });
  }
  
  addCollector(config) {
    this.collectors.set(config.id, {
      ...config,
      isRunning: false,
      lastRun: null,
      errorCount: 0
    });
    
    this.dataBuffers.set(config.id, []);
  }
  
  async startAllCollectors() {
    logger.info('Starting all data collectors...');
    
    for (const [id, collector] of this.collectors) {
      await this.startCollector(id);
    }
    
    this.collectionStats.activeCollectors = this.collectors.size;
  }
  
  async startCollector(collectorId) {
    const collector = this.collectors.get(collectorId);
    if (!collector || collector.isRunning) {
      return;
    }
    
    collector.isRunning = true;
    
    const runCollection = async () => {
      if (!collector.isRunning) return;
      
      try {
        const startTime = Date.now();
        
        // Run collector
        const data = await collector.collector();
        
        // Store in buffer
        await this.bufferData(collectorId, data);
        
        // Update stats
        collector.lastRun = new Date();
        collector.errorCount = 0;
        
        this.collectionStats.totalEvents += Array.isArray(data) ? data.length : 1;
        this.collectionStats.lastCollection = new Date();
        
        // Emit collection event
        this.emit('data_collected', {
          collectorId,
          dataCount: Array.isArray(data) ? data.length : 1,
          duration: Date.now() - startTime
        });
        
        logger.debug(`Collector ${collectorId} completed in ${Date.now() - startTime}ms`);
        
      } catch (error) {
        logger.error(`Collector ${collectorId} failed: ${error.message}`);
        collector.errorCount++;
        this.collectionStats.errors++;
      }
      
      // Schedule next run
      if (collector.isRunning) {
        setTimeout(runCollection, collector.interval);
      }
    };
    
    // Initial run
    setTimeout(runCollection, 100);
  }
  
  async stopCollector(collectorId) {
    const collector = this.collectors.get(collectorId);
    if (collector) {
      collector.isRunning = false;
      this.collectionStats.activeCollectors--;
    }
  }
  
  async stopAllCollectors() {
    for (const [id] of this.collectors) {
      await this.stopCollector(id);
    }
  }
  
  async bufferData(collectorId, data) {
    if (!this.dataBuffers.has(collectorId)) {
      this.dataBuffers.set(collectorId, []);
    }
    
    const buffer = this.dataBuffers.get(collectorId);
    const collector = this.collectors.get(collectorId);
    
    if (Array.isArray(data)) {
      buffer.push(...data);
    } else {
      buffer.push(data);
    }
    
    // Trim buffer if too large
    if (buffer.length > collector.bufferSize) {
      buffer.splice(0, buffer.length - collector.bufferSize);
    }
    
    // Emit buffer update
    this.emit('buffer_updated', {
      collectorId,
      bufferSize: buffer.length
    });
  }
  
  async collectRealtimeTraffic() {
    try {
      const recentTraffic = await TrafficLog.find()
        .sort({ timestamp: -1 })
        .limit(100)
        .populate('sourceNode exitNode', 'nickname ipAddress country')
        .lean();
      
      // Process and enrich data
      const processedTraffic = recentTraffic.map(log => ({
        id: log._id.toString(),
        timestamp: log.timestamp,
        sourceNode: log.sourceNode ? {
          id: log.sourceNode._id.toString(),
          nickname: log.sourceNode.nickname,
          ipAddress: log.sourceNode.ipAddress,
          country: log.sourceNode.country
        } : null,
        destinationIp: log.destinationIp,
        protocol: log.protocol,
        bytesSent: log.bytesSent,
        bytesReceived: log.bytesReceived,
        isMalicious: log.isMalicious,
        threatLevel: log.threatLevel,
        threatType: log.threatType,
        duration: log.duration
      }));
      
      return processedTraffic;
      
    } catch (error) {
      logger.error(`Real-time traffic collection failed: ${error.message}`);
      throw error;
    }
  }
  
  async collectNodeStatus() {
    try {
      const nodes = await TorNode.find({ status: 'online' })
        .limit(200)
        .select('nickname fingerprint ipAddress country status bandwidth flags lastSeen')
        .lean();
      
      // Calculate node health scores
      const nodeStatus = nodes.map(node => ({
        id: node._id.toString(),
        fingerprint: node.fingerprint,
        nickname: node.nickname,
        ipAddress: node.ipAddress,
        country: node.country,
        status: node.status,
        bandwidth: node.bandwidth?.average || 0,
        flags: node.flags || [],
        lastSeen: node.lastSeen,
        healthScore: this.calculateNodeHealthScore(node),
        isCritical: node.flags?.includes('Exit') || node.flags?.includes('Guard')
      }));
      
      return nodeStatus;
      
    } catch (error) {
      logger.error(`Node status collection failed: ${error.message}`);
      throw error;
    }
  }
  
  calculateNodeHealthScore(node) {
    let score = 50; // Base score
    
    // Uptime factor
    if (node.uptime > 0.9) score += 20; // >90% uptime
    else if (node.uptime > 0.7) score += 10; // >70% uptime
    
    // Bandwidth factor
    const bandwidth = node.bandwidth?.average || 0;
    if (bandwidth > 100000000) score += 20; // >100MB/s
    else if (bandwidth > 10000000) score += 10; // >10MB/s
    
    // Flag factors
    const flags = node.flags || [];
    if (flags.includes('Stable')) score += 10;
    if (flags.includes('Fast')) score += 10;
    if (flags.includes('Valid')) score += 5;
    
    // Recency factor
    const hoursSinceSeen = (Date.now() - new Date(node.lastSeen).getTime()) / (1000 * 60 * 60);
    if (hoursSinceSeen > 24) score -= 30; // Offline for >24 hours
    else if (hoursSinceSeen > 1) score -= 10; // Seen >1 hour ago
    
    return Math.max(0, Math.min(100, score));
  }
  
  async collectPerformanceMetrics() {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now - 3600000);
      
      const metrics = await TrafficLog.aggregate([
        {
          $match: {
            timestamp: { $gte: oneHourAgo }
          }
        },
        {
          $facet: {
            throughput: [
              {
                $group: {
                  _id: null,
                  totalBytes: { $sum: { $add: ['$bytesSent', '$bytesReceived'] } },
                  avgBytesPerSecond: { 
                    $avg: { 
                      $divide: [
                        { $add: ['$bytesSent', '$bytesReceived'] },
                        { $max: [1, '$duration'] }
                      ]
                    }
                  }
                }
              }
            ],
            latency: [
              {
                $match: { duration: { $gt: 0 } }
              },
              {
                $group: {
                  _id: null,
                  avgLatency: { $avg: '$duration' },
                  maxLatency: { $max: '$duration' },
                  minLatency: { $min: '$duration' }
                }
              }
            ],
            successRate: [
              {
                $group: {
                  _id: null,
                  totalConnections: { $sum: 1 },
                  successfulConnections: {
                    $sum: {
                      $cond: [
                        { $and: [
                          { $gt: ['$bytesReceived', 0] },
                          { $lt: ['$responseCode', 500] }
                        ]},
                        1,
                        0
                      ]
                    }
                  }
                }
              }
            ],
            errorDistribution: [
              {
                $match: { responseCode: { $gte: 400 } }
              },
              {
                $group: {
                  _id: '$responseCode',
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 10 }
            ]
          }
        }
      ]);
      
      const result = {
        timestamp: now,
        throughput: metrics[0]?.throughput[0] || { totalBytes: 0, avgBytesPerSecond: 0 },
        latency: metrics[0]?.latency[0] || { avgLatency: 0, maxLatency: 0, minLatency: 0 },
        successRate: metrics[0]?.successRate[0] || { totalConnections: 0, successfulConnections: 0 },
        errorDistribution: metrics[0]?.errorDistribution || []
      };
      
      // Calculate success rate percentage
      if (result.successRate.totalConnections > 0) {
        result.successRate.percentage = 
          (result.successRate.successfulConnections / result.successRate.totalConnections) * 100;
      } else {
        result.successRate.percentage = 100;
      }
      
      return result;
      
    } catch (error) {
      logger.error(`Performance metrics collection failed: ${error.message}`);
      throw error;
    }
  }
  
  async collectThreatIntelligence() {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now - 86400000);
      
      const threats = await TrafficLog.aggregate([
        {
          $match: {
            isMalicious: true,
            timestamp: { $gte: twentyFourHoursAgo }
          }
        },
        {
          $facet: {
            byThreatType: [
              { $unwind: '$threatType' },
              {
                $group: {
                  _id: '$threatType',
                  count: { $sum: 1 },
                  totalBytes: { $sum: { $add: ['$bytesSent', '$bytesReceived'] } }
                }
              },
              { $sort: { count: -1 } }
            ],
            bySeverity: [
              {
                $group: {
                  _id: '$threatLevel',
                  count: { $sum: 1 }
                }
              },
              { $sort: { _id: -1 } }
            ],
            topSources: [
              {
                $lookup: {
                  from: 'tornodes',
                  localField: 'sourceNode',
                  foreignField: '_id',
                  as: 'nodeInfo'
                }
              },
              { $unwind: '$nodeInfo' },
              {
                $group: {
                  _id: '$sourceNode',
                  nickname: { $first: '$nodeInfo.nickname' },
                  count: { $sum: 1 },
                  threatTypes: { $addToSet: '$threatType' }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 10 }
            ],
            emergingThreats: [
              {
                $match: {
                  timestamp: { $gte: new Date(now - 3600000) } // Last hour
                }
              },
              { $unwind: '$threatType' },
              {
                $group: {
                  _id: '$threatType',
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 5 }
            ]
          }
        }
      ]);
      
      const alerts = await Alert.find({
        triggeredAt: { $gte: twentyFourHoursAgo },
        severity: { $in: ['high', 'critical'] }
      })
      .sort({ triggeredAt: -1 })
      .limit(10)
      .lean();
      
      return {
        timestamp: now,
        threatDistribution: threats[0]?.byThreatType || [],
        severityDistribution: threats[0]?.bySeverity || [],
        topThreatSources: threats[0]?.topSources || [],
        emergingThreats: threats[0]?.emergingThreats || [],
        recentAlerts: alerts
      };
      
    } catch (error) {
      logger.error(`Threat intelligence collection failed: ${error.message}`);
      throw error;
    }
  }
  
  async collectNetworkStatistics() {
    try {
      const stats = await TorNode.aggregate([
        {
          $facet: {
            overview: [
              {
                $group: {
                  _id: null,
                  totalNodes: { $sum: 1 },
                  onlineNodes: {
                    $sum: { $cond: [{ $eq: ['$status', 'online'] }, 1, 0] }
                  },
                  exitNodes: {
                    $sum: { $cond: [{ $eq: ['$isExit', true] }, 1, 0] }
                  },
                  guardNodes: {
                    $sum: { $cond: [{ $eq: ['$isGuard', true] }, 1, 0] }
                  },
                  totalBandwidth: { $sum: '$bandwidth.average' }
                }
              }
            ],
            countryDistribution: [
              { $match: { status: 'online' } },
              {
                $group: {
                  _id: '$countryCode',
                  country: { $first: '$country' },
                  count: { $sum: 1 },
                  bandwidth: { $sum: '$bandwidth.average' }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 15 }
            ],
            versionDistribution: [
              { 
                $match: { 
                  status: 'online',
                  version: { $exists: true, $ne: '' }
                }
              },
              {
                $group: {
                  _id: { $arrayElemAt: [{ $split: ['$version', ' '] }, 0] },
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 10 }
            ],
            statusTrend: [
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 }
                }
              }
            ]
          }
        }
      ]);
      
      return {
        timestamp: new Date(),
        overview: stats[0]?.overview[0] || {
          totalNodes: 0,
          onlineNodes: 0,
          exitNodes: 0,
          guardNodes: 0,
          totalBandwidth: 0
        },
        countryDistribution: stats[0]?.countryDistribution || [],
        versionDistribution: stats[0]?.versionDistribution || [],
        statusTrend: stats[0]?.statusTrend || []
      };
      
    } catch (error) {
      logger.error(`Network statistics collection failed: ${error.message}`);
      throw error;
    }
  }
  
  startAggregationTasks() {
    // Hourly aggregation
    setInterval(async () => {
      try {
        await this.aggregateHourlyData();
      } catch (error) {
        logger.error(`Hourly aggregation failed: ${error.message}`);
      }
    }, 3600000); // 1 hour
    
    // Daily aggregation
    setInterval(async () => {
      try {
        await this.aggregateDailyData();
      } catch (error) {
        logger.error(`Daily aggregation failed: ${error.message}`);
      }
    }, 86400000); // 24 hours
  }
  
  async aggregateHourlyData() {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now - 3600000);
      
      // Aggregate traffic data
      const trafficAggregation = await TrafficLog.aggregate([
        {
          $match: {
            timestamp: { $gte: oneHourAgo, $lt: now }
          }
        },
        {
          $group: {
            _id: {
              hour: { $hour: '$timestamp' },
              minute: 0
            },
            timestamp: { $first: '$timestamp' },
            totalConnections: { $sum: 1 },
            totalBytes: { $sum: { $add: ['$bytesSent', '$bytesReceived'] } },
            maliciousConnections: {
              $sum: { $cond: [{ $eq: ['$isMalicious', true] }, 1, 0] }
            },
            avgLatency: { $avg: '$duration' }
          }
        },
        { $sort: { '_id.hour': 1 } }
      ]);
      
      // Store aggregated data
      const redisClient = getRedisClient();
      if (redisClient) {
        await redisClient.set(
          `aggregation:hourly:${now.getHours()}`,
          JSON.stringify(trafficAggregation),
          { EX: 2592000 } // 30 days
        );
      }
      
      logger.info(`Hourly aggregation completed for ${now.toISOString()}`);
      
    } catch (error) {
      logger.error(`Hourly aggregation failed: ${error.message}`);
      throw error;
    }
  }
  
  async aggregateDailyData() {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now - 86400000);
      
      // Aggregate daily statistics
      const dailyStats = await TrafficLog.aggregate([
        {
          $match: {
            timestamp: { $gte: oneDayAgo, $lt: now }
          }
        },
        {
          $facet: {
            summary: [
              {
                $group: {
                  _id: null,
                  totalConnections: { $sum: 1 },
                  totalBytes: { $sum: { $add: ['$bytesSent', '$bytesReceived'] } },
                  maliciousConnections: {
                    $sum: { $cond: [{ $eq: ['$isMalicious', true] }, 1, 0] }
                  },
                  uniqueSources: { $addToSet: '$sourceNode' },
                  uniqueDestinations: { $addToSet: '$destinationIp' }
                }
              }
            ],
            protocolBreakdown: [
              {
                $group: {
                  _id: '$protocol',
                  count: { $sum: 1 },
                  bytes: { $sum: { $add: ['$bytesSent', '$bytesReceived'] } }
                }
              },
              { $sort: { count: -1 } }
            ],
            threatBreakdown: [
              {
                $match: { isMalicious: true }
              },
              { $unwind: '$threatType' },
              {
                $group: {
                  _id: '$threatType',
                  count: { $sum: 1 },
                  bytes: { $sum: { $add: ['$bytesSent', '$bytesReceived'] } }
                }
              },
              { $sort: { count: -1 } }
            ]
          }
        }
      ]);
      
      // Store daily report
      const redisClient = getRedisClient();
      if (redisClient) {
        const dateStr = now.toISOString().split('T')[0];
        await redisClient.set(
          `aggregation:daily:${dateStr}`,
          JSON.stringify(dailyStats),
          { EX: 2592000 } // 30 days
        );
      }
      
      logger.info(`Daily aggregation completed for ${now.toISOString()}`);
      
    } catch (error) {
      logger.error(`Daily aggregation failed: ${error.message}`);
      throw error;
    }
  }
  
  async getBufferData(collectorId, limit = 100) {
    if (!this.dataBuffers.has(collectorId)) {
      return [];
    }
    
    const buffer = this.dataBuffers.get(collectorId);
    return buffer.slice(-limit); // Return most recent items
  }
  
  async getCollectorStatus() {
    const status = {};
    
    for (const [id, collector] of this.collectors) {
      status[id] = {
        name: collector.name,
        isRunning: collector.isRunning,
        lastRun: collector.lastRun,
        errorCount: collector.errorCount,
        bufferSize: this.dataBuffers.get(id)?.length || 0,
        interval: collector.interval
      };
    }
    
    return status;
  }
  
  async exportData(collectorId, format = 'json', limit = 1000) {
    const data = await this.getBufferData(collectorId, limit);
    
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.convertToCSV(data, collectorId);
      case 'ndjson':
        return data.map(item => JSON.stringify(item)).join('\n');
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
  
  convertToCSV(data, collectorId) {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }
    
    // Get headers from first object
    const firstItem = data[0];
    const headers = Object.keys(firstItem);
    
    const rows = data.map(item => 
      headers.map(header => {
        const value = item[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value).replace(/"/g, '""');
      })
    );
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  }
  
  async getVisualizationData(type, params = {}) {
    switch (type) {
      case 'network_map':
        return await this.getNetworkMapData(params);
      case 'traffic_timeline':
        return await this.getTrafficTimelineData(params);
      case 'threat_heatmap':
        return await this.getThreatHeatmapData(params);
      case 'performance_dashboard':
        return await this.getPerformanceDashboardData(params);
      default:
        throw new Error(`Unsupported visualization type: ${type}`);
    }
  }
  
  async getNetworkMapData(params) {
    const { limit = 100 } = params;
    
    const nodes = await TorNode.find({ status: 'online' })
      .limit(limit)
      .select('nickname ipAddress country countryCode bandwidth geoLocation isExit isGuard')
      .lean();
    
    const traffic = await TrafficLog.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('sourceNode exitNode', 'ipAddress country')
      .lean();
    
    return {
      nodes: nodes.map(node => ({
        id: node._id.toString(),
        name: node.nickname || node.ipAddress,
        country: node.country,
        countryCode: node.countryCode,
        bandwidth: node.bandwidth?.average || 0,
        latitude: node.geoLocation?.latitude,
        longitude: node.geoLocation?.longitude,
        type: node.isExit ? 'exit' : node.isGuard ? 'guard' : 'relay',
        status: 'online'
      })),
      connections: traffic.map(log => ({
        id: log._id.toString(),
        source: log.sourceNode?.ipAddress,
        destination: log.destinationIp,
        bytes: log.bytesSent + log.bytesReceived,
        isMalicious: log.isMalicious,
        timestamp: log.timestamp
      }))
    };
  }
  
  async getTrafficTimelineData(params) {
    const { hours = 24, interval = 'hour' } = params;
    const now = new Date();
    const startTime = new Date(now - (hours * 3600000));
    
    const timeFormat = interval === 'hour' ? '%Y-%m-%d %H:00' : '%Y-%m-%d';
    
    const timeline = await TrafficLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startTime, $lte: now }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: timeFormat,
              date: '$timestamp'
            }
          },
          timestamp: { $first: '$timestamp' },
          totalConnections: { $sum: 1 },
          totalBytes: { $sum: { $add: ['$bytesSent', '$bytesReceived'] } },
          maliciousConnections: {
            $sum: { $cond: [{ $eq: ['$isMalicious', true] }, 1, 0] }
          },
          avgLatency: { $avg: '$duration' }
        }
      },
      { $sort: { timestamp: 1 } }
    ]);
    
    return {
      timeline: timeline,
      timeRange: { start: startTime, end: now },
      interval: interval
    };
  }
  
  async getThreatHeatmapData(params) {
    const { days = 7 } = params;
    const now = new Date();
    const startTime = new Date(now - (days * 86400000));
    
    const heatmap = await TrafficLog.aggregate([
      {
        $match: {
          isMalicious: true,
          timestamp: { $gte: startTime, $lte: now }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$timestamp' },
            dayOfWeek: { $dayOfWeek: '$timestamp' }
          },
          threatCount: { $sum: 1 },
          threatTypes: { $addToSet: '$threatType' }
        }
      },
      { $sort: { '_id.dayOfWeek': 1, '_id.hour': 1 } }
    ]);
    
    // Format for heatmap visualization
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const formattedData = [];
    
    for (let day = 1; day <= 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const dataPoint = heatmap.find(d => 
          d._id.dayOfWeek === day && d._id.hour === hour
        );
        
        formattedData.push({
          day: daysOfWeek[day - 1],
          hour: hour,
          threatCount: dataPoint?.threatCount || 0,
          threatTypes: dataPoint?.threatTypes || []
        });
      }
    }
    
    return {
      heatmap: formattedData,
      timeRange: { start: startTime, end: now },
      maxThreatCount: Math.max(...formattedData.map(d => d.threatCount))
    };
  }
  
  async getPerformanceDashboardData(params) {
    const { hours = 24 } = params;
    
    const [
      realtimeTraffic,
      nodeStatus,
      performanceMetrics,
      threatIntel,
      networkStats
    ] = await Promise.all([
      this.getBufferData('realtime_traffic', 50),
      this.getBufferData('node_status', 100),
      this.getBufferData('performance_metrics', 10),
      this.getBufferData('threat_intel', 5),
      this.getBufferData('network_stats', 5)
    ]);
    
    return {
      realtimeTraffic: realtimeTraffic.slice(-20), // Last 20 entries
      nodeStatus: {
        total: networkStats[0]?.overview?.totalNodes || 0,
        online: networkStats[0]?.overview?.onlineNodes || 0,
        critical: nodeStatus.filter(n => n.isCritical).length,
        healthDistribution: this.calculateHealthDistribution(nodeStatus)
      },
      performance: {
        throughput: performanceMetrics[0]?.throughput || {},
        latency: performanceMetrics[0]?.latency || {},
        successRate: performanceMetrics[0]?.successRate || {}
      },
      threats: {
        distribution: threatIntel[0]?.threatDistribution || [],
        emerging: threatIntel[0]?.emergingThreats || [],
        recentAlerts: threatIntel[0]?.recentAlerts || []
      },
      network: {
        stats: networkStats[0] || {},
        countryDistribution: networkStats[0]?.countryDistribution || []
      },
      lastUpdated: new Date()
    };
  }
  
  calculateHealthDistribution(nodeStatus) {
    const distribution = {
      excellent: 0, // 80-100
      good: 0,      // 60-79
      fair: 0,      // 40-59
      poor: 0,      // 20-39
      critical: 0   // 0-19
    };
    
    for (const node of nodeStatus) {
      const score = node.healthScore || 0;
      
      if (score >= 80) distribution.excellent++;
      else if (score >= 60) distribution.good++;
      else if (score >= 40) distribution.fair++;
      else if (score >= 20) distribution.poor++;
      else distribution.critical++;
    }
    
    return distribution;
  }
}

module.exports = new DataCollectionEngine();