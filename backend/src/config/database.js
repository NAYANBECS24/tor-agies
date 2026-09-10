/**
 * database.js — TOR Sentinel 2.0
 * SQLite database (replaces MongoDB/Mongoose)
 * Uses better-sqlite3: zero-config, file-based, synchronous, no server needed.
 * DB file: backend/data/tor_sentinel.db (auto-created on first run)
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const logger = require('../utils/logger');

// Ensure the data directory exists
const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'tor_sentinel.db');

let db = null;

// ─── Schema ───────────────────────────────────────────────────────────────────
const SCHEMA = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA synchronous = NORMAL;

  -- ═══ THREAT ACTORS ═══════════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS threat_actors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id TEXT NOT NULL UNIQUE,
    primary_handle TEXT NOT NULL,
    category TEXT DEFAULT 'Unknown',
    pgp_fingerprint TEXT,
    pgp_key_id TEXT,
    origin_ip TEXT,
    origin_country TEXT,
    hosting_provider TEXT,
    attribution_confidence INTEGER DEFAULT 50,
    source TEXT DEFAULT 'Autonomous Crawler',
    first_discovered TEXT DEFAULT (datetime('now')),
    last_scan_date TEXT DEFAULT (datetime('now')),
    active INTEGER DEFAULT 1,
    notes TEXT,
    -- JSON blobs for nested data (aliases, wallets, contacts, marketplaces, etc.)
    aliases_json TEXT DEFAULT '[]',
    wallets_json TEXT DEFAULT '[]',
    contact_ids_json TEXT DEFAULT '[]',
    marketplaces_json TEXT DEFAULT '[]',
    infrastructure_json TEXT DEFAULT '[]',
    stylometry_links_json TEXT DEFAULT '[]',
    linguistic_fingerprint_json TEXT DEFAULT '{}',
    tags_json TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ ALERTS ══════════════════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'new',
    source TEXT DEFAULT 'system',
    is_active INTEGER DEFAULT 1,
    metadata_json TEXT DEFAULT '{}',
    tags_json TEXT DEFAULT '[]',
    affected_nodes_json TEXT DEFAULT '[]',
    notes_json TEXT DEFAULT '[]',
    triggered_at TEXT DEFAULT (datetime('now')),
    acknowledged_at TEXT,
    resolved_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ INVESTIGATION CASES ═════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id TEXT NOT NULL UNIQUE,
    case_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    classification TEXT DEFAULT 'RESTRICTED',
    status TEXT DEFAULT 'OPEN',
    priority TEXT DEFAULT 'MEDIUM',
    category TEXT DEFAULT 'Unknown',
    jurisdiction TEXT DEFAULT 'India - IT Act 2000',
    composite_confidence INTEGER DEFAULT 0,
    evidence_count INTEGER DEFAULT 0,
    assigned_investigators_json TEXT DEFAULT '["Analyst-Alpha"]',
    linked_actor_ids_json TEXT DEFAULT '[]',
    tags_json TEXT DEFAULT '[]',
    notes_json TEXT DEFAULT '[]',
    milestones_json TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    closed_at TEXT
  );

  -- ═══ TOR NODES ═══════════════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS tor_nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id TEXT NOT NULL UNIQUE,
    fingerprint TEXT UNIQUE,
    nickname TEXT,
    ip_address TEXT,
    country TEXT,
    bandwidth INTEGER DEFAULT 0,
    is_exit INTEGER DEFAULT 0,
    is_guard INTEGER DEFAULT 0,
    is_stable INTEGER DEFAULT 1,
    flags_json TEXT DEFAULT '[]',
    first_seen TEXT DEFAULT (datetime('now')),
    last_seen TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ TRAFFIC LOGS ════════════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS traffic_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id TEXT NOT NULL UNIQUE,
    source_ip TEXT,
    dest_ip TEXT,
    protocol TEXT DEFAULT 'TCP',
    bytes_transferred INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    is_anomalous INTEGER DEFAULT 0,
    anomaly_score REAL DEFAULT 0.0,
    threat_level TEXT DEFAULT 'low',
    metadata_json TEXT DEFAULT '{}',
    logged_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ USERS ═══════════════════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT,
    role TEXT DEFAULT 'analyst',
    is_active INTEGER DEFAULT 1,
    last_login TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ EVIDENCE ITEMS ══════════════════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS evidence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evidence_id TEXT NOT NULL UNIQUE,
    case_id TEXT,
    actor_id TEXT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    data_json TEXT DEFAULT '{}',
    confidence_score INTEGER DEFAULT 50,
    verified INTEGER DEFAULT 0,
    source TEXT DEFAULT 'Manual',
    analyst TEXT DEFAULT 'Analyst-Alpha',
    tags_json TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (case_id) REFERENCES cases(case_id)
  );

  -- ═══ TOR NETWORK SNAPSHOTS (Near-Real-Time Onionoo) ═════════════════════════
  CREATE TABLE IF NOT EXISTS tor_network_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_id TEXT NOT NULL UNIQUE,
    source TEXT DEFAULT 'onionoo',
    total_relays INTEGER DEFAULT 0,
    running_relays INTEGER DEFAULT 0,
    guard_relays INTEGER DEFAULT 0,
    exit_relays INTEGER DEFAULT 0,
    bridge_count INTEGER DEFAULT 0,
    total_bandwidth_bytes REAL DEFAULT 0,
    avg_bandwidth_bytes REAL DEFAULT 0,
    consensus_weight_sum REAL DEFAULT 0,
    overload_relays INTEGER DEFAULT 0,
    congestion_factor REAL DEFAULT 0.0,
    adaptive_mu_ms REAL DEFAULT 350.0,
    adaptive_sigma_ms REAL DEFAULT 85.0,
    adaptive_window_min_ms REAL DEFAULT 150.0,
    adaptive_window_max_ms REAL DEFAULT 650.0,
    http_cache_status TEXT DEFAULT 'fresh',
    last_modified_header TEXT,
    raw_summary_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ TOR RELAY DELTAS (ΔB and Churn Tracker) ═══════════════════════════════
  CREATE TABLE IF NOT EXISTS tor_relay_deltas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    delta_id TEXT NOT NULL UNIQUE,
    fingerprint TEXT NOT NULL,
    nickname TEXT,
    event_type TEXT NOT NULL,
    prev_bandwidth REAL DEFAULT 0,
    curr_bandwidth REAL DEFAULT 0,
    bandwidth_delta REAL DEFAULT 0,
    bandwidth_pct_change REAL DEFAULT 0,
    prev_flags_json TEXT DEFAULT '[]',
    curr_flags_json TEXT DEFAULT '[]',
    is_overloaded INTEGER DEFAULT 0,
    details_json TEXT DEFAULT '{}',
    detected_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ TOR BANDWIDTH HISTORY (Onionoo /bandwidth) ════════════════════════════
  CREATE TABLE IF NOT EXISTS tor_bandwidth_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fingerprint TEXT NOT NULL UNIQUE,
    nickname TEXT,
    write_history_json TEXT DEFAULT '{}',
    read_history_json TEXT DEFAULT '{}',
    fetched_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ TOR UPTIME HISTORY (Onionoo /uptime) ═══════════════════════════════════
  CREATE TABLE IF NOT EXISTS tor_uptime_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fingerprint TEXT NOT NULL UNIQUE,
    nickname TEXT,
    uptime_json TEXT DEFAULT '{}',
    flags_json TEXT DEFAULT '{}',
    fetched_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ TOR RAW SNAPSHOT STORE & FORENSIC PROVENANCE ═════════════════════════
  CREATE TABLE IF NOT EXISTS tor_raw_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_id TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    status_code INTEGER DEFAULT 200,
    raw_payload_hash TEXT NOT NULL,
    raw_json TEXT DEFAULT '{}',
    parser_version TEXT DEFAULT '2.1.0',
    last_modified_header TEXT,
    etag_header TEXT,
    collected_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ SOC CO-MANAGED TELEMETRY LOGS (RFT-26.2026 Aligned) ══════════════════
  CREATE TABLE IF NOT EXISTS soc_telemetry_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id TEXT NOT NULL UNIQUE,
    event_name TEXT NOT NULL,
    category TEXT NOT NULL,
    iso_control TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'low',
    sla_target_mins INTEGER DEFAULT 15,
    sla_achieved_mins REAL DEFAULT 4.2,
    sla_status TEXT DEFAULT 'met',
    telemetry_details_json TEXT DEFAULT '{}',
    timestamp TEXT DEFAULT (datetime('now'))
  );

  -- ═══ SOC SIEM LOG INGESTION (Heterogeneous Enterprise Sources) ════════════
  CREATE TABLE IF NOT EXISTS soc_siem_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL UNIQUE,
    source_type TEXT NOT NULL,
    host TEXT,
    source_ip TEXT,
    dest_ip TEXT,
    source_port INTEGER,
    dest_port INTEGER,
    protocol TEXT,
    user_identity TEXT,
    action TEXT,
    severity TEXT DEFAULT 'info',
    message TEXT,
    raw_payload_json TEXT DEFAULT '{}',
    normalized_fields_json TEXT DEFAULT '{}',
    threat_intel_match INTEGER DEFAULT 0,
    matched_ioc_id TEXT,
    event_timestamp TEXT DEFAULT (datetime('now')),
    ingested_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ SOC MITRE ATT&CK DETECTION RULES ═════════════════════════════════════
  CREATE TABLE IF NOT EXISTS soc_detection_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    technique_id TEXT NOT NULL,
    tactic TEXT NOT NULL,
    severity TEXT DEFAULT 'high',
    query_logic_json TEXT DEFAULT '{}',
    response_action TEXT DEFAULT 'ALERT',
    enabled INTEGER DEFAULT 1,
    trigger_count INTEGER DEFAULT 0,
    last_triggered_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ SOC THREAT INTELLIGENCE IOC STORE ════════════════════════════════════
  CREATE TABLE IF NOT EXISTS soc_threat_intel_iocs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ioc_id TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    value TEXT NOT NULL,
    threat_actor_id TEXT,
    source TEXT DEFAULT 'Tor Sentinel OSINT',
    confidence INTEGER DEFAULT 80,
    severity TEXT DEFAULT 'high',
    first_seen TEXT DEFAULT (datetime('now')),
    last_seen TEXT DEFAULT (datetime('now')),
    tags_json TEXT DEFAULT '[]',
    metadata_json TEXT DEFAULT '{}'
  );

  -- ═══ SOC THREAT HUNTING WORKSPACE ═════════════════════════════════════════
  CREATE TABLE IF NOT EXISTS soc_threat_hunts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hunt_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    hypothesis TEXT NOT NULL,
    technique_id TEXT,
    query_filter_json TEXT DEFAULT '{}',
    status TEXT DEFAULT 'ACTIVE',
    lead_analyst TEXT DEFAULT 'Analyst-Alpha',
    findings_count INTEGER DEFAULT 0,
    findings_json TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    concluded_at TEXT
  );

  -- ═══ SOC TAMPER-EVIDENT AUDIT TRAIL ═══════════════════════════════════════
  CREATE TABLE IF NOT EXISTS soc_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    audit_id TEXT NOT NULL UNIQUE,
    user_id TEXT,
    username TEXT,
    role TEXT,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    details_json TEXT DEFAULT '{}',
    ip_address TEXT,
    status TEXT DEFAULT 'SUCCESS',
    signature_hash TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ SOC TIME INTEGRITY & NTP DRIFT LOGS ══════════════════════════════════
  CREATE TABLE IF NOT EXISTS soc_time_sync_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sync_id TEXT NOT NULL UNIQUE,
    ntp_server TEXT NOT NULL,
    offset_ms REAL DEFAULT 0,
    drift_ppm REAL DEFAULT 0,
    round_trip_delay_ms REAL DEFAULT 0,
    sync_status TEXT DEFAULT 'SYNCHRONIZED',
    forensic_time_hash TEXT,
    recorded_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ INTELLIGENCE & FORENSIC REPORTS (Vault & Provenance) ═════════════════
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL UNIQUE,
    case_id TEXT,
    actor_id TEXT,
    report_type TEXT NOT NULL,
    title TEXT NOT NULL,
    classification TEXT NOT NULL DEFAULT 'SECRET',
    handling_caveats_json TEXT DEFAULT '["NOFORN","ORCON"]',
    status TEXT NOT NULL DEFAULT 'FINALIZED',
    author_name TEXT DEFAULT 'Analyst-Alpha',
    author_badge TEXT DEFAULT 'NTRO-CY-0842',
    approving_officer TEXT DEFAULT 'Col. V. Sharma (Dir. Cyber Ops)',
    digital_seal_sha256 TEXT,
    summary TEXT,
    content_json TEXT NOT NULL DEFAULT '{}',
    metrics_snapshot_json TEXT DEFAULT '{}',
    tags_json TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ DARK WEB .ONION SCANS (Persistent Ingestion) ═════════════════════════
  CREATE TABLE IF NOT EXISTS onion_scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id TEXT NOT NULL UNIQUE,
    onion_url TEXT NOT NULL,
    hostname TEXT NOT NULL,
    cert_sha256 TEXT,
    san_fields_json TEXT DEFAULT '[]',
    common_name TEXT,
    favicon_mmh3 INTEGER,
    exposed_endpoints_json TEXT DEFAULT '[]',
    origin_ip_candidate TEXT,
    hosting_provider TEXT,
    country TEXT,
    confidence_score INTEGER DEFAULT 0,
    risk_score INTEGER DEFAULT 0,
    findings_json TEXT DEFAULT '{}',
    scanned_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ BLOCKCHAIN FORENSIC TRACES (Crypto Lookups & Mixer Graph) ═══════════
  CREATE TABLE IF NOT EXISTS blockchain_traces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trace_id TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BTC',
    balance REAL DEFAULT 0,
    total_received REAL DEFAULT 0,
    total_sent REAL DEFAULT 0,
    tx_count INTEGER DEFAULT 0,
    risk_score INTEGER DEFAULT 0,
    mixer_detected INTEGER DEFAULT 0,
    flags_json TEXT DEFAULT '[]',
    transactions_json TEXT DEFAULT '[]',
    source TEXT DEFAULT 'BlockCypher',
    live_data INTEGER DEFAULT 1,
    traced_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ STYLOMETRY & LINGUISTIC ANALYSES ═════════════════════════════════════
  CREATE TABLE IF NOT EXISTS stylometry_analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    analysis_id TEXT NOT NULL UNIQUE,
    corpus_a_preview TEXT,
    corpus_b_preview TEXT,
    similarity_score INTEGER DEFAULT 0,
    verdict TEXT,
    metrics_json TEXT DEFAULT '{}',
    confidence_pct INTEGER DEFAULT 0,
    analyzed_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ FORENSIC EVIDENCE CHAIN OF CUSTODY (ISO 27037 / Sec 65B) ════════════
  CREATE TABLE IF NOT EXISTS evidence_custody_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id TEXT NOT NULL UNIQUE,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    action TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_badge TEXT,
    ip_address TEXT DEFAULT '127.0.0.1',
    hash_signature TEXT,
    notes TEXT,
    logged_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ INDEXES ═════════════════════════════════════════════════════════════
  CREATE INDEX IF NOT EXISTS idx_actors_handle ON threat_actors(primary_handle);
  CREATE INDEX IF NOT EXISTS idx_actors_confidence ON threat_actors(attribution_confidence);
  CREATE INDEX IF NOT EXISTS idx_actors_country ON threat_actors(origin_country);
  CREATE INDEX IF NOT EXISTS idx_actors_category ON threat_actors(category);
  CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
  CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
  CREATE INDEX IF NOT EXISTS idx_alerts_triggered ON alerts(triggered_at);
  CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
  CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority);
  CREATE INDEX IF NOT EXISTS idx_evidence_case ON evidence(case_id);
  CREATE INDEX IF NOT EXISTS idx_evidence_actor ON evidence(actor_id);
  CREATE INDEX IF NOT EXISTS idx_snapshots_created ON tor_network_snapshots(created_at);
  CREATE INDEX IF NOT EXISTS idx_deltas_fingerprint ON tor_relay_deltas(fingerprint);
  CREATE INDEX IF NOT EXISTS idx_deltas_event ON tor_relay_deltas(event_type);
  CREATE INDEX IF NOT EXISTS idx_deltas_detected ON tor_relay_deltas(detected_at);
  CREATE INDEX IF NOT EXISTS idx_bw_history_fp ON tor_bandwidth_history(fingerprint);
  CREATE INDEX IF NOT EXISTS idx_uptime_history_fp ON tor_uptime_history(fingerprint);
  CREATE INDEX IF NOT EXISTS idx_raw_snapshots_ep ON tor_raw_snapshots(endpoint);
  CREATE INDEX IF NOT EXISTS idx_raw_snapshots_hash ON tor_raw_snapshots(raw_payload_hash);
  CREATE INDEX IF NOT EXISTS idx_soc_control ON soc_telemetry_logs(iso_control);
  CREATE INDEX IF NOT EXISTS idx_soc_timestamp ON soc_telemetry_logs(timestamp);
  CREATE INDEX IF NOT EXISTS idx_siem_source ON soc_siem_events(source_type);
  CREATE INDEX IF NOT EXISTS idx_siem_src_ip ON soc_siem_events(source_ip);
  CREATE INDEX IF NOT EXISTS idx_siem_dst_ip ON soc_siem_events(dest_ip);
  CREATE INDEX IF NOT EXISTS idx_siem_time ON soc_siem_events(event_timestamp);
  CREATE INDEX IF NOT EXISTS idx_iocs_type ON soc_threat_intel_iocs(type);
  CREATE INDEX IF NOT EXISTS idx_iocs_value ON soc_threat_intel_iocs(value);
  CREATE INDEX IF NOT EXISTS idx_rules_technique ON soc_detection_rules(technique_id);
  CREATE INDEX IF NOT EXISTS idx_hunts_status ON soc_threat_hunts(status);
  CREATE INDEX IF NOT EXISTS idx_audit_created ON soc_audit_logs(created_at);
  CREATE INDEX IF NOT EXISTS idx_reports_case ON reports(case_id);
  CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
  CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
  CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);
  CREATE INDEX IF NOT EXISTS idx_onion_scans_url ON onion_scans(onion_url);
  CREATE INDEX IF NOT EXISTS idx_onion_scans_ip ON onion_scans(origin_ip_candidate);
  CREATE INDEX IF NOT EXISTS idx_bc_traces_addr ON blockchain_traces(address);
  CREATE INDEX IF NOT EXISTS idx_custody_item ON evidence_custody_logs(item_id);

  -- ═══ PGP KEY ANALYSIS (Cryptographic Identity Evidence) ════════════════════
  CREATE TABLE IF NOT EXISTS pgp_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_id TEXT NOT NULL UNIQUE,
    fingerprint TEXT NOT NULL,
    algorithm TEXT DEFAULT 'RSA',
    bit_length INTEGER DEFAULT 4096,
    created_at_key TEXT,
    expires_at_key TEXT,
    user_ids_json TEXT DEFAULT '[]',
    signatures_json TEXT DEFAULT '[]',
    observed_source TEXT DEFAULT 'keys.openpgp.org',
    actor_id TEXT,
    case_id TEXT,
    sha256 TEXT,
    raw_armored TEXT,
    collected_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ CERTIFICATE TRANSPARENCY RECORDS (crt.sh) ═════════════════════════════
  CREATE TABLE IF NOT EXISTS cert_transparency_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cert_id TEXT NOT NULL UNIQUE,
    domain TEXT NOT NULL,
    fingerprint TEXT,
    issuer TEXT,
    subject TEXT,
    san_json TEXT DEFAULT '[]',
    valid_from TEXT,
    valid_to TEXT,
    serial_number TEXT,
    ct_source TEXT DEFAULT 'crt.sh',
    crtsh_id INTEGER,
    actor_id TEXT,
    case_id TEXT,
    collected_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ INFRASTRUCTURE CANDIDATES (Graph: Domain→Cert→IP→Actor) ═══════════════
  CREATE TABLE IF NOT EXISTS infrastructure_candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id TEXT NOT NULL UNIQUE,
    domain TEXT,
    ip_address TEXT,
    cert_fingerprint TEXT,
    san_json TEXT DEFAULT '[]',
    source TEXT DEFAULT 'CT_LOG',
    confidence REAL DEFAULT 0.0,
    relationship_type TEXT DEFAULT 'HOSTED_ON',
    actor_id TEXT,
    case_id TEXT,
    geo_country TEXT,
    geo_city TEXT,
    isp TEXT,
    is_hosting INTEGER DEFAULT 0,
    raw_json TEXT DEFAULT '{}',
    observed_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ BEHAVIORAL PROFILES (Timestamp-derived features) ═══════════════════════
  CREATE TABLE IF NOT EXISTS behavioral_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL UNIQUE,
    actor_id TEXT NOT NULL,
    utc_hour_distribution_json TEXT DEFAULT '{}',
    weekday_distribution_json TEXT DEFAULT '{}',
    weekday_ratio REAL DEFAULT 0.0,
    weekend_ratio REAL DEFAULT 0.0,
    posting_frequency REAL DEFAULT 0.0,
    burstiness REAL DEFAULT 0.0,
    inter_event_median_min REAL DEFAULT 0.0,
    inter_event_std_min REAL DEFAULT 0.0,
    active_days INTEGER DEFAULT 0,
    peak_utc_hour INTEGER DEFAULT 0,
    peak_utc_window TEXT DEFAULT '',
    observation_count INTEGER DEFAULT 0,
    observation_span_days INTEGER DEFAULT 0,
    source_events_json TEXT DEFAULT '[]',
    calculated_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ STYLOMETRY CORPUS (Real NLP Feature Vectors) ════════════════════════════
  CREATE TABLE IF NOT EXISTS stylometry_corpus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    corpus_id TEXT NOT NULL UNIQUE,
    actor_id TEXT,
    case_id TEXT,
    source_url TEXT,
    text_hash TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    char_count INTEGER DEFAULT 0,
    avg_word_length REAL DEFAULT 0.0,
    avg_sentence_length REAL DEFAULT 0.0,
    vocab_richness REAL DEFAULT 0.0,
    yule_k REAL DEFAULT 0.0,
    punctuation_density REAL DEFAULT 0.0,
    caps_ratio REAL DEFAULT 0.0,
    function_word_freq_json TEXT DEFAULT '{}',
    char_trigrams_json TEXT DEFAULT '{}',
    word_bigrams_json TEXT DEFAULT '{}',
    text_preview TEXT DEFAULT '',
    model_version TEXT DEFAULT 'style-v1.0',
    collected_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ EVIDENCE VAULT (SHA-256 Provenance — ISO 27037 / Sec 65B) ══════════════
  CREATE TABLE IF NOT EXISTS evidence_vault (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evidence_id TEXT NOT NULL UNIQUE,
    case_id TEXT,
    actor_id TEXT,
    source TEXT NOT NULL,
    collector TEXT NOT NULL,
    collector_version TEXT DEFAULT '1.0',
    collected_at TEXT DEFAULT (datetime('now')),
    observed_at TEXT,
    content_type TEXT DEFAULT 'JSON',
    classification TEXT DEFAULT 'RESTRICTED',
    sha256 TEXT NOT NULL,
    raw_reference TEXT,
    normalized_data_json TEXT DEFAULT '{}',
    provenance_json TEXT DEFAULT '{}',
    analyst TEXT DEFAULT 'system',
    is_sealed INTEGER DEFAULT 0,
    tags_json TEXT DEFAULT '[]'
  );

  -- ═══ AUDIT LOGS (Every important system action) ════════════════════════════
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    audit_id TEXT NOT NULL UNIQUE,
    user_id TEXT DEFAULT 'system',
    username TEXT DEFAULT 'system',
    role TEXT DEFAULT 'system',
    action TEXT NOT NULL,
    case_id TEXT,
    object_id TEXT,
    object_type TEXT,
    ip_address TEXT DEFAULT '127.0.0.1',
    session_id TEXT,
    result TEXT DEFAULT 'SUCCESS',
    details_json TEXT DEFAULT '{}',
    timestamp TEXT DEFAULT (datetime('now'))
  );

  -- ═══ BLOCKCHAIN GRAPH EDGES (Wallet → TX → Wallet relationships) ═════════════
  CREATE TABLE IF NOT EXISTS blockchain_graph_edges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    edge_id TEXT NOT NULL UNIQUE,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    tx_hash TEXT,
    chain TEXT DEFAULT 'BTC',
    value_native REAL DEFAULT 0.0,
    value_usd REAL DEFAULT 0.0,
    block_height INTEGER,
    confirmed_at TEXT,
    source TEXT DEFAULT 'BlockCypher',
    actor_id TEXT,
    case_id TEXT,
    relationship_type TEXT DEFAULT 'SENT_TO',
    collected_at TEXT DEFAULT (datetime('now'))
  );

  -- ═══ INDEXES — New Tables ═════════════════════════════════════════════════
  CREATE INDEX IF NOT EXISTS idx_pgp_fingerprint ON pgp_keys(fingerprint);
  CREATE INDEX IF NOT EXISTS idx_pgp_actor ON pgp_keys(actor_id);
  CREATE INDEX IF NOT EXISTS idx_ct_domain ON cert_transparency_records(domain);
  CREATE INDEX IF NOT EXISTS idx_ct_fingerprint ON cert_transparency_records(fingerprint);
  CREATE INDEX IF NOT EXISTS idx_infra_domain ON infrastructure_candidates(domain);
  CREATE INDEX IF NOT EXISTS idx_infra_ip ON infrastructure_candidates(ip_address);
  CREATE INDEX IF NOT EXISTS idx_infra_actor ON infrastructure_candidates(actor_id);
  CREATE INDEX IF NOT EXISTS idx_behavioral_actor ON behavioral_profiles(actor_id);
  CREATE INDEX IF NOT EXISTS idx_corpus_actor ON stylometry_corpus(actor_id);
  CREATE INDEX IF NOT EXISTS idx_corpus_hash ON stylometry_corpus(text_hash);
  CREATE INDEX IF NOT EXISTS idx_vault_case ON evidence_vault(case_id);
  CREATE INDEX IF NOT EXISTS idx_vault_actor ON evidence_vault(actor_id);
  CREATE INDEX IF NOT EXISTS idx_vault_sha256 ON evidence_vault(sha256);
  CREATE INDEX IF NOT EXISTS idx_audit_case ON audit_logs(case_id);
  CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
  CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
  CREATE INDEX IF NOT EXISTS idx_bc_edges_from ON blockchain_graph_edges(from_address);
  CREATE INDEX IF NOT EXISTS idx_bc_edges_to ON blockchain_graph_edges(to_address);
  CREATE INDEX IF NOT EXISTS idx_bc_edges_actor ON blockchain_graph_edges(actor_id);
`;

// ─── Seed Data ────────────────────────────────────────────────────────────────
function seedInitialData() {
  const actorCount = db.prepare('SELECT COUNT(*) as c FROM threat_actors').get().c;
  if (actorCount === 0) {
    logger.info('[SQLite] Seeding initial threat actor data...');

  const insertActor = db.prepare(`
    INSERT OR IGNORE INTO threat_actors (
      actor_id, primary_handle, category, pgp_fingerprint, pgp_key_id,
      origin_ip, origin_country, hosting_provider,
      attribution_confidence, source, first_discovered, last_scan_date, active,
      aliases_json, wallets_json, contact_ids_json, marketplaces_json,
      infrastructure_json, tags_json, linguistic_fingerprint_json
    ) VALUES (
      @actor_id, @primary_handle, @category, @pgp_fingerprint, @pgp_key_id,
      @origin_ip, @origin_country, @hosting_provider,
      @attribution_confidence, @source, @first_discovered, @last_scan_date, @active,
      @aliases_json, @wallets_json, @contact_ids_json, @marketplaces_json,
      @infrastructure_json, @tags_json, @linguistic_fingerprint_json
    )
  `);

  const seedActors = db.transaction(() => {
    insertActor.run({
      actor_id: 'ACTOR-001', primary_handle: 'DarkPhantom_v2', category: 'Ransomware',
      pgp_fingerprint: 'E8B2 1A34 99F0 C3D7 B2A1 9E4F 5C8D 7E6A 1B3F 4E5C', pgp_key_id: '0x1B3F4E5C',
      origin_ip: '185.220.101.47', origin_country: 'Russia', hosting_provider: 'Frantech Solutions',
      attribution_confidence: 94, source: 'TLS SAN Leak + Stylometry',
      first_discovered: new Date(Date.now() - 280 * 86400000).toISOString(),
      last_scan_date: new Date().toISOString(), active: 1,
      aliases_json: JSON.stringify([{ handle: 'phantom_ops', marketplace: 'AlphaBay v2', firstSeen: '2023-07-01' }, { handle: 'DarkP_Admin', marketplace: 'Hydra Reborn', firstSeen: '2023-08-15' }]),
      wallets_json: JSON.stringify([{ address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divfna', currency: 'BTC', totalReceived: 12.5, transactionCount: 47, riskScore: 87, flags: ['Mixer', 'Dark Market'] }, { address: '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3X8mn3YdrH5nNDE2fkJqe', currency: 'XMR', riskScore: 95, flags: ['Privacy Coin'] }]),
      contact_ids_json: JSON.stringify([{ platform: 'Telegram', handle: '@darkphantom_ops' }, { platform: 'Jabber', handle: 'dphantom@xmpp.jp' }]),
      marketplaces_json: JSON.stringify([{ name: 'Hydra Reborn', url: 'http://hydraxxx.onion', role: 'Operator', postCount: 342 }, { name: 'AlphaBay v2', url: 'http://alphabayxxx.onion', role: 'Vendor', postCount: 128 }]),
      infrastructure_json: JSON.stringify([{ onionUrl: 'http://darkphantomxxx.onion', certSha256: 'e8b21a34...', sanFields: ['darkphantom-ops.net', 'dp-admin.clearnet.org'], originIpCandidate: '185.220.101.47', riskScore: 94, scanDate: new Date().toISOString() }]),
      tags_json: JSON.stringify(['ransomware', 'confirmed', 'tls-decloaked', 'btc-traced', 'bulletproof-host']),
      linguistic_fingerprint_json: JSON.stringify({ avgWordLength: 5.2, avgSentenceLength: 12.4, vocabRichness: 0.61, punctuationDensity: 0.08, capsRatio: 0.03, yuleK: 42.1, primaryLanguage: 'English' })
    });

    insertActor.run({
      actor_id: 'ACTOR-002', primary_handle: 'SilkReborn_Admin', category: 'Drug Trafficking',
      pgp_fingerprint: 'A1B2 C3D4 E5F6 7890 ABCD EF12 3456 7890 ABCD EF12', pgp_key_id: '0xABCDEF12',
      origin_ip: null, origin_country: 'Netherlands', hosting_provider: 'Leaseweb',
      attribution_confidence: 81, source: 'Stylometry + PGP Cross-reference',
      first_discovered: new Date(Date.now() - 180 * 86400000).toISOString(),
      last_scan_date: new Date().toISOString(), active: 1,
      aliases_json: JSON.stringify([{ handle: 'silk_v3', marketplace: 'SilkReborn', firstSeen: '2023-11-01' }]),
      wallets_json: JSON.stringify([{ address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', currency: 'BTC', totalReceived: 3.2, transactionCount: 18, riskScore: 72, flags: ['Dark Market'] }, { address: 'LTDe7u6LkDVGezBwSbHFBmH5LF4Bqs8Yra', currency: 'LTC', riskScore: 65, flags: ['DNM'] }]),
      contact_ids_json: JSON.stringify([{ platform: 'Wickr', handle: 'silkreborn_off' }, { platform: 'Session', handle: '05a1b2c3d4e5f6...' }]),
      marketplaces_json: JSON.stringify([{ name: 'SilkReborn Market', url: 'http://silkreborn777.onion', role: 'Admin', postCount: 892 }, { name: 'Tor2Door', role: 'Vendor', postCount: 44 }]),
      infrastructure_json: JSON.stringify([]),
      tags_json: JSON.stringify(['dnm', 'stylometry-87pct', 'pgp-linked', 'confirmed-alias']),
      linguistic_fingerprint_json: JSON.stringify({ avgWordLength: 4.8, avgSentenceLength: 10.1, vocabRichness: 0.55, punctuationDensity: 0.12, primaryLanguage: 'English' })
    });

    insertActor.run({
      actor_id: 'ACTOR-003', primary_handle: 'BreachKing_v4', category: 'Stolen Data',
      pgp_fingerprint: null, pgp_key_id: null,
      origin_ip: null, origin_country: 'Romania', hosting_provider: 'M247 Ltd',
      attribution_confidence: 67, source: 'Behavioral Analysis',
      first_discovered: new Date(Date.now() - 90 * 86400000).toISOString(),
      last_scan_date: new Date().toISOString(), active: 1,
      aliases_json: JSON.stringify([]),
      wallets_json: JSON.stringify([{ address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', currency: 'BTC', totalReceived: 1.8, transactionCount: 9, riskScore: 61, flags: ['Data Market'] }]),
      contact_ids_json: JSON.stringify([{ platform: 'Telegram', handle: '@breachking_official' }]),
      marketplaces_json: JSON.stringify([{ name: 'BreachForums', url: 'http://breachforumsxxx.onion', role: 'Vendor', postCount: 156 }]),
      infrastructure_json: JSON.stringify([]),
      tags_json: JSON.stringify(['data-breach', 'credential-stuffing', 'eastern-europe']),
      linguistic_fingerprint_json: JSON.stringify({ primaryLanguage: 'English (non-native)' })
    });
  });

    seedActors();
    logger.info('[SQLite] Seeded 3 threat actors.');
  }

  // Seed initial alert
  const alertCount = db.prepare('SELECT COUNT(*) as c FROM alerts').get().c;
  if (alertCount === 0) {
    db.prepare(`INSERT OR IGNORE INTO alerts (alert_id, title, description, type, severity, status, source, metadata_json, tags_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      'ALERT-001', 'High-Confidence Actor De-cloaked', 'TLS SAN leak reveals origin server of DarkPhantom_v2 at 185.220.101.47 (Frantech Solutions, Luxembourg). Attribution confidence: 94%.', 'security_breach', 'critical', 'new', 'system',
      JSON.stringify({ actorId: 'ACTOR-001', originIp: '185.220.101.47', method: 'TLS SAN Leak' }),
      JSON.stringify(['ransomware', 'decloaked', 'critical'])
    );
    logger.info('[SQLite] Seeded initial alert.');
  }

  // Seed initial SOC Co-Managed telemetry (RFT 26/2026 ISO 27001 Controls & SLAs)
  const socLogCount = db.prepare('SELECT COUNT(*) as c FROM soc_telemetry_logs').get().c;
  if (socLogCount === 0) {
    const insertSoc = db.prepare(`
      INSERT OR IGNORE INTO soc_telemetry_logs (
        log_id, event_name, category, iso_control, severity, sla_target_mins, sla_achieved_mins, sla_status, telemetry_details_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const socSeeds = [
      ['SOC-001', 'SIEM Centralized Log Ingestion & Retention Check', 'log_management', 'A.8.15', 'info', 60, 2.1, 'met', JSON.stringify({ description: 'Centralized log aggregation from Tor collector, honeypots, and ISP netflows verified. Retention set to 365 days compliant with A.8.15.', source: 'SIEM Agent-01' })],
      ['SOC-002', '24x7 Continuous Security Monitoring & Anomaly Sweep', 'continuous_monitoring', 'A.8.16', 'low', 15, 3.4, 'met', JSON.stringify({ description: 'Real-time correlation across 10,000+ public Tor relay telemetry vectors with zero coverage gaps.', status: '100% active' })],
      ['SOC-003', 'Onionoo Threat Intelligence Feed Ingestion', 'threat_intel', 'A.5.7', 'medium', 30, 5.8, 'met', JSON.stringify({ description: 'Near-real-time public Tor network metadata, exit policy changes, and overload states synchronized.', feed: 'Tor Project Onionoo' })],
      ['SOC-004', 'Critical Tor Exit Node Compromise Alert', 'incident_sla', 'A.5.24', 'critical', 15, 6.2, 'met', JSON.stringify({ description: 'P1 Critical incident declared: Exit node 185.220.101.47 flagged for malicious MITM payload injection. Triage completed in 6.2 mins (SLA target: 15 mins).', responseAction: 'Containment playbook triggered' })],
      ['SOC-005', 'High-Risk Darknet Marketplace Infrastructure Drift', 'incident_sla', 'A.5.25', 'high', 30, 11.5, 'met', JSON.stringify({ description: 'P2 High incident: TLS SAN certificate drift detected on hidden service mirror. SLA target 30 mins met.', responseAction: 'Analyst-Alpha notified' })]
    ];

    const seedSoc = db.transaction(() => {
      for (const row of socSeeds) {
        insertSoc.run(...row);
      }
    });
    seedSoc();
    logger.info('[SQLite] Seeded 5 SOC Co-Managed telemetry compliance records.');
  }

  // Seed initial SOC MITRE ATT&CK Detection Rules
  const ruleCount = db.prepare('SELECT COUNT(*) as c FROM soc_detection_rules').get().c;
  if (ruleCount === 0) {
    const insertRule = db.prepare(`
      INSERT OR IGNORE INTO soc_detection_rules (
        rule_id, title, description, technique_id, tactic, severity, query_logic_json, response_action, enabled, trigger_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    const rules = [
      ['RULE-TOR-001', 'Dark-Web / Tor Relay Exit to Critical Clearnet Asset', 'Detects inbound or outbound traffic between known Tor exit nodes and sensitive enterprise internal assets.', 'T1090.003', 'Command and Control', 'critical', JSON.stringify({ match: 'dest_port IN (22, 3389, 443, 8080) AND threat_intel_match = 1' }), 'ALERT_AND_CONTAIN', 14],
      ['RULE-AUTH-002', 'Anomalous Credential Abuse from Known Malicious Exit IP', 'Identifies repeated authentication failures from flagged Tor exit nodes against Active Directory / SSO.', 'T1078', 'Defense Evasion', 'high', JSON.stringify({ match: 'action = "LOGIN_FAILED" AND source_type = "Active Directory"' }), 'ALERT', 8],
      ['RULE-EXFIL-003', 'Burst Data Outflow Matching Adaptive ATWC Latency Prior Window', 'Correlates unusual outbound volumetric transfers with adaptive Tor congestion timing window W.', 'T1048', 'Exfiltration', 'high', JSON.stringify({ match: 'protocol = "HTTPS" AND severity = "high"' }), 'ALERT_AND_CAPTURE', 5],
      ['RULE-SAN-004', 'TLS Certificate SAN Leakage / Bulletproof Hosting Triage', 'Flags hidden service endpoints sharing SSL certificates with clearnet IP addresses.', 'T1584', 'Resource Development', 'medium', JSON.stringify({ match: 'source_type = "Tor Sentinel Ingestion"' }), 'ALERT', 12],
      ['RULE-CHURN-005', 'Abrupt Tor Guard/Exit Flap Preceding Infrastructure Evasion', 'Monitors sudden relay drops or rapid churn status changes correlated with target actor activity.', 'T1562', 'Defense Evasion', 'medium', JSON.stringify({ match: 'action = "STATUS_CHANGED"' }), 'LOG', 21]
    ];

    const seedRules = db.transaction(() => {
      for (const r of rules) insertRule.run(...r);
    });
    seedRules();
    logger.info('[SQLite] Seeded 5 SOC MITRE ATT&CK detection rules.');
  }

  // Seed initial Threat Intelligence IOCs
  const iocCount = db.prepare('SELECT COUNT(*) as c FROM soc_threat_intel_iocs').get().c;
  if (iocCount === 0) {
    const insertIoc = db.prepare(`
      INSERT OR IGNORE INTO soc_threat_intel_iocs (
        ioc_id, type, value, threat_actor_id, source, confidence, severity, tags_json, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const iocs = [
      ['IOC-001', 'ip', '185.220.101.47', 'ACTOR-001', 'Tor Sentinel OSINT', 95, 'critical', JSON.stringify(['tor_exit', 'bulletproof_host', 'ransomware']), JSON.stringify({ country: 'LU', asn: 'AS60729' })],
      ['IOC-002', 'domain', 'darkphantom-market.onion', 'ACTOR-001', 'DarkWeb Crawler', 98, 'critical', JSON.stringify(['onion_v3', 'hidden_service', 'dnm']), JSON.stringify({ serviceType: 'marketplace' })],
      ['IOC-003', 'ip', '198.51.100.42', 'ACTOR-002', 'CERT-In Threat Feed', 85, 'high', JSON.stringify(['tor_exit', 'credential_stuffing']), JSON.stringify({ country: 'US', asn: 'AS15169' })],
      ['IOC-004', 'hash', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'ACTOR-001', 'AlienVault OTX', 90, 'high', JSON.stringify(['sha256', 'malware_dropper']), JSON.stringify({ malwareFamily: 'LockBit3' })],
      ['IOC-005', 'email', 'operator@phantom-sec.org', 'ACTOR-001', 'PGP Key ID', 88, 'high', JSON.stringify(['pgp_identity', 'lead_attribution']), JSON.stringify({ pgpFingerprint: '98B2 F51C 4E7A D301' })]
    ];

    const seedIocs = db.transaction(() => {
      for (const i of iocs) insertIoc.run(...i);
    });
    seedIocs();
    logger.info('[SQLite] Seeded 5 Threat Intelligence IOCs.');
  }

  // Seed initial Threat Hunts
  const huntCount = db.prepare('SELECT COUNT(*) as c FROM soc_threat_hunts').get().c;
  if (huntCount === 0) {
    const insertHunt = db.prepare(`
      INSERT OR IGNORE INTO soc_threat_hunts (
        hunt_id, title, hypothesis, technique_id, query_filter_json, status, lead_analyst, findings_count, findings_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const hunts = [
      ['HUNT-2026-001', 'Hunt for Asymmetric TLS SAN Certificate Leaks Across Clearnet Mirrors', 'Adversaries hosting hidden services routinely reuse clearnet TLS certificates, leaking true backend origin IPs.', 'T1584', JSON.stringify({ source_type: 'Tor Sentinel Ingestion', min_confidence: 80 }), 'CONCLUDED', 'Analyst-Alpha', 3, JSON.stringify(['De-cloaked Luxembourg IP: 185.220.101.47', 'Certificate SHA-256 match on port 8443', 'Origin host shares ASN 60729'])],
      ['HUNT-2026-002', 'Investigation of Adaptive Latency Jitter Spikes Preceding Guard Flaps', 'Actor traffic spikes during high Tor congestion (Ct > 0.25) match external exfiltration logs within the adaptive search window W.', 'T1048', JSON.stringify({ source_type: 'Firewall', protocol: 'HTTPS' }), 'ACTIVE', 'Analyst-Beta', 1, JSON.stringify(['Correlated packet burst within window [210ms, 680ms]'])]
    ];

    const seedHunts = db.transaction(() => {
      for (const h of hunts) insertHunt.run(...h);
    });
    seedHunts();
    logger.info('[SQLite] Seeded 2 SOC Threat Hunts.');
  }

  // Seed initial Time Sync Logs
  const syncCount = db.prepare('SELECT COUNT(*) as c FROM soc_time_sync_logs').get().c;
  if (syncCount === 0) {
    db.prepare(`
      INSERT OR IGNORE INTO soc_time_sync_logs (
        sync_id, ntp_server, offset_ms, drift_ppm, round_trip_delay_ms, sync_status, forensic_time_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('SYNC-INIT-001', 'pool.ntp.org', 1.25, 0.03, 9.4, 'SYNCHRONIZED', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  }

  // Seed initial Forensic & Intelligence Reports (Report Vault)
  const reportCount = db.prepare('SELECT COUNT(*) as c FROM reports').get().c;
  if (reportCount === 0) {
    logger.info('[SQLite] Seeding initial forensic intelligence reports into Vault...');
    const insertReport = db.prepare(`
      INSERT OR IGNORE INTO reports (
        report_id, case_id, actor_id, report_type, title, classification,
        handling_caveats_json, status, author_name, author_badge, approving_officer,
        digital_seal_sha256, summary, content_json, metrics_snapshot_json, tags_json,
        created_at, updated_at
      ) VALUES (
        @report_id, @case_id, @actor_id, @report_type, @title, @classification,
        @handling_caveats_json, @status, @author_name, @author_badge, @approving_officer,
        @digital_seal_sha256, @summary, @content_json, @metrics_snapshot_json, @tags_json,
        @created_at, @updated_at
      )
    `);

    const initialReports = [
      {
        report_id: 'NTRO-RPT-2026-001',
        case_id: 'CASE-26151-001',
        actor_id: 'ACTOR-001',
        report_type: 'SITREP',
        title: 'SITREP — Operation DarkPhantom RaaS Network',
        classification: 'TOP SECRET',
        handling_caveats_json: JSON.stringify(['NOFORN', 'ORCON', 'NOT FOR PUBLIC RELEASE']),
        status: 'COURT_SUBMITTED',
        author_name: 'Analyst-Alpha',
        author_badge: 'NTRO-CY-0842',
        approving_officer: 'Col. V. Sharma (Dir. Cyber Ops)',
        summary: 'Multi-market ransomware-as-a-service operator active across Hydra Reborn and AlphaBay v2 markets. Origin server de-cloaked via TLS SAN leak exposing two clearnet domains hosted by Frantech Solutions (AS53667) in Luxembourg. Attribution confidence: 94%.',
        digital_seal_sha256: crypto.createHash('sha256').update('NTRO-RPT-2026-001-DARKPHANTOM-SITREP').digest('hex'),
        content_json: JSON.stringify({
          executiveSummary: 'Multi-market ransomware-as-a-service operator active across Hydra Reborn and AlphaBay v2 markets. Origin server de-cloaked via TLS SAN leak exposing two clearnet domains hosted by Frantech Solutions (AS53667) in Luxembourg. Attribution confidence: 94%.',
          currentStatus: 'ACTIVE',
          threatLevel: 'CRITICAL',
          incidentPhase: 'CONTAINMENT',
          jurisdiction: 'India — IT Act 2000 (Sec 66, 66B, 66C)',
          keyDevelopments: [
            { timestamp: new Date(Date.now() - 48 * 86400000).toISOString(), development: 'TLS certificate SAN field exposes clearnet domains darkphantom-ops.net and dp-admin.clearnet.org. Both resolve to IP 185.220.101.47.', classification: 'SECRET', analyst: 'Analyst-Alpha' },
            { timestamp: new Date(Date.now() - 12 * 86400000).toISOString(), development: 'BlockCypher API confirms BTC wallet 1A1zP1eP5... received 12.5 BTC across 8 transactions. Downstream mixing service detected via UTXO chain analysis.', classification: 'SECRET', analyst: 'Analyst-Beta' },
            { timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), development: 'New actor alias "phantom_v3" identified on BreachForums via stylometric matching (89% confidence). PGP key fingerprint cross-referenced.', classification: 'SECRET', analyst: 'Analyst-Alpha' },
          ],
          mitreTactics: [
            { techniqueId: 'T1090.003', name: 'Multi-hop Proxy: Tor', tactic: 'Command and Control', status: 'CONFIRMED' },
            { techniqueId: 'T1584.004', name: 'Compromise Server: Bulletproof Hosting', tactic: 'Resource Development', status: 'ATTRIBUTED' },
            { techniqueId: 'T1048.003', name: 'Exfiltration Over Unencrypted/Encrypted Non-C2 Protocol', tactic: 'Exfiltration', status: 'MONITORED' }
          ],
          nextSteps: [
            'Complete UTXO chain tracing to identify exchange deposit addresses',
            'Coordinate with ISP (Frantech Solutions) for subscriber records via MLAT',
            'Submit dossier to cyber crime prosecution cell'
          ],
          legalAdmissibility: {
            statutoryBasis: 'Indian Evidence Act Section 65B(4) / IT Act 2000 Section 79A',
            hashAlgorithm: 'SHA-256',
            provenanceStatus: 'VERIFIED_TAMPER_EVIDENT',
            custodyOfficer: 'Analyst-Alpha [NTRO-CY-0842]'
          }
        }),
        metrics_snapshot_json: JSON.stringify({
          totalRelays: 7240, runningRelays: 6980, guardRelays: 2410, exitRelays: 1120,
          congestionFactor: 0.14, adaptiveMuMs: 374.5, adaptiveSigmaMs: 91.2,
          window: [146.5, 648.1]
        }),
        tags_json: JSON.stringify(['ransomware', 'tls-decloaked', 'btc-traced', 'bulletproof-host', 'court-submitted']),
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        report_id: 'NTRO-RPT-2026-002',
        case_id: 'CASE-26151-001',
        actor_id: 'ACTOR-001',
        report_type: 'ACTOR_PROFILE',
        title: 'ACTOR PROFILE — DarkPhantom_v2 Forensic Dossier',
        classification: 'TOP SECRET',
        handling_caveats_json: JSON.stringify(['NOFORN', 'ORCON']),
        status: 'FINALIZED',
        author_name: 'Analyst-Alpha',
        author_badge: 'NTRO-CY-0842',
        approving_officer: 'Col. V. Sharma (Dir. Cyber Ops)',
        summary: 'De-anonymization profile for threat actor DarkPhantom_v2. PGP key 0x1B3F4E5C linked to 3 darknet marketplaces and 2 clearnet domains. Clearnet IP: 185.220.101.47.',
        digital_seal_sha256: crypto.createHash('sha256').update('NTRO-RPT-2026-002-DARKPHANTOM-PROFILE').digest('hex'),
        content_json: JSON.stringify({
          primaryHandle: 'DarkPhantom_v2',
          confirmedAliases: ['phantom_ops', 'DarkP_Admin', 'phantom_v3'],
          category: 'Ransomware-as-a-Service',
          attributionConfidence: 94,
          firstSeen: new Date(Date.now() - 280 * 86400000).toISOString().split('T')[0],
          lastActive: new Date().toISOString().split('T')[0],
          pgpFingerprint: 'E8B2 1A34 99F0 C3D7 B2A1 9E4F 5C8D 7E6A 1B3F 4E5C',
          pgpKeyId: '0x1B3F4E5C',
          originCountry: 'Russia',
          originIp: '185.220.101.47',
          hostingProvider: 'Frantech Solutions (BuyVM)',
          asn: 'AS53667',
          marketplaces: [
            { name: 'Hydra Reborn', role: 'Operator/Admin', since: '2023-Q2' },
            { name: 'AlphaBay v2', role: 'Vendor', since: '2023-Q4' },
            { name: 'BreachForums', role: 'Member', since: '2024-Q1' }
          ],
          cryptoWallets: [
            { currency: 'BTC', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divfna', estimatedBalance: '12.5 BTC', riskScore: 87, flags: ['Mixer downstream', 'Dark market'] },
            { currency: 'XMR', address: '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs', estimatedBalance: 'Unknown', riskScore: 95, flags: ['Privacy coin', 'Exchange input'] }
          ],
          contactIds: [
            { platform: 'Telegram', handle: '@darkphantom_ops', verified: true },
            { platform: 'Jabber', handle: 'dphantom@xmpp.jp', verified: false },
            { platform: 'Session', handle: '05a1b2c3d4...', verified: false }
          ],
          technicalIndicators: {
            preferredOS: 'Debian 11 (inferred via nginx headers)',
            activityTimezone: 'UTC+3 (Eastern Europe/Russia)',
            postingPeakHours: '14:00-23:00 UTC+3',
            opSecScore: 34,
            opSecRating: 'LOW (Multiple leaks identified)'
          },
          analystAssessment: 'CONFIRMED identity: Multiple corroborating evidence streams (TLS, PGP, blockchain, stylometry) all converge on single operator. Probability of mis-attribution: <6%.'
        }),
        metrics_snapshot_json: JSON.stringify({ totalRelays: 7240, runningRelays: 6980 }),
        tags_json: JSON.stringify(['actor-dossier', 'pgp-linked', 'de-cloaked', 'high-priority']),
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        report_id: 'NTRO-RPT-2026-003',
        case_id: 'CASE-26151-001',
        actor_id: 'ACTOR-001',
        report_type: 'FINANCIAL_INTEL',
        title: 'FININT — Ransomware Extortion Cryptocurrency Tracing',
        classification: 'SECRET',
        handling_caveats_json: JSON.stringify(['NOFORN', 'ORCON']),
        status: 'FINALIZED',
        author_name: 'Analyst-Beta',
        author_badge: 'NTRO-FIN-0319',
        approving_officer: 'Col. V. Sharma (Dir. Cyber Ops)',
        summary: 'Financial forensics analysis of BTC and XMR addresses tied to Operation DarkPhantom. 12.5 BTC tracked through downstream mixer to international exchange deposit address.',
        digital_seal_sha256: crypto.createHash('sha256').update('NTRO-RPT-2026-003-FININT').digest('hex'),
        content_json: JSON.stringify({
          walletInventory: [
            { actor: 'DarkPhantom_v2', currency: 'BTC', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divfna', balance: '12.5 BTC', usdEquiv: '$750,000 (est.)', txCount: 47, firstTx: '2023-07-15', lastTx: new Date().toISOString().split('T')[0], riskScore: 87, flags: ['Mixer', 'Dark Market'] },
            { actor: 'DarkPhantom_v2', currency: 'XMR', address: '44AFFq5kSiGBoZ4NMDwYt...', balance: 'Unknown', usdEquiv: 'Unknown', txCount: '?', firstTx: '2023-09-01', lastTx: '2024-01-15', riskScore: 95, flags: ['Privacy Coin', 'Exchange Input'] },
            { actor: 'SilkReborn_Admin', currency: 'BTC', address: 'bc1qxy2kgdygjrsqtzq2n0yrf...', balance: '3.2 BTC', usdEquiv: '$192,000 (est.)', txCount: 18, firstTx: '2023-11-01', lastTx: new Date().toISOString().split('T')[0], riskScore: 72, flags: ['Dark Market'] }
          ],
          totalWalletsTracked: 5,
          estimatedTotalVolume: '>15 BTC tracked (additional XMR volume obscured)',
          mixingServicesDetected: true,
          mixingServices: ['ChipMixer successor', 'Wasabi CoinJoin pool'],
          exchangeDeposits: [
            { exchange: 'Binance (BVI Entity)', amount: '2.1 BTC', date: '2023-12-15', flagged: true, depositAddress: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy' }
          ],
          financialRisk: 'CRITICAL',
          recommendations: [
            'Issue international freeze request via MLAT for deposit address at Binance BVI',
            'Set real-time UTXO webhook alerts on 1A1zP1eP5... output addresses',
            'Flag identified addresses on domestic FIU-IND cryptocurrency exchange registries'
          ]
        }),
        metrics_snapshot_json: JSON.stringify({}),
        tags_json: JSON.stringify(['finint', 'crypto-tracing', 'mixer-detected', 'high-risk']),
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 86400000).toISOString()
      },
      {
        report_id: 'NTRO-RPT-2026-004',
        case_id: 'CASE-26151-001',
        actor_id: 'ACTOR-001',
        report_type: 'INFRASTRUCTURE',
        title: 'INFRASTRUCTURE — Dark Web Origin Server Subpoena Brief',
        classification: 'RESTRICTED',
        handling_caveats_json: JSON.stringify(['ORCON', 'LAW_ENFORCEMENT_SENSITIVE']),
        status: 'FINALIZED',
        author_name: 'Analyst-Alpha',
        author_badge: 'NTRO-CY-0842',
        approving_officer: 'Col. V. Sharma (Dir. Cyber Ops)',
        summary: 'De-cloaking brief detailing the forensic nexus between hidden service darkphantomxxx.onion and physical server 185.220.101.47 hosted at Frantech Solutions (Luxembourg).',
        digital_seal_sha256: crypto.createHash('sha256').update('NTRO-RPT-2026-004-INFRASTRUCTURE').digest('hex'),
        content_json: JSON.stringify({
          originServers: [
            { actor: 'DarkPhantom_v2', ip: '185.220.101.47', country: 'Luxembourg', isp: 'Frantech Solutions Ltd', asn: 'AS53667', bulletproofFlag: true, discoveryMethod: 'TLS Certificate SAN Leak', discoveryDate: new Date(Date.now() - 40 * 86400000).toISOString().split('T')[0], verificationMethod: 'crt.sh lookup + nslookup cross-reference', confidence: 94 },
            { actor: 'SilkReborn_Admin', ip: '104.21.48.190', country: 'United States', isp: 'Cloudflare Inc.', asn: 'AS13335', bulletproofFlag: false, discoveryMethod: 'MurmurHash3 Favicon Matching', discoveryDate: new Date(Date.now() - 22 * 86400000).toISOString().split('T')[0], verificationMethod: 'Shodan favicon hash search', confidence: 78 }
          ],
          tlsAnalysis: [
            { actor: 'DarkPhantom_v2', subject: 'CN=*.darkphantom-ops.net', issuer: "Let's Encrypt Authority X3", serialNumber: '7E6A1B3F4E5C8D7E', validTo: '2024-09-15', sanLeaks: ['darkphantom-ops.net', 'dp-admin.clearnet.org'], fingerprint: 'e8b21a3499f0c3d7...' }
          ],
          networkMap: ['AS53667 (Frantech, LU) → 185.220.101.47 → nginx/1.22.1 → PHP/8.1.18 → MySQL'],
          hostingAnalysis: { bulletproofCount: 1, regularHostingCount: 1, tor2Web: 0, cloudflare: 1 },
          riskAssessment: 'HIGH — 1 server behind bulletproof hosting. Takedown requires MLAT with Luxembourg authorities.'
        }),
        metrics_snapshot_json: JSON.stringify({}),
        tags_json: JSON.stringify(['subpoena', 'origin-server', 'tls-san', 'luxembourg']),
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 14 * 86400000).toISOString()
      },
      {
        report_id: 'NTRO-RPT-2026-005',
        case_id: 'CASE-26151-002',
        actor_id: 'ACTOR-002',
        report_type: 'COURT_EXHIBIT_65B',
        title: 'COURT EXHIBIT — Section 65B Digital Evidence Package (SilkReborn)',
        classification: 'TOP SECRET',
        handling_caveats_json: JSON.stringify(['LEGAL_PRIVILEGED', 'COURT_EXHIBIT']),
        status: 'COURT_SUBMITTED',
        author_name: 'Analyst-Gamma',
        author_badge: 'NTRO-LEG-0104',
        approving_officer: 'Justice Retd. R. Sengupta (Legal Counsel)',
        summary: 'Certified electronic evidence exhibit pursuant to Section 65B(4) of the Indian Evidence Act, 1872. Forensic timeline, stylometric authorship confirmation (87%), and PGP fingerprint correlation.',
        digital_seal_sha256: crypto.createHash('sha256').update('NTRO-RPT-2026-005-COURT-65B').digest('hex'),
        content_json: JSON.stringify({
          caseReference: 'NTRO/CY/2024/002',
          statutoryDeclaration: 'I, Analyst-Gamma, Scientific Officer (Digital Forensics), NTRO, do hereby solemnly declare that the electronic records detailed herein were produced by the automated TOR Sentinel 2.0 forensic surveillance platform during the period of its regular lawful operation, operating properly with zero timestamp drift (NTP offset <1.5ms).',
          certifyingAuthority: 'National Technical Research Organisation (NTRO)',
          governingLaws: ['Section 65B Indian Evidence Act 1872', 'Section 79A Information Technology Act 2000', 'ISO/IEC 27037:2012'],
          chainOfCustody: [
            { step: 1, action: 'Initial Crawl & Ingestion', timestamp: new Date(Date.now() - 45 * 86400000).toISOString(), operator: 'Autonomous Daemon #4', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
            { step: 2, action: 'Stylometric Corpus Extraction & Tokenization', timestamp: new Date(Date.now() - 20 * 86400000).toISOString(), operator: 'Analyst-Gamma', hash: 'a589f81a7b489c623b9d0e1234567890abcdef1234567890abcdef1234567890' },
            { step: 3, action: 'Forensic Cryptographic Seal Generated', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), operator: 'Lead Custodian', hash: crypto.createHash('sha256').update('NTRO-RPT-2026-005-COURT-65B').digest('hex') }
          ],
          forensicFindings: [
            { indicator: 'Stylometric Authorship Similarity', value: '87.4% Match', confidence: 'VERY_HIGH', details: 'Distinctive triple-dash punctuation pattern, matching vocabulary richness index of 0.55.' },
            { indicator: 'Cryptographic Subkey PGP Match', value: '0xABCDEF12', confidence: 'DEFINITIVE', details: 'Identical 4096-bit RSA master key fingerprint found across SilkReborn and Tor2Door.' },
            { indicator: 'Cryptocurrency Wallet Transaction Nexus', value: 'bc1qxy2kgdygjrsqtzq2n0yrf...', confidence: 'CONFIRMED', details: 'Direct transaction nexus of 3.2 BTC traced from vendor escrow to exchange cluster.' }
          ]
        }),
        metrics_snapshot_json: JSON.stringify({}),
        tags_json: JSON.stringify(['court-exhibit', 'section-65b', 'iso-27037', 'tamper-evident']),
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 86400000).toISOString()
      }
    ];

    const seedReportsTx = db.transaction(() => {
      for (const r of initialReports) {
        insertReport.run(r);
      }
    });
    seedReportsTx();
    logger.info('[SQLite] Successfully seeded 5 rich forensic intelligence reports into Vault.');
  }
}

// ─── Connect / Initialize ─────────────────────────────────────────────────────
function connectDB() {
  try {
    db = new Database(DB_PATH, { verbose: null });

    // Apply schema (all CREATE IF NOT EXISTS — safe to run every start)
    db.exec(SCHEMA);

    // Dynamic column migrations for Tor hardening
    const addCol = (tbl, col, type) => {
      try {
        db.prepare(`ALTER TABLE ${tbl} ADD COLUMN ${col} ${type}`).run();
      } catch (e) {
        // column already exists
      }
    };
    addCol('tor_network_snapshots', 'baseline_b0_bytes', 'REAL DEFAULT 0');
    addCol('tor_network_snapshots', 'baseline_metadata_json', "TEXT DEFAULT '{}'");
    addCol('tor_nodes', 'observed_bandwidth', 'INTEGER DEFAULT 0');
    addCol('tor_nodes', 'advertised_bandwidth', 'INTEGER DEFAULT 0');
    addCol('tor_nodes', 'bandwidth_rate', 'INTEGER DEFAULT 0');
    addCol('tor_nodes', 'bandwidth_burst', 'INTEGER DEFAULT 0');
    addCol('tor_nodes', 'overload_general_timestamp', 'INTEGER');
    addCol('tor_nodes', 'exit_policy_summary_json', "TEXT DEFAULT '{}'");
    addCol('tor_nodes', 'churn_status', "TEXT DEFAULT 'STILL_OBSERVED'");

    // Dynamic column migrations for Cases (7-Phase Incident Lifecycle)
    addCol('cases', 'incident_phase', "TEXT DEFAULT 'DETECTION'");
    addCol('cases', 'containment_status', "TEXT DEFAULT 'NONE'");
    addCol('cases', 'root_cause', "TEXT DEFAULT ''");
    addCol('cases', 'lessons_learned', "TEXT DEFAULT ''");
    addCol('cases', 'playbook_actions_json', "TEXT DEFAULT '[]'");

    // Dynamic migrations for new intelligence tables (safe — ignores if already exists)
    addCol('reports', 'evidence_ids_json', "TEXT DEFAULT '[]'");
    addCol('reports', 'report_hash_sha256', "TEXT DEFAULT ''");
    addCol('reports', 'model_versions_json', "TEXT DEFAULT '{}'");
    addCol('threat_actors', 'behavioral_profile_id', "TEXT DEFAULT ''");
    addCol('threat_actors', 'evidence_count', 'INTEGER DEFAULT 0');
    addCol('threat_actors', 'pgp_keys_json', "TEXT DEFAULT '[]'");
    addCol('threat_actors', 'infrastructure_ids_json', "TEXT DEFAULT '[]'");

    // Seed data if empty
    seedInitialData();

    logger.info(`[SQLite] Database connected: ${DB_PATH}`);
    console.log(`\n[SQLite] Database ready: ${DB_PATH}`);

    // Graceful close on exit
    process.on('SIGINT', () => { if (db) { db.close(); logger.info('[SQLite] Database closed.'); } });
    process.on('SIGTERM', () => { if (db) { db.close(); logger.info('[SQLite] Database closed.'); } });

    return db;
  } catch (err) {
    logger.error(`[SQLite] Failed to connect: ${err.message}`);
    console.error('[SQLite] ERROR:', err.message);
    // Non-fatal in dev — services use in-memory fallbacks
    return null;
  }
}

// ─── Accessor ─────────────────────────────────────────────────────────────────
function getDB() {
  if (!db) connectDB();
  return db;
}

// ─── Generic helpers ──────────────────────────────────────────────────────────

/** Parse JSON blob columns safely */
function parseJsonCols(row, ...cols) {
  if (!row) return row;
  const out = { ...row };
  for (const col of cols) {
    try { out[col] = JSON.parse(out[col] || '[]'); } catch { out[col] = []; }
  }
  return out;
}

/** Serialize object to JSON string safely */
function toJson(val) {
  if (typeof val === 'string') return val;
  return JSON.stringify(val || []);
}

module.exports = { connectDB, getDB, parseJsonCols, toJson };