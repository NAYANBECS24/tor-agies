/**
 * ctLogService.js — TOR-AEGIS
 * Real Certificate Transparency intelligence via crt.sh (free public API).
 * Queries domain/fingerprint certificate history and stores infrastructure
 * candidate relationships for actor graph linkage.
 *
 * API: https://crt.sh/?q=<domain>&output=json (no key required)
 */

const https = require('https');
const crypto = require('crypto');
const { getDB } = require('../config/database');
const logger = require('../utils/logger');

function httpsGet(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'TOR-AEGIS/2.0 NTRO-26151 Research Platform',
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: null, raw: data.slice(0, 500) }); }
      });
    });
    req.setTimeout(timeout, () => { req.destroy(); reject(new Error('Request timeout')); });
    req.on('error', reject);
  });
}

function uid(prefix = 'CT') {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

/**
 * Query crt.sh for all certificates matching a domain.
 * Returns deduplicated certificate records with SANs.
 */
async function queryCTLogs(domain, options = {}) {
  const { actorId = null, caseId = null, limit = 50 } = options;

  if (!domain || typeof domain !== 'string') {
    return { success: false, error: 'Domain required', domain };
  }

  const cleanDomain = domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const url = `https://crt.sh/?q=${encodeURIComponent('%.' + cleanDomain)}&output=json`;

  logger.info(`[CTLog] Querying crt.sh for domain: ${cleanDomain}`);

  let records = [];
  try {
    const res = await httpsGet(url, 20000);
    if (res.status !== 200 || !Array.isArray(res.body)) {
      throw new Error(`crt.sh returned ${res.status}`);
    }
    records = res.body;
  } catch (err) {
    logger.warn(`[CTLog] crt.sh query failed for ${cleanDomain}: ${err.message}`);
    return {
      success: false,
      error: err.message,
      domain: cleanDomain,
      liveData: false
    };
  }

  // Deduplicate by crtsh ID
  const seen = new Set();
  const unique = [];
  for (const r of records) {
    const key = String(r.id || r.serial_number || r.sha256);
    if (!seen.has(key)) { seen.add(key); unique.push(r); }
  }

  const toStore = unique.slice(0, limit);
  const stored = [];
  const db = getDB();

  if (db) {
    const insert = db.prepare(`
      INSERT OR IGNORE INTO cert_transparency_records (
        cert_id, domain, fingerprint, issuer, subject, san_json,
        valid_from, valid_to, serial_number, ct_source, crtsh_id,
        actor_id, case_id, collected_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'crt.sh', ?, ?, ?, datetime('now'))
    `);

    const tx = db.transaction(() => {
      for (const r of toStore) {
        const certId = uid('CT');
        const sanList = parseSANs(r.name_value || '');
        const fp = r.sha256 || crypto.createHash('sha256')
          .update(`${r.id}${r.serial_number}${r.issuer_name}`).digest('hex');

        try {
          insert.run(
            certId,
            cleanDomain,
            fp,
            r.issuer_name || '',
            r.common_name || r.name_value || '',
            JSON.stringify(sanList),
            r.not_before || null,
            r.not_after || null,
            r.serial_number || null,
            r.id || null,
            actorId,
            caseId
          );
          stored.push({
            certId,
            fingerprint: fp,
            issuer: r.issuer_name,
            subject: r.common_name || r.name_value,
            sans: sanList,
            validFrom: r.not_before,
            validTo: r.not_after,
            crtshId: r.id,
            liveData: true
          });
        } catch (e) {
          // Duplicate or constraint error — skip
        }
      }
    });
    tx();
  }

  logger.info(`[CTLog] Stored ${stored.length} CT records for ${cleanDomain}`);
  return {
    success: true,
    domain: cleanDomain,
    totalFound: records.length,
    stored: stored.length,
    records: stored,
    liveData: true,
    source: 'crt.sh',
    queriedAt: new Date().toISOString()
  };
}

/**
 * Parse SAN (Subject Alternative Names) from crt.sh name_value field.
 * The field uses newlines to separate multiple names.
 */
function parseSANs(nameValue) {
  if (!nameValue) return [];
  return nameValue
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0 && s !== 'undefined');
}

/**
 * Get stored CT records for a domain from our local DB.
 */
function getStoredCTRecords(domain, limit = 100) {
  const db = getDB();
  if (!db) return [];
  try {
    const rows = db.prepare(`
      SELECT * FROM cert_transparency_records
      WHERE domain LIKE ?
      ORDER BY collected_at DESC
      LIMIT ?
    `).all(`%${domain}%`, limit);

    return rows.map(r => ({
      certId: r.cert_id,
      domain: r.domain,
      fingerprint: r.fingerprint,
      issuer: r.issuer,
      subject: r.subject,
      sans: tryParseJson(r.san_json, []),
      validFrom: r.valid_from,
      validTo: r.valid_to,
      serialNumber: r.serial_number,
      crtshId: r.crtsh_id,
      actorId: r.actor_id,
      collectedAt: r.collected_at
    }));
  } catch (e) {
    logger.warn(`[CTLog] Failed to query stored records: ${e.message}`);
    return [];
  }
}

/**
 * Find all CT records linked to a specific actor.
 */
function getActorCTRecords(actorId) {
  const db = getDB();
  if (!db) return [];
  try {
    return db.prepare(`
      SELECT * FROM cert_transparency_records WHERE actor_id = ? ORDER BY collected_at DESC
    `).all(actorId);
  } catch { return []; }
}

/**
 * Cross-reference: find actors sharing the same certificate fingerprint.
 */
function findSharedCertActors(fingerprint) {
  const db = getDB();
  if (!db) return [];
  try {
    return db.prepare(`
      SELECT DISTINCT actor_id FROM cert_transparency_records
      WHERE fingerprint = ? AND actor_id IS NOT NULL
    `).all(fingerprint).map(r => r.actor_id);
  } catch { return []; }
}

function tryParseJson(str, fallback = []) {
  try { return JSON.parse(str || JSON.stringify(fallback)); } catch { return fallback; }
}

module.exports = {
  queryCTLogs,
  getStoredCTRecords,
  getActorCTRecords,
  findSharedCertActors,
  parseSANs
};
