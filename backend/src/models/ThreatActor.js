/**
 * ThreatActor.js — SQLite-backed model (replaces Mongoose)
 * NTRO PS-26151 — Threat Actor intelligence store
 */

const { getDB, parseJsonCols, toJson } = require('../config/database');
const { v4: uuidv4 } = require('crypto');

function uuid() { return `ACTOR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`; }

const JSON_COLS = ['aliases_json', 'wallets_json', 'contact_ids_json', 'marketplaces_json', 'infrastructure_json', 'stylometry_links_json', 'tags_json'];

function toPublic(row) {
  if (!row) return null;
  const r = parseJsonCols(row, ...JSON_COLS);
  try { r.linguistic_fingerprint_json = JSON.parse(row.linguistic_fingerprint_json || '{}'); } catch { r.linguistic_fingerprint_json = {}; }
  return {
    actorId: r.actor_id,
    primaryHandle: r.primary_handle,
    category: r.category,
    pgpFingerprint: r.pgp_fingerprint,
    pgpKeyId: r.pgp_key_id,
    originIpAttribution: r.origin_ip,
    originCountry: r.origin_country,
    hostingProvider: r.hosting_provider,
    attributionConfidence: r.attribution_confidence,
    source: r.source,
    firstDiscovered: r.first_discovered,
    lastScanDate: r.last_scan_date,
    active: !!r.active,
    notes: r.notes,
    aliases: r.aliases_json,
    cryptoWallets: r.wallets_json,
    contactIds: r.contact_ids_json,
    marketplaces: r.marketplaces_json,
    infrastructureFindings: r.infrastructure_json,
    stylometryLinks: r.stylometry_links_json,
    linguisticFingerprint: r.linguistic_fingerprint_json,
    tags: r.tags_json,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const ThreatActor = {
  /** Return all actors, with optional filters */
  find(filters = {}) {
    const db = getDB();
    let sql = 'SELECT * FROM threat_actors WHERE 1=1';
    const params = [];
    if (filters.category) { sql += ' AND category = ?'; params.push(filters.category); }
    if (filters.active !== undefined) { sql += ' AND active = ?'; params.push(filters.active ? 1 : 0); }
    if (filters.origin_country) { sql += ' AND origin_country = ?'; params.push(filters.origin_country); }
    if (filters.attribution_confidence_gte) { sql += ' AND attribution_confidence >= ?'; params.push(filters.attribution_confidence_gte); }
    if (filters.search) {
      sql += ' AND (primary_handle LIKE ? OR aliases_json LIKE ? OR tags_json LIKE ?)';
      const q = `%${filters.search}%`;
      params.push(q, q, q);
    }
    sql += ' ORDER BY attribution_confidence DESC, updated_at DESC';
    if (filters.limit) { sql += ' LIMIT ?'; params.push(filters.limit); }
    const rows = db.prepare(sql).all(...params);
    return rows.map(toPublic);
  },

  /** Find one by actor_id */
  findById(actorId) {
    const db = getDB();
    return toPublic(db.prepare('SELECT * FROM threat_actors WHERE actor_id = ?').get(actorId));
  },

  /** Find one by primary_handle */
  findByHandle(handle) {
    const db = getDB();
    return toPublic(db.prepare('SELECT * FROM threat_actors WHERE primary_handle = ?').get(handle));
  },

  /** Create a new actor */
  create(data) {
    const db = getDB();
    const actorId = data.actorId || uuid();
    db.prepare(`
      INSERT OR IGNORE INTO threat_actors (
        actor_id, primary_handle, category, pgp_fingerprint, pgp_key_id,
        origin_ip, origin_country, hosting_provider, attribution_confidence,
        source, first_discovered, last_scan_date, active, notes,
        aliases_json, wallets_json, contact_ids_json, marketplaces_json,
        infrastructure_json, stylometry_links_json, tags_json, linguistic_fingerprint_json
      ) VALUES (
        @actor_id, @primary_handle, @category, @pgp_fingerprint, @pgp_key_id,
        @origin_ip, @origin_country, @hosting_provider, @attribution_confidence,
        @source, @first_discovered, @last_scan_date, @active, @notes,
        @aliases_json, @wallets_json, @contact_ids_json, @marketplaces_json,
        @infrastructure_json, @stylometry_links_json, @tags_json, @linguistic_fingerprint_json
      )
    `).run({
      actor_id: actorId,
      primary_handle: data.primaryHandle || data.primary_handle,
      category: data.category || 'Unknown',
      pgp_fingerprint: data.pgpFingerprint || null,
      pgp_key_id: data.pgpKeyId || null,
      origin_ip: data.originIpAttribution || null,
      origin_country: data.originCountry || null,
      hosting_provider: data.hostingProvider || null,
      attribution_confidence: data.attributionConfidence || 50,
      source: data.source || 'Manual Entry',
      first_discovered: data.firstDiscovered || new Date().toISOString(),
      last_scan_date: new Date().toISOString(),
      active: 1,
      notes: data.notes || null,
      aliases_json: toJson(data.aliases),
      wallets_json: toJson(data.cryptoWallets),
      contact_ids_json: toJson(data.contactIds),
      marketplaces_json: toJson(data.marketplaces),
      infrastructure_json: toJson(data.infrastructureFindings),
      stylometry_links_json: toJson(data.stylometryLinks),
      tags_json: toJson(data.tags),
      linguistic_fingerprint_json: toJson(data.linguisticFingerprint),
    });
    return this.findById(actorId);
  },

  /** Update actor fields */
  updateById(actorId, updates) {
    const db = getDB();
    const existing = db.prepare('SELECT * FROM threat_actors WHERE actor_id = ?').get(actorId);
    if (!existing) return null;

    const fields = [];
    const vals = [];
    const map = {
      primaryHandle: 'primary_handle', category: 'category', pgpFingerprint: 'pgp_fingerprint',
      pgpKeyId: 'pgp_key_id', originIpAttribution: 'origin_ip', originCountry: 'origin_country',
      hostingProvider: 'hosting_provider', attributionConfidence: 'attribution_confidence',
      source: 'source', active: 'active', notes: 'notes',
      aliases: 'aliases_json', cryptoWallets: 'wallets_json', contactIds: 'contact_ids_json',
      marketplaces: 'marketplaces_json', infrastructureFindings: 'infrastructure_json',
      stylometryLinks: 'stylometry_links_json', tags: 'tags_json', linguisticFingerprint: 'linguistic_fingerprint_json',
    };

    for (const [key, col] of Object.entries(map)) {
      if (key in updates) {
        fields.push(`${col} = ?`);
        vals.push(col.endsWith('_json') ? toJson(updates[key]) : updates[key]);
      }
    }
    if (fields.length === 0) return this.findById(actorId);
    fields.push('updated_at = ?');
    vals.push(new Date().toISOString(), actorId);
    db.prepare(`UPDATE threat_actors SET ${fields.join(', ')} WHERE actor_id = ?`).run(...vals);
    return this.findById(actorId);
  },

  /** Delete actor */
  deleteById(actorId) {
    const db = getDB();
    return db.prepare('DELETE FROM threat_actors WHERE actor_id = ?').run(actorId);
  },

  /** Count actors */
  count(filters = {}) {
    const db = getDB();
    let sql = 'SELECT COUNT(*) as c FROM threat_actors WHERE 1=1';
    const params = [];
    if (filters.category) { sql += ' AND category = ?'; params.push(filters.category); }
    if (filters.active !== undefined) { sql += ' AND active = ?'; params.push(filters.active ? 1 : 0); }
    return db.prepare(sql).get(...params).c;
  },

  /** Stats by category */
  getStats() {
    const db = getDB();
    const byCategory = db.prepare('SELECT category, COUNT(*) as count FROM threat_actors GROUP BY category').all();
    const byCountry = db.prepare('SELECT origin_country, COUNT(*) as count FROM threat_actors WHERE origin_country IS NOT NULL GROUP BY origin_country ORDER BY count DESC LIMIT 10').all();
    const avgConf = db.prepare('SELECT AVG(attribution_confidence) as avg FROM threat_actors').get().avg || 0;
    const total = db.prepare('SELECT COUNT(*) as c FROM threat_actors').get().c;
    return { total, avgConfidence: Math.round(avgConf), byCategory, byCountry };
  },
};

module.exports = ThreatActor;
