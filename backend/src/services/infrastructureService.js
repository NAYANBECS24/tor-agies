/**
 * infrastructureService.js — TOR-AEGIS
 * Infrastructure Intelligence Orchestrator.
 * Combines CT logs + onion scan + GeoIP to build Domain→Cert→IP→Actor graph edges.
 * Stores results in infrastructure_candidates table.
 */

const crypto = require('crypto');
const { getDB } = require('../config/database');
const logger = require('../utils/logger');
const ctLogService = require('./ctLogService');
const { sealEvidence } = require('./evidenceVaultService');

const https = require('https');

function httpsGet(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'TOR-AEGIS/2.0 NTRO-26151' }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: null }); }
      });
    });
    req.setTimeout(timeout, () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
  });
}

function uid() {
  return `INFRA-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

/**
 * GeoIP lookup via ip-api.com (free, no key required, 45 req/min).
 */
async function geoLocateIP(ip) {
  if (!ip || ip === '0.0.0.0' || ip.startsWith('127.') || ip.startsWith('10.')) {
    return { ip, country: 'Private', city: 'N/A', isp: 'N/A', isHosting: false, liveData: false };
  }
  try {
    const res = await httpsGet(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon,isp,org,hosting`
    );
    if (res.status === 200 && res.body?.status === 'success') {
      return {
        ip,
        country: res.body.country,
        countryCode: res.body.countryCode,
        region: res.body.regionName,
        city: res.body.city,
        lat: res.body.lat,
        lon: res.body.lon,
        isp: res.body.isp,
        org: res.body.org,
        isHosting: !!res.body.hosting,
        liveData: true
      };
    }
  } catch (e) {
    logger.warn(`[Infrastructure] GeoIP failed for ${ip}: ${e.message}`);
  }
  return { ip, country: 'Unknown', city: 'Unknown', isp: 'Unknown', isHosting: false, liveData: false };
}

/**
 * Store an infrastructure candidate relationship.
 * Returns the candidate_id.
 */
function storeCandidate(candidate) {
  const db = getDB();
  if (!db) return null;
  const id = uid();
  try {
    db.prepare(`
      INSERT INTO infrastructure_candidates (
        candidate_id, domain, ip_address, cert_fingerprint, san_json,
        source, confidence, relationship_type, actor_id, case_id,
        geo_country, geo_city, isp, is_hosting, raw_json, observed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      id,
      candidate.domain || null,
      candidate.ip || null,
      candidate.certFingerprint || null,
      JSON.stringify(candidate.sans || []),
      candidate.source || 'CT_LOG',
      candidate.confidence || 0.0,
      candidate.relationshipType || 'HOSTED_ON',
      candidate.actorId || null,
      candidate.caseId || null,
      candidate.geoCountry || null,
      candidate.geoCity || null,
      candidate.isp || null,
      candidate.isHosting ? 1 : 0,
      JSON.stringify(candidate.raw || {}),
    );
    return id;
  } catch (e) {
    logger.warn(`[Infrastructure] Failed to store candidate: ${e.message}`);
    return null;
  }
}

/**
 * Full infrastructure fingerprint pipeline for a domain.
 * 1. Query CT logs (crt.sh)
 * 2. Extract unique IPs from scan results
 * 3. GeoIP enrich each IP
 * 4. Store infrastructure_candidates
 * 5. Seal evidence in vault
 */
async function fingerprintDomain(domain, options = {}) {
  const { actorId = null, caseId = null } = options;
  const results = {
    domain,
    ctRecords: [],
    candidates: [],
    geoResults: {},
    liveData: false,
    queriedAt: new Date().toISOString()
  };

  logger.info(`[Infrastructure] Fingerprinting domain: ${domain}`);

  // Step 1: CT log query
  const ctResult = await ctLogService.queryCTLogs(domain, { actorId, caseId });
  if (ctResult.success) {
    results.ctRecords = ctResult.records;
    results.liveData = true;

    // Step 2: Build infrastructure candidates from CT SANs
    for (const cert of ctResult.records) {
      const candidateId = storeCandidate({
        domain,
        certFingerprint: cert.fingerprint,
        sans: cert.sans || [],
        source: 'CT_LOG',
        confidence: 0.65,
        relationshipType: 'CERTIFIED_FOR',
        actorId,
        caseId,
        raw: { issuer: cert.issuer, validFrom: cert.validFrom, validTo: cert.validTo }
      });
      if (candidateId) results.candidates.push(candidateId);
    }
  }

  // Step 3: Seal as evidence
  if (results.ctRecords.length > 0) {
    const sealed = sealEvidence(
      { domain, ctRecords: results.ctRecords.length, candidates: results.candidates },
      {
        source: 'crt.sh CT Log',
        collector: 'infrastructureService',
        collectorVersion: '1.0',
        caseId,
        actorId,
        contentType: 'JSON',
        classification: 'RESTRICTED',
        tags: ['infrastructure', 'ct-log', 'certificate']
      }
    );
    results.evidenceId = sealed.evidenceId;
    results.sha256 = sealed.sha256;
  }

  return results;
}

/**
 * Get infrastructure candidates for an actor.
 */
function getActorInfrastructure(actorId, limit = 50) {
  const db = getDB();
  if (!db) return [];
  try {
    return db.prepare(`
      SELECT * FROM infrastructure_candidates
      WHERE actor_id = ?
      ORDER BY confidence DESC, observed_at DESC
      LIMIT ?
    `).all(actorId, limit).map(r => ({
      candidateId: r.candidate_id,
      domain: r.domain,
      ip: r.ip_address,
      certFingerprint: r.cert_fingerprint,
      sans: tryParseJson(r.san_json, []),
      source: r.source,
      confidence: r.confidence,
      relationshipType: r.relationship_type,
      geoCountry: r.geo_country,
      geoCity: r.geo_city,
      isp: r.isp,
      isHosting: !!r.is_hosting,
      observedAt: r.observed_at
    }));
  } catch { return []; }
}

/**
 * Get all infrastructure candidates for a case.
 */
function getCaseInfrastructure(caseId, limit = 100) {
  const db = getDB();
  if (!db) return [];
  try {
    return db.prepare(`
      SELECT * FROM infrastructure_candidates
      WHERE case_id = ?
      ORDER BY confidence DESC, observed_at DESC
      LIMIT ?
    `).all(caseId, limit);
  } catch { return []; }
}

/**
 * Find actors sharing an IP address.
 */
function findActorsByIP(ip) {
  const db = getDB();
  if (!db) return [];
  try {
    return db.prepare(`
      SELECT DISTINCT actor_id FROM infrastructure_candidates
      WHERE ip_address = ? AND actor_id IS NOT NULL
    `).all(ip).map(r => r.actor_id);
  } catch { return []; }
}

/**
 * Find actors sharing a certificate fingerprint.
 */
function findActorsByCert(certFingerprint) {
  const db = getDB();
  if (!db) return [];
  try {
    return db.prepare(`
      SELECT DISTINCT actor_id FROM infrastructure_candidates
      WHERE cert_fingerprint = ? AND actor_id IS NOT NULL
    `).all(certFingerprint).map(r => r.actor_id);
  } catch { return []; }
}

function tryParseJson(str, fallback = []) {
  try { return JSON.parse(str || JSON.stringify(fallback)); } catch { return fallback; }
}

module.exports = {
  fingerprintDomain,
  geoLocateIP,
  storeCandidate,
  getActorInfrastructure,
  getCaseInfrastructure,
  findActorsByIP,
  findActorsByCert
};
