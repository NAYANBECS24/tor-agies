/**
 * darkwebIntelService.js
 * TOR Sentinel 2.0 — NTRO PS-26151
 * Core intelligence engine for dark web threat actor de-anonymization.
 * Implements simulated versions of:
 *   1. Hidden service misconfiguration & de-cloaking scanner
 *   2. Cross-marketplace identity entity graph builder
 *   3. AI stylometric authorship & persona linker
 *   4. Dossier generation & export
 */

const crypto = require('crypto');
const { getDB } = require('../config/database');
const logger = require('../utils/logger');

// ─── In-Memory Actor Graph ────────────────────────────────────────────────────
// Key: actorId, Value: actor profile object + edges
const actorRegistry = new Map();
const pivotIndex = new Map(); // pivotId → Set of actorIds

// ─── Utility Functions ─────────────────────────────────────────────────────────
function generateId(prefix = 'ACTOR') {
  return `${prefix}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function mmh3Simulate(data) {
  // Deterministic hash simulation (MurmurHash3 would require native module)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}

function riskScore(findings) {
  let score = 0;
  if (findings.certSha256) score += 30;
  if (findings.sanFields && findings.sanFields.length > 0) score += 35;
  if (findings.faviconMmh3) score += 15;
  if (findings.exposedEndpoints && findings.exposedEndpoints.length > 0) {
    score += findings.exposedEndpoints.length * 10;
  }
  return Math.min(score, 100);
}

// ─── Module 1: Hidden Service De-Cloaking Scanner ─────────────────────────────
/**
 * Simulates scanning an .onion service for infrastructure misconfigurations.
 * In production, this connects via Tor SOCKS5 proxy to perform real checks.
 */
function scanHiddenService(onionUrl) {
  const hostname = onionUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const seed = hostname;

  // Simulate TLS certificate fields
  const certFingerprint = crypto.createHash('sha256').update(seed + 'cert').digest('hex');
  const sanFields = Math.random() > 0.4 ? [
    `${seed.substring(0, 8)}.clearnet-host.com`,
    `www.${seed.substring(0, 6)}-services.net`
  ] : [];
  const commonName = sanFields.length > 0 ? sanFields[0] : `*.${seed.substring(0, 8)}.onion`;

  // Simulate favicon hash
  const faviconHash = mmh3Simulate(seed + 'favicon');

  // Simulate exposed endpoints
  const potentialEndpoints = ['/server-status', '/server-info', '/.git/HEAD', '/phpinfo.php', '/env', '/config.json', '/admin'];
  const exposedEndpoints = potentialEndpoints.filter(() => Math.random() > 0.7);

  // Simulate origin IP attribution
  const ipOctets = [
    185, 220,
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255)
  ];
  const originIp = sanFields.length > 0 ? ipOctets.join('.') : null;

  // Simulate Shodan/Censys search queries
  const searchQueries = [];
  searchQueries.push(`ssl.cert.sha256:${certFingerprint}`);
  if (faviconHash) searchQueries.push(`http.favicon.hash:${faviconHash}`);
  if (sanFields.length > 0) searchQueries.push(`ssl.cert.subject.cn:${commonName}`);

  const findings = {
    onionUrl,
    hostname,
    scanTimestamp: new Date().toISOString(),
    tlsCertificate: {
      sha256: certFingerprint,
      commonName,
      sanFields,
      serialNumber: crypto.randomBytes(8).toString('hex').toUpperCase(),
      issuer: sanFields.length > 0 ? 'Let\'s Encrypt Authority X3' : 'Self-Signed',
      validFrom: new Date(Date.now() - 90 * 86400000).toISOString(),
      validTo: new Date(Date.now() + 275 * 86400000).toISOString(),
      leakRisk: sanFields.length > 0 ? 'HIGH — SAN fields expose clearnet domain' : 'LOW',
    },
    faviconAnalysis: {
      mmh3Hash: faviconHash,
      md5: crypto.createHash('md5').update(seed + 'favicon').digest('hex'),
      shodanQuery: `http.favicon.hash:${faviconHash}`,
      matchFound: Math.random() > 0.5,
      matchedIp: originIp,
    },
    exposedEndpoints: exposedEndpoints.map(path => ({
      path,
      statusCode: 200,
      severity: path.includes('git') ? 'CRITICAL' : path.includes('status') ? 'HIGH' : 'MEDIUM',
      sample: `Simulated response from ${path} on ${hostname}`,
    })),
    clearnetCorrelation: {
      searchQueries,
      originIpCandidate: originIp,
      clearnetDomain: sanFields.length > 0 ? sanFields[0] : null,
      hostingProvider: originIp ? 'Frantech Solutions (BuyVM)' : null,
      country: originIp ? 'Luxembourg' : null,
      confidence: sanFields.length > 0 ? 'HIGH (92%)' : exposedEndpoints.length > 0 ? 'MEDIUM (61%)' : 'LOW (23%)',
    },
    riskScore: riskScore({ certSha256: certFingerprint, sanFields, faviconMmh3: faviconHash, exposedEndpoints }),
    summary: generateScanSummary(sanFields, exposedEndpoints, originIp),
  };

  // Persist scan result to SQLite database
  try {
    const d = getDB();
    if (d) {
      const scanId = `SCAN-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      d.prepare(`
        INSERT INTO onion_scans (
          scan_id, onion_url, hostname, cert_sha256, san_fields_json, common_name,
          favicon_mmh3, exposed_endpoints_json, origin_ip_candidate, hosting_provider,
          country, confidence_score, risk_score, findings_json, scanned_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        scanId, findings.onionUrl, findings.hostname, findings.tlsCertificate?.sha256,
        JSON.stringify(findings.tlsCertificate?.sanFields || []), findings.tlsCertificate?.commonName,
        findings.faviconAnalysis?.mmh3Hash || 0, JSON.stringify(findings.exposedEndpoints || []),
        findings.clearnetCorrelation?.originIpCandidate, findings.clearnetCorrelation?.hostingProvider,
        findings.clearnetCorrelation?.country, sanFields.length > 0 ? 92 : 60,
        findings.riskScore, JSON.stringify(findings)
      );
    }
  } catch (err) {
    logger.warn(`[DarkWebIntel] Failed to persist scan: ${err.message}`);
  }

  return findings;
}

function generateScanSummary(sanFields, exposedEndpoints, originIp) {
  const issues = [];
  if (sanFields.length > 0) issues.push(`TLS certificate leaks clearnet domain: ${sanFields[0]}`);
  if (exposedEndpoints.length > 0) issues.push(`${exposedEndpoints.length} exposed management endpoint(s) detected`);
  if (originIp) issues.push(`Probable origin server IP: ${originIp}`);
  if (issues.length === 0) issues.push('No critical misconfigurations found in this scan');
  return issues;
}

// ─── Module 2: Actor Entity Graph Builder ──────────────────────────────────────
function addActorToGraph(profile) {
  const actorId = profile.actorId || generateId('ACTOR');
  const actor = { ...profile, actorId, addedAt: new Date().toISOString() };
  actorRegistry.set(actorId, actor);

  // Index PGP pivot
  if (profile.pgpFingerprint) {
    const pgpId = `PGP:${profile.pgpFingerprint.toUpperCase()}`;
    if (!pivotIndex.has(pgpId)) pivotIndex.set(pgpId, new Set());
    pivotIndex.get(pgpId).add(actorId);
  }

  // Index wallet pivots
  if (profile.cryptoWallets) {
    profile.cryptoWallets.forEach(w => {
      const walletId = `WALLET:${w.address}`;
      if (!pivotIndex.has(walletId)) pivotIndex.set(walletId, new Set());
      pivotIndex.get(walletId).add(actorId);
    });
  }

  // Index contact pivots
  if (profile.contactIds) {
    profile.contactIds.forEach(c => {
      const contactId = `CONTACT:${c.platform}:${c.handle}`;
      if (!pivotIndex.has(contactId)) pivotIndex.set(contactId, new Set());
      pivotIndex.get(contactId).add(actorId);
    });
  }

  return { success: true, actorId, message: `Actor ${profile.primaryHandle} added to graph` };
}

function getActorGraph() {
  const nodes = [];
  const links = [];
  const seen = new Set();

  actorRegistry.forEach((actor, actorId) => {
    nodes.push({ id: actorId, type: 'ACTOR', label: actor.primaryHandle, category: actor.category, confidence: actor.attributionConfidence });

    // Marketplace nodes
    (actor.marketplaces || []).forEach(m => {
      const mId = `MKT:${m.name}`;
      if (!seen.has(mId)) { nodes.push({ id: mId, type: 'MARKETPLACE', label: m.name }); seen.add(mId); }
      links.push({ source: actorId, target: mId, relation: 'OPERATES_ON' });
    });

    // PGP nodes
    if (actor.pgpFingerprint) {
      const pgpId = `PGP:${actor.pgpFingerprint}`;
      if (!seen.has(pgpId)) { nodes.push({ id: pgpId, type: 'PGP_KEY', label: actor.pgpFingerprint.substring(0, 16) + '...' }); seen.add(pgpId); }
      links.push({ source: actorId, target: pgpId, relation: 'SIGNS_WITH', confidence: 0.99 });
    }

    // Wallet nodes
    (actor.cryptoWallets || []).forEach(w => {
      const wId = `WALLET:${w.address}`;
      if (!seen.has(wId)) { nodes.push({ id: wId, type: 'CRYPTO_WALLET', label: `${w.currency}: ${w.address.substring(0, 12)}...`, currency: w.currency }); seen.add(wId); }
      links.push({ source: actorId, target: wId, relation: 'RECEIVES_FUNDS', confidence: 0.95 });
    });

    // Contact nodes
    (actor.contactIds || []).forEach(c => {
      const cId = `CONTACT:${c.platform}:${c.handle}`;
      if (!seen.has(cId)) { nodes.push({ id: cId, type: 'COMM_CHANNEL', label: `${c.platform}: ${c.handle}` }); seen.add(cId); }
      links.push({ source: actorId, target: cId, relation: 'CONTACT_VIA' });
    });
  });

  return { nodes, links, totalActors: actorRegistry.size };
}

function getCrossAliasLinks() {
  const crossLinks = [];
  pivotIndex.forEach((actorIds, pivotId) => {
    if (actorIds.size > 1) {
      const actors = [...actorIds].map(id => ({
        actorId: id,
        handle: actorRegistry.get(id)?.primaryHandle || 'Unknown',
      }));
      const [pivotType] = pivotId.split(':');
      crossLinks.push({
        pivotId,
        pivotType,
        pivotIdentifier: pivotId.split(':').slice(1).join(':'),
        linkedActors: actors,
        confidence: pivotType === 'PGP' ? 0.99 : pivotType === 'WALLET' ? 0.92 : 0.75,
        attributionStrength: pivotType === 'PGP' ? 'DEFINITIVE' : pivotType === 'WALLET' ? 'STRONG' : 'MODERATE',
      });
    }
  });
  return crossLinks;
}

function actorRowToObject(row) {
  if (!row) return null;
  const P = s => { try { return JSON.parse(s || '[]'); } catch { return []; } };
  const PO = s => { try { return JSON.parse(s || '{}'); } catch { return {}; } };
  return {
    actorId: row.actor_id,
    primaryHandle: row.primary_handle,
    category: row.category,
    pgpFingerprint: row.pgp_fingerprint,
    pgpKeyId: row.pgp_key_id,
    originIpAttribution: row.origin_ip,
    originCountry: row.origin_country,
    hostingProvider: row.hosting_provider,
    attributionConfidence: row.attribution_confidence,
    source: row.source,
    firstDiscovered: row.first_discovered,
    lastScanDate: row.last_scan_date,
    active: !!row.active,
    aliases: P(row.aliases_json),
    cryptoWallets: P(row.wallets_json),
    contactIds: P(row.contact_ids_json),
    marketplaces: P(row.marketplaces_json),
    infrastructureFindings: P(row.infrastructure_json),
    tags: P(row.tags_json),
    linguisticFingerprint: PO(row.linguistic_fingerprint_json),
  };
}

function getAllActors() {
  try {
    const d = getDB();
    if (d) {
      const rows = d.prepare('SELECT * FROM threat_actors ORDER BY attribution_confidence DESC').all();
      if (rows && rows.length > 0) {
        return rows.map(actorRowToObject);
      }
    }
  } catch (e) {
    logger.warn(`[DarkWebIntel] SQLite actors query fallback: ${e.message}`);
  }
  return [...actorRegistry.values()];
}

function getActorById(actorId) {
  if (!actorId) return null;
  try {
    const d = getDB();
    if (d) {
      const row = d.prepare('SELECT * FROM threat_actors WHERE actor_id = ? OR primary_handle = ? OR primary_handle LIKE ?').get(actorId, actorId, `%${actorId}%`);
      if (row) return actorRowToObject(row);
    }
  } catch (e) {}

  if (actorRegistry.has(actorId)) return actorRegistry.get(actorId);
  for (const actor of actorRegistry.values()) {
    if (actor.actorId === actorId || 
        actor.primaryHandle === actorId || 
        actor.actorId?.includes(actorId) || 
        actor.primaryHandle?.toLowerCase() === actorId.toLowerCase()) {
      return actor;
    }
  }
  return null;
}

// Seed with sample data for demonstration
function seedSampleActors() {
  const samples = [
    {
      primaryHandle: 'DarkPhantom_v2',
      category: 'Ransomware',
      pgpFingerprint: 'E8B21A3499F0C3D7B2A19E4F5C8D7E6A1B3F4E5C',
      cryptoWallets: [
        { address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divfna', currency: 'BTC', totalReceived: 12.5, transactionCount: 47 },
        { address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', currency: 'BTC', totalReceived: 8.2, transactionCount: 23 },
      ],
      marketplaces: [{ name: 'BreachForums', url: 'breachforums.st', postCount: 1247, rating: '★★★★★', verified: true }],
      contactIds: [{ platform: 'Telegram', handle: '@dark_phantom_ops' }, { platform: 'Tox', handle: 'A3B2C1D4...' }],
      attributionConfidence: 94,
      originIpAttribution: '185.220.101.47',
      originCountry: 'Russia',
      tags: ['LockBit affiliate', 'double-extortion', 'active'],
      active: true,
    },
    {
      primaryHandle: 'SilkReborn_Admin',
      category: 'Drugs',
      pgpFingerprint: 'E8B21A3499F0C3D7B2A19E4F5C8D7E6A1B3F4E5C', // Same PGP as DarkPhantom — alias!
      cryptoWallets: [
        { address: '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn38nXLH20', currency: 'XMR', totalReceived: 234.7, transactionCount: 89 },
      ],
      marketplaces: [
        { name: 'Hydra Reborn', url: 'hydraxxx.onion', postCount: 3421, rating: '★★★★☆', verified: true },
        { name: 'AlphaBay v2', url: 'alphabayxx.onion', postCount: 891, rating: '★★★☆☆', verified: false },
      ],
      contactIds: [{ platform: 'Jabber', handle: 'silkreborn@thesecure.biz' }],
      attributionConfidence: 88,
      tags: ['marketplace admin', 'fentanyl', 'high-volume'],
      active: true,
    },
    {
      primaryHandle: 'GhostNet_Broker',
      category: 'Hacking Services',
      pgpFingerprint: 'A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0',
      cryptoWallets: [
        { address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', currency: 'BTC', totalReceived: 45.1, transactionCount: 112 },
        { address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divfna', currency: 'BTC', totalReceived: 12.5, transactionCount: 47 }, // Same wallet as DarkPhantom
      ],
      marketplaces: [{ name: 'RaidForums Mirror', url: 'raidforums-reborn.onion', postCount: 672, rating: '★★★★☆', verified: false }],
      contactIds: [{ platform: 'Session', handle: '05d1b7c3e9f2a4b8c7d3e1f2a3b4c5d6e7f8a9b0c1d2e3f4' }],
      attributionConfidence: 71,
      tags: ['initial access broker', 'zero-day seller'],
      active: true,
    },
  ];

  samples.forEach(s => addActorToGraph(s));
}

// ─── Module 3: Stylometric Persona Linker ──────────────────────────────────────
function extractLexicalFeatures(text) {
  const words = text.match(/\b\w+\b/g) || [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  if (words.length === 0) {
    return { avgWordLength: 0, avgSentenceLength: 0, vocabRichness: 0, punctuationDensity: 0, digitDensity: 0, capsRatio: 0, yuleK: 0 };
  }

  const avgWordLength = words.reduce((s, w) => s + w.length, 0) / words.length;
  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : words.length;
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const vocabRichness = uniqueWords.size / words.length;
  const punctCount = (text.match(/[.,;:!?'"()\-]/g) || []).length;
  const punctuationDensity = punctCount / (text.length + 1);
  const digitDensity = (text.match(/\d/g) || []).length / (text.length + 1);
  const capsRatio = (text.match(/[A-Z]/g) || []).length / (text.length + 1);

  // Yule's Characteristic K
  const freq = {};
  words.forEach(w => { const lw = w.toLowerCase(); freq[lw] = (freq[lw] || 0) + 1; });
  const freqVals = Object.values(freq);
  const N = words.length;
  const sumF2 = freqVals.reduce((s, f) => s + f * f, 0);
  const yuleK = N > 0 ? 10000 * (sumF2 - N) / (N * N + 1) : 0;

  return { avgWordLength, avgSentenceLength, vocabRichness, punctuationDensity, digitDensity, capsRatio, yuleK };
}

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((s, a, i) => s + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((s, a) => s + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((s, b) => s + b * b, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

function featureToVector(f) {
  return [f.avgWordLength, f.avgSentenceLength, f.vocabRichness * 10, f.punctuationDensity * 100, f.digitDensity * 100, f.capsRatio * 100, f.yuleK / 10];
}

function charNgramSimilarity(textA, textB, n = 3) {
  function getNgrams(text, n) {
    const ngrams = {};
    for (let i = 0; i <= text.length - n; i++) {
      const g = text.substring(i, i + n);
      ngrams[g] = (ngrams[g] || 0) + 1;
    }
    return ngrams;
  }

  const ngramsA = getNgrams(textA.toLowerCase(), n);
  const ngramsB = getNgrams(textB.toLowerCase(), n);
  const allKeys = new Set([...Object.keys(ngramsA), ...Object.keys(ngramsB)]);

  const vecA = [...allKeys].map(k => ngramsA[k] || 0);
  const vecB = [...allKeys].map(k => ngramsB[k] || 0);

  return cosineSimilarity(vecA, vecB);
}

function analyzeStylometry(corpusA, corpusB) {
  const textA = Array.isArray(corpusA) ? corpusA.join(' ') : corpusA;
  const textB = Array.isArray(corpusB) ? corpusB.join(' ') : corpusB;

  const featA = extractLexicalFeatures(textA);
  const featB = extractLexicalFeatures(textB);

  const lexicalSim = cosineSimilarity(featureToVector(featA), featureToVector(featB));
  const char3gramSim = charNgramSimilarity(textA, textB, 3);
  const char4gramSim = charNgramSimilarity(textA, textB, 4);
  const char5gramSim = charNgramSimilarity(textA, textB, 5);
  const avgCharSim = (char3gramSim + char4gramSim + char5gramSim) / 3;

  const compositeSimilarity = Math.min((0.65 * avgCharSim) + (0.35 * lexicalSim), 1.0);
  const isLikelyRebranded = compositeSimilarity >= 0.72;
  const confidencePct = Math.min(Math.round(compositeSimilarity * 100 * 10) / 10, 99.0);

  // Feature delta analysis
  const featureDelta = {
    avgWordLength: { a: Math.round(featA.avgWordLength * 100) / 100, b: Math.round(featB.avgWordLength * 100) / 100, delta: Math.abs(featA.avgWordLength - featB.avgWordLength) },
    avgSentenceLength: { a: Math.round(featA.avgSentenceLength * 100) / 100, b: Math.round(featB.avgSentenceLength * 100) / 100, delta: Math.abs(featA.avgSentenceLength - featB.avgSentenceLength) },
    vocabRichness: { a: Math.round(featA.vocabRichness * 1000) / 1000, b: Math.round(featB.vocabRichness * 1000) / 1000, delta: Math.abs(featA.vocabRichness - featB.vocabRichness) },
    punctuationDensity: { a: Math.round(featA.punctuationDensity * 10000) / 10000, b: Math.round(featB.punctuationDensity * 10000) / 10000, delta: Math.abs(featA.punctuationDensity - featB.punctuationDensity) },
    capsRatio: { a: Math.round(featA.capsRatio * 10000) / 10000, b: Math.round(featB.capsRatio * 10000) / 10000, delta: Math.abs(featA.capsRatio - featB.capsRatio) },
    yuleK: { a: Math.round(featA.yuleK * 100) / 100, b: Math.round(featB.yuleK * 100) / 100, delta: Math.abs(featA.yuleK - featB.yuleK) },
  };

  return {
    analysisId: generateId('STYLO'),
    timestamp: new Date().toISOString(),
    compositeSimilarity: Math.round(compositeSimilarity * 10000) / 10000,
    charNgramSimilarity: Math.round(avgCharSim * 10000) / 10000,
    lexicalSimilarity: Math.round(lexicalSim * 10000) / 10000,
    charNgramBreakdown: {
      trigram: Math.round(char3gramSim * 10000) / 10000,
      quadgram: Math.round(char4gramSim * 10000) / 10000,
      pentagram: Math.round(char5gramSim * 10000) / 10000,
    },
    isLikelyRebranded,
    attributionConfidence: `${confidencePct}%`,
    verdict: isLikelyRebranded ? 'LIKELY SAME ACTOR' : compositeSimilarity >= 0.55 ? 'UNCERTAIN — FURTHER ANALYSIS REQUIRED' : 'LIKELY DIFFERENT ACTOR',
    verdictColor: isLikelyRebranded ? 'error' : compositeSimilarity >= 0.55 ? 'warning' : 'success',
    featuresA: featA,
    featuresB: featB,
    featureDelta,
    interpretations: generateInterpretation(compositeSimilarity, featureDelta),
  };

  // Persist stylometry analysis to SQLite
  try {
    const d = getDB();
    if (d) {
      d.prepare(`
        INSERT INTO stylometry_analyses (
          analysis_id, corpus_a_preview, corpus_b_preview, similarity_score,
          verdict, metrics_json, confidence_pct, analyzed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        result.analysisId, textA.substring(0, 120), textB.substring(0, 120),
        Math.round(compositeSimilarity * 100), result.verdict, JSON.stringify(result),
        confidencePct
      );
    }
  } catch (err) {
    logger.warn(`[DarkWebIntel] Failed to persist stylometry: ${err.message}`);
  }

  return result;
}

function generateInterpretation(score, delta) {
  const notes = [];
  if (delta.avgWordLength.delta < 0.3) notes.push('Identical average word length — strong authorial consistency');
  if (delta.yuleK.delta < 5) notes.push('Yule\'s K metric aligns — similar vocabulary repetition pattern');
  if (delta.punctuationDensity.delta < 0.002) notes.push('Punctuation usage density matches closely');
  if (delta.capsRatio.delta < 0.005) notes.push('Capitalization habits are near-identical');
  if (score >= 0.85) notes.push('Composite score exceeds 85% — high confidence same author');
  else if (score >= 0.72) notes.push('Composite score exceeds 72% threshold — probable same author');
  else if (score >= 0.55) notes.push('Moderate similarity — shared linguistic influences or community norms');
  else notes.push('Low similarity — distinct authorship profiles');
  return notes;
}

// ─── Module 4: Dossier Generator ───────────────────────────────────────────────
function generateDossier(actorId) {
  const actor = actorRegistry.get(actorId);
  if (!actor) return null;

  const aliases = [...actorRegistry.values()]
    .filter(a => {
      if (a.actorId === actorId) return false;
      if (actor.pgpFingerprint && a.pgpFingerprint === actor.pgpFingerprint) return true;
      const sharedWallets = (actor.cryptoWallets || []).map(w => w.address);
      return (a.cryptoWallets || []).some(w => sharedWallets.includes(w.address));
    })
    .map(a => ({ actorId: a.actorId, handle: a.primaryHandle, linkType: 'Shared PGP/Wallet' }));

  return {
    caseReference: `NTRO-26151-${actorId}`,
    generatedAt: new Date().toISOString(),
    actor,
    linkedAliases: aliases,
    crossAliasLinks: getCrossAliasLinks().filter(cl =>
      cl.linkedActors.some(la => la.actorId === actorId)
    ),
    summary: {
      totalMarkets: (actor.marketplaces || []).length,
      totalWallets: (actor.cryptoWallets || []).length,
      pgpVerified: !!actor.pgpFingerprint,
      originAttributed: !!actor.originIpAttribution,
      linkedAliasCount: aliases.length,
    }
  };
}

// ─── Module 5: Dark Web Metadata Extractor ────────────────────────────────────
function fetchDarkwebMetadata(targetUrl) {
  const url = (targetUrl || 'http://darkphantomxxx.onion').trim();
  const hostname = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const isV3 = hostname.length >= 50 || hostname.includes('.onion');
  const seed = hostname;
  const hashVal = mmh3Simulate(seed + 'meta');
  
  const serverTypes = ['nginx/1.22.1 (Ubuntu)', 'Apache/2.4.54 (Debian)', 'lighttpd/1.4.67', 'Caddy/v2.6.2', 'OpenResty/1.21.4.1'];
  const serverHeader = serverTypes[Math.abs(hashVal) % serverTypes.length];
  const phpVersion = ['PHP/7.4.33', 'PHP/8.1.18', 'Node.js/18.16.0', 'Python/3.10.6 Gunicorn/20.1.0'][Math.abs(hashVal + 1) % 4];

  const certSha256 = crypto.createHash('sha256').update(seed + 'cert-meta').digest('hex');
  const certSerial = crypto.createHash('md5').update(seed + 'serial').digest('hex').toUpperCase();
  const sanList = [
    `${hostname.substring(0, 8)}.clearnet-node.org`,
    `api.${hostname.substring(0, 6)}-cluster.net`,
    `admin.${hostname.substring(0, 5)}.services`
  ];

  const btcAddrs = [
    '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divfna',
    '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
    'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
  ];
  const xmrAddrs = [
    '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn38nXLH20',
    '888tNkZrPN6JsEgekjMnABU4TBzc2Dt29EPAvkFxbANsAnJYPbb3iQ1YBRk1UXcdRsiKc9dhwMVgN5S9cQUiyoogDavup3H'
  ];
  const pgpSample = 'E8B2 1A34 99F0 C3D7 B2A1 9E4F 5C8D 7E6A 1B3F 4E5C';

  const ips = ['185.220.101.47', '195.176.3.23', '178.162.204.51', '94.142.241.111', '188.68.33.64'];
  const suspectedOriginIp = ips[Math.abs(hashVal) % ips.length];
  const hostingProviders = ['Frantech Solutions / BuyVM', 'Hetzner Online GmbH', 'Leaseweb Deutschland GmbH', 'M247 Europe SRL', 'OVH SAS'];

  return {
    target: url,
    hostname,
    onionVersion: isV3 ? 'v3 (56-character ed25519)' : 'v2 / clearnet',
    status: 'ONLINE',
    httpStatus: 200,
    responseTimeMs: 180 + (Math.abs(hashVal) % 350),
    fetchedAt: new Date().toISOString(),
    
    headers: {
      'Server': serverHeader,
      'X-Powered-By': phpVersion,
      'Content-Type': 'text/html; charset=UTF-8',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'ETag': `"${crypto.createHash('md5').update(seed).digest('hex')}"`,
      'Set-Cookie': `sentinel_sid=${crypto.randomBytes(12).toString('hex')}; path=/; HttpOnly; SameSite=Lax`,
      'Connection': 'keep-alive',
    },

    htmlMeta: {
      pageTitle: `${hostname.substring(0, 14)} — Dark Web Portal & Service`,
      generator: serverHeader.includes('Apache') ? 'WordPress 6.2' : 'Custom / Flask',
      description: 'Encrypted dark web portal, merchant listings, and automated PGP communications node.',
      openGraph: {
        'og:title': `${hostname.substring(0, 12)} Service Hub`,
        'og:type': 'website',
        'og:site_name': 'Tor Sentinel OSINT Index',
      },
      language: 'en-US',
      charset: 'UTF-8',
    },

    tlsCertificate: {
      subject: `CN=*.${hostname.substring(0, 12)}.onion`,
      issuer: 'Let\'s Encrypt Authority X3 / Self-Signed Root',
      serialNumber: certSerial,
      validFrom: new Date(Date.now() - 60 * 86400000).toISOString(),
      validTo: new Date(Date.now() + 305 * 86400000).toISOString(),
      fingerprintSha256: certSha256,
      subjectAlternativeNames: sanList,
      sanLeakDetected: sanList.length > 0,
    },

    favicon: {
      hashMmh3: hashVal,
      hashMd5: crypto.createHash('md5').update(seed + 'fav').digest('hex'),
      shodanQuery: `http.favicon.hash:${hashVal}`,
      censysQuery: `services.http.response.favicons.hashes.murmur3:${hashVal}`,
      matchingClearnetHosts: 3,
    },

    extractedIdentifiers: {
      pgpKeyFingerprints: [pgpSample],
      bitcoinAddresses: [btcAddrs[Math.abs(hashVal) % btcAddrs.length]],
      moneroAddresses: [xmrAddrs[Math.abs(hashVal) % xmrAddrs.length]],
      telegramHandles: [`@${hostname.substring(0, 8)}_ops`],
      jabberIds: [`admin@${hostname.substring(0, 8)}.secure.im`],
    },

    infrastructure: {
      suspectedOriginIp,
      hostingProvider: hostingProviders[Math.abs(hashVal) % hostingProviders.length],
      asn: `AS${40000 + (Math.abs(hashVal) % 20000)}`,
      country: ['Luxembourg', 'Germany', 'Netherlands', 'Romania', 'Russia'][Math.abs(hashVal) % 5],
      openPorts: [80, 443, 8080, 22],
      bulletproofHostingFlag: true,
      attributionConfidence: 89,
    },

    descriptor: {
      descriptorPublication: new Date(Date.now() - 3600000 * 4).toISOString(),
      introductionPointsCount: 3,
      authRequired: false,
      singleOnionService: false,
    }
  };
}

// Initialize with sample data
seedSampleActors();

module.exports = {
  scanHiddenService,
  addActorToGraph,
  getActorGraph,
  getCrossAliasLinks,
  getAllActors,
  getActorById,
  analyzeStylometry,
  generateDossier,
  fetchDarkwebMetadata,
};
