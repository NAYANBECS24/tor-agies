/**
 * TorNode.js — SQLite-backed model (replaces Mongoose)
 * NTRO PS-26151 — Tor relay node store
 */

const { getDB, parseJsonCols, toJson } = require('../config/database');

function uuid() { return `NODE-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`; }

function toPublic(row) {
  if (!row) return null;
  let flags = [];
  try { flags = JSON.parse(row.flags_json || '[]'); } catch {}
  return {
    nodeId: row.node_id,
    fingerprint: row.fingerprint,
    nickname: row.nickname,
    ipAddress: row.ip_address,
    country: row.country,
    bandwidth: row.bandwidth,
    isExit: !!row.is_exit,
    isGuard: !!row.is_guard,
    isStable: !!row.is_stable,
    flags,
    firstSeen: row.first_seen,
    lastSeen: row.last_seen,
    createdAt: row.created_at,
  };
}

const TorNode = {
  find(filters = {}) {
    const db = getDB();
    let sql = 'SELECT * FROM tor_nodes WHERE 1=1';
    const params = [];
    if (filters.isExit !== undefined) { sql += ' AND is_exit = ?'; params.push(filters.isExit ? 1 : 0); }
    if (filters.isGuard !== undefined) { sql += ' AND is_guard = ?'; params.push(filters.isGuard ? 1 : 0); }
    if (filters.country) { sql += ' AND country = ?'; params.push(filters.country); }
    sql += ' ORDER BY bandwidth DESC';
    if (filters.limit) { sql += ' LIMIT ?'; params.push(filters.limit); }
    return db.prepare(sql).all(...params).map(toPublic);
  },

  findById(nodeId) {
    return toPublic(getDB().prepare('SELECT * FROM tor_nodes WHERE node_id = ?').get(nodeId));
  },

  create(data) {
    const db = getDB();
    const nodeId = data.nodeId || uuid();
    db.prepare(`
      INSERT OR REPLACE INTO tor_nodes (node_id, fingerprint, nickname, ip_address, country, bandwidth, is_exit, is_guard, is_stable, flags_json, first_seen, last_seen)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      nodeId, data.fingerprint, data.nickname, data.ipAddress,
      data.country, data.bandwidth || 0,
      data.isExit ? 1 : 0, data.isGuard ? 1 : 0, data.isStable !== false ? 1 : 0,
      toJson(data.flags),
      data.firstSeen || new Date().toISOString(),
      data.lastSeen || new Date().toISOString()
    );
    return this.findById(nodeId);
  },

  count() {
    return getDB().prepare('SELECT COUNT(*) as c FROM tor_nodes').get().c;
  },

  getStats() {
    const db = getDB();
    return {
      total: db.prepare('SELECT COUNT(*) as c FROM tor_nodes').get().c,
      exitNodes: db.prepare('SELECT COUNT(*) as c FROM tor_nodes WHERE is_exit = 1').get().c,
      guardNodes: db.prepare('SELECT COUNT(*) as c FROM tor_nodes WHERE is_guard = 1').get().c,
      byCountry: db.prepare('SELECT country, COUNT(*) as count FROM tor_nodes GROUP BY country ORDER BY count DESC LIMIT 10').all(),
    };
  },
};

module.exports = TorNode;