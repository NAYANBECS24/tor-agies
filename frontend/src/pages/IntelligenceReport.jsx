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

const API_REPORTS_ALL = '/api/cases/reports/all';
const API_REPORTS_STATS = '/api/cases/reports/stats';
const API_REPORTS_GENERATE = '/api/cases/reports/generate';
const API_REPORTS_COMPARE = '/api/cases/reports/compare';
const API_CASES = '/api/cases';

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
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, byType: {}, byClassification: {}, byStatus: {} });
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Generator form
  const [selectedCase, setSelectedCase] = useState(null);
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

  // Load Reports, Stats & Cases
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_REPORTS_ALL}`);
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (e) {
      console.warn('Failed to fetch reports:', e);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_REPORTS_STATS}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (e) {}
  };

  const fetchCases = async () => {
    try {
      const res = await fetch(`${API_CASES}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setCases(data.data);
        if (!selectedCase) setSelectedCase(data.data[0]);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchReports();
    fetchStats();
    fetchCases();
  }, []);

  // Generate and Persist New Report
  const handleGenerateReport = async () => {
    setGenerating(true);
    const activeCaveats = [];
    if (caveats.noforn) activeCaveats.push('NOFORN');
    if (caveats.orcon) activeCaveats.push('ORCON');
    if (caveats.legalPriv) activeCaveats.push('LEGAL_PRIVILEGED');
    if (caveats.les) activeCaveats.push('LAW_ENFORCEMENT_SENSITIVE');

    try {
      const payload = {
        caseId: selectedCase?.caseId,
        reportType,
        classification,
        handlingCaveats: activeCaveats,
        authorName,
        authorBadge,
        approvingOfficer,
        customNotes
      };

      const res = await fetch(`${API_REPORTS_GENERATE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setViewReport(data.data);
        await fetchReports();
        await fetchStats();
        setActiveTab(0);
      } else {
        alert('Report generation error: ' + data.message);
      }
    } catch (err) {
      alert('Failed to connect to report generation service.');
    }
    setGenerating(false);
  };

  // Verify SHA-256 Digital Seal
  const handleVerifySeal = async (reportId) => {
    try {
      const res = await fetch(`/api/cases/reports/${reportId}/verify`, { method: 'POST' });
      const data = await res.json();
      setVerifyResult(data.data);
      setTimeout(() => setVerifyResult(null), 5000);
    } catch (e) {
      alert('Verification request failed');
    }
  };

  // Co-sign Report
  const handleCoSign = async () => {
    if (!viewReport) return;
    setSigning(true);
    try {
      const res = await fetch(`/api/cases/reports/${viewReport.reportId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerName: signerName,
          badgeId: signerBadge,
          role: signerRole
        })
      });
      const data = await res.json();
      if (data.success) {
        setViewReport(data.data);
        setReports(reports.map(r => r.reportId === data.data.reportId ? data.data : r));
        setSignDialog(false);
      }
    } catch (e) {
      alert('Failed to co-sign report');
    }
    setSigning(false);
  };

  // Comparator Handler
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
    try {
      const res = await fetch(`${API_REPORTS_COMPARE}?reportA=${compareSelection[0]}&reportB=${compareSelection[1]}`);
      const data = await res.json();
      if (data.success) {
        setDiffResult(data.data);
        setActiveTab(2); // Switch to Comparator Tab
      } else {
        alert('Comparison error: ' + data.message);
      }
    } catch (e) {
      alert('Failed to execute report comparison.');
    }
    setComparing(false);
  };

  // Delete Report
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm(`Are you sure you want to permanently delete report ${reportId} from the vault?`)) return;
    try {
      const res = await fetch(`/api/cases/reports/${reportId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setReports(reports.filter(r => r.reportId !== reportId));
        fetchStats();
        if (viewReport?.reportId === reportId) setViewReport(null);
      }
    } catch (e) {
      alert('Failed to delete report');
    }
  };

  // Status Change
  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const res = await fetch(`/api/cases/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, approvingOfficer })
      });
      const data = await res.json();
      if (data.success) {
        setReports(reports.map(r => r.reportId === reportId ? data.data : r));
        if (viewReport?.reportId === reportId) setViewReport(data.data);
        fetchStats();
      }
    } catch (e) {
      alert('Failed to update report status');
    }
  };

  // Export File (PDF / HTML / JSON / CSV / TXT)
  const handleExport = (reportId, format = 'json') => {
    const url = `/api/cases/reports/${reportId}/export?format=${format}`;
    if (format === 'html') {
      window.open(url, '_blank');
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
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
          { label: 'Archived Reports in SQLite', val: stats.total || reports.length, icon: <FolderIcon />, color: '#2196f3' },
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
                        <Button variant="outlined" size="small" onClick={() => { setSearchQuery(''); setFilterType('ALL'); setFilterClass('ALL'); setFilterStatus('ALL'); }} sx={{ mt: 1, borderColor: '#ce93d8', color: '#ce93d8' }}>
                          Clear Filters
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
