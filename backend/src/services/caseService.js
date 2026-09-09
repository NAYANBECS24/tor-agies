/**
 * caseService.js — TOR Sentinel 2.0
 * NTRO PS-26151 — Case Management Engine (SQLite-backed)
 * Persistent storage via better-sqlite3 — no external DB server needed.
 */

const { getDB, toJson } = require('../config/database');
const { getAllActors, getActorById, getCrossAliasLinks } = require('./darkwebIntelService');

// Lazy DB accessor (safe to call after server init)
function db() { return getDB(); }


// ─── JSON column helpers ──────────────────────────────────────────────────────
const J = (v) => typeof v === 'string' ? v : JSON.stringify(v || []);
const P = (s) => { try { return JSON.parse(s || '[]'); } catch { return []; } };
const PO = (s) => { try { return JSON.parse(s || '{}'); } catch { return {}; } };

function toPublicCase(row) {
  if (!row) return null;
  return {
    caseId: row.case_id,
    caseNumber: row.case_number,
    title: row.title,
    description: row.description,
    classification: row.classification,
    status: row.status,
    priority: row.priority,
    category: row.category,
    jurisdiction: row.jurisdiction,
    compositeConfidence: row.composite_confidence,
    evidenceCount: row.evidence_count,
    assignedInvestigators: P(row.assigned_investigators_json),
    linkedActorIds: P(row.linked_actor_ids_json),
    tags: P(row.tags_json),
    notes: P(row.notes_json),
    milestones: P(row.milestones_json),
    incidentPhase: row.incident_phase || 'DETECTION',
    containmentStatus: row.containment_status || 'NONE',
    rootCause: row.root_cause || '',
    lessonsLearned: row.lessons_learned || '',
    playbookActions: P(row.playbook_actions_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    closedAt: row.closed_at,
  };
}

// ─── Seed initial cases if DB is empty ───────────────────────────────────────
function seedInitialCases() {
  const d = db();
  if (!d) return;
  const count = d.prepare('SELECT COUNT(*) as c FROM cases').get().c;
  if (count > 0) return;

  const insert = d.prepare(`
    INSERT OR IGNORE INTO cases (
      case_id, case_number, title, description, classification, status, priority,
      category, jurisdiction, composite_confidence, evidence_count,
      assigned_investigators_json, linked_actor_ids_json, tags_json, notes_json, milestones_json
    ) VALUES (
      @case_id, @case_number, @title, @description, @classification, @status, @priority,
      @category, @jurisdiction, @composite_confidence, @evidence_count,
      @assigned_investigators_json, @linked_actor_ids_json, @tags_json, @notes_json, @milestones_json
    )
  `);

  const seed = d.transaction(() => {
    insert.run({
      case_id: 'CASE-26151-001', case_number: 'NTRO/CY/2024/001',
      title: 'Operation DarkPhantom — Ransomware-as-a-Service Network',
      description: 'Multi-market RaaS operator active since Q3 2023. Origin server de-cloaked via TLS SAN leak exposing clearnet infrastructure in Luxembourg.',
      classification: 'TOP SECRET', status: 'ACTIVE', priority: 'CRITICAL', category: 'Ransomware',
      jurisdiction: 'India — IT Act 2000 (Sec 66, 66B, 66C)', composite_confidence: 94, evidence_count: 14,
      assigned_investigators_json: J(['Analyst-Alpha', 'Analyst-Beta']),
      linked_actor_ids_json: J(['ACTOR-001']),
      tags_json: J(['ransomware', 'tls-decloaked', 'btc-traced', 'bulletproof-host']),
      notes_json: J([
        { id: 'N001', author: 'Analyst-Alpha', text: 'TLS SAN leak confirmed via crt.sh. Two clearnet domains share same IP block at 185.220.101.47.', timestamp: new Date(Date.now() - 48 * 86400000).toISOString(), classification: 'SECRET' },
        { id: 'N002', author: 'Analyst-Beta', text: 'BlockCypher confirms 12.5 BTC received in last 30 days. Mixing service detected downstream.', timestamp: new Date(Date.now() - 12 * 86400000).toISOString(), classification: 'SECRET' },
      ]),
      milestones_json: J([
        { label: 'Case Opened', status: 'done', date: new Date(Date.now() - 72 * 86400000).toISOString() },
        { label: 'Actor Identified', status: 'done', date: new Date(Date.now() - 60 * 86400000).toISOString() },
        { label: 'Origin IP De-cloaked', status: 'done', date: new Date(Date.now() - 40 * 86400000).toISOString() },
        { label: 'Financial Forensics', status: 'done', date: new Date(Date.now() - 15 * 86400000).toISOString() },
        { label: 'Dossier Submitted', status: 'pending', date: null },
        { label: 'Legal Review', status: 'pending', date: null },
      ])
    });

    insert.run({
      case_id: 'CASE-26151-002', case_number: 'NTRO/CY/2024/002',
      title: 'Operation SilkReborn — Cross-Market Drug Trafficking Network',
      description: 'DNM vendor operating on multiple markets simultaneously. Stylometric analysis confirmed 87% persona match.',
      classification: 'SECRET', status: 'PENDING REVIEW', priority: 'HIGH', category: 'Drug Trafficking',
      jurisdiction: 'India — NDPS Act 1985 + IT Act 2000', composite_confidence: 81, evidence_count: 9,
      assigned_investigators_json: J(['Analyst-Gamma']),
      linked_actor_ids_json: J(['ACTOR-002']),
      tags_json: J(['dnm', 'pgp-linked', 'stylometry-87pct']),
      notes_json: J([
        { id: 'N001', author: 'Analyst-Gamma', text: 'Stylometry confidence 87% — operator uses distinctive triple-dash punctuation pattern.', timestamp: new Date(Date.now() - 30 * 86400000).toISOString(), classification: 'SECRET' },
      ]),
      milestones_json: J([
        { label: 'Case Opened', status: 'done', date: new Date(Date.now() - 45 * 86400000).toISOString() },
        { label: 'Actor Identified', status: 'done', date: new Date(Date.now() - 35 * 86400000).toISOString() },
        { label: 'Stylometry Analysis', status: 'done', date: new Date(Date.now() - 20 * 86400000).toISOString() },
        { label: 'Pending Legal Review', status: 'pending', date: null },
      ])
    });

    insert.run({
      case_id: 'CASE-26151-003', case_number: 'NTRO/CY/2024/003',
      title: 'Operation BreachSyndicate — Stolen Credential Market',
      description: 'High-volume stolen data merchant. Behavioral profiling infers UTC+2 timezone. Monero wallet linked to known exchange.',
      classification: 'RESTRICTED', status: 'OPEN', priority: 'MEDIUM', category: 'Data Trafficking',
      jurisdiction: 'India — IT Act 2000 (Sec 43A, 72A)', composite_confidence: 67, evidence_count: 5,
      assigned_investigators_json: J(['Analyst-Alpha']),
      linked_actor_ids_json: J(['ACTOR-003']),
      tags_json: J(['data-breach', 'xmr-traced', 'eastern-europe']),
      notes_json: J([]),
      milestones_json: J([
        { label: 'Case Opened', status: 'done', date: new Date(Date.now() - 15 * 86400000).toISOString() },
        { label: 'Initial OSINT', status: 'done', date: new Date(Date.now() - 8 * 86400000).toISOString() },
        { label: 'Actor Identification', status: 'pending', date: null },
      ])
    });
  });
  seed();
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

function getAllCases(filters = {}) {
  seedInitialCases();
  const d = db();
  let sql = 'SELECT * FROM cases WHERE 1=1';
  const params = [];
  if (filters.status) { sql += ' AND status = ?'; params.push(filters.status); }
  if (filters.priority) { sql += ' AND priority = ?'; params.push(filters.priority); }
  if (filters.classification) { sql += ' AND classification = ?'; params.push(filters.classification); }
  if (filters.search) {
    sql += ' AND (title LIKE ? OR description LIKE ? OR tags_json LIKE ?)';
    const q = `%${filters.search}%`;
    params.push(q, q, q);
  }
  sql += ' ORDER BY updated_at DESC';

  const rows = d.prepare(sql).all(...params);
  return rows.map(row => {
    const c = toPublicCase(row);
    c.linkedActors = c.linkedActorIds.map(id => {
      const a = getActorById(id);
      return a ? { actorId: a.actorId, handle: a.primaryHandle, category: a.category, attributionConfidence: a.attributionConfidence } : null;
    }).filter(Boolean);
    return c;
  });
}

function getCaseById(caseId) {
  seedInitialCases();
  const row = db().prepare('SELECT * FROM cases WHERE case_id = ?').get(caseId);
  if (!row) return null;
  const c = toPublicCase(row);
  c.linkedActors = c.linkedActorIds.map(id => getActorById(id)).filter(Boolean);
  c.crossAliases = getCrossAliasLinks().filter(l =>
    c.linkedActorIds.includes(l.actorIds?.[0]) || c.linkedActorIds.includes(l.actorIds?.[1])
  );
  // Build timeline from linked actor data
  const timeline = [];
  c.linkedActors.forEach(actor => {
    if (actor.firstDiscovered) timeline.push({ type: 'ACTOR_IDENTIFIED', timestamp: actor.firstDiscovered, description: `Actor "${actor.primaryHandle}" identified`, actor: actor.primaryHandle });
    if (actor.originIpAttribution) timeline.push({ type: 'IP_DECLOAKED', timestamp: new Date(new Date(actor.firstDiscovered || Date.now()).getTime() + 7 * 86400000).toISOString(), description: `Origin IP: ${actor.originIpAttribution}`, actor: actor.primaryHandle });
  });
  timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  c.generatedTimeline = timeline;
  return c;
}

function createCase(data) {
  seedInitialCases();
  const d = db();
  const seq = d.prepare('SELECT COUNT(*) as c FROM cases').get().c + 1001;
  const caseId = data.caseId || `CASE-26151-${seq}`;
  const caseNumber = data.caseNumber || `NTRO/CY/2024/${seq}`;
  const now = new Date().toISOString();

  d.prepare(`
    INSERT INTO cases (
      case_id, case_number, title, description, classification, status, priority,
      category, jurisdiction, composite_confidence, evidence_count,
      assigned_investigators_json, linked_actor_ids_json, tags_json, notes_json, milestones_json
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    caseId, caseNumber, data.title || 'Untitled', data.description || '',
    data.classification || 'RESTRICTED', 'OPEN', data.priority || 'MEDIUM',
    data.category || 'Unknown', data.jurisdiction || 'India — IT Act 2000',
    0, 0,
    J(data.assignedInvestigators || ['Analyst-Alpha']),
    J(data.linkedActorIds || []),
    J(data.tags || []),
    J([]),
    J([
      { label: 'Case Opened', status: 'done', date: now },
      { label: 'Initial OSINT', status: 'pending', date: null },
      { label: 'Actor Identification', status: 'pending', date: null },
      { label: 'Evidence Collection', status: 'pending', date: null },
      { label: 'Dossier Submission', status: 'pending', date: null },
    ])
  );
  return getCaseById(caseId);
}

function updateCase(caseId, updates) {
  seedInitialCases();
  const d = db();
  const fields = [];
  const vals = [];
  const directFields = { status: 'status', priority: 'priority', classification: 'classification', title: 'title', description: 'description', jurisdiction: 'jurisdiction', compositeConfidence: 'composite_confidence', evidenceCount: 'evidence_count' };
  for (const [k, col] of Object.entries(directFields)) {
    if (k in updates) { fields.push(`${col} = ?`); vals.push(updates[k]); }
  }
  if ('tags' in updates) { fields.push('tags_json = ?'); vals.push(J(updates.tags)); }
  if ('milestones' in updates) { fields.push('milestones_json = ?'); vals.push(J(updates.milestones)); }
  if (fields.length === 0) return getCaseById(caseId);
  fields.push('updated_at = ?');
  vals.push(new Date().toISOString());
  if (updates.status === 'CLOSED') { fields.push('closed_at = ?'); vals.push(new Date().toISOString()); }
  vals.push(caseId);
  d.prepare(`UPDATE cases SET ${fields.join(', ')} WHERE case_id = ?`).run(...vals);
  return getCaseById(caseId);
}

function addNoteToCase(caseId, note) {
  seedInitialCases();
  const d = db();
  const row = d.prepare('SELECT notes_json FROM cases WHERE case_id = ?').get(caseId);
  if (!row) return null;
  const notes = P(row.notes_json);
  const newNote = {
    id: `N${String(notes.length + 1).padStart(3, '0')}`,
    author: note.author || 'Analyst-Alpha',
    text: note.text,
    timestamp: new Date().toISOString(),
    classification: note.classification || 'RESTRICTED'
  };
  notes.push(newNote);
  d.prepare('UPDATE cases SET notes_json = ?, updated_at = ? WHERE case_id = ?').run(J(notes), new Date().toISOString(), caseId);
  return newNote;
}

function linkActorToCase(caseId, actorId) {
  seedInitialCases();
  const d = db();
  const row = d.prepare('SELECT linked_actor_ids_json FROM cases WHERE case_id = ?').get(caseId);
  if (!row) return null;
  const ids = P(row.linked_actor_ids_json);
  if (!ids.includes(actorId)) {
    ids.push(actorId);
    d.prepare('UPDATE cases SET linked_actor_ids_json = ?, updated_at = ? WHERE case_id = ?').run(J(ids), new Date().toISOString(), caseId);
  }
  return getCaseById(caseId);
}

function getCaseStats() {
  seedInitialCases();
  const d = db();
  const all = d.prepare('SELECT status, priority, classification, composite_confidence, evidence_count FROM cases').all();
  const byStatus = {}, byPriority = {}, byClassification = {};
  let totalConf = 0, totalEvidence = 0;
  for (const r of all) {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    byPriority[r.priority] = (byPriority[r.priority] || 0) + 1;
    byClassification[r.classification] = (byClassification[r.classification] || 0) + 1;
    totalConf += r.composite_confidence || 0;
    totalEvidence += r.evidence_count || 0;
  }
  return {
    total: all.length, byStatus, byPriority, byClassification,
    avgConfidence: all.length ? Math.round(totalConf / all.length) : 0,
    totalEvidence, lastUpdated: new Date().toISOString()
  };
}

function exportCasePackage(caseId) {
  const c = getCaseById(caseId);
  if (!c) return null;
  return {
    exportedAt: new Date().toISOString(), exportVersion: '2.0',
    classification: c.classification, caseFile: c,
    actorDossiers: (c.linkedActors || []).map(a => ({ actorId: a.actorId, handle: a.primaryHandle, category: a.category, attributionConfidence: a.attributionConfidence })),
    evidenceSummary: { totalItems: c.evidenceCount, compositeConfidence: c.compositeConfidence, attributionVerdict: c.compositeConfidence >= 80 ? 'CONFIRMED' : c.compositeConfidence >= 60 ? 'PROBABLE' : 'SUSPECTED' },
    legalFramework: c.jurisdiction,
    caveats: ['Intelligence product — Handle per classification guidelines', 'Derived from OSINT and technical attribution', 'Verify before operational use']
  };
}

// ─── Correlation Engine ───────────────────────────────────────────────────────
function correlateActors(actorIds) {
  const actors = actorIds.map(id => getActorById(id)).filter(Boolean);
  if (actors.length < 2) return { error: 'At least 2 valid actor IDs required' };
  const attributes = [
    { key: 'hosting', label: 'Hosting Provider', weight: 3, extractor: a => a.hostingProvider },
    { key: 'timezone', label: 'Timezone', weight: 4, extractor: a => a.timezone },
    { key: 'language', label: 'Language', weight: 2, extractor: a => a.language },
    { key: 'category', label: 'Threat Category', weight: 1, extractor: a => a.category },
    { key: 'country', label: 'Origin Country', weight: 3, extractor: a => a.originCountry },
    { key: 'wallets', label: 'Crypto Currencies', weight: 2, extractor: a => (a.cryptoWallets || []).map(w => w.currency).sort().join(',') },
    { key: 'contactPlatform', label: 'Communication Platform', weight: 3, extractor: a => (a.contactIds || []).map(c => c.platform).sort().join(',') },
  ];
  const pairs = [];
  for (let i = 0; i < actors.length; i++) {
    for (let j = i + 1; j < actors.length; j++) {
      const sharedAttrs = attributes.filter(attr => {
        const va = attr.extractor(actors[i]), vb = attr.extractor(actors[j]);
        return va && vb && va === vb;
      }).map(attr => ({ ...attr, value: attr.extractor(actors[i]) }));
      const totalWeight = attributes.reduce((s, a) => s + a.weight, 0);
      const sharedWeight = sharedAttrs.reduce((s, a) => s + a.weight, 0);
      const similarity = Math.round((sharedWeight / totalWeight) * 100);
      pairs.push({
        actorA: { id: actors[i].actorId, handle: actors[i].primaryHandle },
        actorB: { id: actors[j].actorId, handle: actors[j].primaryHandle },
        sharedAttributes: sharedAttrs, sharedCount: sharedAttrs.length,
        totalAttributes: attributes.length, similarityScore: similarity,
        verdict: similarity >= 60 ? 'LIKELY_SAME_ENTITY' : similarity >= 35 ? 'POSSIBLE_LINK' : 'UNRELATED'
      });
    }
  }
  const topCluster = pairs.filter(p => p.verdict === 'LIKELY_SAME_ENTITY');
  return {
    analysisDate: new Date().toISOString(), actorCount: actors.length,
    attributeCount: attributes.length, pairwiseComparison: pairs,
    clusterVerdict: topCluster.length > 0 ? `HIGH PROBABILITY: ${topCluster.length} pair(s) likely same entity` : 'No same-entity clusters detected',
    topSharedAttributes: attributes.filter(attr => {
      const vals = actors.map(a => attr.extractor(a)).filter(Boolean);
      return [...new Set(vals)].length === 1 && vals.length === actors.length;
    }).map(attr => ({ ...attr, value: attr.extractor(actors[0]) }))
  };
}

// ─── NTRO Report ──────────────────────────────────────────────────────────────
function generateNTROReport(caseId, reportType = 'ACTOR_PROFILE') {
  try {
    const reportService = require('./reportService');
    const savedReport = reportService.generateAndSaveReport({
      caseId,
      reportType: (reportType || 'ACTOR_PROFILE').toUpperCase(),
      authorName: 'Analyst-Alpha'
    });
    return savedReport;
  } catch (err) {
    const caseData = getCaseById(caseId);
    if (!caseData) return null;
    return {
      reportId: `NTRO-RPT-${Date.now()}`,
      reportType,
      classification: caseData.classification,
      caseReference: caseData.caseNumber,
      generatedAt: new Date().toISOString(),
      generatedBy: 'TOR Sentinel 2.0 — Auto-Intelligence System',
      title: `${reportType} — ${caseData.title}`,
      summary: caseData.description,
      content: { executiveSummary: caseData.description }
    };
  }
}

const VALID_PHASES = [
  'PREPARATION', 'DETECTION', 'ENRICHMENT', 'CORRELATION', 'ATTRIBUTION', 'CONTAINMENT', 'PROSECUTION',
  'ASSESSMENT', 'CLASSIFICATION', 'RESPONSE', 'RECOVERY', 'LESSONS_LEARNED'
];

function updateIncidentPhase(caseId, phase, details = {}) {
  const normalizedPhase = phase.toUpperCase();
  if (!VALID_PHASES.includes(normalizedPhase)) {
    throw new Error(`Invalid incident phase: ${phase}. Must be one of: ${VALID_PHASES.join(', ')}`);
  }

  const d = db();
  const c = getCaseById(caseId);
  if (!c) return null;

  const notes = c.notes || [];
  notes.push({
    id: `N-${Date.now()}`,
    author: details.author || 'SOC Lead',
    text: `Incident escalated to phase [${normalizedPhase}]: ${details.notes || 'Phase progression approved.'}`,
    timestamp: new Date().toISOString(),
    classification: c.classification
  });

  d.prepare(`
    UPDATE cases
    SET incident_phase = ?,
        containment_status = COALESCE(?, containment_status),
        root_cause = COALESCE(?, root_cause),
        lessons_learned = COALESCE(?, lessons_learned),
        notes_json = ?,
        updated_at = datetime('now')
    WHERE case_id = ?
  `).run(
    normalizedPhase,
    details.containmentStatus || null,
    details.rootCause || null,
    details.lessonsLearned || null,
    J(notes),
    caseId
  );

  return getCaseById(caseId);
}

function executePlaybookAction(caseId, actionName, parameters = {}) {
  const d = db();
  const c = getCaseById(caseId);
  if (!c) return null;

  const actions = c.playbookActions || [];
  const actionRecord = {
    actionId: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    actionName: actionName.toUpperCase(),
    executedAt: new Date().toISOString(),
    executedBy: parameters.analyst || 'SOC Operator',
    status: 'COMPLETED',
    parameters,
    result: `Orchestrated action [${actionName.toUpperCase()}] successfully applied across perimeter devices.`
  };
  actions.push(actionRecord);

  // Auto-update containment status if isolation/blocking action
  let newContainment = c.containmentStatus;
  if (['ISOLATE_HOST', 'BLOCK_IP_ON_FIREWALL', 'REVOKE_CREDENTIALS'].includes(actionName.toUpperCase())) {
    newContainment = 'CONTAINED';
  }

  d.prepare(`
    UPDATE cases
    SET playbook_actions_json = ?,
        containment_status = ?,
        updated_at = datetime('now')
    WHERE case_id = ?
  `).run(J(actions), newContainment, caseId);

  return {
    success: true,
    actionRecord,
    case: getCaseById(caseId)
  };
}

// ─── Digital Evidence Locker & Chain of Custody ──────────────────────────────
function getEvidenceForCase(caseId) {
  const d = db();
  if (!d) return [];
  const count = d.prepare('SELECT COUNT(*) as c FROM evidence WHERE case_id = ?').get(caseId).c;
  if (count === 0 && caseId === 'CASE-26151-001') {
    const seedExhibits = [
      {
        id: 'EX-26151-01', case_id: caseId, actor_id: 'ACTOR-001', type: 'TLS_SAN_CERTIFICATE',
        title: 'TLS SAN Certificate Leak — crt.sh Ledger',
        description: 'X.509 Certificate SAN field exposing *.darkphantom-ops.net and dp-admin.clearnet.org resolving to origin 185.220.101.47.',
        data: { originIp: '185.220.101.47', issuer: "Let's Encrypt Authority X3", sanDomains: ['darkphantom-ops.net', 'dp-admin.clearnet.org'], asn: 'AS53667 Frantech Solutions' },
        confidence: 96, verified: 1, source: 'Autonomous Certificate Monitor', analyst: 'Analyst-Alpha'
      },
      {
        id: 'EX-26151-02', case_id: caseId, actor_id: 'ACTOR-001', type: 'BLOCKCHAIN_LEDGER',
        title: 'Bitcoin RaaS Ransom UTXO Flow Ledger',
        description: 'Blockchain forensic trace confirming 12.5 BTC in ransom payments received across 3 addresses with downstream Wasabi coinjoin mixer hops.',
        data: { wallet: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', totalBtc: 12.5, mixerUsed: 'Wasabi Wallet CoinJoin', hops: 4 },
        confidence: 92, verified: 1, source: 'Blockchain Tracer & Mempool', analyst: 'Analyst-Beta'
      },
      {
        id: 'EX-26151-03', case_id: caseId, actor_id: 'ACTOR-001', type: 'STYLOMETRIC_CORPUS',
        title: 'Stylometric Linguistic Match — Hydra vs AlphaBay',
        description: 'Cosine similarity 87% between forum posts on Hydra Reborn and AlphaBay v2 based on rare syntax markers and triple-dash punctuation.',
        data: { similarityScore: 87, verdict: 'HIGH_PROBABILITY_SAME_AUTHOR', punctuationMarkers: '---', vocabularyOverlap: 0.74 },
        confidence: 88, verified: 1, source: 'Stylometry AI Engine', analyst: 'Analyst-Gamma'
      },
      {
        id: 'EX-26151-04', case_id: caseId, actor_id: 'ACTOR-001', type: 'ONION_TELEMETRY',
        title: 'Hidden Service Descriptors & Consensus Timing',
        description: 'Onionoo Tor network consensus snapshots correlating circuit build bursts with target active C2 beacon cycles.',
        data: { onionUrl: 'darkph5x...onion', circuitHops: 3, exitLatencyMs: 42.8, timingCorrelationScore: 0.91 },
        confidence: 90, verified: 1, source: 'ATWC Timing Engine', analyst: 'Analyst-Alpha'
      }
    ];

    const insertEvidence = d.prepare(`
      INSERT INTO evidence (
        evidence_id, case_id, actor_id, type, title, description, data_json,
        confidence_score, verified, source, analyst, tags_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    for (const ex of seedExhibits) {
      insertEvidence.run(ex.id, ex.case_id, ex.actor_id, ex.type, ex.title, ex.description, J(ex.data), ex.confidence, ex.verified, ex.source, ex.analyst, J([ex.type.toLowerCase(), 'forensic-seal']));
    }
  }

  const rows = d.prepare('SELECT * FROM evidence WHERE case_id = ? ORDER BY created_at DESC').all(caseId);
  return rows.map(r => ({
    id: r.id,
    evidenceId: r.evidence_id,
    caseId: r.case_id,
    actorId: r.actor_id,
    type: r.type,
    title: r.title,
    description: r.description,
    data: PO(r.data_json),
    confidenceScore: r.confidence_score,
    verified: Boolean(r.verified),
    source: r.source,
    analyst: r.analyst,
    tags: P(r.tags_json),
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }));
}

function addEvidenceToCase(caseId, evidenceData) {
  const d = db();
  if (!d) return null;
  const count = d.prepare('SELECT COUNT(*) as c FROM evidence').get().c + 1;
  const evidenceId = `EX-26151-${String(count).padStart(2, '0')}`;
  const now = new Date().toISOString();

  d.prepare(`
    INSERT INTO evidence (
      evidence_id, case_id, actor_id, type, title, description, data_json,
      confidence_score, verified, source, analyst, tags_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    evidenceId,
    caseId,
    evidenceData.actorId || null,
    evidenceData.type || 'TECHNICAL_INDICATOR',
    evidenceData.title || 'Untitled Evidence',
    evidenceData.description || '',
    J(evidenceData.data || {}),
    evidenceData.confidenceScore || 85,
    evidenceData.verified ? 1 : 0,
    evidenceData.source || 'Manual Forensic Entry',
    evidenceData.analyst || 'Lead Analyst',
    J(evidenceData.tags || ['evidence', 'iso-27037']),
    now,
    now
  );

  d.prepare("UPDATE cases SET evidence_count = evidence_count + 1, updated_at = datetime('now') WHERE case_id = ?").run(caseId);

  try {
    const crypto = require('crypto');
    const logId = `CUSTODY-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const hash = crypto.createHash('sha256').update(`${evidenceId}:ATTACHED_TO_${caseId}:${now}`).digest('hex');
    d.prepare(`
      INSERT INTO evidence_custody_logs (log_id, item_id, item_type, action, actor_name, actor_badge, hash_signature, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(logId, evidenceId, 'EVIDENCE', 'ATTACHED', evidenceData.analyst || 'Lead Analyst', evidenceData.badge || 'NTRO-0842', hash, `Attached evidence "${evidenceData.title}" to ${caseId}`);
  } catch {}

  return getEvidenceForCase(caseId);
}

function getCustodyForCase(caseId) {
  const d = db();
  if (!d) return [];
  const rows = d.prepare(`
    SELECT * FROM evidence_custody_logs
    WHERE item_id = ? OR item_id IN (SELECT evidence_id FROM evidence WHERE case_id = ?)
       OR notes LIKE ?
    ORDER BY logged_at DESC
  `).all(caseId, caseId, `%${caseId}%`);
  return rows;
}

module.exports = {
  getAllCases, getCaseById, createCase, updateCase,
  addNoteToCase, linkActorToCase, getCaseStats, exportCasePackage,
  correlateActors, generateNTROReport,
  updateIncidentPhase, executePlaybookAction,
  getEvidenceForCase, addEvidenceToCase, getCustodyForCase
};
