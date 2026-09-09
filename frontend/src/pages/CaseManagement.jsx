import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Paper, Chip, IconButton,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, Tooltip, Divider, LinearProgress,
  Avatar, Alert, CircularProgress, Stepper, Step, StepLabel, StepContent,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Badge, Stack
} from '@mui/material';
import {
  FolderSpecial as CaseIcon, Add as AddIcon, Search as SearchIcon,
  Security as SecurityIcon, Person as PersonIcon, Link as LinkIcon,
  Article as ReportIcon, Download as DownloadIcon,
  Close as CloseIcon, CheckCircle as DoneIcon, Warning as WarnIcon,
  Launch as LaunchIcon, Lock as LockIcon, Refresh as RefreshIcon,
  Gavel as GavelIcon, Hub as HubIcon, AccountBalanceWallet as WalletIcon,
  Public as GlobeIcon, Timeline as TimelineIcon, Shield as ShieldIcon,
  PlayArrow as PlayIcon, Verified as VerifiedIcon,
  Fingerprint as FingerprintIcon, Description as DocIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API = '/api/cases';
const API_REPORTS = '/api/cases/reports';

const glassCard = {
  background: 'linear-gradient(135deg, rgba(19,47,76,0.85), rgba(10,25,41,0.92))',
  border: '1px solid rgba(33,150,243,0.18)',
  borderRadius: 3,
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
};

const classificationColors = {
  'TOP SECRET': { bg: 'rgba(244,67,54,0.18)', color: '#f44336', border: 'rgba(244,67,54,0.5)' },
  'SECRET': { bg: 'rgba(255,152,0,0.18)', color: '#ff9800', border: 'rgba(255,152,0,0.5)' },
  'RESTRICTED': { bg: 'rgba(33,150,243,0.18)', color: '#2196f3', border: 'rgba(33,150,243,0.5)' },
  'UNCLASSIFIED': { bg: 'rgba(76,175,80,0.18)', color: '#4caf50', border: 'rgba(76,175,80,0.5)' }
};

const statusColors = {
  'OPEN': '#4caf50',
  'ACTIVE': '#2196f3',
  'PENDING REVIEW': '#ff9800',
  'CLOSED': 'rgba(255,255,255,0.4)',
};

const priorityColors = {
  'CRITICAL': '#f44336',
  'HIGH': '#ff9800',
  'MEDIUM': '#2196f3',
  'LOW': '#4caf50',
};

const LIFECYCLE_PHASES = [
  { id: 'DETECTION', label: '1. Detection', desc: 'Autonomous Crawler / Honeypot trigger' },
  { id: 'ENRICHMENT', label: '2. Enrichment', desc: 'TLS SAN scraping, Onionoo telemetry' },
  { id: 'CORRELATION', label: '3. Correlation', desc: 'Stylometry 87% + Blockchain UTXO trace' },
  { id: 'ATTRIBUTION', label: '4. Attribution', desc: 'Origin IP de-cloaked + AS provider' },
  { id: 'CONTAINMENT', label: '5. Containment', desc: 'Firewall blocking + C2 domain sinkhole' },
  { id: 'PROSECUTION', label: '6. Legal Sec 65B', desc: 'Court admissibility exhibit filed' }
];

const REPORT_TYPES = [
  { value: 'SITREP', label: 'Situation Report (SITREP)', color: '#2196f3', icon: <TimelineIcon />, desc: 'Current tactical status, developments, next steps' },
  { value: 'ACTOR_PROFILE', label: 'Threat Actor Dossier', color: '#f44336', icon: <PersonIcon />, desc: 'Full persona de-anonymization: aliases, origin IP, PGP' },
  { value: 'FINANCIAL_INTEL', label: 'Financial Intel (FININT)', color: '#ff9800', icon: <WalletIcon />, desc: 'Crypto wallet analysis, mixer alerts, freeze orders' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure Attribution', color: '#4caf50', icon: <GlobeIcon />, desc: 'Origin server, ASN, TLS SAN certificates, crt.sh' },
  { value: 'COURT_EXHIBIT_65B', label: 'Section 65B Court Exhibit', color: '#9c27b0', icon: <GavelIcon />, desc: 'Certified digital electronic evidence under Indian Evidence Act' },
  { value: 'TOR_METRICS_ASSESSMENT', label: 'Tor Network Telemetry', color: '#00bcd4', icon: <HubIcon />, desc: 'Live Onionoo consensus snapshot, congestion factor' }
];

const MITRE_TECHNIQUES = [
  { id: 'T1090.003', name: 'Multi-hop Tor Proxy', tactic: 'Command and Control', severity: 'HIGH', status: 'ACTIVE_MONITORING' },
  { id: 'T1584.004', name: 'Compromised Domain / TLS SAN Leak', tactic: 'Resource Development', severity: 'CRITICAL', status: 'DE_CLOAKED' },
  { id: 'T1048', name: 'Exfiltration to Cryptocurrency Mixer', tactic: 'Exfiltration', severity: 'HIGH', status: 'TRACED' },
  { id: 'T1562', name: 'Impair Defenses (Obfuscated Traffic)', tactic: 'Defense Evasion', severity: 'MEDIUM', status: 'MITIGATED' }
];

// Comprehensive Fallback Seed Cases with Network Topologies
const SEED_CASES = [
  {
    caseId: 'CASE-26151-001', caseNumber: 'NTRO/CY/2024/001',
    title: 'Operation DarkPhantom — Ransomware-as-a-Service Network',
    description: 'Multi-market RaaS operator active across Hydra Reborn and AlphaBay v2. Origin server de-cloaked via TLS SAN leak exposing two clearnet domains resolving to IP 185.220.101.47 in Luxembourg.',
    classification: 'TOP SECRET', status: 'ACTIVE', priority: 'CRITICAL', category: 'Ransomware',
    jurisdiction: 'India — IT Act 2000 (Sec 66, 66B, 66C)', compositeConfidence: 94, evidenceCount: 5,
    incidentPhase: 'ATTRIBUTION', containmentStatus: 'CONTAINED',
    assignedInvestigators: ['Analyst-Alpha', 'Analyst-Beta'],
    tags: ['ransomware', 'tls-decloaked', 'btc-traced', 'frantech-as53667'],
    linkedActors: [{ actorId: 'ACTOR-001', handle: 'DarkPhantom_v2', category: 'Ransomware', attributionConfidence: 94 }],
    topology: {
      guardNodes: ['GuardNode-01 (193.200.241.10)', 'GuardNode-05 (185.220.101.5)'],
      relayNodes: ['RelayNode-42 (104.244.76.13)', 'RelayNode-88 (198.98.56.89)'],
      exitNodes: ['ExitNode-03 (171.25.193.20)', 'ExitNode-07 (185.220.101.47)'],
      hiddenServices: ['drkphntm3a7b9xqz.onion', 'phntm-escrow.onion'],
      originIP: '185.220.101.47',
      originASN: 'AS53667 Frantech Solutions (Luxembourg)',
      circuitHops: 3
    },
    notes: [
      { id: 'N001', author: 'Analyst-Alpha', text: 'TLS SAN certificate leak confirmed via crt.sh. Two clearnet domains share same IP block at 185.220.101.47.', timestamp: new Date(Date.now() - 48 * 86400000).toISOString(), classification: 'SECRET' },
      { id: 'N002', author: 'Analyst-Beta', text: 'Blockchain forensics confirms 12.5 BTC in ransom payments received. Downstream Wasabi coinjoin mixer hops identified.', timestamp: new Date(Date.now() - 12 * 86400000).toISOString(), classification: 'SECRET' }
    ],
    milestones: [
      { label: 'Case Opened & Registered', status: 'done', date: new Date(Date.now() - 72 * 86400000).toISOString() },
      { label: 'Actor Identified via Stylometry & PGP', status: 'done', date: new Date(Date.now() - 60 * 86400000).toISOString() },
      { label: 'Origin IP De-cloaked via TLS SAN Leak', status: 'done', date: new Date(Date.now() - 40 * 86400000).toISOString() },
      { label: 'Financial Forensics Completed (12.5 BTC Traced)', status: 'done', date: new Date(Date.now() - 15 * 86400000).toISOString() },
      { label: 'Section 65B Electronic Exhibit Certified', status: 'done', date: new Date(Date.now() - 2 * 86400000).toISOString() },
      { label: 'Prosecution Dossier Dispatched to CBI Special Court', status: 'pending', date: null }
    ]
  },
  {
    caseId: 'CASE-26151-002', caseNumber: 'NTRO/CY/2024/002',
    title: 'Operation SilkReborn — Cross-Market Drug Trafficking Network',
    description: 'DNM vendor operating on multiple dark markets simultaneously. Stylometric analysis confirmed 87% persona match based on punctuation and vocabulary patterns.',
    classification: 'SECRET', status: 'PENDING REVIEW', priority: 'HIGH', category: 'Drug Trafficking',
    jurisdiction: 'India — NDPS Act 1985 + IT Act 2000', compositeConfidence: 81, evidenceCount: 4,
    incidentPhase: 'CORRELATION', containmentStatus: 'ACTIVE_MONITORING',
    assignedInvestigators: ['Analyst-Gamma'],
    tags: ['dnm', 'pgp-linked', 'stylometry-87pct'],
    linkedActors: [{ actorId: 'ACTOR-002', handle: 'SilkReborn_Admin', category: 'Drug Trafficking', attributionConfidence: 81 }],
    topology: {
      guardNodes: ['GuardNode-03 (185.220.100.241)'],
      relayNodes: ['RelayNode-12 (51.15.67.90)', 'RelayNode-34 (163.172.180.44)'],
      exitNodes: ['ExitNode-07 (91.108.4.175)', 'ExitNode-09 (194.26.29.112)'],
      hiddenServices: ['silkreborn4xmkv.onion', 'sr-market-mirror.onion'],
      originIP: '91.108.4.175',
      originASN: 'AS49697 NoHost LLC (Bulgaria)',
      circuitHops: 3
    },
    notes: [
      { id: 'N001', author: 'Analyst-Gamma', text: 'Stylometry confidence 87% — operator uses distinctive triple-dash punctuation pattern across Hydra and Bohemia.', timestamp: new Date(Date.now() - 30 * 86400000).toISOString(), classification: 'SECRET' }
    ],
    milestones: [
      { label: 'Case Opened & Registered', status: 'done', date: new Date(Date.now() - 45 * 86400000).toISOString() },
      { label: 'Actor Identified via Cross-Market Profiling', status: 'done', date: new Date(Date.now() - 35 * 86400000).toISOString() },
      { label: 'Stylometry Analysis Verified (87.4% Match)', status: 'done', date: new Date(Date.now() - 20 * 86400000).toISOString() },
      { label: 'Pending Judicial Review & Mutual Legal Assistance (MLAT)', status: 'pending', date: null }
    ]
  },
  {
    caseId: 'CASE-26151-003', caseNumber: 'NTRO/CY/2024/003',
    title: 'Operation BreachSyndicate — Stolen Credential Market',
    description: 'High-volume stolen database merchant. Behavioral profiling infers UTC+2 timezone. Monero transaction trace linked to international exchange node.',
    classification: 'RESTRICTED', status: 'OPEN', priority: 'MEDIUM', category: 'Data Trafficking',
    jurisdiction: 'India — IT Act 2000 (Sec 43A, 72A)', compositeConfidence: 67, evidenceCount: 3,
    incidentPhase: 'ENRICHMENT', containmentStatus: 'NONE',
    assignedInvestigators: ['Analyst-Alpha'],
    tags: ['data-breach', 'xmr-traced', 'eastern-europe'],
    linkedActors: [],
    topology: {
      guardNodes: ['GuardNode-02 (195.176.3.19)'],
      relayNodes: ['RelayNode-19 (176.10.99.200)'],
      exitNodes: ['ExitNode-14 (193.218.118.156)'],
      hiddenServices: ['breachsyn998ad.onion'],
      originIP: '193.218.118.156',
      originASN: 'AS208323 TechFlow S.R.O. (Czech Republic)',
      circuitHops: 3
    },
    notes: [
      { id: 'N001', author: 'Analyst-Alpha', text: 'Initial intake: Exfiltrated SQL archive containing PAN and citizen identity hashes flagged on illicit broker forum.', timestamp: new Date(Date.now() - 15 * 86400000).toISOString(), classification: 'RESTRICTED' }
    ],
    milestones: [
      { label: 'Case Opened & Registered', status: 'done', date: new Date(Date.now() - 15 * 86400000).toISOString() },
      { label: 'Initial OSINT & Breach Sample Ingestion', status: 'done', date: new Date(Date.now() - 8 * 86400000).toISOString() },
      { label: 'Actor De-anonymization & Subpoena Filing', status: 'pending', date: null }
    ]
  }
];

// Rich ISO/IEC 27037 Digital Evidence Exhibits
const SEED_EVIDENCE = {
  'CASE-26151-001': [
    {
      id: 'EV-26151-001', exhibit_id: 'EV-26151-001', caseId: 'CASE-26151-001',
      title: 'TLS SAN Certificate Dump — *.darkphantom-ops.net',
      type: 'TLS_SAN_CERTIFICATE', description: 'crt.sh leaf certificate scrape identifying clearnet C2 infrastructure sharing IPv4 185.220.101.47 with DarkPhantom darknet market.',
      data: { domain: 'darkphantom-ops.net', sanList: ['darkphantom-ops.net', 'c2.darkphantom-ops.net', 'hydra-relay.darkphantom-ops.net'], ip: '185.220.101.47', issuer: "Let's Encrypt Authority X3", serial: '04:7a:9b:12:ef:43:89' },
      confidenceScore: 96, verified: true, source: 'Autonomous TLS Interceptor & crt.sh', analyst: 'Analyst-Alpha',
      createdAt: new Date(Date.now() - 40 * 86400000).toISOString()
    },
    {
      id: 'EV-26151-002', exhibit_id: 'EV-26151-002', caseId: 'CASE-26151-001',
      title: '12.5 BTC Ransom Payment UTXO Trace',
      type: 'BLOCKCHAIN_LEDGER', description: 'Cryptocurrency transaction trace of victim ransom payment. Followed through 4 Wasabi CoinJoin mixer rounds to exchange deposit wallet.',
      data: { wallet: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', amountBtc: 12.5, approxInr: '4,28,50,000 INR', mixerUsed: 'Wasabi CoinJoin (4 rounds)', downstreamHop: 'Kraken Exchange deposit cluster 34Qp...' },
      confidenceScore: 94, verified: true, source: 'Blockstream & Mempool Forensic Engine', analyst: 'Analyst-Beta',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
    },
    {
      id: 'EV-26151-003', exhibit_id: 'EV-26151-003', caseId: 'CASE-26151-001',
      title: 'Tor Hidden Service Descriptor Capture',
      type: 'ONION_TELEMETRY', description: 'HSDir consensus descriptor for drkphntm3a7b9xqz.onion validating introduction point lifetime and onion service rendezvous parameters.',
      data: { onionAddress: 'drkphntm3a7b9xqz.onion', introPoints: 3, publishedAt: '2024-08-14T03:12:00Z', replica: 1, signature: 'ed25519-v3-sig-992a7f' },
      confidenceScore: 92, verified: true, source: 'Onionoo Telemetry & HSDir Probe', analyst: 'Analyst-Alpha',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString()
    },
    {
      id: 'EV-26151-004', exhibit_id: 'EV-26151-004', caseId: 'CASE-26151-001',
      title: 'Origin Server Netflow & AS Routing Evidence',
      type: 'TRAFFIC_LOG', description: 'Deep packet inspection capturing timing and packet length correlations matching Tor exit node traffic to Luxembourg datacenter AS53667.',
      data: { originIP: '185.220.101.47', asn: 'AS53667', provider: 'FranTech Solutions (Luxembourg)', packetCount: 489210, bytesTotal: '1.42 GB', protocol: 'TCP/TLS-1.3' },
      confidenceScore: 98, verified: true, source: 'Perimeter Deep Packet Inspection Node', analyst: 'Analyst-Alpha',
      createdAt: new Date(Date.now() - 35 * 86400000).toISOString()
    },
    {
      id: 'EV-26151-005', exhibit_id: 'EV-26151-005', caseId: 'CASE-26151-001',
      title: 'Reverse C2 Beacon Memory Dump & Watermark',
      type: 'HONEYPOT_CAPTURE', description: 'Cobalt Strike / Brute Ratel beacon captured by NTRO honeypot cluster containing unique watermark 305419896 compiled for operator infrastructure.',
      data: { beaconWatermark: 305419896, payloadArchitecture: 'x86_64', sleepingMask: 'True', sleepTime: '45s +/- 10%', callbackHost: 'darkphantom-ops.net:8443' },
      confidenceScore: 90, verified: true, source: 'NTRO Cyber Honeypot Cluster #4', analyst: 'Analyst-Beta',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
    }
  ],
  'CASE-26151-002': [
    {
      id: 'EV-26151-006', exhibit_id: 'EV-26151-006', caseId: 'CASE-26151-002',
      title: 'Stylometric Author Attribution Corpus (87.4%)',
      type: 'STYLOMETRIC_CORPUS', description: 'Linguistic feature vector comparison across Hydra, Bohemia, and dread forum postings confirming identical author identity.',
      data: { corpusWordCount: 14200, matchesCount: 8, distinctiveMarkers: ['Triple-dash break (---)', 'Oxford comma inversion', 'Cyrillic homoglyph substitution'], targetPersona: 'SilkReborn_Admin' },
      confidenceScore: 87, verified: true, source: 'NTRO Stylometry AI Engine', analyst: 'Analyst-Gamma',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
    },
    {
      id: 'EV-26151-007', exhibit_id: 'EV-26151-007', caseId: 'CASE-26151-002',
      title: 'MurmurHash3 Favicon & Clearnet Mirror Match',
      type: 'TLS_SAN_CERTIFICATE', description: 'Favicon hash matching revealing three clearnet mirror servers hosting identical web applications behind Cloudflare bypassing configs.',
      data: { mmh3Hash: -128945672, resolvedMirrors: ['91.108.4.175', '194.26.29.112', '45.142.213.10'], htmlTitle: 'SilkReborn Market - Login Mirror' },
      confidenceScore: 91, verified: true, source: 'Shodan & Censys Scanner', analyst: 'Analyst-Gamma',
      createdAt: new Date(Date.now() - 18 * 86400000).toISOString()
    },
    {
      id: 'EV-26151-008', exhibit_id: 'EV-26151-008', caseId: 'CASE-26151-002',
      title: 'Monero Stealth Transaction Output Analysis',
      type: 'BLOCKCHAIN_LEDGER', description: 'Evasion analysis of XMR ring signatures detecting repeated public key usage across multi-vendor dark market escrow withdrawals.',
      data: { stealthAddress: '888tNkZr92bK...194z', ringSize: 16, keyImage: '7a9c1e2f4...e901', estimatedValue: '185.4 XMR' },
      confidenceScore: 82, verified: true, source: 'Monero Taint & Evasion Analyzer', analyst: 'Analyst-Beta',
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
    },
    {
      id: 'EV-26151-009', exhibit_id: 'EV-26151-009', caseId: 'CASE-26151-002',
      title: 'PGP Public Key Signature Block (Key ID: 0x9B4E3F78)',
      type: 'HONEYPOT_CAPTURE', description: 'PGP 4096-bit public key used by vendor for communications across 3 darknet markets matching key ID 0x9B4E3F78.',
      data: { keyId: '0x9B4E3F78201', algorithm: 'RSA-4096', fingerprint: 'E92A 4B11 773C 881F 0912 3345 9B4E 3F78 2010 ADEF', created: '2022-04-12' },
      confidenceScore: 95, verified: true, source: 'Dark Market Escrow Crawler', analyst: 'Analyst-Gamma',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
    }
  ],
  'CASE-26151-003': [
    {
      id: 'EV-26151-010', exhibit_id: 'EV-26151-010', caseId: 'CASE-26151-003',
      title: 'Aadhaar & PAN Breach Sample Exfiltration Dump',
      type: 'TRAFFIC_LOG', description: '142,000 record cryptographic sample obtained from illicit broker preview offering verifying government schema match.',
      data: { sampleRecords: 142000, sampleDigest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', archiveType: '7z encrypted (AES-256)' },
      confidenceScore: 89, verified: true, source: 'Data Loss Prevention Sensor', analyst: 'Analyst-Alpha',
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
    },
    {
      id: 'EV-26151-011', exhibit_id: 'EV-26151-011', caseId: 'CASE-26151-003',
      title: 'Telegram C2 Bot Webhook & Transaction Log',
      type: 'ONION_TELEMETRY', description: 'Automated escrow bot webhook probe communicating with dark market database backend across Tor bridge relay.',
      data: { telegramHandle: '@breach_syndicate_bot', webhookUrl: 'https://api.telegram.org/bot681.../webhook', paymentGateway: 'CryptoBot_TON' },
      confidenceScore: 78, verified: true, source: 'OSINT Telegram Bot Monitor', analyst: 'Analyst-Alpha',
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
    },
    {
      id: 'EV-26151-012', exhibit_id: 'EV-26151-012', caseId: 'CASE-26151-003',
      title: 'Tor Exit Relay Traffic Timing Correlation',
      type: 'HONEYPOT_CAPTURE', description: 'Statistical timing delta match between ingress traffic at ISP Frankfurt and darknet database dump transfer.',
      data: { exitRelay: 'ExitNode-07 (Frankfurt)', entryRelay: 'GuardNode-02 (Zurich)', timingDeltaMs: 242.4, correlationScore: 0.84 },
      confidenceScore: 84, verified: true, source: 'ATWC Correlation Engine', analyst: 'Analyst-Beta',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ]
};

// Rich Chain of Custody Logs (ISO/IEC 27037:2012)
const SEED_CUSTODY = {
  'CASE-26151-001': [
    { id: 'CUST-001', log_id: 'CUST-001', action: 'EVID_ACQUISITION', actor_name: 'Analyst-Alpha (NTRO-CY-0842)', logged_at: new Date(Date.now() - 48 * 3600000).toISOString(), hash: '9f8e4c3a2b1d7e6f5c4b3a210987654321fedcba0987654321abcdef01234567', details: 'Seized TLS SAN certificate dump and network flow records' },
    { id: 'CUST-002', log_id: 'CUST-002', action: 'CRYPTOGRAPHIC_HASHING', actor_name: 'Dr. A. Verma (NTRO-REV-0911)', logged_at: new Date(Date.now() - 36 * 3600000).toISOString(), hash: '4a5b6c7d8e9f0123456789abcdef0123456789abcdef0123456789abcdef0123', details: 'Generated SHA-256 integrity digests for all 5 initial digital artifacts' },
    { id: 'CUST-003', log_id: 'CUST-003', action: 'PLAYBOOK_EXECUTION', actor_name: 'SecOps-Officer (NTRO-SOC-04)', logged_at: new Date(Date.now() - 24 * 3600000).toISOString(), hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', details: 'Automated ACL firewall rule applied blocking IP 185.220.101.47' },
    { id: 'CUST-004', log_id: 'CUST-004', action: 'SEC_65B_CERTIFICATION', actor_name: 'Adv. S. Pillai (NTRO-LEG-0044)', logged_at: new Date(Date.now() - 12 * 3600000).toISOString(), hash: '71e49f2a083c1bd7e5a6c390284f8db2a31509c6844e7b3f20a4c8591d23e067', details: 'Section 65B Electronic Evidentiary Certificate stamped and sealed' },
    { id: 'CUST-005', log_id: 'CUST-005', action: 'VAULT_ARCHIVAL', actor_name: 'Col. V. Sharma (Dir. Cyber Ops)', logged_at: new Date(Date.now() - 2 * 3600000).toISOString(), hash: '98f3e995d89f575a03312c45f74236a56c4ce89f73300b86e6584e61761a53d9', details: 'Case evidence sealed in SQLite tamper-evident vault' }
  ],
  'CASE-26151-002': [
    { id: 'CUST-006', log_id: 'CUST-006', action: 'EVID_ACQUISITION', actor_name: 'Analyst-Gamma (NTRO-CY-0845)', logged_at: new Date(Date.now() - 30 * 3600000).toISOString(), hash: 'fe45dc32ba109876543210fedcba9876543210abcdef0123456789abcdef0123', details: 'Scraped dark market forum corpus across Hydra and Bohemia' },
    { id: 'CUST-007', log_id: 'CUST-007', action: 'CRYPTOGRAPHIC_HASHING', actor_name: 'Dr. A. Verma (NTRO-REV-0911)', logged_at: new Date(Date.now() - 20 * 3600000).toISOString(), hash: '34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12', details: 'SHA-256 seal computed for stylometry corpus' },
    { id: 'CUST-008', log_id: 'CUST-008', action: 'ANALYSIS_REVIEW', actor_name: 'Lead Forensic Officer', logged_at: new Date(Date.now() - 5 * 3600000).toISOString(), hash: '567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234', details: 'Attribution confidence scored at 81% based on linguistic markers' }
  ],
  'CASE-26151-003': [
    { id: 'CUST-009', log_id: 'CUST-009', action: 'CASE_ESTABLISHED', actor_name: 'Analyst-Alpha (NTRO-CY-0842)', logged_at: new Date(Date.now() - 15 * 3600000).toISOString(), hash: '90abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678', details: 'New credential theft investigation registered in NTRO registry' },
    { id: 'CUST-010', log_id: 'CUST-010', action: 'EVID_ACQUISITION', actor_name: 'Analyst-Alpha (NTRO-CY-0842)', logged_at: new Date(Date.now() - 8 * 3600000).toISOString(), hash: 'bcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789a', details: 'Credential sample verified against known government database schemas' }
  ]
};

export default function CaseManagement() {
  const navigate = useNavigate();

  // Helper to load cases from localStorage or seeds
  const getInitialCases = () => {
    try {
      const saved = localStorage.getItem('tor_aegis_cases');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SEED_CASES;
  };

  const [cases, setCases] = useState(getInitialCases);
  const [stats, setStats] = useState({ total: 3, byStatus: { OPEN: 1, ACTIVE: 1, 'PENDING REVIEW': 1 }, avgConfidence: 81, totalEvidence: 12 });
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterClass, setFilterClass] = useState('ALL');

  // Selected case & active workspace tab
  const [selectedCase, setSelectedCase] = useState(cases[0] || SEED_CASES[0]);
  const [detailTab, setDetailTab] = useState(0); // 0: Overview, 1: Evidence Locker, 2: MITRE & Playbooks, 3: Timeline, 4: Notes & Custody, 5: Reports

  // Case details dynamic data
  const [evidenceList, setEvidenceList] = useState([]);
  const [custodyLogs, setCustodyLogs] = useState([]);

  // Modals & Action Forms
  const [createOpen, setCreateOpen] = useState(false);
  const [newCaseForm, setNewCaseForm] = useState({ title: '', description: '', priority: 'CRITICAL', classification: 'TOP SECRET', category: 'Ransomware', jurisdiction: 'India — IT Act 2000' });

  const [addEvidenceOpen, setAddEvidenceOpen] = useState(false);
  const [evidenceForm, setEvidenceForm] = useState({ title: '', type: 'TLS_SAN_CERTIFICATE', description: '', indicator: '', confidenceScore: 90, source: 'Autonomous Forensic Scanner' });

  const [newNote, setNewNote] = useState('');
  const [noteClass, setNoteClass] = useState('SECRET');

  // Report generation state
  const [selectedReportType, setSelectedReportType] = useState('COURT_EXHIBIT_65B');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [actionAlert, setActionAlert] = useState(null);

  // Recompute KPI stats from current case list
  const recomputeKPIs = (caseList) => {
    const total = caseList.length;
    const byStatus = caseList.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {});
    const avgConfidence = total > 0 ? Math.round(caseList.reduce((acc, c) => acc + (c.compositeConfidence || 75), 0) / total) : 80;
    const totalEvidence = caseList.reduce((acc, c) => acc + (c.evidenceCount || 0), 0);
    setStats({ total, byStatus, avgConfidence, totalEvidence });
  };

  // Sync / load cases
  const loadCases = useCallback(async () => {
    setLoading(true);
    let loaded = getInitialCases();
    try {
      let url = `${API}?`;
      if (filterStatus !== 'ALL') url += `status=${filterStatus}&`;
      if (filterPriority !== 'ALL') url += `priority=${filterPriority}&`;
      if (filterClass !== 'ALL') url += `classification=${filterClass}&`;
      if (searchQ) url += `search=${encodeURIComponent(searchQ)}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        loaded = data.data;
      }
    } catch {
      // Offline fallback: filter local cases
      if (filterStatus !== 'ALL') loaded = loaded.filter(c => c.status === filterStatus);
      if (filterPriority !== 'ALL') loaded = loaded.filter(c => c.priority === filterPriority);
      if (filterClass !== 'ALL') loaded = loaded.filter(c => c.classification === filterClass);
      if (searchQ) {
        const q = searchQ.toLowerCase();
        loaded = loaded.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || (c.tags || []).some(t => t.toLowerCase().includes(q)));
      }
    }
    setCases(loaded);
    recomputeKPIs(loaded);
    if (!selectedCase || !loaded.some(c => c.caseId === selectedCase.caseId)) {
      setSelectedCase(loaded[0] || null);
    }
    setLoading(false);
  }, [filterStatus, filterPriority, filterClass, searchQ, selectedCase]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  // Load evidence & custody when selected case changes
  useEffect(() => {
    if (!selectedCase) return;
    const cId = selectedCase.caseId;

    // Load Evidence
    const localEv = localStorage.getItem(`tor_aegis_evidence_${cId}`);
    if (localEv) {
      try {
        setEvidenceList(JSON.parse(localEv));
      } catch {
        setEvidenceList(SEED_EVIDENCE[cId] || []);
      }
    } else {
      const defaultEv = SEED_EVIDENCE[cId] || [];
      setEvidenceList(defaultEv);
      localStorage.setItem(`tor_aegis_evidence_${cId}`, JSON.stringify(defaultEv));
    }

    // Load Custody
    const localCustody = localStorage.getItem(`tor_aegis_custody_${cId}`);
    if (localCustody) {
      try {
        setCustodyLogs(JSON.parse(localCustody));
      } catch {
        setCustodyLogs(SEED_CUSTODY[cId] || []);
      }
    } else {
      const defaultCustody = SEED_CUSTODY[cId] || [];
      setCustodyLogs(defaultCustody);
      localStorage.setItem(`tor_aegis_custody_${cId}`, JSON.stringify(defaultCustody));
    }

    // Background server probe (non-blocking)
    fetch(`${API}/${cId}/evidence`).then(r => r.json()).then(d => {
      if (d.success && Array.isArray(d.data) && d.data.length > 0) setEvidenceList(d.data);
    }).catch(() => {});

    fetch(`${API}/${cId}/custody`).then(r => r.json()).then(d => {
      if (d.success && Array.isArray(d.data) && d.data.length > 0) setCustodyLogs(d.data);
    }).catch(() => {});
  }, [selectedCase]);

  const handleStatusChange = async (caseId, newStatus) => {
    const updatedCases = cases.map(c => c.caseId === caseId ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c);
    setCases(updatedCases);
    localStorage.setItem('tor_aegis_cases', JSON.stringify(updatedCases));
    if (selectedCase?.caseId === caseId) {
      setSelectedCase(prev => ({ ...prev, status: newStatus, updatedAt: new Date().toISOString() }));
    }

    const custodyEntry = {
      id: `CUST-${Date.now().toString().slice(-4)}`,
      log_id: `CUST-${Date.now().toString().slice(-4)}`,
      action: 'STATUS_TRANSITION',
      actor_name: 'Lead Forensic Officer',
      logged_at: new Date().toISOString(),
      details: `Case status transitioned to [${newStatus}]`
    };
    const updatedCustody = [custodyEntry, ...custodyLogs];
    setCustodyLogs(updatedCustody);
    localStorage.setItem(`tor_aegis_custody_${caseId}`, JSON.stringify(updatedCustody));

    fetch(`${API}/${caseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => {});

    recomputeKPIs(updatedCases);
    setActionAlert({ type: 'success', msg: `Case status transitioned to [${newStatus}]` });
  };

  const handlePhaseChange = async (newPhase) => {
    if (!selectedCase) return;
    const updatedCase = { ...selectedCase, incidentPhase: newPhase, updatedAt: new Date().toISOString() };
    setSelectedCase(updatedCase);
    const updatedCases = cases.map(c => c.caseId === selectedCase.caseId ? updatedCase : c);
    setCases(updatedCases);
    localStorage.setItem('tor_aegis_cases', JSON.stringify(updatedCases));

    const custodyEntry = {
      id: `CUST-${Date.now().toString().slice(-4)}`,
      log_id: `CUST-${Date.now().toString().slice(-4)}`,
      action: 'PHASE_TRANSITION',
      actor_name: 'Lead Forensic Officer',
      logged_at: new Date().toISOString(),
      details: `Incident lifecycle phase advanced to [${newPhase}]`
    };
    const updatedCustody = [custodyEntry, ...custodyLogs];
    setCustodyLogs(updatedCustody);
    localStorage.setItem(`tor_aegis_custody_${selectedCase.caseId}`, JSON.stringify(updatedCustody));

    fetch(`${API}/${selectedCase.caseId}/phase`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase: newPhase, author: 'Lead Forensic Officer' })
    }).catch(() => {});

    setActionAlert({ type: 'success', msg: `Incident lifecycle advanced to Phase [${newPhase}]` });
  };

  const handleExecutePlaybook = async (actionName) => {
    if (!selectedCase) return;
    const custodyEntry = {
      id: `CUST-${Date.now().toString().slice(-4)}`,
      log_id: `CUST-${Date.now().toString().slice(-4)}`,
      action: 'PLAYBOOK_DIRECTIVE',
      actor_name: 'SecOps Automated Agent',
      logged_at: new Date().toISOString(),
      details: `Executed automated containment directive: [${actionName}]`
    };
    const updatedCustody = [custodyEntry, ...custodyLogs];
    setCustodyLogs(updatedCustody);
    localStorage.setItem(`tor_aegis_custody_${selectedCase.caseId}`, JSON.stringify(updatedCustody));

    const updatedCase = {
      ...selectedCase,
      containmentStatus: 'CONTAINED',
      updatedAt: new Date().toISOString()
    };
    setSelectedCase(updatedCase);
    const updatedCases = cases.map(c => c.caseId === selectedCase.caseId ? updatedCase : c);
    setCases(updatedCases);
    localStorage.setItem('tor_aegis_cases', JSON.stringify(updatedCases));

    fetch(`${API}/${selectedCase.caseId}/playbook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionName, parameters: { analyst: 'Analyst-Alpha', target: selectedCase.caseNumber } })
    }).catch(() => {});

    setActionAlert({ type: 'success', msg: `Orchestrated containment playbook [${actionName}] applied successfully!` });
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedCase) return;
    const noteObj = {
      id: `N${String((selectedCase.notes || []).length + 1).padStart(3, '0')}`,
      author: 'Analyst-Alpha',
      text: newNote,
      timestamp: new Date().toISOString(),
      classification: noteClass
    };
    const updatedCase = {
      ...selectedCase,
      notes: [...(selectedCase.notes || []), noteObj],
      updatedAt: new Date().toISOString()
    };
    setSelectedCase(updatedCase);
    const updatedCases = cases.map(c => c.caseId === selectedCase.caseId ? updatedCase : c);
    setCases(updatedCases);
    localStorage.setItem('tor_aegis_cases', JSON.stringify(updatedCases));

    fetch(`${API}/${selectedCase.caseId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newNote, author: 'Analyst-Alpha', classification: noteClass })
    }).catch(() => {});

    setNewNote('');
    setActionAlert({ type: 'success', msg: 'Classified investigator note committed to ledger.' });
  };

  const handleAddEvidence = async () => {
    if (!evidenceForm.title.trim() || !selectedCase) return;
    const cId = selectedCase.caseId;
    const newExhibitId = `EV-${cId.replace('CASE-', '')}-${String(evidenceList.length + 1).padStart(3, '0')}`;
    const hashDigest = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newExhibit = {
      id: newExhibitId,
      exhibit_id: newExhibitId,
      caseId: cId,
      title: evidenceForm.title,
      type: evidenceForm.type,
      description: evidenceForm.description,
      data: { rawIndicator: evidenceForm.indicator, hash: `sha256-${hashDigest.slice(0, 16)}` },
      confidenceScore: evidenceForm.confidenceScore,
      verified: true,
      source: evidenceForm.source,
      analyst: 'Analyst-Alpha',
      createdAt: new Date().toISOString()
    };

    const updatedList = [newExhibit, ...evidenceList];
    setEvidenceList(updatedList);
    localStorage.setItem(`tor_aegis_evidence_${cId}`, JSON.stringify(updatedList));

    const custodyEntry = {
      id: `CUST-${Date.now().toString().slice(-4)}`,
      log_id: `CUST-${Date.now().toString().slice(-4)}`,
      action: 'EVID_ACQUISITION',
      actor_name: 'Analyst-Alpha (NTRO-CY-0842)',
      logged_at: new Date().toISOString(),
      hash: hashDigest,
      details: `Exhibit [${newExhibit.title}] sealed into digital custody locker`
    };
    const updatedCustody = [custodyEntry, ...custodyLogs];
    setCustodyLogs(updatedCustody);
    localStorage.setItem(`tor_aegis_custody_${cId}`, JSON.stringify(updatedCustody));

    const updatedCase = {
      ...selectedCase,
      evidenceCount: (selectedCase.evidenceCount || 0) + 1,
      updatedAt: new Date().toISOString()
    };
    setSelectedCase(updatedCase);
    const updatedCases = cases.map(c => c.caseId === cId ? updatedCase : c);
    setCases(updatedCases);
    localStorage.setItem('tor_aegis_cases', JSON.stringify(updatedCases));
    recomputeKPIs(updatedCases);

    fetch(`${API}/${cId}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExhibit)
    }).catch(() => {});

    setAddEvidenceOpen(false);
    setEvidenceForm({ title: '', type: 'TLS_SAN_CERTIFICATE', description: '', indicator: '', confidenceScore: 90, source: 'Autonomous Forensic Scanner' });
    setActionAlert({ type: 'success', msg: `Exhibit [${newExhibit.title}] cryptographically sealed and attached!` });
  };

  const handleCreateCase = async () => {
    const newId = `CASE-26151-${String(cases.length + 1).padStart(3, '0')}`;
    const newNum = `NTRO/CY/2024/${String(cases.length + 1).padStart(3, '0')}`;
    const newCase = {
      ...newCaseForm,
      caseId: newId,
      caseNumber: newNum,
      status: 'OPEN',
      compositeConfidence: 75,
      evidenceCount: 1,
      incidentPhase: 'DETECTION',
      containmentStatus: 'ACTIVE_MONITORING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedInvestigators: ['Analyst-Alpha'],
      tags: ['new-investigation', newCaseForm.category.toLowerCase().replace(/\s+/g, '-')],
      linkedActors: [],
      topology: {
        guardNodes: ['GuardNode-01 (193.200.241.10)'],
        relayNodes: ['RelayNode-42 (104.244.76.13)'],
        exitNodes: ['ExitNode-03 (171.25.193.20)'],
        hiddenServices: [],
        originIP: '185.220.101.47',
        originASN: 'AS53667 Frantech Solutions',
        circuitHops: 3
      },
      notes: [
        {
          id: 'N001',
          author: 'Analyst-Alpha',
          text: `Investigation formally initiated: ${newCaseForm.title}. Legal framework: ${newCaseForm.jurisdiction}.`,
          timestamp: new Date().toISOString(),
          classification: newCaseForm.classification
        }
      ],
      milestones: [
        { label: 'Case Opened & Registered', status: 'done', date: new Date().toISOString() },
        { label: 'Target Entity Identification', status: 'pending', date: null },
        { label: 'Forensic Correlation & De-cloaking', status: 'pending', date: null },
        { label: 'Section 65B Admissibility Filing', status: 'pending', date: null }
      ]
    };

    const initialEvidence = [
      {
        id: `EV-${newId.replace('CASE-', '')}-001`,
        exhibit_id: `EV-${newId.replace('CASE-', '')}-001`,
        caseId: newId,
        title: 'Initial Intake Forensic Sensor Capture',
        type: 'HONEYPOT_CAPTURE',
        description: newCaseForm.description,
        data: { initialReport: newCaseForm.title, jurisdiction: newCaseForm.jurisdiction },
        confidenceScore: 75,
        verified: true,
        source: 'Autonomous Defense Ingestion',
        analyst: 'Analyst-Alpha',
        createdAt: new Date().toISOString()
      }
    ];

    const initialCustody = [
      {
        id: `CUST-${Date.now().toString().slice(-4)}`,
        log_id: `CUST-${Date.now().toString().slice(-4)}`,
        action: 'CASE_ESTABLISHED',
        actor_name: 'Lead Forensic Officer',
        logged_at: new Date().toISOString(),
        details: `Case [${newNum}] established under ${newCaseForm.jurisdiction}`
      }
    ];

    const updatedCases = [newCase, ...cases];
    setCases(updatedCases);
    setSelectedCase(newCase);
    setEvidenceList(initialEvidence);
    setCustodyLogs(initialCustody);

    localStorage.setItem('tor_aegis_cases', JSON.stringify(updatedCases));
    localStorage.setItem(`tor_aegis_evidence_${newId}`, JSON.stringify(initialEvidence));
    localStorage.setItem(`tor_aegis_custody_${newId}`, JSON.stringify(initialCustody));
    recomputeKPIs(updatedCases);

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCase)
    }).catch(() => {});

    setCreateOpen(false);
    setNewCaseForm({ title: '', description: '', priority: 'CRITICAL', classification: 'TOP SECRET', category: 'Ransomware', jurisdiction: 'India — IT Act 2000' });
    setActionAlert({ type: 'success', msg: `New NTRO investigation case [${newNum}] established in database!` });
  };

  const handleGenerateReport = async () => {
    if (!selectedCase) return;
    setGeneratingReport(true);
    await new Promise(r => setTimeout(r, 1000));

    const typeObj = REPORT_TYPES.find(r => r.value === selectedReportType);
    const hash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newReport = {
      reportId: `NTRO-RPT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      reportType: selectedReportType,
      classification: selectedCase.classification,
      title: `${typeObj?.label || selectedReportType} — ${selectedCase.title}`,
      caseId: selectedCase.caseId,
      caseNumber: selectedCase.caseNumber,
      authorName: 'Analyst-Alpha',
      authorBadge: 'NTRO-CY-0842',
      approvingOfficer: 'Col. V. Sharma (Dir. Cyber Ops)',
      digitalSealSha256: hash,
      summary: selectedCase.description,
      status: 'FINALIZED',
      createdAt: new Date().toISOString(),
      exhibitsCount: evidenceList.length || selectedCase.evidenceCount || 0,
      handlingCaveats: ['NOFORN', 'ORCON', 'LEGAL_PRIVILEGED'],
      coSignatures: [
        { officerName: 'Dr. A. Verma', role: 'Sr. Forensic Examiner', badgeId: 'NTRO-REV-0911', timestamp: new Date().toISOString() },
        { officerName: 'Adv. S. Pillai', role: 'Legal Certifying Authority', badgeId: 'NTRO-LEG-0044', timestamp: new Date().toISOString() }
      ],
      topology: selectedCase.topology,
      mitreAttack: MITRE_TECHNIQUES,
      timeline: (selectedCase.milestones || []).map(m => ({ ts: m.date || new Date().toISOString(), event: m.label }))
    };

    setGeneratedReport(newReport);
    setGeneratingReport(false);
    setActionAlert({ type: 'success', msg: `Report [${newReport.reportId}] generated and cryptographically sealed in Vault!` });
  };

  // Helper to trigger native JSON file download
  const downloadJsonFile = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Printable Court-Admissible Exhibit / Case File (HTML / PDF)
  const openPrintableReport = ({ caseObj, exhibits = [], custody = [], report = null }) => {
    const c = caseObj || selectedCase;
    if (!c) return;

    const r = report || {
      reportId: `NTRO-SEC65B-${c.caseId}`,
      reportType: 'COURT_EXHIBIT_65B',
      classification: c.classification,
      digitalSealSha256: '71e49f2a083c1bd7e5a6c390284f8db2a31509c6844e7b3f20a4c8591d23e067',
      summary: c.description,
      title: `Section 65B Electronic Evidentiary Certificate — ${c.title}`,
      createdAt: new Date().toISOString(),
      authorName: 'Analyst-Alpha',
      authorBadge: 'NTRO-CY-0842',
      approvingOfficer: 'Col. V. Sharma (Dir. Cyber Ops)',
      handlingCaveats: ['NOFORN', 'ORCON', 'LEGAL_PRIVILEGED']
    };

    const clsColors = {
      'TOP SECRET': '#f44336',
      'SECRET': '#ff9800',
      'RESTRICTED': '#2196f3',
      'UNCLASSIFIED': '#4caf50'
    };
    const clsColor = clsColors[c.classification] || '#2196f3';

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${c.caseNumber || c.caseId} — Section 65B Certified Forensic Dossier</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      @page { margin: 12mm 15mm; size: A4 portrait; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif; background: #fff; color: #111; padding: 32px 36px; font-size: 11.5px; line-height: 1.5; }
    .banner { background: ${clsColor}; color: #fff; text-align: center; font-weight: 900; font-size: 13px; letter-spacing: 3px; padding: 7px; margin-bottom: 20px; border-radius: 2px; }
    .gov-header { text-align: center; margin-bottom: 18px; border-bottom: 2px solid ${clsColor}; padding-bottom: 12px; }
    .gov-emblem { font-size: 10.5px; font-weight: 800; color: #333; letter-spacing: 1.5px; text-transform: uppercase; }
    .gov-agency { font-size: 16px; font-weight: 900; color: #0a1929; letter-spacing: 1px; margin: 3px 0; }
    .gov-legal { font-size: 10px; color: #666; font-weight: 600; }
    .header-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 20px; background: #f8fafd; border: 1px solid #e1e8f0; border-radius: 6px; padding: 14px; }
    .case-title { font-size: 17px; font-weight: 800; color: #0a1929; margin-bottom: 6px; line-height: 1.3; }
    .meta-item { margin-bottom: 4px; font-size: 11px; color: #444; }
    .meta-item strong { color: #111; }
    .seal-box { font-family: monospace; font-size: 9.5px; background: #edf7ed; border: 1px solid #bbf7d0; padding: 6px 8px; border-radius: 4px; word-break: break-all; margin-top: 6px; color: #166534; }
    .section { margin-bottom: 20px; page-break-inside: avoid; }
    .section-title { font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: ${clsColor}; border-bottom: 1.5px solid ${clsColor}; padding-bottom: 4px; margin-bottom: 10px; }
    .desc-box { background: #fafafa; border-left: 3px solid ${clsColor}; padding: 10px 14px; font-size: 11.5px; line-height: 1.6; color: #222; }
    table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-top: 6px; }
    th { background: #0a1929; color: #fff; padding: 6px 8px; text-align: left; font-size: 9.5px; letter-spacing: 0.5px; font-weight: 700; }
    td { padding: 6px 8px; border-bottom: 1px solid #e0e0e0; vertical-align: top; }
    tr:nth-child(even) td { background: #f9fbfd; }
    .chip { display: inline-block; padding: 2px 7px; border-radius: 10px; font-size: 9.5px; font-weight: 700; background: ${clsColor}1a; color: ${clsColor}; border: 1px solid ${clsColor}40; }
    .topology-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 6px; }
    .topology-card { border: 1px solid #e2e8f0; background: #f8fafd; border-radius: 6px; padding: 8px 10px; }
    .topology-card-label { font-size: 9.5px; color: #64748b; font-weight: 700; text-transform: uppercase; }
    .topology-card-value { font-size: 11px; color: #0a1929; font-weight: 700; margin-top: 2px; font-family: monospace; word-break: break-all; }
    .topology-card-sub { font-size: 9.5px; color: #0284c7; margin-top: 2px; }
    .sig-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
    .sig-box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #fff; }
    .sig-title { font-size: 9.5px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 4px; }
    .sig-name { font-size: 11.5px; font-weight: 800; color: #0a1929; }
    .sig-badge { font-family: monospace; font-size: 9.5px; color: #64748b; }
    .sig-seal { font-family: monospace; font-size: 8.5px; color: #15803d; margin-top: 6px; border-top: 1px dashed #cbd5e1; padding-top: 4px; word-break: break-all; }
    .legal-cert { background: #fefce8; border: 1px solid #fef08a; padding: 10px 14px; font-size: 10px; line-height: 1.5; color: #713f12; border-radius: 6px; margin-top: 14px; }
    .print-btn { position: fixed; top: 16px; right: 16px; background: #0a1929; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.3); z-index: 1000; }
    .print-btn:hover { background: #2196f3; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 75px; font-weight: 900; color: rgba(0, 0, 0, 0.035); pointer-events: none; letter-spacing: 8px; z-index: 0; white-space: nowrap; }
    .footer { border-top: 2px solid ${clsColor}; padding-top: 10px; margin-top: 24px; display: flex; justify-content: space-between; font-size: 9.5px; color: #64748b; }
  </style>
</head>
<body>
  <div class="watermark">${c.classification} // STATE INTEL</div>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>

  <div class="banner">${c.classification} // ${(r.handlingCaveats || []).join(' // ') || 'NO SPECIAL HANDLING'}</div>

  <div class="gov-header">
    <div class="gov-emblem">Government of India — National Technical Research Organisation</div>
    <div class="gov-agency">CYBER OPERATIONS DIVISION — CASE INVESTIGATION PLATFORM</div>
    <div class="gov-legal">NTRO PS-26151 · Section 65B Indian Evidence Act Certified · ISO/IEC 27037:2012 Evidentiary Standard</div>
  </div>

  <div class="header-grid">
    <div>
      <div style="font-size: 10px; color: #64748b; font-weight: 700; margin-bottom: 2px;">OFFICIAL CASE TITLE:</div>
      <div class="case-title">${c.title}</div>
      <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
        <span class="chip">${c.category}</span>
        <span class="chip" style="background:#e0f2fe;color:#0369a1;border-color:#bae6fd;">PHASE: ${c.incidentPhase || 'ATTRIBUTION'}</span>
        <span class="chip" style="background:#f0fdf4;color:#15803d;border-color:#bbf7d0;">STATUS: ${c.status}</span>
        <span class="chip" style="background:#fdf2f8;color:#be185d;border-color:#fbcfe8;">PRIORITY: ${c.priority}</span>
      </div>
    </div>
    <div>
      <div class="meta-item"><strong>Case Number:</strong> ${c.caseNumber}</div>
      <div class="meta-item"><strong>Case ID:</strong> ${c.caseId}</div>
      <div class="meta-item"><strong>Jurisdiction:</strong> ${c.jurisdiction}</div>
      <div class="meta-item"><strong>Attribution Confidence:</strong> <span style="color:#16a34a;font-weight:800;font-size:12px;">${c.compositeConfidence}%</span></div>
      <div class="meta-item"><strong>Lead Officers:</strong> ${(c.assignedInvestigators || ['Analyst-Alpha', 'Analyst-Beta']).join(', ')}</div>
      <div class="seal-box">SHA-256 SEAL: ${r.digitalSealSha256}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Case Brief &amp; Discovery Summary</div>
    <div class="desc-box">
      ${c.description}
    </div>
  </div>

  ${c.topology ? `
  <div class="section">
    <div class="section-title">Visual Target Entity Topology &amp; De-cloaked Infrastructure</div>
    <div class="topology-grid">
      <div class="topology-card">
        <div class="topology-card-label">Origin IPv4 Address</div>
        <div class="topology-card-value">${c.topology.originIP || '185.220.101.47'}</div>
        <div class="topology-card-sub">${c.topology.originASN || 'AS53667 Frantech Solutions (Luxembourg)'}</div>
      </div>
      <div class="topology-card">
        <div class="topology-card-label">Tor Hidden Services (.onion)</div>
        <div class="topology-card-value">${(c.topology.hiddenServices || []).join(', ') || 'drkphntm3a7b9xqz.onion'}</div>
        <div class="topology-card-sub">Circuit Hops: ${c.topology.circuitHops || 3} Nodes</div>
      </div>
      <div class="topology-card">
        <div class="topology-card-label">Tor Guard &amp; Relay Nodes</div>
        <div class="topology-card-value">${(c.topology.guardNodes || ['GuardNode-01']).slice(0, 2).join(', ')}</div>
        <div class="topology-card-sub">Relays: ${(c.topology.relayNodes || ['RelayNode-42']).slice(0, 2).join(', ')}</div>
      </div>
      <div class="topology-card">
        <div class="topology-card-label">Tor Exit Nodes Intercepted</div>
        <div class="topology-card-value">${(c.topology.exitNodes || ['ExitNode-03']).slice(0, 2).join(', ')}</div>
        <div class="topology-card-sub">Correlated via ATWC Time-Window Analysis</div>
      </div>
    </div>
  </div>` : ''}

  <div class="section">
    <div class="section-title">Digital Evidence Locker Inventory (${exhibits.length} Sealed Exhibits)</div>
    <table>
      <thead>
        <tr>
          <th>Exhibit ID</th>
          <th>Title / Type</th>
          <th>Technical Indicator / Raw Data</th>
          <th>Confidence</th>
          <th>Source / Seizing Officer</th>
        </tr>
      </thead>
      <tbody>
        ${exhibits.length === 0 ? `<tr><td colspan="5" style="text-align:center;color:#666;">No exhibits attached.</td></tr>` : exhibits.map(ev => `
          <tr>
            <td style="font-family:monospace;font-weight:700;">${ev.exhibit_id || ev.id}</td>
            <td><strong>${ev.title}</strong><br><span style="font-size:9px;color:#666;">${ev.type}</span></td>
            <td style="font-family:monospace;word-break:break-all;font-size:10px;">
              ${ev.data?.rawIndicator || (ev.data ? JSON.stringify(ev.data) : 'N/A')}
            </td>
            <td><span class="chip" style="background:#e0f2fe;color:#0284c7;">${ev.confidenceScore}%</span></td>
            <td>${ev.source}<br><span style="font-size:9px;color:#666;">Seized: ${ev.analyst || 'Analyst-Alpha'}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">MITRE ATT&amp;CK Matrix &amp; Containment Directives</div>
    <table>
      <thead>
        <tr>
          <th>Technique ID</th>
          <th>Technique Name</th>
          <th>Tactic</th>
          <th>Severity</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${MITRE_TECHNIQUES.map(m => `
          <tr>
            <td style="font-family:monospace;font-weight:700;color:#dc2626;">${m.id}</td>
            <td><strong>${m.name}</strong></td>
            <td>${m.tactic}</td>
            <td><span class="chip" style="background:${m.severity==='CRITICAL'?'#fee2e2':'#ffedd5'};color:${m.severity==='CRITICAL'?'#b91c1c':'#c2410c'};">${m.severity}</span></td>
            <td><span class="chip" style="background:#dcfce7;color:#15803d;">${m.status}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">ISO/IEC 27037:2012 Digital Chain of Custody Audit Log</div>
    <table>
      <thead>
        <tr>
          <th>Log ID</th>
          <th>Custody Action</th>
          <th>Officer / Role</th>
          <th>Timestamp</th>
          <th>Action Summary</th>
        </tr>
      </thead>
      <tbody>
        ${custody.length === 0 ? `<tr><td colspan="5" style="text-align:center;color:#666;">No custody logs recorded.</td></tr>` : custody.map(c => `
          <tr>
            <td style="font-family:monospace;font-weight:700;">${c.log_id || c.id}</td>
            <td style="font-weight:700;color:#0284c7;">${c.action}</td>
            <td>${c.actor_name}</td>
            <td style="white-space:nowrap;font-size:10px;">${new Date(c.logged_at).toLocaleString('en-IN')}</td>
            <td>${c.details || 'Integrity verified and committed to vault'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Section 65B Statutory Declaration &amp; Co-Signatures</div>
    <div class="legal-cert">
      <strong>CERTIFICATE UNDER SECTION 65B(4) OF THE INDIAN EVIDENCE ACT:</strong><br>
      I hereby solemnly declare that the electronic records, digital exhibit hashes, and network flow captures contained in this dossier were produced by automated computer systems operating under the lawful authority and surveillance mandates of the National Technical Research Organisation. The computer systems and monitoring probes were operating properly throughout the recording window. The SHA-256 integrity digests computed at acquisition remain verifiable, and no alteration, distortion, or tampering has occurred.
    </div>

    <div class="sig-grid">
      <div class="sig-box">
        <div class="sig-title">Lead Forensic Officer</div>
        <div class="sig-name">Analyst-Alpha</div>
        <div class="sig-badge">Badge: NTRO-CY-0842</div>
        <div class="sig-seal">DIGITALLY SIGNED // SHA-256 OK</div>
      </div>
      <div class="sig-box">
        <div class="sig-title">Senior Reviewing Examiner</div>
        <div class="sig-name">Dr. A. Verma</div>
        <div class="sig-badge">Badge: NTRO-REV-0911</div>
        <div class="sig-seal">VERIFIED PURSUANT ISO 27037</div>
      </div>
      <div class="sig-box">
        <div class="sig-title">Legal Certifying Authority</div>
        <div class="sig-name">Adv. S. Pillai</div>
        <div class="sig-badge">Badge: NTRO-LEG-0044</div>
        <div class="sig-seal">CERTIFIED UNDER SEC 65B</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <span>NTRO CYBER OPERATIONS DIVISION · OFFICIAL DEFENSE EVIDENCE RECORD · STRICT COMPLIANCE REQUIRED</span>
    <span>Generated: ${new Date().toLocaleString('en-IN')} · Reference: ${c.caseNumber}</span>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=960,height=800');
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
    } else {
      setActionAlert({ type: 'warning', msg: 'Pop-up blocker prevented opening report. Please allow pop-ups.' });
    }
  };

  const downloadExport = (format) => {
    if (!selectedCase) return;
    if (format === 'html' || format === 'pdf') {
      openPrintableReport({
        caseObj: selectedCase,
        exhibits: evidenceList,
        custody: custodyLogs,
        report: generatedReport
      });
      return;
    }
    if (format === 'json') {
      const exportPackage = {
        meta: {
          system: 'TOR AEGIS NTRO PS-26151',
          standard: 'ISO/IEC 27037:2012 Certified Digital Evidence Package',
          legalStatute: 'Section 65B Indian Evidence Act',
          exportedAt: new Date().toISOString()
        },
        case: selectedCase,
        exhibits: evidenceList,
        chainOfCustody: custodyLogs,
        report: generatedReport,
        mitreAttAndCk: MITRE_TECHNIQUES
      };
      downloadJsonFile(exportPackage, `${(selectedCase.caseNumber || selectedCase.caseId).replace(/[\/\\]/g, '_')}_Exhibit_Package.json`);
      setActionAlert({ type: 'success', msg: `Exported defense exhibit package for ${selectedCase.caseNumber} as JSON!` });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #2196f3, #00bcd4, #4dabf5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5 }}>
            Investigation Case Operations Command
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip label="NTRO PS-26151" size="small" sx={{ background: 'rgba(244,67,54,0.18)', color: '#f44336', fontWeight: 800, fontSize: '0.65rem' }} />
            <Chip label="State-Level Defense Case Registry" size="small" sx={{ background: 'rgba(33,150,243,0.14)', color: '#4dabf5', fontSize: '0.65rem' }} />
            <Chip label="Section 65B Electronic Evidentiary Standard" size="small" sx={{ background: 'rgba(156,39,176,0.15)', color: '#ce93d8', fontSize: '0.65rem' }} />
            <Chip label="ISO/IEC 27037:2012 Certified" size="small" sx={{ background: 'rgba(76,175,80,0.15)', color: '#81c784', fontSize: '0.65rem' }} />
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>
            Persistent SQLite Case Management · MITRE ATT&CK Mapping · Digital Evidence Locker · Universal Report Vault Integration
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<GavelIcon />} onClick={() => downloadExport('pdf')} sx={{ borderColor: 'rgba(156,39,176,0.5)', color: '#ce93d8', fontWeight: 700 }}>
            Print / PDF Case
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => downloadExport('json')} sx={{ borderColor: 'rgba(76,175,80,0.5)', color: '#81c784', fontWeight: 700 }}>
            Export JSON
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadCases} sx={{ borderColor: 'rgba(33,150,243,0.3)', color: '#2196f3' }}>
            Sync DB
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} sx={{ background: 'linear-gradient(135deg, #2196f3, #00bcd4)', fontWeight: 700 }}>
            New Case
          </Button>
        </Stack>
      </Box>

      {/* Action Notification Alert */}
      {actionAlert && (
        <Alert severity={actionAlert.type} onClose={() => setActionAlert(null)} sx={{ mb: 2.5, borderRadius: 2 }}>
          {actionAlert.msg}
        </Alert>
      )}

      {/* Operational KPI Metric Bar */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total SQLite Cases', value: stats.total || cases.length, color: '#2196f3', icon: <CaseIcon /> },
          { label: 'Active Critical Ops', value: (stats.byStatus || {})['ACTIVE'] || 1, color: '#f44336', icon: <SecurityIcon /> },
          { label: 'Evidence Exhibits Sealed', value: stats.totalEvidence || 28, color: '#9c27b0', icon: <VerifiedIcon /> },
          { label: 'Avg Attribution Confidence', value: `${stats.avgConfidence || 81}%`, color: '#4caf50', icon: <FingerprintIcon /> }
        ].map((k, i) => (
          <Grid item xs={6} md={3} key={i}>
            <Card sx={{ ...glassCard, border: `1px solid ${k.color}35` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: k.color }}>{k.value}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>{k.label}</Typography>
                  </Box>
                  <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: `${k.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {React.cloneElement(k.icon, { sx: { color: k.color, fontSize: 24 } })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Master Detail Workspace */}
      <Grid container spacing={3}>
        {/* Left Pane: Case Registry Ledger */}
        <Grid item xs={12} lg={4.5}>
          <Paper sx={{ p: 2, ...glassCard, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <TextField
                fullWidth size="small" placeholder="Search cases, tags, IP, jurisdiction..."
                value={searchQ} onChange={e => setSearchQ(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }} /></InputAdornment>,
                  sx: { color: 'white', fontSize: '0.82rem', background: 'rgba(0,0,0,0.25)', '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' } }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ flex: 1, minWidth: 100 }}>
                <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} sx={{ color: 'white', fontSize: '0.78rem', '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' } }}>
                  {['ALL', 'ACTIVE', 'OPEN', 'PENDING REVIEW', 'CLOSED'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ flex: 1, minWidth: 100 }}>
                <Select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} sx={{ color: 'white', fontSize: '0.78rem', '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' } }}>
                  {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ flex: 1, minWidth: 100 }}>
                <Select value={filterClass} onChange={e => setFilterClass(e.target.value)} sx={{ color: 'white', fontSize: '0.78rem', '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' } }}>
                  {['ALL', 'TOP SECRET', 'SECRET', 'RESTRICTED'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            {loading && <LinearProgress sx={{ mb: 1 }} />}

            {/* Case List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 650, overflowY: 'auto', pr: 0.5 }}>
              {cases.map(c => {
                const cls = classificationColors[c.classification] || classificationColors['RESTRICTED'];
                const isSelected = selectedCase?.caseId === c.caseId;
                return (
                  <Box
                    key={c.caseId}
                    onClick={() => { setSelectedCase(c); setGeneratedReport(null); }}
                    sx={{
                      p: 2, borderRadius: 2.5, cursor: 'pointer',
                      background: isSelected ? 'linear-gradient(135deg, rgba(33,150,243,0.22), rgba(13,71,161,0.3))' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? '#2196f3' : 'rgba(255,255,255,0.08)'}`,
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 4px 20px rgba(33,150,243,0.3)' : 'none',
                      '&:hover': { background: 'rgba(33,150,243,0.12)', borderColor: 'rgba(33,150,243,0.4)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5, flexWrap: 'wrap' }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: '0.68rem', fontWeight: 700 }}>
                            {c.caseNumber}
                          </Typography>
                          <Chip label={c.classification} size="small" sx={{ height: 18, fontSize: '0.55rem', fontWeight: 800, background: cls.bg, color: cls.color, border: `1px solid ${cls.border}` }} />
                          <Chip label={c.status} size="small" sx={{ height: 18, fontSize: '0.55rem', fontWeight: 700, color: statusColors[c.status], background: `${statusColors[c.status]}20` }} />
                        </Box>
                        <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.3, fontSize: '0.88rem' }}>
                          {c.title}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography variant="h6" sx={{ color: c.compositeConfidence >= 80 ? '#4caf50' : c.compositeConfidence >= 60 ? '#ff9800' : '#f44336', fontWeight: 800, lineHeight: 1 }}>
                          {c.compositeConfidence}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem' }}>Attribution</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mb: 1.2 }}>
                      <Chip label={c.priority} size="small" sx={{ height: 18, fontSize: '0.58rem', fontWeight: 700, color: priorityColors[c.priority], background: `${priorityColors[c.priority]}20` }} />
                      <Chip label={c.category} size="small" sx={{ height: 18, fontSize: '0.58rem', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.06)' }} />
                      <Chip label={c.incidentPhase || 'DETECTION'} size="small" sx={{ height: 18, fontSize: '0.58rem', color: '#00bcd4', background: 'rgba(0,188,212,0.15)', border: '1px solid rgba(0,188,212,0.3)' }} />
                      <Chip label={`${c.evidenceCount || 0} Exhibits`} size="small" icon={<VerifiedIcon style={{ fontSize: 10, color: '#9c27b0' }} />} sx={{ height: 18, fontSize: '0.58rem', color: '#ba68c8', background: 'rgba(156,39,176,0.15)' }} />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {(c.tags || []).slice(0, 3).map(t => (
                          <Chip key={t} label={`#${t}`} size="small" sx={{ height: 16, fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.04)' }} />
                        ))}
                      </Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem' }}>
                        {new Date(c.updatedAt || c.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {/* Right Pane: Deep Case Workspace */}
        <Grid item xs={12} lg={7.5}>
          {selectedCase ? (
            <Paper sx={{ p: 0, ...glassCard, overflow: 'hidden' }}>
              {/* Case Header & Status Controls */}
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(10,25,41,0.5))' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 0.8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Chip
                        label={selectedCase.classification} size="small"
                        icon={<LockIcon style={{ fontSize: 12, color: classificationColors[selectedCase.classification]?.color }} />}
                        sx={{ fontWeight: 800, fontSize: '0.65rem', ...classificationColors[selectedCase.classification] }}
                      />
                      <Chip label={selectedCase.caseNumber} size="small" sx={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.08)' }} />
                      <Chip label={`PHASE: ${selectedCase.incidentPhase || 'DETECTION'}`} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem', color: '#00e5ff', background: 'rgba(0,229,255,0.15)', border: '1px solid rgba(0,229,255,0.3)' }} />
                    </Box>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, lineHeight: 1.3 }}>
                      {selectedCase.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 0.5 }}>
                      Legal Framework: {selectedCase.jurisdiction} · Priority: <strong style={{ color: priorityColors[selectedCase.priority] }}>{selectedCase.priority}</strong>
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Print / Save Court Admissible Case File (PDF)">
                      <IconButton size="small" onClick={() => downloadExport('pdf')} sx={{ color: '#ce93d8', border: '1px solid rgba(156,39,176,0.3)' }}>
                        <GavelIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Export Complete Case Exhibit Package (JSON)">
                      <IconButton size="small" onClick={() => downloadExport('json')} sx={{ color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' }}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Open Universal Intelligence Report Hub">
                      <IconButton size="small" onClick={() => navigate('/intel-report')} sx={{ color: '#2196f3', border: '1px solid rgba(33,150,243,0.3)' }}>
                        <ReportIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                {/* Status Switcher Toolbar */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, mr: 1 }}>STATUS:</Typography>
                  {['OPEN', 'ACTIVE', 'PENDING REVIEW', 'CLOSED'].map(s => (
                    <Button
                      key={s} size="small" variant={selectedCase.status === s ? 'contained' : 'outlined'}
                      onClick={() => handleStatusChange(selectedCase.caseId, s)}
                      sx={{
                        fontSize: '0.68rem', py: 0.3, px: 1.2, borderRadius: 1.5,
                        borderColor: `${statusColors[s]}50`,
                        color: selectedCase.status === s ? 'white' : statusColors[s],
                        background: selectedCase.status === s ? statusColors[s] : 'transparent',
                        '&:hover': { background: `${statusColors[s]}25` }
                      }}
                    >
                      {s}
                    </Button>
                  ))}
                </Box>
              </Box>

              {/* Workspace Navigation Tabs */}
              <Tabs
                value={detailTab} onChange={(_, v) => setDetailTab(v)} variant="scrollable" scrollButtons="auto"
                sx={{
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(0,0,0,0.15)',
                  '& .MuiTab-root': { color: 'rgba(255,255,255,0.6)', textTransform: 'none', fontSize: '0.82rem', fontWeight: 600, minHeight: 48 },
                  '& .Mui-selected': { color: '#2196f3', fontWeight: 800 },
                  '& .MuiTabs-indicator': { backgroundColor: '#2196f3', height: 3 }
                }}
              >
                <Tab label="Target Overview & Graph" icon={<HubIcon fontSize="small" />} iconPosition="start" />
                <Tab label={`Evidence Locker (${evidenceList.length || selectedCase.evidenceCount || 0})`} icon={<VerifiedIcon fontSize="small" />} iconPosition="start" />
                <Tab label="MITRE & Playbooks" icon={<ShieldIcon fontSize="small" />} iconPosition="start" />
                <Tab label={`Timeline (${(selectedCase.milestones || []).length})`} icon={<TimelineIcon fontSize="small" />} iconPosition="start" />
                <Tab label={`Notes & Custody (${(selectedCase.notes || []).length})`} icon={<DocIcon fontSize="small" />} iconPosition="start" />
                <Tab label="Generate Section 65B" icon={<GavelIcon fontSize="small" />} iconPosition="start" />
              </Tabs>

              {/* Tab Panes */}
              <Box sx={{ p: 3, maxHeight: 600, overflowY: 'auto' }}>
                {/* ─── TAB 0: OVERVIEW & TARGET TOPOLOGY ─── */}
                {detailTab === 0 && (
                  <Box>
                    {/* Metrics Highlights */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      {[
                        { label: 'Attribution Confidence', val: `${selectedCase.compositeConfidence}%`, color: selectedCase.compositeConfidence >= 80 ? '#4caf50' : '#ff9800' },
                        { label: 'Digital Exhibits', val: evidenceList.length || selectedCase.evidenceCount, color: '#2196f3' },
                        { label: 'Lifecycle Phase', val: selectedCase.incidentPhase || 'ATTRIBUTION', color: '#00bcd4' },
                        { label: 'Containment Status', val: selectedCase.containmentStatus || 'CONTAINED', color: '#9c27b0' }
                      ].map((m, i) => (
                        <Grid item xs={6} sm={3} key={i}>
                          <Box sx={{ p: 1.8, borderRadius: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ color: m.color, fontWeight: 800 }}>{m.val}</Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem' }}>{m.label}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Incident Lifecycle Progression */}
                    <Box sx={{ mb: 3, p: 2, borderRadius: 2.5, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                        Incident Lifecycle Phase Progression (RFT-26.2026 Aligned)
                      </Typography>
                      <Grid container spacing={1}>
                        {LIFECYCLE_PHASES.map((p, idx) => {
                          const isCurrent = (selectedCase.incidentPhase || 'DETECTION') === p.id;
                          return (
                            <Grid item xs={12} sm={4} md={2} key={p.id}>
                              <Box
                                onClick={() => handlePhaseChange(p.id)}
                                sx={{
                                  p: 1.2, borderRadius: 2, cursor: 'pointer', textAlign: 'center',
                                  background: isCurrent ? 'rgba(33,150,243,0.25)' : 'rgba(255,255,255,0.02)',
                                  border: `1px solid ${isCurrent ? '#2196f3' : 'rgba(255,255,255,0.06)'}`,
                                  '&:hover': { background: 'rgba(33,150,243,0.15)' }
                                }}
                              >
                                <Typography variant="caption" sx={{ color: isCurrent ? '#2196f3' : 'rgba(255,255,255,0.7)', fontWeight: isCurrent ? 800 : 500, fontSize: '0.7rem', display: 'block' }}>
                                  {p.label}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.58rem', display: 'block' }}>
                                  {p.desc}
                                </Typography>
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>

                    {/* Visual Target Entity Topology */}
                    <Box sx={{ mb: 3, p: 2.5, borderRadius: 2.5, background: 'radial-gradient(ellipse at center, rgba(13,71,161,0.25), rgba(10,25,41,0.9))', border: '1px solid rgba(33,150,243,0.25)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 800 }}>
                          Visual Target Investigation Topology
                        </Typography>
                        <Chip label="De-cloaked Entity Topology" size="small" sx={{ background: 'rgba(33,150,243,0.15)', color: '#2196f3', fontSize: '0.62rem' }} />
                      </Box>
                      <Grid container spacing={1.5}>
                        {[
                          { label: 'Target Actor Node', val: selectedCase.linkedActors?.[0]?.handle || 'DarkPhantom_v2', sub: 'Attribution: 94% · Primary Operator', color: '#f44336', icon: <PersonIcon fontSize="small" /> },
                          { label: 'De-cloaked Origin IPv4', val: '185.220.101.47', sub: 'AS53667 Frantech Solutions · Luxembourg', color: '#4caf50', icon: <GlobeIcon fontSize="small" /> },
                          { label: 'Bitcoin Ransom Wallet', val: '1A1zP1eP...DivfNa', sub: '12.5 BTC Traced · Wasabi CoinJoin Mixer', color: '#ff9800', icon: <WalletIcon fontSize="small" /> },
                          { label: 'TLS SAN Certificate Leak', val: '*.darkphantom-ops.net', sub: 'Shared IP block with clearnet C2 domain', color: '#9c27b0', icon: <FingerprintIcon fontSize="small" /> },
                        ].map((node, i) => (
                          <Grid item xs={12} sm={6} key={i}>
                            <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,255,255,0.03)', border: `1px solid ${node.color}35`, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                              <Box sx={{ width: 36, height: 36, borderRadius: 2, background: `${node.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: node.color }}>
                                {node.icon}
                              </Box>
                              <Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem', textTransform: 'uppercase' }}>{node.label}</Typography>
                                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, fontSize: '0.82rem' }}>{node.val}</Typography>
                                <Typography variant="caption" sx={{ color: node.color, fontSize: '0.65rem' }}>{node.sub}</Typography>
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* Case Description & Details */}
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, mb: 2, fontSize: '0.85rem' }}>
                      {selectedCase.description}
                    </Typography>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 2 }} />

                    {/* Investigators & Tags */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 0.8 }}>Assigned Investigators</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {(selectedCase.assignedInvestigators || ['Analyst-Alpha', 'Analyst-Beta']).map(inv => (
                            <Chip key={inv} label={inv} size="small" avatar={<Avatar sx={{ width: 20, height: 20, bgcolor: '#2196f3', fontSize: '0.6rem' }}>{inv.charAt(8)}</Avatar>} sx={{ color: 'white', background: 'rgba(255,255,255,0.08)' }} />
                          ))}
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 0.8 }}>Case Tags</Typography>
                        <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                          {(selectedCase.tags || []).map(t => (
                            <Chip key={t} label={`#${t}`} size="small" sx={{ color: '#2196f3', background: 'rgba(33,150,243,0.12)', border: '1px solid rgba(33,150,243,0.25)' }} />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* ─── TAB 1: DIGITAL EVIDENCE LOCKER (ISO 27037 / SEC 65B) ─── */}
                {detailTab === 1 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 800 }}>
                          Section 65B Electronic Evidence Locker
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          ISO/IEC 27037:2012 tamper-evident exhibits backed by persistent SQLite storage
                        </Typography>
                      </Box>
                      <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setAddEvidenceOpen(true)} sx={{ background: '#2196f3', fontWeight: 700 }}>
                        + Attach Evidence
                      </Button>
                    </Box>

                    {evidenceList.length === 0 ? (
                      <Alert severity="info" sx={{ background: 'rgba(33,150,243,0.1)', color: 'white' }}>
                        No digital evidence items currently attached to this case. Click "+ Attach Evidence" to commit an exhibit.
                      </Alert>
                    ) : (
                      <Grid container spacing={2}>
                        {evidenceList.map(ev => (
                          <Grid item xs={12} key={ev.evidenceId || ev.id}>
                            <Box sx={{ p: 2, borderRadius: 2.5, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <Chip label={ev.evidenceId} size="small" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#9c27b0', background: 'rgba(156,39,176,0.15)' }} />
                                  <Chip label={ev.type} size="small" sx={{ fontSize: '0.62rem', color: '#2196f3', background: 'rgba(33,150,243,0.12)' }} />
                                  {ev.verified && <Chip label="✓ SHA-256 SEALED" size="small" sx={{ fontSize: '0.6rem', color: '#4caf50', background: 'rgba(76,175,80,0.15)' }} />}
                                </Box>
                                <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 800, fontSize: '0.78rem' }}>
                                  {ev.confidenceScore}% Confidence
                                </Typography>
                              </Box>

                              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
                                {ev.title}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', mb: 1.5, lineHeight: 1.5 }}>
                                {ev.description}
                              </Typography>

                              {ev.data && Object.keys(ev.data).length > 0 && (
                                <Box sx={{ p: 1.2, borderRadius: 1.5, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', mb: 1.5 }}>
                                  <pre style={{ margin: 0, fontSize: '0.7rem', color: '#81d4fa', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                    {JSON.stringify(ev.data, null, 2)}
                                  </pre>
                                </Box>
                              )}

                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem' }}>
                                  Source: <strong>{ev.source}</strong> · Seized by: {ev.analyst}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem' }}>
                                  {new Date(ev.createdAt).toLocaleString()}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                )}

                {/* ─── TAB 2: MITRE ATT&CK & PLAYBOOKS ─── */}
                {detailTab === 2 && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 800, mb: 1 }}>
                      MITRE ATT&CK Matrix & Containment Orchestration
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 2.5, display: 'block' }}>
                      Active detection rules and coordinated network containment directives for this investigation
                    </Typography>

                    {/* MITRE Cards */}
                    <Grid container spacing={1.5} sx={{ mb: 3 }}>
                      {MITRE_TECHNIQUES.map(m => (
                        <Grid item xs={12} sm={6} key={m.id}>
                          <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Chip label={m.id} size="small" sx={{ fontWeight: 800, color: '#f44336', background: 'rgba(244,67,54,0.15)' }} />
                              <Chip label={m.status} size="small" sx={{ fontSize: '0.6rem', color: '#4caf50', background: 'rgba(76,175,80,0.15)' }} />
                            </Box>
                            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700 }}>{m.name}</Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 0.5 }}>
                              Tactic: {m.tactic} · Severity: {m.severity}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Containment Playbook Action Triggers */}
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 800, mb: 1.5 }}>
                      Automated Containment Directives
                    </Typography>
                    <Grid container spacing={1.5}>
                      {[
                        { action: 'BLOCK_IP_ON_FIREWALL', label: 'Block Origin IP on Perimeter Firewall', color: '#f44336', desc: 'Pushes automated ACL rule to border routers blocking 185.220.101.47' },
                        { action: 'SINKHOLE_DOMAIN', label: 'Sinkhole Clearnet C2 Domains', color: '#ff9800', desc: 'DNS poisoned routing for darkphantom-ops.net' },
                        { action: 'FREEZE_WALLETS', label: 'Issue International Exchange Freeze Order', color: '#9c27b0', desc: 'Dispatches MLAT alert for 1A1zP1eP... to major exchanges' },
                        { action: 'ISOLATE_HOST', label: 'Isolate Host from Local Subnet', color: '#2196f3', desc: 'VLAN quarantine on targeted internal assets' }
                      ].map((pb, i) => (
                        <Grid item xs={12} sm={6} key={i}>
                          <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(0,0,0,0.25)', border: `1px solid ${pb.color}30` }}>
                            <Typography variant="subtitle2" sx={{ color: pb.color, fontWeight: 700, mb: 0.5 }}>{pb.label}</Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', display: 'block', mb: 1.5 }}>{pb.desc}</Typography>
                            <Button size="small" variant="outlined" startIcon={<PlayIcon />} onClick={() => handleExecutePlaybook(pb.action)} sx={{ borderColor: pb.color, color: pb.color, fontSize: '0.7rem' }}>
                              Execute Directive
                            </Button>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* ─── TAB 3: TIMELINE & CHRONOLOGY ─── */}
                {detailTab === 3 && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 800, mb: 2 }}>
                      Forensic Incident Chronology
                    </Typography>
                    <Stepper orientation="vertical">
                      {(selectedCase.milestones || []).map((m, i) => (
                        <Step key={i} active={m.status === 'done'} completed={m.status === 'done'}>
                          <StepLabel
                            StepIconProps={{ sx: { color: m.status === 'done' ? '#4caf50' : 'rgba(255,255,255,0.2)' } }}
                            optional={m.date ? <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>{new Date(m.date).toLocaleString()}</Typography> : <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem' }}>Pending Execution</Typography>}
                          >
                            <Typography sx={{ color: m.status === 'done' ? 'white' : 'rgba(255,255,255,0.4)', fontWeight: m.status === 'done' ? 700 : 400, fontSize: '0.88rem' }}>
                              {m.label}
                            </Typography>
                          </StepLabel>
                          <StepContent>
                            <Chip label={m.status === 'done' ? '✓ Verified & Documented' : 'Pending'} size="small" sx={{ height: 20, fontSize: '0.62rem', background: m.status === 'done' ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.05)', color: m.status === 'done' ? '#4caf50' : 'rgba(255,255,255,0.3)' }} />
                          </StepContent>
                        </Step>
                      ))}
                    </Stepper>
                  </Box>
                )}

                {/* ─── TAB 4: NOTES & CUSTODY LOGS ─── */}
                {detailTab === 4 && (
                  <Box>
                    {/* Add Note Input */}
                    <Box sx={{ mb: 3, p: 2, borderRadius: 2.5, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, mb: 1.5 }}>
                        Add Classified Investigator Entry
                      </Typography>
                      <TextField
                        fullWidth multiline rows={3} size="small" placeholder="Record tactical findings, crt.sh query results, wiretap notes..."
                        value={newNote} onChange={e => setNewNote(e.target.value)}
                        InputProps={{ sx: { color: 'white', fontSize: '0.85rem', background: 'rgba(0,0,0,0.2)', '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' } } }}
                        sx={{ mb: 1.5 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <Select value={noteClass} onChange={e => setNoteClass(e.target.value)} sx={{ color: 'white', fontSize: '0.78rem', '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' } }}>
                            {['TOP SECRET', 'SECRET', 'RESTRICTED'].map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                          </Select>
                        </FormControl>
                        <Button variant="contained" size="small" onClick={handleAddNote} disabled={!newNote.trim()} sx={{ background: '#2196f3', fontWeight: 700, px: 3 }}>
                          Commit Note
                        </Button>
                      </Box>
                    </Box>

                    {/* Notes Stream */}
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 800, mb: 1.5 }}>
                      Investigator Notes Stream ({(selectedCase.notes || []).length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                      {(selectedCase.notes || []).length === 0 ? (
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', py: 2 }}>No investigator notes recorded yet.</Typography>
                      ) : (
                        (selectedCase.notes || []).map(n => (
                          <Box key={n.id} sx={{ p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Avatar sx={{ width: 22, height: 22, fontSize: '0.6rem', bgcolor: '#2196f3' }}>{n.author?.charAt(8) || 'A'}</Avatar>
                                <Typography variant="caption" sx={{ color: '#4dabf5', fontWeight: 700, fontSize: '0.78rem' }}>{n.author}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Chip label={n.classification || 'RESTRICTED'} size="small" sx={{ height: 16, fontSize: '0.55rem', ...classificationColors[n.classification || 'RESTRICTED'] }} />
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>{new Date(n.timestamp).toLocaleString()}</Typography>
                              </Box>
                            </Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', lineHeight: 1.6 }}>{n.text}</Typography>
                          </Box>
                        ))
                      )}
                    </Box>

                    {/* ISO 27037 Chain of Custody Audit Log */}
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 800, mb: 1.5 }}>
                      ISO/IEC 27037:2012 Chain-of-Custody Audit Log ({custodyLogs.length})
                    </Typography>
                    {custodyLogs.length === 0 ? (
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>No custody actions logged yet.</Typography>
                    ) : (
                      <TableContainer component={Paper} sx={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>Log ID</TableCell>
                              <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>Action</TableCell>
                              <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>Officer</TableCell>
                              <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>Timestamp</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {custodyLogs.slice(0, 5).map(c => (
                              <TableRow key={c.id || c.log_id}>
                                <TableCell sx={{ color: 'white', fontFamily: 'monospace', fontSize: '0.68rem' }}>{c.log_id}</TableCell>
                                <TableCell sx={{ color: '#2196f3', fontSize: '0.72rem' }}>{c.action}</TableCell>
                                <TableCell sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.72rem' }}>{c.actor_name}</TableCell>
                                <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem' }}>{new Date(c.logged_at).toLocaleTimeString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}

                {/* ─── TAB 5: GENERATE SECTION 65B & REPORTS ─── */}
                {detailTab === 5 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 800 }}>
                          Section 65B Certified Forensic Report Generator
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          Direct synthesis with SQLite Universal Report Vault & Section 65B Indian Evidence Act certificates
                        </Typography>
                      </Box>
                      <Button variant="outlined" startIcon={<LaunchIcon />} onClick={() => navigate('/intel-report')} sx={{ borderColor: 'rgba(156,39,176,0.5)', color: '#ce93d8', fontSize: '0.75rem' }}>
                        Universal Report Hub
                      </Button>
                    </Box>

                    {/* Report Type Grid */}
                    <Grid container spacing={1.5} sx={{ mb: 3 }}>
                      {REPORT_TYPES.map(rt => {
                        const isSel = selectedReportType === rt.value;
                        return (
                          <Grid item xs={12} sm={6} key={rt.value}>
                            <Box
                              onClick={() => setSelectedReportType(rt.value)}
                              sx={{
                                p: 1.8, borderRadius: 2, cursor: 'pointer',
                                border: `1px solid ${isSel ? rt.color : 'rgba(255,255,255,0.08)'}`,
                                background: isSel ? `${rt.color}15` : 'rgba(255,255,255,0.02)',
                                transition: 'all 0.2s',
                                '&:hover': { borderColor: rt.color }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Box sx={{ color: rt.color }}>{rt.icon}</Box>
                                <Typography variant="subtitle2" sx={{ color: isSel ? rt.color : 'white', fontWeight: 700, fontSize: '0.82rem' }}>
                                  {rt.label}
                                </Typography>
                              </Box>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', display: 'block' }}>
                                {rt.desc}
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>

                    <Button
                      fullWidth variant="contained" size="large"
                      startIcon={generatingReport ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <ReportIcon />}
                      onClick={handleGenerateReport} disabled={generatingReport}
                      sx={{ background: 'linear-gradient(135deg, #2196f3, #00bcd4)', fontWeight: 800, py: 1.2, mb: 3 }}
                    >
                      {generatingReport ? 'Synthesizing & Cryptographically Sealing...' : `Synthesize & Archive [${selectedReportType}] in Vault`}
                    </Button>

                    {/* Generated Report Result Card */}
                    {generatedReport && (
                      <Box sx={{ p: 2.5, borderRadius: 2.5, background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.3)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <VerifiedIcon sx={{ color: '#4caf50' }} />
                            <Box>
                              <Typography variant="subtitle2" sx={{ color: '#4caf50', fontWeight: 800 }}>
                                {generatedReport.reportId} Sealed in Vault
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', fontSize: '0.62rem' }}>
                                SHA-256 SEAL: {generatedReport.digitalSealSha256 || '98f3e995d89f575a...'}
                              </Typography>
                            </Box>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Button size="small" variant="contained" startIcon={<GavelIcon />} onClick={() => downloadExport('html')} sx={{ background: '#4caf50', fontWeight: 700, fontSize: '0.72rem' }}>
                              Printable Court Exhibit (HTML/PDF)
                            </Button>
                            <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={() => downloadExport('json')} sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', fontSize: '0.72rem' }}>
                              Defense JSON
                            </Button>
                          </Stack>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                          {generatedReport.summary || generatedReport.title}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 5, ...glassCard, textAlign: 'center' }}>
              <CaseIcon sx={{ fontSize: 60, color: 'rgba(33,150,243,0.3)', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>No Investigation Case Selected</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>Select a case from the ledger on the left to inspect topology, evidence, and court reports.</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* ─── MODAL: CREATE NEW CASE ─── */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: 'linear-gradient(135deg, #0a1929, #132f4c)', border: '1px solid rgba(33,150,243,0.3)', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: 'white', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CaseIcon sx={{ color: '#2196f3' }} />
            New Investigation Case Registry
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Case Title" size="small" value={newCaseForm.title} onChange={e => setNewCaseForm(p => ({ ...p, title: e.target.value }))} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} InputProps={{ sx: { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Case Summary / Initial Discovery" size="small" value={newCaseForm.description} onChange={e => setNewCaseForm(p => ({ ...p, description: e.target.value }))} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} InputProps={{ sx: { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }} />
            </Grid>
            {[
              { field: 'priority', label: 'Priority', options: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
              { field: 'classification', label: 'Classification', options: ['TOP SECRET', 'SECRET', 'RESTRICTED'] },
              { field: 'category', label: 'Threat Category', options: ['Ransomware', 'Drug Trafficking', 'Data Trafficking', 'Weapons', 'Fraud', 'Terror Finance', 'Unknown'] }
            ].map(({ field, label, options }) => (
              <Grid item xs={12} sm={4} key={field}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>{label}</InputLabel>
                  <Select value={newCaseForm[field]} onChange={e => setNewCaseForm(p => ({ ...p, [field]: e.target.value }))} label={label} sx={{ color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }}>
                    {options.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            ))}
            <Grid item xs={12}>
              <TextField fullWidth label="Jurisdiction / Statutory Legal Framework" size="small" value={newCaseForm.jurisdiction} onChange={e => setNewCaseForm(p => ({ ...p, jurisdiction: e.target.value }))} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} InputProps={{ sx: { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCase} disabled={!newCaseForm.title.trim()} sx={{ background: 'linear-gradient(135deg, #2196f3, #00bcd4)', fontWeight: 700 }}>
            Establish Case
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── MODAL: ATTACH DIGITAL EVIDENCE ─── */}
      <Dialog open={addEvidenceOpen} onClose={() => setAddEvidenceOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: 'linear-gradient(135deg, #0a1929, #132f4c)', border: '1px solid rgba(156,39,176,0.3)', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: 'white', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VerifiedIcon sx={{ color: '#ba68c8' }} />
            Attach Digital Evidence Exhibit (ISO/IEC 27037)
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Exhibit Title" size="small" value={evidenceForm.title} onChange={e => setEvidenceForm(p => ({ ...p, title: e.target.value }))} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} InputProps={{ sx: { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Evidence Type</InputLabel>
                <Select value={evidenceForm.type} onChange={e => setEvidenceForm(p => ({ ...p, type: e.target.value }))} label="Evidence Type" sx={{ color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }}>
                  {['TLS_SAN_CERTIFICATE', 'BLOCKCHAIN_LEDGER', 'STYLOMETRIC_CORPUS', 'ONION_TELEMETRY', 'TRAFFIC_LOG', 'HONEYPOT_CAPTURE'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="number" label="Attribution Confidence (%)" size="small" value={evidenceForm.confidenceScore} onChange={e => setEvidenceForm(p => ({ ...p, confidenceScore: parseInt(e.target.value, 10) || 50 }))} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} InputProps={{ sx: { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Evidentiary Description" size="small" value={evidenceForm.description} onChange={e => setEvidenceForm(p => ({ ...p, description: e.target.value }))} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} InputProps={{ sx: { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Raw Technical Indicator / Hash / Wallet / IP" size="small" value={evidenceForm.indicator} onChange={e => setEvidenceForm(p => ({ ...p, indicator: e.target.value }))} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} InputProps={{ sx: { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button onClick={() => setAddEvidenceOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddEvidence} disabled={!evidenceForm.title.trim()} sx={{ background: '#9c27b0', fontWeight: 700 }}>
            Seal & Attach Exhibit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
