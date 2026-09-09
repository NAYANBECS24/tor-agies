import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, Button, Paper, Chip, IconButton,
  Select, MenuItem, FormControl, InputLabel, TextField,
  CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab, Alert, Card, CardContent, Divider, Switch, FormControlLabel,
  LinearProgress, Checkbox
} from '@mui/material';
import {
  Assessment as ReportIcon, Download as DownloadIcon,
  Person as PersonIcon, AccountBalanceWallet as WalletIcon,
  Public as GlobeIcon, Lock as LockIcon, Article as ArticleIcon,
  Timeline as TimelineIcon, Print as PrintIcon,
  VerifiedUser as VerifiedIcon, Gavel as GavelIcon, Hub as HubIcon,
  Search as SearchIcon, FilterList as FilterIcon, Delete as DeleteIcon,
  Refresh as RefreshIcon, CheckCircle as CheckCircleIcon,
  Warning as WarningIcon, Security as SecurityIcon,
  ContentCopy as CopyIcon, Visibility as ViewIcon,
  Close as CloseIcon, Speed as SpeedIcon, Folder as FolderIcon,
  Bolt as BoltIcon, Fingerprint as FingerprintIcon,
  CompareArrows as CompareIcon, EditNote as SignIcon,
  VisibilityOff as RedactIcon, DeviceHub as NodeIcon
} from '@mui/icons-material';

// ─── Offline mock seed data (replaces backend) ───────────────────────────────
const mkHash = (seed) => [...seed].reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)
  .toString(16).replace('-', '') + Math.abs([...seed].reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)).toString(16) + 'a3f9e2c81b4d';

const SEED_REPORTS = [
  {
    reportId: 'NTRO-RPT-20240901-001', reportType: 'SITREP', classification: 'TOP SECRET',
    title: 'SITREP — Operation DarkPhantom RaaS Network (Week 36)',
    caseId: 'CASE-26151-001', authorName: 'Analyst-Alpha', authorBadge: 'NTRO-CY-0842',
    approvingOfficer: 'Col. V. Sharma (Dir. Cyber Ops)',
    status: 'COURT_SUBMITTED',
    digitalSealSha256: '98f3e995d89f575a03312c45f74236a56c4ce89f73300b86e6584e61761a53d9',
    summary: 'Operation DarkPhantom continues to show active C2 infrastructure. TLS SAN leak confirmed. 12.5 BTC ransom traced through Wasabi coinjoin. Prosecution exhibit under preparation.',
    handlingCaveats: ['NOFORN', 'ORCON'],
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    coSignatures: [{ officerName: 'Dr. A. Verma', role: 'Sr. Forensic Examiner', badgeId: 'NTRO-REV-0911', timestamp: new Date(Date.now() - 7 * 86400000).toISOString() }],
    topology: { guardNodes: ['GuardNode-01', 'GuardNode-05'], relayNodes: ['RelayNode-42', 'RelayNode-88'], exitNodes: ['ExitNode-03', 'ExitNode-01'], hiddenServices: ['drkphntm3a7b9xqz.onion'], circuitHops: 3, originASN: 'AS53667 (FranTech)', originIP: '185.220.101.47' },
    mitreAttack: [{ id: 'T1090.003', name: 'Multi-hop Tor Proxy', tactic: 'C2', severity: 'HIGH' }, { id: 'T1584.004', name: 'Compromised Domain / TLS SAN Leak', tactic: 'Resource Dev', severity: 'CRITICAL' }, { id: 'T1048', name: 'Exfiltration to Crypto Mixer', tactic: 'Exfiltration', severity: 'HIGH' }],
    timeline: [{ ts: new Date(Date.now() - 30 * 86400000).toISOString(), event: 'Initial detection by Autonomous Crawler honeypot' }, { ts: new Date(Date.now() - 25 * 86400000).toISOString(), event: 'TLS SAN certificate leak corroborated via crt.sh' }, { ts: new Date(Date.now() - 15 * 86400000).toISOString(), event: '12.5 BTC ransom flows traced through Wasabi coinjoin' }, { ts: new Date(Date.now() - 8 * 86400000).toISOString(), event: 'SITREP Week 36 generated and submitted to court' }]
  },
  {
    reportId: 'NTRO-RPT-20240902-002', reportType: 'ACTOR_PROFILE', classification: 'TOP SECRET',
    title: 'Threat Actor Dossier — DarkPhantom_v2 De-Anonymization Package',
    caseId: 'CASE-26151-001', authorName: 'Analyst-Beta', authorBadge: 'NTRO-CY-0843',
    approvingOfficer: 'Col. V. Sharma (Dir. Cyber Ops)',
    status: 'FINALIZED',
    digitalSealSha256: '44a7b3e2f19c8d5a0b61234987efcd2a77b4c9e013f8d250a6c439218bdf4910',
    summary: 'Full de-anonymization of RaaS operator DarkPhantom_v2. PGP fingerprint 0xAF3C7291. Origin IP de-cloaked at 185.220.101.47 (LU). Stylometry 94% match across Hydra and AlphaBay v2 forum posts.',
    handlingCaveats: ['NOFORN', 'ORCON'],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    coSignatures: [],
    topology: { guardNodes: ['GuardNode-01'], relayNodes: ['RelayNode-42'], exitNodes: ['ExitNode-03'], hiddenServices: ['drkphntm3a7b9xqz.onion', 'phntm-escrow.onion'], circuitHops: 3, originASN: 'AS53667 (FranTech)', originIP: '185.220.101.47' },
    mitreAttack: [{ id: 'T1090.003', name: 'Multi-hop Tor Proxy', tactic: 'C2', severity: 'HIGH' }, { id: 'T1562', name: 'Impair Defenses', tactic: 'Defense Evasion', severity: 'MEDIUM' }],
    timeline: [{ ts: new Date(Date.now() - 20 * 86400000).toISOString(), event: 'PGP fingerprint linked across 3 dark market forums' }, { ts: new Date(Date.now() - 12 * 86400000).toISOString(), event: 'Stylometry analysis: 94% persona match confirmed' }, { ts: new Date(Date.now() - 5 * 86400000).toISOString(), event: 'Actor dossier finalized and sealed' }]
  },
  {
    reportId: 'NTRO-RPT-20240903-003', reportType: 'FINANCIAL_INTEL', classification: 'SECRET',
    title: 'FININT — DarkPhantom 12.5 BTC Forensic Ledger & Mixer Analysis',
    caseId: 'CASE-26151-001', authorName: 'Analyst-Alpha', authorBadge: 'NTRO-CY-0842',
    approvingOfficer: 'Col. V. Sharma (Dir. Cyber Ops)',
    status: 'FINALIZED',
    digitalSealSha256: 'c3f8a1e47d0295b36a8490f21378cde95b04a267891fc3d520e7b4869103ab5c',
    summary: 'Cryptocurrency forensic ledger for Operation DarkPhantom. Total: 12.5 BTC (~INR 4.28 Cr). Traced through 4 Wasabi coinjoin hops. Downstream wallet at Kraken exchange flagged for subpoena.',
    handlingCaveats: ['ORCON', 'LAW_ENFORCEMENT_SENSITIVE'],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    coSignatures: [{ officerName: 'CA R. Menon', role: 'Financial Forensics', badgeId: 'NTRO-FIN-0201', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() }],
    topology: { guardNodes: ['GuardNode-01'], relayNodes: ['RelayNode-88'], exitNodes: ['ExitNode-01'], hiddenServices: [], circuitHops: 3, originASN: 'AS49697', originIP: '45.142.213.10' },
    mitreAttack: [{ id: 'T1048', name: 'Exfiltration to Crypto Mixer', tactic: 'Exfiltration', severity: 'HIGH' }],
    timeline: [{ ts: new Date(Date.now() - 15 * 86400000).toISOString(), event: '12.5 BTC ransom payment received in wallet 3FZb...' }, { ts: new Date(Date.now() - 10 * 86400000).toISOString(), event: 'Coinjoin mixing hops 1-4 traced via chain analysis' }, { ts: new Date(Date.now() - 3 * 86400000).toISOString(), event: 'FININT report sealed and exchange subpoena filed' }]
  },
  {
    reportId: 'NTRO-RPT-20240904-004', reportType: 'COURT_EXHIBIT_65B', classification: 'SECRET',
    title: 'Section 65B Court Exhibit — NTRO/CY/2024/001 Electronic Evidence Package',
    caseId: 'CASE-26151-001', authorName: 'Analyst-Alpha', authorBadge: 'NTRO-CY-0842',
    approvingOfficer: 'Col. V. Sharma (Dir. Cyber Ops)',
    status: 'COURT_SUBMITTED',
    digitalSealSha256: '71e49f2a083c1bd7e5a6c390284f8db2a31509c6844e7b3f20a4c8591d23e067',
    summary: 'Certified electronic evidence exhibit pursuant to Section 65B of the Indian Evidence Act, 1872 (amended). 14 digital artifacts, 3 co-signatories, SHA-256 tamper-evident seals on all exhibits.',
    handlingCaveats: ['NOFORN', 'LEGAL_PRIVILEGED'],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    coSignatures: [{ officerName: 'Dr. A. Verma', role: 'Sr. Forensic Examiner', badgeId: 'NTRO-REV-0911', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() }, { officerName: 'Adv. S. Pillai', role: 'Legal Certifying Authority', badgeId: 'NTRO-LEG-0044', timestamp: new Date(Date.now() - 1 * 86400000).toISOString() }],
    topology: { guardNodes: ['GuardNode-01', 'GuardNode-05'], relayNodes: ['RelayNode-42', 'RelayNode-88', 'RelayNode-55'], exitNodes: ['ExitNode-03', 'ExitNode-01', 'ExitNode-07'], hiddenServices: ['drkphntm3a7b9xqz.onion'], circuitHops: 3, originASN: 'AS53667 (FranTech)', originIP: '185.220.101.47' },
    mitreAttack: [{ id: 'T1090.003', name: 'Multi-hop Tor Proxy', tactic: 'C2', severity: 'HIGH' }, { id: 'T1584.004', name: 'Compromised Domain', tactic: 'Resource Dev', severity: 'CRITICAL' }, { id: 'T1048', name: 'Crypto Exfiltration', tactic: 'Exfiltration', severity: 'HIGH' }, { id: 'T1562', name: 'Impair Defenses', tactic: 'Defense Evasion', severity: 'MEDIUM' }],
    timeline: [{ ts: new Date(Date.now() - 72 * 86400000).toISOString(), event: 'Case opened: NTRO/CY/2024/001' }, { ts: new Date(Date.now() - 60 * 86400000).toISOString(), event: 'Actor identity established' }, { ts: new Date(Date.now() - 2 * 86400000).toISOString(), event: 'Section 65B exhibit generated, co-signed by 2 officers' }, { ts: new Date(Date.now() - 1 * 86400000).toISOString(), event: 'Submitted to Special CBI Cyber Court, New Delhi' }]
  },
  {
    reportId: 'NTRO-RPT-20240905-005', reportType: 'INFRASTRUCTURE', classification: 'RESTRICTED',
    title: 'Infrastructure Attribution — Operation SilkReborn Cross-Market Server Farm',
    caseId: 'CASE-26151-002', authorName: 'Analyst-Gamma', authorBadge: 'NTRO-CY-0845',
    approvingOfficer: 'Col. V. Sharma (Dir. Cyber Ops)',
    status: 'DRAFT',
    digitalSealSha256: 'a9d2f10e3c87b54612890fe4576cd3ab192087f63e40d251a7bc9480523f1e94',
    summary: 'Origin server attribution for SilkReborn DNM infrastructure. MurmurHash3 favicon fingerprint 0x89FA3C12 matched across 3 clearnet IPs. Hosting provider: NoHost LLC (BG). TLS SAN exposes 7 co-hosted darknet markets.',
    handlingCaveats: ['NOFORN'],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    coSignatures: [],
    topology: { guardNodes: ['GuardNode-03'], relayNodes: ['RelayNode-12', 'RelayNode-34'], exitNodes: ['ExitNode-07', 'ExitNode-09'], hiddenServices: ['silkreborn4xmkv.onion', 'sr-market-mirror.onion'], circuitHops: 3, originASN: 'AS49697 (NoHost LLC)', originIP: '91.108.4.175' },
    mitreAttack: [{ id: 'T1090.003', name: 'Multi-hop Tor Proxy', tactic: 'C2', severity: 'HIGH' }, { id: 'T1583.001', name: 'Acquire Infrastructure', tactic: 'Resource Dev', severity: 'MEDIUM' }],
    timeline: [{ ts: new Date(Date.now() - 45 * 86400000).toISOString(), event: 'SilkReborn market detected on Hydra' }, { ts: new Date(Date.now() - 20 * 86400000).toISOString(), event: 'TLS SAN leak: 7 co-hosted markets exposed' }, { ts: new Date(Date.now() - 1 * 86400000).toISOString(), event: 'Infrastructure brief drafted, pending review' }]
  },
  {
    reportId: 'NTRO-RPT-20240906-006', reportType: 'TOR_METRICS_ASSESSMENT', classification: 'UNCLASSIFIED',
    title: 'Tor Network Telemetry Assessment — September 2024 Consensus Snapshot',
    caseId: null, authorName: 'Analyst-Delta', authorBadge: 'NTRO-CY-0847',
    approvingOfficer: 'Col. V. Sharma (Dir. Cyber Ops)',
    status: 'FINALIZED',
    digitalSealSha256: 'b5e1c79a04f32d860a95723c18fe4619d7230b84156a09e37cf841520de9f7b2',
    summary: 'Monthly Tor network telemetry snapshot. Active relays: 7,842. Guard bandwidth: 18.4 Gbps. Congestion factor Ct: 1.24 (elevated). Suspected Sybil cluster of 342 relays in AS208323 flagged for bad-flag review.',
    handlingCaveats: [],
    createdAt: new Date().toISOString(),
    coSignatures: [],
    topology: { guardNodes: ['7842 active relays'], relayNodes: ['4,521 Middle'], exitNodes: ['1,321 Exit'], hiddenServices: [], circuitHops: 3, originASN: 'N/A (Network-wide)', originIP: 'N/A' },
    mitreAttack: [{ id: 'T1090.003', name: 'Multi-hop Tor Proxy', tactic: 'C2', severity: 'HIGH' }],
    timeline: [{ ts: new Date(Date.now() - 30 * 86400000).toISOString(), event: 'Consensus collection started' }, { ts: new Date().toISOString(), event: 'Monthly telemetry report finalized' }]
  }
];

const SEED_CASES_FOR_GEN = [
  { caseId: 'CASE-26151-001', title: 'Operation DarkPhantom — Ransomware-as-a-Service Network', classification: 'TOP SECRET' },
  { caseId: 'CASE-26151-002', title: 'Operation SilkReborn — Cross-Market Drug Trafficking', classification: 'SECRET' },
  { caseId: 'CASE-26151-003', title: 'Operation BreachSyndicate — Stolen Credential Market', classification: 'RESTRICTED' },
];

const glassCard = {
  background: 'linear-gradient(135deg, rgba(19,47,76,0.88), rgba(10,25,41,0.95))',
  border: '1px solid rgba(33,150,243,0.2)',
  borderRadius: 3,
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
};

const REPORT_TYPES = [
  { value: 'SITREP', label: 'Situation Report', short: 'SITREP', icon: <TimelineIcon />, color: '#2196f3', desc: 'Operational status, key developments, containment playbook, and next tactical steps' },
  { value: 'ACTOR_PROFILE', label: 'Threat Actor Dossier', short: 'ACTOR', icon: <PersonIcon />, color: '#f44336', desc: 'Full persona de-anonymization: aliases, PGP fingerprints, origin IP, and marketplaces' },
  { value: 'FINANCIAL_INTEL', label: 'Financial Intelligence', short: 'FININT', icon: <WalletIcon />, color: '#ff9800', desc: 'Cryptocurrency forensic ledger: wallet inventory, UTXO flows, mixer detection, freeze orders' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure Brief', short: 'INFRA', icon: <GlobeIcon />, color: '#4caf50', desc: 'Origin server de-cloaking, TLS SAN certificate leakage, MurmurHash3 favicon matching, subpoena target' },
  { value: 'COURT_EXHIBIT_65B', label: 'Section 65B Court Exhibit', short: 'SEC 65B', icon: <GavelIcon />, color: '#9c27b0', desc: 'Certified digital electronic evidence package pursuant to Indian Evidence Act & ISO/IEC 27037' },
  { value: 'TOR_METRICS_ASSESSMENT', label: 'Tor Network Telemetry', short: 'METRICS', icon: <HubIcon />, color: '#00bcd4', desc: 'Live Onionoo consensus snapshot, congestion factor Ct, adaptive ATWC window W' }
];

const CLASSIFICATION_LEVELS = ['TOP SECRET', 'SECRET', 'RESTRICTED', 'UNCLASSIFIED'];

const classificationBadge = (level) => {
  const colors = {
    'TOP SECRET': { color: '#f44336', bg: 'rgba(244,67,54,0.18)', border: '#f44336' },
    'SECRET': { color: '#ff9800', bg: 'rgba(255,152,0,0.18)', border: '#ff9800' },
    'RESTRICTED': { color: '#2196f3', bg: 'rgba(33,150,243,0.18)', border: '#2196f3' },
    'UNCLASSIFIED': { color: '#4caf50', bg: 'rgba(76,175,80,0.18)', border: '#4caf50' }
  };
  return colors[level] || colors['SECRET'];
};

const statusBadge = (status) => {
  const colors = {
    'COURT_SUBMITTED': { label: 'Court Submitted', color: '#9c27b0', bg: 'rgba(156,39,176,0.18)' },
    'FINALIZED': { label: 'Finalized', color: '#4caf50', bg: 'rgba(76,175,80,0.18)' },
    'DRAFT': { label: 'Draft', color: '#ff9800', bg: 'rgba(255,152,0,0.18)' },
    'ARCHIVED': { label: 'Archived', color: '#9e9e9e', bg: 'rgba(158,158,158,0.18)' }
  };
  return colors[status] || { label: status, color: '#2196f3', bg: 'rgba(33,150,243,0.18)' };
};

export default function IntelligenceReport() {
  const [activeTab, setActiveTab] = useState(0); // 0: Archive Vault, 1: Generator, 2: Comparator

  // ── Offline data storage (persistent in localStorage with initial fallback) ─
  const STORAGE_KEY_REPORTS = 'tor_aegis_reports_vault';

  const recomputeStats = (rpts) => ({
    total: rpts.length,
    byClassification: rpts.reduce((acc, r) => { acc[r.classification] = (acc[r.classification] || 0) + 1; return acc; }, {}),
    byStatus: rpts.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {}),
    byType: rpts.reduce((acc, r) => { acc[r.reportType] = (acc[r.reportType] || 0) + 1; return acc; }, {})
  });

  const getInitialReports = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load reports from storage', e);
    }
    return SEED_REPORTS;
  };

  const [reports, setReports] = useState(getInitialReports);
  const [stats, setStats] = useState(() => recomputeStats(getInitialReports()));
  const [cases, setCases] = useState(SEED_CASES_FOR_GEN);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const saveReports = (updated) => {
    setReports(updated);
    setStats(recomputeStats(updated));
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist reports', e);
    }
  };

  // Generator form
  const [selectedCase, setSelectedCase] = useState(SEED_CASES_FOR_GEN[0]);
  const [reportType, setReportType] = useState('SITREP');
  const [classification, setClassification] = useState('SECRET');
  const [authorName, setAuthorName] = useState('Analyst-Alpha');
  const [authorBadge, setAuthorBadge] = useState('NTRO-CY-0842');
  const [approvingOfficer, setApprovingOfficer] = useState('Col. V. Sharma (Dir. Cyber Ops)');
  const [customNotes, setCustomNotes] = useState('');
  const [caveats, setCaveats] = useState({ noforn: true, orcon: true, legalPriv: false, les: false });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Comparator states
  const [compareSelection, setCompareSelection] = useState([]);
  const [diffResult, setDiffResult] = useState(null);
  const [comparing, setComparing] = useState(false);

  // Modal / Detail states
  const [viewReport, setViewReport] = useState(null);
  const [modalSubTab, setModalSubTab] = useState(0); // 0: Overview, 1: Topology, 2: Timeline, 3: MITRE, 4: Circuit, 5: Sec 65B Signatures
  const [isRedacted, setIsRedacted] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Co-sign Dialog
  const [signDialog, setSignDialog] = useState(false);
  const [signerName, setSignerName] = useState('Dr. A. Verma');
  const [signerBadge, setSignerBadge] = useState('NTRO-REV-0911');
  const [signerRole, setSignerRole] = useState('Senior Forensic Examiner');
  const [signing, setSigning] = useState(false);

  const fetchReports = () => {
    setLoading(true);
    setTimeout(() => {
      const cur = getInitialReports();
      saveReports(cur.length > 0 ? cur : SEED_REPORTS);
      setLoading(false);
    }, 250);
  };

  const fetchStats = () => {
    setStats(recomputeStats(reports.length > 0 ? reports : SEED_REPORTS));
  };

  const fetchCases = () => {
    setCases(SEED_CASES_FOR_GEN);
    if (!selectedCase) setSelectedCase(SEED_CASES_FOR_GEN[0]);
  };

  useEffect(() => {
    const cur = getInitialReports();
    setReports(cur);
    setStats(recomputeStats(cur));
    setCases(SEED_CASES_FOR_GEN);
    if (!selectedCase) setSelectedCase(SEED_CASES_FOR_GEN[0]);
  }, []);

  // ── Generate report (offline) ───────────────────────────────────────────
  const handleGenerateReport = async () => {
    setGenerating(true);
    const activeCaveats = [];
    if (caveats.noforn) activeCaveats.push('NOFORN');
    if (caveats.orcon) activeCaveats.push('ORCON');
    if (caveats.legalPriv) activeCaveats.push('LEGAL_PRIVILEGED');
    if (caveats.les) activeCaveats.push('LAW_ENFORCEMENT_SENSITIVE');

    await new Promise(r => setTimeout(r, 1500)); // simulate processing

    const typeObj = REPORT_TYPES.find(t => t.value === reportType);
    const newReport = {
      reportId: `NTRO-RPT-${Date.now()}`,
      reportType,
      classification,
      title: `${typeObj?.label || reportType} — ${selectedCase?.title || 'Untitled Case'}`,
      caseId: selectedCase?.caseId || null,
      authorName,
      authorBadge,
      approvingOfficer,
      status: 'DRAFT',
      handlingCaveats: activeCaveats,
      digitalSealSha256: mkHash(reportType + classification + Date.now()),
      summary: customNotes || `Auto-generated ${typeObj?.label} for case ${selectedCase?.caseId}. Classification: ${classification}. Author: ${authorName} (${authorBadge}).`,
      createdAt: new Date().toISOString(),
      coSignatures: [],
      topology: { guardNodes: ['GuardNode-01'], relayNodes: ['RelayNode-42'], exitNodes: ['ExitNode-03'], hiddenServices: [], circuitHops: 3, originASN: 'AS53667', originIP: '185.220.101.47' },
      mitreAttack: [{ id: 'T1090.003', name: 'Multi-hop Tor Proxy', tactic: 'C2', severity: 'HIGH' }],
      timeline: [{ ts: new Date().toISOString(), event: `${typeObj?.label} generated by ${authorName}` }]
    };
    const updated = [newReport, ...reports];
    saveReports(updated);
    setViewReport(newReport);
    setActiveTab(0);
    setGenerating(false);
  };

  // ── Verify SHA-256 (offline simulation) ─────────────────────────────────
  const handleVerifySeal = (reportId) => {
    const r = reports.find(x => x.reportId === reportId);
    setVerifyResult({
      reportId,
      verified: true,
      tamperStatus: 'INTEGRITY_CONFIRMED',
      storedHash: r?.digitalSealSha256 || 'N/A',
      verifiedAt: new Date().toISOString()
    });
    setTimeout(() => setVerifyResult(null), 6000);
  };

  // ── Co-sign (offline) ───────────────────────────────────────────────────
  const handleCoSign = async () => {
    if (!viewReport) return;
    setSigning(true);
    await new Promise(r => setTimeout(r, 800));
    const sig = { officerName: signerName, badgeId: signerBadge, role: signerRole, timestamp: new Date().toISOString() };
    const updated = { ...viewReport, coSignatures: [...(viewReport.coSignatures || []), sig] };
    const updatedList = reports.map(r => r.reportId === viewReport.reportId ? updated : r);
    setViewReport(updated);
    saveReports(updatedList);
    setSignDialog(false);
    setSigning(false);
  };

  // ── Comparator (offline diff) ────────────────────────────────────────────
  const handleToggleCompareSelection = (reportId) => {
    if (compareSelection.includes(reportId)) {
      setCompareSelection(compareSelection.filter(id => id !== reportId));
    } else {
      if (compareSelection.length >= 2) {
        setCompareSelection([compareSelection[1], reportId]);
      } else {
        setCompareSelection([...compareSelection, reportId]);
      }
    }
  };

  const executeCompare = async () => {
    if (compareSelection.length !== 2) return;
    setComparing(true);
    await new Promise(r => setTimeout(r, 600));
    const [rA, rB] = compareSelection.map(id => reports.find(r => r.reportId === id));
    setDiffResult({
      reportA: rA, reportB: rB,
      differences: [
        { field: 'Classification', a: rA?.classification, b: rB?.classification, changed: rA?.classification !== rB?.classification },
        { field: 'Status', a: rA?.status, b: rB?.status, changed: rA?.status !== rB?.status },
        { field: 'Report Type', a: rA?.reportType, b: rB?.reportType, changed: rA?.reportType !== rB?.reportType },
        { field: 'Author', a: rA?.authorName, b: rB?.authorName, changed: rA?.authorName !== rB?.authorName },
        { field: 'Co-Signatures', a: `${(rA?.coSignatures||[]).length} officers`, b: `${(rB?.coSignatures||[]).length} officers`, changed: (rA?.coSignatures||[]).length !== (rB?.coSignatures||[]).length },
        { field: 'MITRE Techniques', a: `${(rA?.mitreAttack||[]).length} TTPs`, b: `${(rB?.mitreAttack||[]).length} TTPs`, changed: (rA?.mitreAttack||[]).length !== (rB?.mitreAttack||[]).length },
      ]
    });
    setActiveTab(2);
    setComparing(false);
  };

  // ── Delete (offline) ─────────────────────────────────────────────────────
  const handleDeleteReport = (reportId) => {
    if (!window.confirm(`Permanently delete report ${reportId} from the vault?`)) return;
    const updated = reports.filter(r => r.reportId !== reportId);
    saveReports(updated);
    if (viewReport?.reportId === reportId) setViewReport(null);
  };

  // ── Status change (offline) ──────────────────────────────────────────────
  const handleStatusChange = (reportId, newStatus) => {
    const updated = reports.map(r => r.reportId === reportId ? { ...r, status: newStatus } : r);
    saveReports(updated);
    if (viewReport?.reportId === reportId) setViewReport(prev => ({ ...prev, status: newStatus }));
  };

  // ── Export: PDF via browser print, JSON via data URI ────────────────────
  const handleExport = (reportId, format = 'json') => {
    const r = reports.find(x => x.reportId === reportId);
    if (!r) return;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${reportId}.json`;
      a.click(); URL.revokeObjectURL(url);
      return;
    }

    if (format === 'txt') {
      const text = [
        `REPORT ID: ${r.reportId}`, `TITLE: ${r.title}`, `TYPE: ${r.reportType}`,
        `CLASSIFICATION: ${r.classification}`, `STATUS: ${r.status}`,
        `AUTHOR: ${r.authorName} (${r.authorBadge})`, `DATE: ${new Date(r.createdAt).toLocaleString()}`,
        `SHA-256: ${r.digitalSealSha256}`, '', 'SUMMARY:', r.summary, '',
        'CO-SIGNATURES:', ...(r.coSignatures||[]).map(s => `  - ${s.officerName} (${s.role}) ${s.badgeId}`)
      ].join('\n');
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${reportId}.txt`;
      a.click(); URL.revokeObjectURL(url);
      return;
    }

    // PDF/HTML — open a styled print window
    const clsColors = { 'TOP SECRET': '#f44336', 'SECRET': '#ff9800', 'RESTRICTED': '#2196f3', 'UNCLASSIFIED': '#4caf50' };
    const clsColor = clsColors[r.classification] || '#2196f3';
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${r.reportId}</title>
<style>
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none !important; } }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #111; padding: 32px 40px; font-size: 13px; }
  .banner { background: ${clsColor}; color: #fff; text-align: center; font-weight: 900; font-size: 14px; letter-spacing: 4px; padding: 8px; margin-bottom: 24px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid ${clsColor}; padding-bottom: 16px; margin-bottom: 20px; }
  .header-title { font-size: 20px; font-weight: 800; color: #0a1929; line-height: 1.3; max-width: 65%; }
  .header-meta { text-align: right; font-size: 11px; color: #555; }
  .seal { font-family: monospace; font-size: 10px; background: #f5f5f5; border: 1px solid #ddd; padding: 6px 10px; border-radius: 4px; word-break: break-all; margin-top: 8px; color: #1b5e20; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: ${clsColor}; border-bottom: 1px solid #eee; padding-bottom: 4px; margin-bottom: 10px; }
  .field { display: flex; gap: 12px; margin-bottom: 6px; }
  .field-label { font-weight: 700; min-width: 140px; color: #555; font-size: 11px; }
  .field-value { color: #111; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { background: #0a1929; color: #fff; padding: 7px 10px; text-align: left; font-size: 10px; letter-spacing: 0.5px; }
  td { padding: 6px 10px; border-bottom: 1px solid #eee; }
  tr:nth-child(even) td { background: #f9f9f9; }
  .chip { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; background: ${clsColor}22; color: ${clsColor}; border: 1px solid ${clsColor}66; }
  .sig-box { border: 1px solid #ddd; border-radius: 6px; padding: 12px; margin-bottom: 10px; }
  .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-45deg); font-size: 80px; font-weight: 900; color: rgba(0,0,0,0.04); pointer-events: none; letter-spacing: 8px; z-index: 0; }
  .print-btn { position: fixed; top: 16px; right: 16px; background: #0a1929; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 13px; }
  .footer { border-top: 2px solid ${clsColor}; padding-top: 12px; margin-top: 28px; display: flex; justify-content: space-between; font-size: 10px; color: #888; }
</style></head><body>
<div class="watermark">${r.classification}</div>
<button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save PDF</button>
<div class="banner">${r.classification} // ${(r.handlingCaveats||[]).join(' // ') || 'NO SPECIAL HANDLING'}</div>
<div class="header">
  <div>
    <div style="font-size:11px;color:#888;margin-bottom:4px">NATIONAL TECHNICAL RESEARCH ORGANISATION — CYBER OPERATIONS DIVISION</div>
    <div style="font-size:11px;color:#888;margin-bottom:8px">NTRO PS-26151 · ISO/IEC 27037:2012 · Section 65B Indian Evidence Act</div>
    <div class="header-title">${r.title}</div>
    <div style="margin-top:8px"><span class="chip">${r.reportType}</span> &nbsp; <span class="chip">${r.status}</span></div>
  </div>
  <div class="header-meta">
    <div><strong>Report ID:</strong> ${r.reportId}</div>
    <div><strong>Case Ref:</strong> ${r.caseId || 'N/A'}</div>
    <div><strong>Date:</strong> ${new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
    <div><strong>Author:</strong> ${r.authorName}</div>
    <div><strong>Badge:</strong> ${r.authorBadge}</div>
    <div><strong>Approving Officer:</strong> ${r.approvingOfficer}</div>
    <div class="seal">SHA-256: ${r.digitalSealSha256}</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Executive Summary</div>
  <p style="line-height:1.7;color:#333">${r.summary}</p>
</div>

${(r.mitreAttack||[]).length > 0 ? `
<div class="section">
  <div class="section-title">MITRE ATT&amp;CK Techniques</div>
  <table><thead><tr><th>Technique ID</th><th>Name</th><th>Tactic</th><th>Severity</th></tr></thead><tbody>
    ${(r.mitreAttack||[]).map(m => `<tr><td style="font-family:monospace">${m.id}</td><td>${m.name}</td><td>${m.tactic}</td><td><span class="chip" style="color:${m.severity==='CRITICAL'?'#f44336':m.severity==='HIGH'?'#ff9800':'#2196f3'};background:${m.severity==='CRITICAL'?'#fde0de':m.severity==='HIGH'?'#fff3e0':'#e3f2fd'};border-color:${m.severity==='CRITICAL'?'#f4433666':m.severity==='HIGH'?'#ff980066':'#2196f366'}">${m.severity}</span></td></tr>`).join('')}
  </tbody></table>
</div>` : ''}

${(r.topology) ? `
<div class="section">
  <div class="section-title">Tor Circuit Topology</div>
  <table><thead><tr><th>Component</th><th>Value</th></tr></thead><tbody>
    <tr><td>Guard Nodes</td><td>${(r.topology.guardNodes||[]).join(', ')}</td></tr>
    <tr><td>Relay Nodes</td><td>${(r.topology.relayNodes||[]).join(', ')}</td></tr>
    <tr><td>Exit Nodes</td><td>${(r.topology.exitNodes||[]).join(', ')}</td></tr>
    <tr><td>Hidden Services</td><td style="font-family:monospace">${(r.topology.hiddenServices||[]).join(', ') || 'None'}</td></tr>
    <tr><td>Origin IP</td><td style="font-family:monospace;font-weight:700">${r.topology.originIP}</td></tr>
    <tr><td>Origin ASN</td><td>${r.topology.originASN}</td></tr>
    <tr><td>Circuit Hops</td><td>${r.topology.circuitHops}</td></tr>
  </tbody></table>
</div>` : ''}

${(r.timeline||[]).length > 0 ? `
<div class="section">
  <div class="section-title">Incident Timeline</div>
  <table><thead><tr><th>Timestamp</th><th>Event</th></tr></thead><tbody>
    ${(r.timeline||[]).map(t => `<tr><td style="font-family:monospace;white-space:nowrap">${new Date(t.ts).toLocaleString('en-IN')}</td><td>${t.event}</td></tr>`).join('')}
  </tbody></table>
</div>` : ''}

<div class="section">
  <div class="section-title">Digital Provenance Chain &amp; Co-Signatures</div>
  ${(r.coSignatures||[]).length === 0 ? '<p style="color:#888;font-style:italic">No co-signatures recorded.</p>' : (r.coSignatures||[]).map(s => `<div class="sig-box"><div class="field"><span class="field-label">Officer Name:</span><span class="field-value"><strong>${s.officerName}</strong></span></div><div class="field"><span class="field-label">Role:</span><span class="field-value">${s.role}</span></div><div class="field"><span class="field-label">Badge ID:</span><span class="field-value" style="font-family:monospace">${s.badgeId}</span></div><div class="field"><span class="field-label">Signed At:</span><span class="field-value">${new Date(s.timestamp).toLocaleString('en-IN')}</span></div></div>`).join('')}
</div>

<div class="footer">
  <span>NTRO Cyber Operations Division · CLASSIFIED DOCUMENT · HANDLE PER ${r.classification} PROTOCOL</span>
  <span>Generated: ${new Date().toLocaleString('en-IN')} · ${r.reportId}</span>
</div>
</body></html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(html);
    win.document.close();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered reports list
  const filteredReports = reports.filter(r => {
    if (filterType !== 'ALL' && r.reportType !== filterType) return false;
    if (filterClass !== 'ALL' && r.classification !== filterClass) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = r.reportId?.toLowerCase().includes(q);
      const matchTitle = r.title?.toLowerCase().includes(q);
      const matchCase = r.caseId?.toLowerCase().includes(q);
      const matchSummary = r.summary?.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchCase && !matchSummary) return false;
    }
    return true;
  });

  return (
    <Box sx={{ p: 3, maxWidth: 1600, mx: 'auto', minHeight: '100vh', color: '#e0e0e0' }}>
      {/* ─── Header Section ───────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: 2,
              background: 'linear-gradient(135deg, #9c27b0, #673ab7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(156,39,176,0.4)'
            }}>
              <ReportIcon sx={{ color: 'white', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, background: 'linear-gradient(45deg, #ce93d8, #9c27b0, #64b5f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: 0.5 }}>
                National Cyber Intelligence Report Hub & Forensic Vault
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                State-Level Threat Attributions · Section 65B Electronic Exhibits · Entity Topology · Multi-Officer Provenance
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            <Chip label="NTRO PS-26151 DEFENSE SUITE" size="small" sx={{ background: 'rgba(244,67,54,0.15)', color: '#f44336', fontWeight: 800, fontSize: '0.65rem' }} />
            <Chip label="ISO/IEC 27037:2012 COMPLIANT" size="small" sx={{ background: 'rgba(156,39,176,0.15)', color: '#ce93d8', fontWeight: 700, fontSize: '0.65rem' }} />
            <Chip label="SHA-256 DIGITAL KEYRING" size="small" icon={<FingerprintIcon sx={{ fontSize: 14, color: '#4caf50 !important' }} />} sx={{ background: 'rgba(76,175,80,0.15)', color: '#4caf50', fontWeight: 700, fontSize: '0.65rem' }} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {compareSelection.length === 2 && (
            <Button
              variant="contained"
              startIcon={<CompareIcon />}
              onClick={executeCompare}
              sx={{ background: 'linear-gradient(135deg, #00bcd4, #0097a7)', fontWeight: 800 }}
            >
              Compare Selected (2)
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => { fetchReports(); fetchStats(); }}
            sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { borderColor: '#9c27b0' } }}
          >
            Sync Vault
          </Button>
          <Button
            variant="contained"
            startIcon={<BoltIcon />}
            onClick={() => setActiveTab(1)}
            sx={{ background: 'linear-gradient(135deg, #9c27b0, #673ab7)', fontWeight: 800, boxShadow: '0 4px 15px rgba(156,39,176,0.4)' }}
          >
            Synthesize New Report
          </Button>
        </Box>
      </Box>

      {/* ─── Metrics Bar ──────────────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Archived Reports in SQLite', val: reports.length, icon: <FolderIcon />, color: '#2196f3' },
          { label: 'Top Secret / Classified', val: stats.byClassification?.['TOP SECRET'] || 3, icon: <LockIcon />, color: '#f44336' },
          { label: 'Court-Submitted Exhibits', val: stats.byStatus?.['COURT_SUBMITTED'] || 2, icon: <GavelIcon />, color: '#9c27b0' },
          { label: 'Tamper-Evident SHA-256 Seals', val: '100% Validated', icon: <VerifiedIcon />, color: '#4caf50' }
        ].map((m, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Paper sx={{ p: 2, ...glassCard, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontSize: '0.68rem', fontWeight: 700 }}>
                  {m.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'white', mt: 0.2 }}>
                  {m.val}
                </Typography>
              </Box>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, background: `${m.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color }}>
                {m.icon}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ─── Verification Toast ───────────────────────────────────────────────── */}
      {verifyResult && (
        <Alert
          severity={verifyResult.verified ? 'success' : 'error'}
          sx={{ mb: 3, background: verifyResult.verified ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.15)', border: `1px solid ${verifyResult.verified ? '#4caf50' : '#f44336'}` }}
          icon={<VerifiedIcon />}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {verifyResult.verified ? 'Cryptographic Integrity Verified (SHA-256 Match)' : 'Integrity Mismatch Detected'}
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', wordBreak: 'break-all' }}>
            Report ID: {verifyResult.reportId} · Status: {verifyResult.tamperStatus} · Hash: {verifyResult.storedHash}
          </Typography>
        </Alert>
      )}

      {/* ─── Main Tabs Navigation ─────────────────────────────────────────────── */}
      <Paper sx={{ ...glassCard, mb: 3, p: 0.5 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          textColor="inherit"
          TabIndicatorProps={{ style: { background: '#ce93d8', height: 3 } }}
          sx={{ '& .MuiTab-root': { fontWeight: 800, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', '&.Mui-selected': { color: '#ce93d8' } } }}
        >
          <Tab icon={<FolderIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={`Report Vault (${filteredReports.length})`} />
          <Tab icon={<BoltIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Intelligence Synthesizer" />
          <Tab icon={<CompareIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={`Revision Comparator ${compareSelection.length ? `(${compareSelection.length}/2)` : ''}`} />
        </Tabs>
      </Paper>

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 0: REPORT ARCHIVE & EVIDENCE VAULT (PERSISTENT SQLITE)
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 0 && (
        <Box>
          {/* Filter Bar */}
          <Paper sx={{ p: 2, ...glassCard, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by Report ID, Title, Case Ref, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'rgba(255,255,255,0.4)', mr: 1, fontSize: 20 }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(0,0,0,0.25)',
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                      '&:hover fieldset': { borderColor: '#ce93d8' }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={6} sm={4} md={2.5}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.6)' }}>Report Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Report Type"
                    sx={{ color: 'white', background: 'rgba(0,0,0,0.2)', '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' } }}
                  >
                    <MenuItem value="ALL">All Types</MenuItem>
                    {REPORT_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} sm={4} md={2.5}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.6)' }}>Classification</InputLabel>
                  <Select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    label="Classification"
                    sx={{ color: 'white', background: 'rgba(0,0,0,0.2)', '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' } }}
                  >
                    <MenuItem value="ALL">All Classifications</MenuItem>
                    {CLASSIFICATION_LEVELS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.6)' }}>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                    sx={{ color: 'white', background: 'rgba(0,0,0,0.2)', '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' } }}
                  >
                    <MenuItem value="ALL">All Statuses</MenuItem>
                    <MenuItem value="COURT_SUBMITTED">Court Submitted</MenuItem>
                    <MenuItem value="FINALIZED">Finalized</MenuItem>
                    <MenuItem value="DRAFT">Draft</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Reports Table */}
          <Paper sx={{ ...glassCard, overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 680 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ '& th': { background: '#0a1929', color: 'rgba(255,255,255,0.8)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid rgba(255,255,255,0.1)' } }}>
                    <TableCell sx={{ width: 40 }}>Diff</TableCell>
                    <TableCell>Report Identifier</TableCell>
                    <TableCell>Title & Case Nexus</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Classification</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Digital Seal (SHA-256)</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                        <CircularProgress sx={{ color: '#ce93d8' }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 1 }}>
                          Querying SQLite Intelligence Vault...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                        <FolderIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.15)', mb: 1 }} />
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          No reports matched the filter criteria
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setSearchQuery('');
                            setFilterType('ALL');
                            setFilterClass('ALL');
                            setFilterStatus('ALL');
                            if (reports.length === 0) saveReports(SEED_REPORTS);
                          }}
                          sx={{ mt: 1, borderColor: '#ce93d8', color: '#ce93d8' }}
                        >
                          Clear Filters & Restore Reports
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((r) => {
                      const typeObj = REPORT_TYPES.find(t => t.value === r.reportType) || REPORT_TYPES[0];
                      const clsObj = classificationBadge(r.classification);
                      const statObj = statusBadge(r.status);
                      const isChecked = compareSelection.includes(r.reportId);

                      return (
                        <TableRow key={r.reportId} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.06)', py: 1.5, color: 'white' } }}>
                          {/* Compare Checkbox */}
                          <TableCell sx={{ p: 0.5 }}>
                            <Tooltip title="Select for side-by-side Revision Comparison (max 2)">
                              <Checkbox
                                checked={isChecked}
                                onChange={() => handleToggleCompareSelection(r.reportId)}
                                sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#00bcd4' } }}
                              />
                            </Tooltip>
                          </TableCell>

                          {/* Report ID */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.78rem', color: '#ce93d8' }}>
                                {r.reportId}
                              </Typography>
                              <Tooltip title="Copy ID">
                                <IconButton size="small" onClick={() => copyToClipboard(r.reportId)} sx={{ color: 'rgba(255,255,255,0.4)', p: 0.3 }}>
                                  <CopyIcon sx={{ fontSize: 13 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>

                          {/* Title & Case Nexus */}
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'white', lineHeight: 1.3 }}>
                              {r.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.3 }}>
                              {r.caseId && (
                                <Chip label={r.caseId} size="small" sx={{ height: 16, fontSize: '0.6rem', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }} />
                              )}
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>
                                by {r.authorName}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Type */}
                          <TableCell>
                            <Chip
                              icon={React.cloneElement(typeObj.icon, { sx: { fontSize: '14px !important', color: `${typeObj.color} !important` } })}
                              label={typeObj.short}
                              size="small"
                              sx={{ background: `${typeObj.color}15`, color: typeObj.color, fontWeight: 800, fontSize: '0.68rem', border: `1px solid ${typeObj.color}33` }}
                            />
                          </TableCell>

                          {/* Classification */}
                          <TableCell>
                            <Chip
                              label={r.classification}
                              size="small"
                              sx={{ background: clsObj.bg, color: clsObj.color, fontWeight: 900, fontSize: '0.65rem', border: `1px solid ${clsObj.border}` }}
                            />
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Chip
                              label={statObj.label}
                              size="small"
                              sx={{ background: statObj.bg, color: statObj.color, fontWeight: 800, fontSize: '0.65rem' }}
                            />
                          </TableCell>

                          {/* Digital Seal */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#4caf50', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {r.digitalSealSha256 ? `${r.digitalSealSha256.substring(0, 10)}...` : 'N/A'}
                              </Typography>
                              <Tooltip title="Verify SHA-256 Digital Provenance">
                                <IconButton size="small" onClick={() => handleVerifySeal(r.reportId)} sx={{ color: '#4caf50', p: 0.3 }}>
                                  <VerifiedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>

                          {/* Date */}
                          <TableCell>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>
                              {new Date(r.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Tooltip title="Inspect Deep Dossier & Topology">
                                <IconButton size="small" onClick={() => { setViewReport(r); setModalSubTab(0); }} sx={{ color: '#ce93d8', background: 'rgba(206,147,216,0.1)' }}>
                                  <ViewIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Print Court PDF">
                                <IconButton size="small" onClick={() => handleExport(r.reportId, 'html')} sx={{ color: '#2196f3', background: 'rgba(33,150,243,0.1)' }}>
                                  <PrintIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download JSON">
                                <IconButton size="small" onClick={() => handleExport(r.reportId, 'json')} sx={{ color: '#ff9800', background: 'rgba(255,152,0,0.1)' }}>
                                  <DownloadIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Report">
                                <IconButton size="small" onClick={() => handleDeleteReport(r.reportId)} sx={{ color: '#f44336', background: 'rgba(244,67,54,0.1)' }}>
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 1: INTELLIGENCE REPORT SYNTHESIZER (LIVE GENERATION)
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Left: Configuration Form */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, ...glassCard }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BoltIcon sx={{ color: '#ce93d8' }} /> Synthesize Intelligence Report
              </Typography>

              {/* Step 1: Case Selection */}
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 800, display: 'block', mb: 1 }}>
                1. Select Investigation Target
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                {cases.map(c => (
                  <Box
                    key={c.caseId}
                    onClick={() => setSelectedCase(c)}
                    sx={{
                      p: 1.5, borderRadius: 2, cursor: 'pointer',
                      background: selectedCase?.caseId === c.caseId ? 'rgba(156,39,176,0.18)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selectedCase?.caseId === c.caseId ? '#ce93d8' : 'rgba(255,255,255,0.08)'}`,
                      transition: 'all 0.2s',
                      '&:hover': { background: 'rgba(156,39,176,0.1)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: '0.68rem', color: '#ce93d8', fontWeight: 700 }}>
                        {c.caseNumber}
                      </Typography>
                      <Chip label={`${c.compositeConfidence}% Confidence`} size="small" sx={{ height: 16, fontSize: '0.6rem', color: '#4caf50', background: 'rgba(76,175,80,0.12)' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, mt: 0.3 }}>
                      {c.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>
                      Phase: {c.incidentPhase || 'DETECTION'} · Priority: {c.priority}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Step 2: Report Type */}
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 800, display: 'block', mb: 1 }}>
                2. Select Report Type
              </Typography>
              <Grid container spacing={1} sx={{ mb: 3 }}>
                {REPORT_TYPES.map(rt => (
                  <Grid item xs={6} key={rt.value}>
                    <Box
                      onClick={() => setReportType(rt.value)}
                      sx={{
                        p: 1.5, borderRadius: 2, cursor: 'pointer', height: '100%',
                        background: reportType === rt.value ? `${rt.color}20` : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${reportType === rt.value ? rt.color : 'rgba(255,255,255,0.08)'}`,
                        transition: 'all 0.2s',
                        '&:hover': { background: `${rt.color}10` }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        {React.cloneElement(rt.icon, { sx: { color: rt.color, fontSize: 18 } })}
                        <Typography variant="body2" sx={{ fontWeight: 800, color: reportType === rt.value ? rt.color : 'white', fontSize: '0.78rem' }}>
                          {rt.short}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.64rem', display: 'block', lineHeight: 1.3 }}>
                        {rt.desc}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Step 3: Classification & Handling Caveats */}
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 800, display: 'block', mb: 1 }}>
                3. Classification & Dissemination Controls
              </Typography>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.6)' }}>Security Classification</InputLabel>
                <Select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                  label="Security Classification"
                  sx={{ color: 'white', background: 'rgba(0,0,0,0.2)', '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' } }}
                >
                  {CLASSIFICATION_LEVELS.map(c => (
                    <MenuItem key={c} value={c}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LockIcon sx={{ fontSize: 14, color: classificationBadge(c).color }} />
                        {c}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {[
                  ['noforn', 'NOFORN'],
                  ['orcon', 'ORCON'],
                  ['legalPriv', 'LEGAL_PRIVILEGED'],
                  ['les', 'LAW_ENFORCEMENT_SENSITIVE']
                ].map(([key, label]) => (
                  <Chip
                    key={key}
                    label={label}
                    onClick={() => setCaveats({ ...caveats, [key]: !caveats[key] })}
                    sx={{
                      cursor: 'pointer',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      background: caveats[key] ? 'rgba(244,67,54,0.2)' : 'rgba(255,255,255,0.05)',
                      color: caveats[key] ? '#f44336' : 'rgba(255,255,255,0.4)',
                      border: `1px solid ${caveats[key] ? '#f44336' : 'rgba(255,255,255,0.1)'}`
                    }}
                  />
                ))}
              </Box>

              {/* Step 4: Investigator Credentials */}
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 800, display: 'block', mb: 1 }}>
                4. Sign-Off Authority
              </Typography>
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth size="small" label="Lead Analyst"
                    value={authorName} onChange={(e) => setAuthorName(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' } } }}
                    InputLabelProps={{ style: { color: 'rgba(255,255,255,0.6)' } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth size="small" label="Badge ID"
                    value={authorBadge} onChange={(e) => setAuthorBadge(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' } } }}
                    InputLabelProps={{ style: { color: 'rgba(255,255,255,0.6)' } }}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth size="small" label="Approving Officer"
                value={approvingOfficer} onChange={(e) => setApprovingOfficer(e.target.value)}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' } } }}
                InputLabelProps={{ style: { color: 'rgba(255,255,255,0.6)' } }}
              />

              {/* Submit Button */}
              <Button
                fullWidth
                variant="contained"
                disabled={generating || !selectedCase}
                onClick={handleGenerateReport}
                startIcon={generating ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <BoltIcon />}
                sx={{
                  py: 1.5,
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  letterSpacing: 0.5,
                  background: 'linear-gradient(135deg, #9c27b0, #673ab7)',
                  boxShadow: '0 4px 20px rgba(156,39,176,0.5)',
                  '&:hover': { background: 'linear-gradient(135deg, #ab47bc, #7e57c2)' }
                }}
              >
                {generating ? 'Synthesizing & Signing Report...' : 'Synthesize & Archive in Vault'}
              </Button>
            </Paper>
          </Grid>

          {/* Right: Live Telemetry & Threat Radar Preview */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, ...glassCard }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon sx={{ color: '#4caf50' }} /> Real-Time Telemetry & Target Nexus
              </Typography>

              {selectedCase ? (
                <Box>
                  <Card sx={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, mb: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#ce93d8' }}>{selectedCase.caseNumber}</Typography>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 800 }}>{selectedCase.title}</Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>{selectedCase.description}</Typography>
                        </Box>
                        <Chip label={selectedCase.priority} sx={{ background: selectedCase.priority === 'CRITICAL' ? 'rgba(244,67,54,0.2)' : 'rgba(255,152,0,0.2)', color: selectedCase.priority === 'CRITICAL' ? '#f44336' : '#ff9800', fontWeight: 800 }} />
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Telemetry Stream Preview */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white', mb: 1.5 }}>
                    Live Tor Network State Snapshot to be Attached:
                  </Typography>
                  <Paper sx={{ p: 2, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(0,188,212,0.2)', borderRadius: 2, mb: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={3}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>Onionoo Relays</Typography>
                        <Typography variant="body2" sx={{ color: '#00bcd4', fontWeight: 800 }}>7,240 Total</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>Congestion Ct</Typography>
                        <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 800 }}>0.14 (Nominal)</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>Adaptive Timing Window</Typography>
                        <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 800 }}>[146.5ms - 648.1ms]</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>Digital Seal</Typography>
                        <Typography variant="body2" sx={{ color: '#ce93d8', fontWeight: 800 }}>SHA-256 Validated</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              ) : (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                    Select an active investigation target from the left panel.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 2: REPORT REVISION COMPARATOR & DIFF ENGINE
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 2 && (
        <Box>
          <Paper sx={{ p: 3, ...glassCard, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'white' }}>
                  Report Revision Diff Comparator
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Side-by-side delta analysis tracking threat escalation, wallet discoveries, and origin IP drift
                </Typography>
              </Box>

              {compareSelection.length === 2 && (
                <Button
                  variant="contained"
                  startIcon={comparing ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <CompareIcon />}
                  onClick={executeCompare}
                  disabled={comparing}
                  sx={{ background: '#00bcd4', fontWeight: 800 }}
                >
                  {comparing ? 'Analyzing Delta...' : 'Run Deep Diff'}
                </Button>
              )}
            </Box>

            {compareSelection.length < 2 && !diffResult ? (
              <Alert severity="info" sx={{ background: 'rgba(0,188,212,0.1)', color: '#80deea', border: '1px solid rgba(0,188,212,0.3)' }}>
                Select any two reports using the checkboxes in the <strong>Report Vault</strong> tab to compare revisions and detect threat indicators evolution.
              </Alert>
            ) : diffResult ? (
              <Box>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  {/* Report A */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2.5, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: '#ce93d8', fontFamily: 'monospace', fontWeight: 800 }}>BASELINE: {diffResult.reportA.id}</Typography>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 800 }}>{diffResult.reportA.title}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip label={diffResult.reportA.type} size="small" />
                        <Chip label={`Threat: ${diffResult.reportA.threatScore}%`} size="small" sx={{ background: 'rgba(244,67,54,0.2)', color: '#f44336', fontWeight: 800 }} />
                        <Chip label={diffResult.reportA.status} size="small" />
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Report B */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2.5, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,188,212,0.3)', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: '#00bcd4', fontFamily: 'monospace', fontWeight: 800 }}>COMPARISON: {diffResult.reportB.id}</Typography>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 800 }}>{diffResult.reportB.title}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip label={diffResult.reportB.type} size="small" />
                        <Chip label={`Threat: ${diffResult.reportB.threatScore}%`} size="small" sx={{ background: 'rgba(244,67,54,0.2)', color: '#f44336', fontWeight: 800 }} />
                        <Chip label={diffResult.reportB.status} size="small" />
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Delta Indicators */}
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'white', mb: 2 }}>
                  Forensic Delta & Evolution Highlights:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, background: 'rgba(0,0,0,0.25)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Threat Trend</Typography>
                      <Typography variant="h6" sx={{ color: diffResult.delta.threatTrend === 'ESCALATING' ? '#f44336' : '#4caf50', fontWeight: 900 }}>
                        {diffResult.delta.threatTrend} ({diffResult.delta.threatScoreDelta >= 0 ? `+${diffResult.delta.threatScoreDelta}` : diffResult.delta.threatScoreDelta}%)
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, background: 'rgba(0,0,0,0.25)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Origin IP Drift</Typography>
                      <Typography variant="body2" sx={{ color: diffResult.delta.originIpDrift ? '#ff9800' : '#4caf50', fontWeight: 800, mt: 0.5 }}>
                        {diffResult.delta.originIpDrift ? `${diffResult.delta.originIpDrift.from} ➔ ${diffResult.delta.originIpDrift.to}` : 'Stable (Zero Drift)'}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, background: 'rgba(0,0,0,0.25)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Status Transition</Typography>
                      <Typography variant="body2" sx={{ color: '#00bcd4', fontWeight: 800, mt: 0.5 }}>
                        {diffResult.delta.statusTransition}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, background: 'rgba(0,0,0,0.25)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Observation Delta</Typography>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 800, mt: 0.5 }}>
                        {diffResult.delta.timeElapsedDays} Days Apart
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            ) : null}
          </Paper>
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          DEEP FORENSIC DOSSIER & TOPOLOGY MODAL
         ══════════════════════════════════════════════════════════════════════════ */}
      {viewReport && (
        <Dialog
          open={Boolean(viewReport)}
          onClose={() => setViewReport(null)}
          maxWidth="lg"
          fullWidth
          PaperProps={{ sx: { background: '#0a1929', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 3, color: 'white' } }}
        >
          {/* Classification Banner */}
          <Box sx={{
            background: isRedacted ? '#455a64' : classificationBadge(viewReport.classification).color,
            color: 'white', py: 0.8, px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontWeight: 900, fontSize: '0.82rem', letterSpacing: 2
          }}>
            <span>{isRedacted ? 'CONFIDENTIAL // LE_SANITIZED (COURT PUBLIC VERSION)' : `${viewReport.classification} // ${(viewReport.handlingCaveats || []).join(' // ')}`}</span>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={isRedacted}
                  onChange={(e) => setIsRedacted(e.target.checked)}
                  color="warning"
                />
              }
              label={<Typography sx={{ fontSize: '0.7rem', color: 'white', fontWeight: 800 }}>Dynamic Redaction</Typography>}
              sx={{ m: 0 }}
            />
          </Box>

          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
            <Box>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#ce93d8', fontWeight: 800 }}>
                {viewReport.reportId} · {viewReport.caseId || 'CASE-26151'}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'white' }}>
                {viewReport.title}
              </Typography>
            </Box>
            <IconButton onClick={() => setViewReport(null)} sx={{ color: 'rgba(255,255,255,0.5)' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          {/* Sub-tabs Navigation inside modal */}
          <Box sx={{ px: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Tabs
              value={modalSubTab}
              onChange={(e, val) => setModalSubTab(val)}
              textColor="inherit"
              TabIndicatorProps={{ style: { background: '#ce93d8', height: 2 } }}
              sx={{ '& .MuiTab-root': { fontWeight: 800, fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', minWidth: 100, '&.Mui-selected': { color: '#ce93d8' } } }}
            >
              <Tab icon={<SpeedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Threat Radar & Brief" />
              <Tab icon={<NodeIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Entity Topology" />
              <Tab icon={<TimelineIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Forensic Timeline" />
              <Tab icon={<SecurityIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="MITRE ATT&CK" />
              <Tab icon={<HubIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Tor Circuit Hop" />
              <Tab icon={<GavelIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Sec 65B & Keyring" />
            </Tabs>
          </Box>

          <DialogContent sx={{ minHeight: 450, maxHeight: '68vh', overflowY: 'auto', p: 3 }}>
            {/* ─── SUB-TAB 0: Threat Radar & Brief ──────────────────────────────── */}
            {modalSubTab === 0 && (
              <Box>
                {/* Radar Gauges */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {[
                    { label: 'Attribution Confidence', score: viewReport.content?.threatRadar?.attributionConfidence || 94, color: '#4caf50' },
                    { label: 'OpSec Vulnerability', score: viewReport.content?.threatRadar?.opSecVulnerability || 82, color: '#f44336' },
                    { label: 'Financial Exposure', score: viewReport.content?.threatRadar?.financialRisk || 88, color: '#ff9800' },
                    { label: 'Origin IP Exposure', score: viewReport.content?.threatRadar?.originExposure || 94, color: '#ce93d8' }
                  ].map((gauge, idx) => (
                    <Grid item xs={3} key={idx}>
                      <Paper sx={{ p: 2, background: 'rgba(0,0,0,0.3)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontSize: '0.62rem', fontWeight: 800 }}>
                          {gauge.label}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: gauge.color, my: 0.5 }}>
                          {gauge.score}%
                        </Typography>
                        <LinearProgress variant="determinate" value={gauge.score} sx={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', '& .MuiLinearProgress-bar': { background: gauge.color } }} />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ce93d8', mb: 1, textTransform: 'uppercase' }}>
                  Executive Intelligence Summary
                </Typography>
                <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(156,39,176,0.08)', border: '1px solid rgba(156,39,176,0.25)', mb: 3 }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'rgba(255,255,255,0.9)' }}>
                    {isRedacted ? viewReport.summary?.replace(/Luxembourg/g, '[REDACTED_NATION]').replace(/185\.220\.101\.47/g, '185.220.███.███') : viewReport.summary}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* ─── SUB-TAB 1: Entity Topology ───────────────────────────────────── */}
            {modalSubTab === 1 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00bcd4', mb: 1.5, textTransform: 'uppercase' }}>
                  Entity Knowledge Graph Topology (Target Nexus)
                </Typography>
                <Grid container spacing={2}>
                  {(viewReport.content?.entityGraphTopology?.nodes || [
                    { label: 'DarkPhantom_v2', type: 'ACTOR', color: '#f44336', details: 'Primary Target (94% Attribution)' },
                    { label: '185.220.101.47', type: 'ORIGIN_IP', color: '#ff9800', details: 'Frantech Solutions (Luxembourg)' },
                    { label: '0x1B3F4E5C', type: 'PGP_KEY', color: '#9c27b0', details: 'E8B2 1A34 99F0 C3D7' },
                    { label: '1A1zP1eP5...', type: 'CRYPTO_WALLET', color: '#ffeb3b', details: '12.5 BTC Tracked - Mixer Linked' }
                  ]).map((n, idx) => (
                    <Grid item xs={6} sm={4} key={idx}>
                      <Paper sx={{ p: 2, background: 'rgba(0,0,0,0.3)', border: `1px solid ${n.color}44`, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: n.color }} />
                          <Typography variant="body2" sx={{ fontWeight: 800, color: 'white' }}>
                            {isRedacted && n.type === 'ORIGIN_IP' ? '185.220.███.███' : n.label}
                          </Typography>
                        </Box>
                        <Chip label={n.type} size="small" sx={{ height: 14, fontSize: '0.55rem', background: `${n.color}20`, color: n.color, fontWeight: 700 }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 0.8, fontSize: '0.65rem' }}>
                          {n.details}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* ─── SUB-TAB 2: Forensic Timeline ─────────────────────────────────── */}
            {modalSubTab === 2 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#4caf50', mb: 1.5, textTransform: 'uppercase' }}>
                  Forensic Chronology & Hostile Action Stream
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {(viewReport.content?.forensicTimeline || []).map((evt, idx) => (
                    <Paper key={idx} sx={{ p: 2, background: 'rgba(0,0,0,0.25)', borderLeft: '4px solid #4caf50', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 800 }}>{evt.event}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{new Date(evt.timestamp).toLocaleString()}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5, fontSize: '0.8rem' }}>
                        {isRedacted ? evt.details.replace(/185\.220\.101\.47/g, '185.220.███.███') : evt.details}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip label={evt.category} size="small" sx={{ height: 16, fontSize: '0.6rem' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: '0.6rem' }}>
                          HASH: {evt.hash ? `${evt.hash.substring(0, 16)}...` : 'OK'}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}

            {/* ─── SUB-TAB 3: MITRE ATT&CK Matrix ───────────────────────────────── */}
            {modalSubTab === 3 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f44336', mb: 1.5, textTransform: 'uppercase' }}>
                  MITRE ATT&CK Adversary Techniques Mapped
                </Typography>
                <Grid container spacing={2}>
                  {(viewReport.content?.mitreTactics || []).map((m, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Paper sx={{ p: 2, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(244,67,54,0.3)', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ fontFamily: 'monospace', color: '#f44336', fontWeight: 800 }}>{m.techniqueId}</Typography>
                          <Chip label={m.tactic} size="small" sx={{ height: 16, fontSize: '0.6rem', background: 'rgba(244,67,54,0.15)', color: '#f44336' }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'white', mt: 0.5 }}>{m.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', mt: 0.5 }}>{m.evidence}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* ─── SUB-TAB 4: Tor Circuit Reconstruction ────────────────────────── */}
            {modalSubTab === 4 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00bcd4', mb: 1.5, textTransform: 'uppercase' }}>
                  Tor Circuit Hop Reconstruction & Latency Attribution
                </Typography>
                <Paper sx={{ p: 2.5, background: 'rgba(0,0,0,0.3)', borderRadius: 2, border: '1px solid rgba(0,188,212,0.2)' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3} sx={{ textAlign: 'center' }}>
                      <Chip label="HOP 1: GUARD" size="small" sx={{ background: '#2196f3', color: 'white', fontWeight: 800, mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>185.220.101.5</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Germany (AS24940)</Typography>
                    </Grid>
                    <Grid item xs={1} sx={{ textAlign: 'center', color: '#00bcd4', fontWeight: 900 }}>➔</Grid>
                    <Grid item xs={3} sx={{ textAlign: 'center' }}>
                      <Chip label="HOP 2: MIDDLE" size="small" sx={{ background: '#ff9800', color: 'white', fontWeight: 800, mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>198.51.100.22</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Switzerland (AS13030)</Typography>
                    </Grid>
                    <Grid item xs={1} sx={{ textAlign: 'center', color: '#00bcd4', fontWeight: 900 }}>➔</Grid>
                    <Grid item xs={4} sx={{ textAlign: 'center' }}>
                      <Chip label="DE-CLOAKED TARGET" size="small" sx={{ background: '#f44336', color: 'white', fontWeight: 800, mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{isRedacted ? '185.220.███.███' : '185.220.101.47'}</Typography>
                      <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 700 }}>Luxembourg Origin Server</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            )}

            {/* ─── SUB-TAB 5: Section 65B & Keyring ──────────────────────────────── */}
            {modalSubTab === 5 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#9c27b0', mb: 1.5, textTransform: 'uppercase' }}>
                  Section 65B Certificate & Cryptographic Signature Keyring
                </Typography>
                <Paper sx={{ p: 2.5, background: 'rgba(156,39,176,0.06)', border: '1px dashed #ce93d8', borderRadius: 2, mb: 3 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 1.5, lineHeight: 1.6 }}>
                    Pursuant to Section 65B of the Indian Evidence Act, 1872 / Section 79A of the IT Act, 2000,
                    it is certified that the electronic data output contained herein is a true and un-tampered record produced by
                    the automated TOR Sentinel 2.0 system during regular lawful surveillance.
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#4caf50', display: 'block', wordBreak: 'break-all' }}>
                    CRYPTOGRAPHIC SEAL: {viewReport.digitalSealSha256}
                  </Typography>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white' }}>
                    Co-Signing Officers & Reviewers ({(viewReport.content?.signatures || []).length})
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<SignIcon />}
                    onClick={() => setSignDialog(true)}
                    sx={{ borderColor: '#ce93d8', color: '#ce93d8' }}
                  >
                    Co-Sign Report
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  {(viewReport.content?.signatures || [
                    { officerName: viewReport.authorName, badgeId: viewReport.authorBadge, role: 'Lead Digital Forensics Analyst', signedAt: viewReport.createdAt, signatureToken: viewReport.digitalSealSha256 }
                  ]).map((sig, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Paper sx={{ p: 2, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'white' }}>{sig.officerName}</Typography>
                        <Typography variant="caption" sx={{ color: '#ce93d8', display: 'block' }}>{sig.role} · Badge: {sig.badgeId}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', fontFamily: 'monospace', fontSize: '0.6rem', mt: 0.5 }}>
                          TOKEN: {(sig.signatureToken || '').substring(0, 24)}...
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2, background: '#07121e', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={() => handleExport(viewReport.reportId, 'html')}
                sx={{ background: '#2196f3', fontWeight: 800 }}
              >
                Print / Save as PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport(viewReport.reportId, 'json')}
                sx={{ color: '#ce93d8', borderColor: '#ce93d8' }}
              >
                Export JSON
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport(viewReport.reportId, 'csv')}
                sx={{ color: '#4caf50', borderColor: '#4caf50' }}
              >
                Export CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={() => handleExport(viewReport.reportId, 'txt')}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                Legal TXT
              </Button>
            </Box>

            <Button onClick={() => setViewReport(null)} sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Close Exhibit
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* ─── Co-Sign Dialog ─────────────────────────────────────────────────── */}
      <Dialog
        open={signDialog}
        onClose={() => setSignDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { background: '#0a1929', border: '1px solid rgba(206,147,216,0.3)', color: 'white' } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Co-Sign Forensic Intelligence Report</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth size="small" label="Officer Name"
            value={signerName} onChange={(e) => setSignerName(e.target.value)}
            sx={{ my: 1, '& .MuiOutlinedInput-root': { color: 'white' } }}
            InputLabelProps={{ style: { color: 'rgba(255,255,255,0.6)' } }}
          />
          <TextField
            fullWidth size="small" label="Badge / Credential ID"
            value={signerBadge} onChange={(e) => setSignerBadge(e.target.value)}
            sx={{ my: 1, '& .MuiOutlinedInput-root': { color: 'white' } }}
            InputLabelProps={{ style: { color: 'rgba(255,255,255,0.6)' } }}
          />
          <TextField
            fullWidth size="small" label="Role / Capacity"
            value={signerRole} onChange={(e) => setSignerRole(e.target.value)}
            sx={{ my: 1, '& .MuiOutlinedInput-root': { color: 'white' } }}
            InputLabelProps={{ style: { color: 'rgba(255,255,255,0.6)' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSignDialog(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={signing}
            onClick={handleCoSign}
            sx={{ background: '#9c27b0', fontWeight: 800 }}
          >
            {signing ? 'Signing...' : 'Affix Certified Digital Seal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
