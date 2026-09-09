/**
 * Alert.js — SQLite-backed model (replaces Mongoose)
 * NTRO PS-26151 — System alert / threat notification store
 */

const { getDB, parseJsonCols, toJson } = require('../config/database');

function uuid() { return `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`; }
const JSON_COLS = ['metadata_json', 'tags_json', 'affected_nodes_json', 'notes_json'];

function toPublic(row) {
  if (!row) return null;
  const r = parseJsonCols(row, ...JSON_COLS);
  return {
    id: r.alert_id,
    alertId: r.alert_id,
    title: r.title,
    description: r.description,
    type: r.type,
    severity: r.severity,
    status: r.status,
    source: r.source,
    isActive: !!r.is_active,
    metadata: r.metadata_json,
    tags: r.tags_json,
    affectedNodes: r.affected_nodes_json,
    notes: r.notes_json,
    triggeredAt: r.triggered_at,
    acknowledgedAt: r.acknowledged_at,
    resolvedAt: r.resolved_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const Alert = {
  find(filters = {}) {
    const db = getDB();
    let sql = 'SELECT * FROM alerts WHERE 1=1';
    const params = [];
    if (filters.severity) { sql += ' AND severity = ?'; params.push(filters.severity); }
    if (filters.status) { sql += ' AND status = ?'; params.push(filters.status); }
    if (filters.type) { sql += ' AND type = ?'; params.push(filters.type); }
    if (filters.isActive !== undefined) { sql += ' AND is_active = ?'; params.push(filters.isActive ? 1 : 0); }
    sql += ' ORDER BY triggered_at DESC';
    if (filters.limit) { sql += ' LIMIT ?'; params.push(filters.limit); }
    return db.prepare(sql).all(...params).map(toPublic);
  },

  findById(alertId) {
    const db = getDB();
    return toPublic(db.prepare('SELECT * FROM alerts WHERE alert_id = ?').get(alertId));
  },

  create(data) {
    const db = getDB();
    const alertId = data.alertId || uuid();
    db.prepare(`
      INSERT INTO alerts (alert_id, title, description, type, severity, status, source, is_active, metadata_json, tags_json, affected_nodes_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `).run(
      alertId, data.title, data.description, data.type,
      data.severity || 'medium', data.status || 'new', data.source || 'system',
      toJson(data.metadata), toJson(data.tags), toJson(data.affectedNodes)
    );
    return this.findById(alertId);
  },

  updateById(alertId, updates) {
    const db = getDB();
    const fields = [];
    const vals = [];
    if ('status' in updates) {
      fields.push('status = ?'); vals.push(updates.status);
      if (updates.status === 'acknowledged') { fields.push('acknowledged_at = ?'); vals.push(new Date().toISOString()); }
      if (updates.status === 'resolved') { fields.push('resolved_at = ?'); vals.push(new Date().toISOString()); }
    }
    if ('severity' in updates) { fields.push('severity = ?'); vals.push(updates.severity); }
    if ('isActive' in updates) { fields.push('is_active = ?'); vals.push(updates.isActive ? 1 : 0); }
    if ('metadata' in updates) { fields.push('metadata_json = ?'); vals.push(toJson(updates.metadata)); }
    if (fields.length === 0) return this.findById(alertId);
    fields.push('updated_at = ?');
    vals.push(new Date().toISOString(), alertId);
    db.prepare(`UPDATE alerts SET ${fields.join(', ')} WHERE alert_id = ?`).run(...vals);
    return this.findById(alertId);
  },

  deleteById(alertId) {
    return getDB().prepare('DELETE FROM alerts WHERE alert_id = ?').run(alertId);
  },

  getStatistics() {
    const db = getDB();
    const bySeverity = db.prepare('SELECT severity, COUNT(*) as count FROM alerts GROUP BY severity').all();
    const byStatus = db.prepare('SELECT status, COUNT(*) as count FROM alerts GROUP BY status').all();
    const byType = db.prepare('SELECT type, COUNT(*) as count FROM alerts GROUP BY type').all();
    const total = db.prepare('SELECT COUNT(*) as c FROM alerts').get().c;
    const recent = db.prepare('SELECT * FROM alerts ORDER BY triggered_at DESC LIMIT 10').all().map(toPublic);
    return { total, bySeverity, byStatus, byType, recent };
  },

  count(filters = {}) {
    const db = getDB();
    let sql = 'SELECT COUNT(*) as c FROM alerts WHERE 1=1';
    const params = [];
    if (filters.severity) { sql += ' AND severity = ?'; params.push(filters.severity); }
    if (filters.status) { sql += ' AND status = ?'; params.push(filters.status); }
    return db.prepare(sql).get(...params).c;
  },
};

module.exports = Alert;