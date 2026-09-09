/**
 * TrafficLog.js — SQLite-backed model (replaces Mongoose)
 * NTRO PS-26151 — Tor traffic analysis and anomaly logs
 */

const { getDB, parseJsonCols, toJson } = require('../config/database');

function uuid() { return `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`; }
const JSON_COLS = ['metadata_json'];

function toPublic(row) {
  if (!row) return null;
  const r = parseJsonCols(row, ...JSON_COLS);
  return {
    id: r.log_id,
    logId: r.log_id,
    timestamp: r.logged_at,
    sourceIp: r.source_ip,
    destIp: r.dest_ip,
    protocol: r.protocol,
    bytesTransferred: r.bytes_transferred,
    durationMs: r.duration_ms,
    isAnomalous: !!r.is_anomalous,
    anomalyScore: r.anomaly_score,
    threatLevel: r.threat_level,
    metadata: r.metadata_json,
  };
}

const TrafficLog = {
  find(filters = {}) {
    const db = getDB();
    let sql = 'SELECT * FROM traffic_logs WHERE 1=1';
    const params = [];
    if (filters.threatLevel) { sql += ' AND threat_level = ?'; params.push(filters.threatLevel); }
    if (filters.isAnomalous !== undefined) { sql += ' AND is_anomalous = ?'; params.push(filters.isAnomalous ? 1 : 0); }
    if (filters.protocol) { sql += ' AND protocol = ?'; params.push(filters.protocol); }
    sql += ' ORDER BY logged_at DESC';
    if (filters.limit) { sql += ' LIMIT ?'; params.push(filters.limit); }
    return db.prepare(sql).all(...params).map(toPublic);
  },

  findById(logId) {
    const db = getDB();
    return toPublic(db.prepare('SELECT * FROM traffic_logs WHERE log_id = ?').get(logId));
  },

  create(data) {
    const db = getDB();
    const logId = data.logId || uuid();
    db.prepare(`
      INSERT INTO traffic_logs (log_id, source_ip, dest_ip, protocol, bytes_transferred, duration_ms, is_anomalous, anomaly_score, threat_level, metadata_json, logged_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      data.sourceIp || data.sourceNode || null,
      data.destIp || data.destinationIp || null,
      data.protocol || 'TCP',
      data.bytesTransferred || (data.bytesSent || 0) + (data.bytesReceived || 0),
      data.durationMs || data.duration || 0,
      data.isAnomalous || data.isMalicious ? 1 : 0,
      data.anomalyScore || (data.isMalicious ? 0.85 : 0.1),
      data.threatLevel || 'low',
      toJson(data.metadata || { threatType: data.threatType, geoData: data.geoData }),
      data.timestamp || new Date().toISOString()
    );
    return this.findById(logId);
  },

  count(filters = {}) {
    const db = getDB();
    let sql = 'SELECT COUNT(*) as c FROM traffic_logs WHERE 1=1';
    const params = [];
    if (filters.isAnomalous !== undefined) { sql += ' AND is_anomalous = ?'; params.push(filters.isAnomalous ? 1 : 0); }
    if (filters.threatLevel) { sql += ' AND threat_level = ?'; params.push(filters.threatLevel); }
    return db.prepare(sql).get(...params).c;
  },

  getStats() {
    const db = getDB();
    return {
      totalLogs: db.prepare('SELECT COUNT(*) as c FROM traffic_logs').get().c,
      anomalousCount: db.prepare('SELECT COUNT(*) as c FROM traffic_logs WHERE is_anomalous = 1').get().c,
      byProtocol: db.prepare('SELECT protocol, COUNT(*) as count FROM traffic_logs GROUP BY protocol').all(),
      byThreatLevel: db.prepare('SELECT threat_level, COUNT(*) as count FROM traffic_logs GROUP BY threat_level').all(),
    };
  }
};

module.exports = TrafficLog;