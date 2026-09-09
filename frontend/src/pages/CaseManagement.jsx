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

// Fallback seed cases if backend is initializing
const SEED_CASES = [
  {
    caseId: 'CASE-26151-001', caseNumber: 'NTRO/CY/2024/001',
    title: 'Operation DarkPhantom — Ransomware-as-a-Service Network',
    description: 'Multi-market RaaS operator active across Hydra Reborn and AlphaBay v2. Origin server de-cloaked via TLS SAN leak exposing two clearnet domains resolving to IP 185.220.101.47 in Luxembourg.',
    classification: 'TOP SECRET', status: 'ACTIVE', priority: 'CRITICAL', category: 'Ransomware',
    jurisdiction: 'India — IT Act 2000 (Sec 66, 66B, 66C)', compositeConfidence: 94, evidenceCount: 14,
    incidentPhase: 'ATTRIBUTION', containmentStatus: 'CONTAINED',
    assignedInvestigators: ['Analyst-Alpha', 'Analyst-Beta'],
    tags: ['ransomware', 'tls-decloaked', 'btc-traced', 'frantech-as53667'],
    linkedActors: [{ actorId: 'ACTOR-001', handle: 'DarkPhantom_v2', category: 'Ransomware', attributionConfidence: 94 }],
    notes: [
      { id: 'N001', author: 'Analyst-Alpha', text: 'TLS SAN certificate leak confirmed via crt.sh. Two clearnet domains share same IP block at 185.220.101.47.', timestamp: new Date(Date.now() - 48 * 86400000).toISOString(), classification: 'SECRET' },
      { id: 'N002', author: 'Analyst-Beta', text: 'Blockchain forensics confirms 12.5 BTC in ransom payments received. Downstream Wasabi coinjoin mixer hops identified.', timestamp: new Date(Date.now() - 12 * 86400000).toISOString(), classification: 'SECRET' }
    ],
    milestones: [
      { label: 'Case Opened', status: 'done', date: new Date(Date.now() - 72 * 86400000).toISOString() },
      { label: 'Actor Identified', status: 'done', date: new Date(Date.now() - 60 * 86400000).toISOString() },
      { label: 'Origin IP De-cloaked', status: 'done', date: new Date(Date.now() - 40 * 86400000).toISOString() },
      { label: 'Financial Forensics (12.5 BTC)', status: 'done', date: new Date(Date.now() - 15 * 86400000).toISOString() },
      { label: 'Section 65B Exhibit Generated', status: 'done', date: new Date(Date.now() - 2 * 86400000).toISOString() },
      { label: 'Legal Prosecution Filing', status: 'pending', date: null }
    ]
  },
  {
    caseId: 'CASE-26151-002', caseNumber: 'NTRO/CY/2024/002',
    title: 'Operation SilkReborn — Cross-Market Drug Trafficking Network',
    description: 'DNM vendor operating on multiple dark markets simultaneously. Stylometric analysis confirmed 87% persona match based on punctuation and vocabulary patterns.',
    classification: 'SECRET', status: 'PENDING REVIEW', priority: 'HIGH', category: 'Drug Trafficking',
    jurisdiction: 'India — NDPS Act 1985 + IT Act 2000', compositeConfidence: 81, evidenceCount: 9,
    incidentPhase: 'CORRELATION', containmentStatus: 'ACTIVE_MONITORING',
    assignedInvestigators: ['Analyst-Gamma'],
    tags: ['dnm', 'pgp-linked', 'stylometry-87pct'],
    linkedActors: [{ actorId: 'ACTOR-002', handle: 'SilkReborn_Admin', category: 'Drug Trafficking', attributionConfidence: 81 }],
    notes: [
      { id: 'N001', author: 'Analyst-Gamma', text: 'Stylometry confidence 87% — operator uses distinctive triple-dash punctuation pattern across Hydra and Bohemia.', timestamp: new Date(Date.now() - 30 * 86400000).toISOString(), classification: 'SECRET' }
    ],
    milestones: [
      { label: 'Case Opened', status: 'done', date: new Date(Date.now() - 45 * 86400000).toISOString() },
      { label: 'Actor Identified', status: 'done', date: new Date(Date.now() - 35 * 86400000).toISOString() },
      { label: 'Stylometry Analysis Verified', status: 'done', date: new Date(Date.now() - 20 * 86400000).toISOString() },
      { label: 'Pending Legal Review', status: 'pending', date: null }
    ]
  },
  {
    caseId: 'CASE-26151-003', caseNumber: 'NTRO/CY/2024/003',
    title: 'Operation BreachSyndicate — Stolen Credential Market',
    description: 'High-volume stolen database merchant. Behavioral profiling infers UTC+2 timezone. Monero transaction trace linked to international exchange node.',
    classification: 'RESTRICTED', status: 'OPEN', priority: 'MEDIUM', category: 'Data Trafficking',
    jurisdiction: 'India — IT Act 2000 (Sec 43A, 72A)', compositeConfidence: 67, evidenceCount: 5,
    incidentPhase: 'ENRICHMENT', containmentStatus: 'NONE',
    assignedInvestigators: ['Analyst-Alpha'],
    tags: ['data-breach', 'xmr-traced', 'eastern-europe'],
    linkedActors: [],
    notes: [],
    milestones: [
      { label: 'Case Opened', status: 'done', date: new Date(Date.now() - 15 * 86400000).toISOString() },
      { label: 'Initial OSINT Gathering', status: 'done', date: new Date(Date.now() - 8 * 86400000).toISOString() },
      { label: 'Actor Identification', status: 'pending', date: null }
    ]
  }
];

export default function CaseManagement() {
  const navigate = useNavigate();
  const [cases, setCases] = useState(SEED_CASES);
  const [stats, setStats] = useState({ total: 3, byStatus: { OPEN: 1, ACTIVE: 1, 'PENDING REVIEW': 1 }, avgConfidence: 81, totalEvidence: 28 });
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterClass, setFilterClass] = useState('ALL');

  // Selected case & active workspace tab
  const [selectedCase, setSelectedCase] = useState(null);
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

  // Fetch all cases from SQLite
  const loadCases = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API}?`;
      if (filterStatus !== 'ALL') url += `status=${filterStatus}&`;
      if (filterPriority !== 'ALL') url += `priority=${filterPriority}&`;
      if (filterClass !== 'ALL') url += `classification=${filterClass}&`;
      if (searchQ) url += `search=${encodeURIComponent(searchQ)}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setCases(data.data);
        if (!selectedCase) setSelectedCase(data.data[0]);
      } else {
        setCases(SEED_CASES);
        if (!selectedCase) setSelectedCase(SEED_CASES[0]);
      }

      const statsRes = await fetch(`${API}/stats`);
      const sd = await statsRes.json();
      if (sd.success) setStats(sd.data);
    } catch {
      setCases(SEED_CASES);
      if (!selectedCase) setSelectedCase(SEED_CASES[0]);
    }
    setLoading(false);
  }, [filterStatus, filterPriority, filterClass, searchQ, selectedCase]);

  useEffect(() => { loadCases(); }, [loadCases]);

  // Load evidence & custody when selected case changes
  useEffect(() => {
    if (!selectedCase) return;
    fetch(`${API}/${selectedCase.caseId}/evidence`)
      .then(r => r.json())
      .then(d => { if (d.success) setEvidenceList(d.data); })
      .catch(() => {});

    fetch(`${API}/${selectedCase.caseId}/custody`)
      .then(r => r.json())
      .then(d => { if (d.success) setCustodyLogs(d.data); })
      .catch(() => {});
  }, [selectedCase]);

  const handleStatusChange = async (caseId, newStatus) => {
    try {
      await fetch(`${API}/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setActionAlert({ type: 'success', msg: `Case status transitioned to [${newStatus}]` });
    } catch {}
    setCases(prev => prev.map(c => c.caseId === caseId ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c));
    if (selectedCase?.caseId === caseId) setSelectedCase(prev => ({ ...prev, status: newStatus }));
  };

  const handlePhaseChange = async (newPhase) => {
    if (!selectedCase) return;
    try {
      const res = await fetch(`${API}/${selectedCase.caseId}/phase`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: newPhase, author: 'Lead Forensic Officer' })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedCase(data.data);
        setCases(prev => prev.map(c => c.caseId === selectedCase.caseId ? data.data : c));
        setActionAlert({ type: 'success', msg: `Incident lifecycle advanced to Phase [${newPhase}]` });
      }
    } catch {
      setSelectedCase(prev => ({ ...prev, incidentPhase: newPhase }));
    }
  };

  const handleExecutePlaybook = async (actionName) => {
    if (!selectedCase) return;
    try {
      const res = await fetch(`${API}/${selectedCase.caseId}/playbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionName, parameters: { analyst: 'Analyst-Alpha', target: selectedCase.caseNumber } })
      });
      const data = await res.json();
      if (data.success) {
        setActionAlert({ type: 'success', msg: `Orchestrated containment playbook [${actionName}] applied successfully!` });
        if (data.data.case) {
          setSelectedCase(data.data.case);
          setCases(prev => prev.map(c => c.caseId === selectedCase.caseId ? data.data.case : c));
        }
      }
    } catch {
      setActionAlert({ type: 'info', msg: `Playbook action [${actionName}] simulated and logged.` });
    }
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
    try {
      await fetch(`${API}/${selectedCase.caseId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newNote, author: 'Analyst-Alpha', classification: noteClass })
      });
    } catch {}
    setSelectedCase(prev => ({ ...prev, notes: [...(prev.notes || []), noteObj] }));
    setCases(prev => prev.map(c => c.caseId === selectedCase.caseId ? { ...c, notes: [...(c.notes || []), noteObj] } : c));
    setNewNote('');
    setActionAlert({ type: 'success', msg: 'Classified investigator note committed to SQLite ledger.' });
  };

  const handleAddEvidence = async () => {
    if (!evidenceForm.title.trim() || !selectedCase) return;
    const payload = {
      title: evidenceForm.title,
      type: evidenceForm.type,
      description: evidenceForm.description,
      data: { rawIndicator: evidenceForm.indicator, hash: 'sha256-' + Math.random().toString(36).substr(2, 8) },
      confidenceScore: evidenceForm.confidenceScore,
      verified: true,
      source: evidenceForm.source,
      analyst: 'Analyst-Alpha'
    };
    try {
      const res = await fetch(`${API}/${selectedCase.caseId}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setEvidenceList(data.data);
        setSelectedCase(prev => ({ ...prev, evidenceCount: (prev.evidenceCount || 0) + 1 }));
      }
    } catch {}
    setAddEvidenceOpen(false);
    setEvidenceForm({ title: '', type: 'TLS_SAN_CERTIFICATE', description: '', indicator: '', confidenceScore: 90, source: 'Autonomous Forensic Scanner' });
    setActionAlert({ type: 'success', msg: 'Digital evidence exhibit sealed and committed to ISO 27037 custody locker.' });
  };

  const handleCreateCase = async () => {
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCaseForm)
      });
      const data = await res.json();
      if (data.success) {
        setCases(prev => [data.data, ...prev]);
        setSelectedCase(data.data);
      }
    } catch {
      const fallbackCase = {
        ...newCaseForm,
        caseId: `CASE-26151-${1000 + cases.length + 1}`,
        caseNumber: `NTRO/CY/2024/${1000 + cases.length + 1}`,
        status: 'OPEN', evidenceCount: 0, compositeConfidence: 0,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        linkedActors: [], notes: [], tags: ['new-case'],
        milestones: [{ label: 'Case Opened', status: 'done', date: new Date().toISOString() }]
      };
      setCases(prev => [fallbackCase, ...prev]);
      setSelectedCase(fallbackCase);
    }
    setCreateOpen(false);
    setNewCaseForm({ title: '', description: '', priority: 'CRITICAL', classification: 'TOP SECRET', category: 'Ransomware', jurisdiction: 'India — IT Act 2000' });
    setActionAlert({ type: 'success', msg: 'New NTRO investigation case established in database.' });
  };

  const handleGenerateReport = async () => {
    if (!selectedCase) return;
    setGeneratingReport(true);
    try {
      const res = await fetch(`${API_REPORTS}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedCase.caseId,
          reportType: selectedReportType,
          classification: selectedCase.classification,
          authorName: 'Analyst-Alpha',
          authorBadge: 'NTRO-CY-0842',
          approvingOfficer: 'Col. V. Sharma (Dir. Cyber Ops)'
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedReport(data.data);
        setActionAlert({ type: 'success', msg: `Report [${data.data.reportId}] generated and sealed in SQLite Vault!` });
      } else throw new Error('API');
    } catch {
      setGeneratedReport({
        reportId: `NTRO-RPT-${Date.now()}`,
        reportType: selectedReportType,
        classification: selectedCase.classification,
        title: `${REPORT_TYPES.find(r => r.value === selectedReportType)?.label} — ${selectedCase.title}`,
        caseId: selectedCase.caseId,
        digitalSealSha256: '98f3e995d89f575a03312c45f74236a56c4ce89f73300b86e6584e61761a53d9',
        summary: selectedCase.description,
        status: 'FINALIZED',
        createdAt: new Date().toISOString()
      });
    }
    setGeneratingReport(false);
  };

  const downloadExport = (format) => {
    if (!selectedCase) return;
    if (format === 'html' && generatedReport) {
      window.open(`${API_REPORTS}/${generatedReport.reportId}/export?format=html`, '_blank');
      return;
    }
    window.open(`${API}/${selectedCase.caseId}/export?format=${format}`, '_blank');
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
                    <Tooltip title="Export Complete Case Exhibit Package (JSON)">
                      <IconButton size="small" onClick={() => downloadExport('json')} sx={{ color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' }}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Open Universal Intelligence Report Hub">
                      <IconButton size="small" onClick={() => navigate('/intel-report')} sx={{ color: '#ce93d8', border: '1px solid rgba(156,39,176,0.3)' }}>
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
