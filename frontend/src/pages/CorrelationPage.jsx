import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Select, MenuItem, FormControl, InputLabel,
  Switch, FormControlLabel, CircularProgress, IconButton, Tooltip,
  Slider, Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab, Avatar, Badge, Divider, Alert
} from '@mui/material';
import {
  PlayArrow as PlayIcon, Refresh as RefreshIcon, Warning as WarningIcon,
  Error as ErrorIcon, CheckCircle as CheckCircleIcon, Timeline as TimelineIcon,
  Download as DownloadIcon, Insights as InsightsIcon, Link as LinkIcon,
  BubbleChart as BubbleChartIcon, Security as SecurityIcon,
  NetworkCheck as NetworkCheckIcon, Hub as HubIcon, FlashOn as FlashIcon,
  TrendingUp as TrendingUpIcon, Bolt as BoltIcon, Analytics as AnalyticsIcon,
  Shield as ShieldIcon, Visibility as VisibilityIcon, Block as BlockIcon,
  FiberManualRecord as DotIcon, NotificationsActive as AlertActiveIcon
} from '@mui/icons-material';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_PATTERNS = [
  { id: 'C001', ruleName: 'DDoS Flood Pattern', source: '192.168.1.50', eventCount: 1247, confidence: 0.97, severity: 'critical', detectedAt: new Date().toISOString(), description: 'Coordinated SYN flood from botnet cluster. 1,247 packets/sec exceeding threshold.', affectedNodes: ['ExitNode-03', 'GuardNode-01', 'RelayNode-42'], protocol: 'TCP/SYN', duration: '14m 32s', blockedAt: '14:23:07', country: 'RU' },
  { id: 'C002', ruleName: 'Port Scan Sweep', source: '10.0.0.23', eventCount: 892, confidence: 0.89, severity: 'high', detectedAt: new Date(Date.now() - 300000).toISOString(), description: 'Sequential TCP port scan across /24 subnet. Classic reconnaissance phase.', affectedNodes: ['GuardNode-01', 'DNSResolver-02'], protocol: 'TCP', duration: '6m 18s', blockedAt: '14:19:44', country: 'CN' },
  { id: 'C003', ruleName: 'Data Exfiltration', source: 'SuspNode-44B', eventCount: 341, confidence: 0.83, severity: 'critical', detectedAt: new Date(Date.now() - 600000).toISOString(), description: 'Large encrypted payload transfer to external C2 server. 2.4GB in 6 minutes.', affectedNodes: ['ExitNode-01', 'RelayNode-88', 'ExitNode-07'], protocol: 'HTTPS/TLS', duration: '6m 02s', blockedAt: '14:14:15', country: 'KP' },
  { id: 'C004', ruleName: 'DNS Tunneling', source: 'MaliciousUser-7', eventCount: 2840, confidence: 0.91, severity: 'high', detectedAt: new Date(Date.now() - 900000).toISOString(), description: 'Data exfiltration via DNS TXT queries. Encoded payload in subdomain labels.', affectedNodes: ['DNSResolver-01', 'RelayNode-42'], protocol: 'DNS/UDP', duration: '22m 10s', blockedAt: '14:07:57', country: 'IR' },
  { id: 'C005', ruleName: 'Brute Force Auth', source: '203.0.113.99', eventCount: 4210, confidence: 0.95, severity: 'high', detectedAt: new Date(Date.now() - 1200000).toISOString(), description: 'Credential stuffing attack against hidden service. 4,210 attempts from 38 IPs.', affectedNodes: ['HSNode-12', 'RelayNode-55'], protocol: 'HTTPS', duration: '31m 45s', blockedAt: '14:02:22', country: 'UA' },
  { id: 'C006', ruleName: 'MITM Interception', source: 'RelayNode-66', eventCount: 78, confidence: 0.76, severity: 'critical', detectedAt: new Date(Date.now() - 1800000).toISOString(), description: 'Suspected SSL stripping on compromised relay. Certificate anomaly detected.', affectedNodes: ['RelayNode-66', 'ExitNode-09'], protocol: 'TLS', duration: '8m 55s', blockedAt: '13:47:12', country: 'BY' },
  { id: 'C007', ruleName: 'Tor Circuit Flood', source: 'BotNet-Cluster', eventCount: 6700, confidence: 0.88, severity: 'high', detectedAt: new Date(Date.now() - 2400000).toISOString(), description: 'Rapid Tor circuit creation overwhelming directory servers. Sybil attack vector.', affectedNodes: ['DirServer-01', 'DirServer-02', 'GuardNode-05'], protocol: 'Tor', duration: '41m 20s', blockedAt: '13:31:47', country: 'Various' },
  { id: 'C008', ruleName: 'Lateral Movement', source: '172.16.10.5', eventCount: 156, confidence: 0.79, severity: 'medium', detectedAt: new Date(Date.now() - 3600000).toISOString(), description: 'Internal network traversal using compromised credentials. Multiple host pivots.', affectedNodes: ['RelayNode-12', 'RelayNode-34', 'RelayNode-78'], protocol: 'SSH/SMB', duration: '55m 33s', blockedAt: '13:15:04', country: 'Internal' },
];

const MOCK_RULES = [
  { name: 'DDoS Flood', threshold: '500 pkt/s', severity: 'critical', enabled: true, hits: 1247, accuracy: 97 },
  { name: 'Port Scan', threshold: '50 ports/min', severity: 'high', enabled: true, hits: 892, accuracy: 91 },
  { name: 'Data Exfil', threshold: '100MB/5min', severity: 'critical', enabled: true, hits: 341, accuracy: 86 },
  { name: 'DNS Tunnel', threshold: '500 TXT/min', severity: 'high', enabled: true, hits: 2840, accuracy: 93 },
  { name: 'Brute Force', threshold: '10 fail/min', severity: 'high', enabled: true, hits: 4210, accuracy: 98 },
  { name: 'MITM Detect', threshold: 'Cert anomaly', severity: 'critical', enabled: true, hits: 78, accuracy: 79 },
  { name: 'Sybil Attack', threshold: '100 circ/min', severity: 'high', enabled: false, hits: 6700, accuracy: 90 },
  { name: 'Anomaly Stat', threshold: '3σ deviation', severity: 'medium', enabled: true, hits: 156, accuracy: 74 },
];

const TIMELINE_EVENTS = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  critical: Math.floor(Math.random() * 8),
  high: Math.floor(Math.random() * 15),
  medium: Math.floor(Math.random() * 20),
}));

const NODE_GRAPH = [
  { id: 'G01', type: 'Guard', x: 20, y: 35, connections: ['R42', 'R88', 'R12'], risk: 'low', bandwidth: '1.2 GB/s' },
  { id: 'G05', type: 'Guard', x: 18, y: 65, connections: ['R55', 'R34'], risk: 'medium', bandwidth: '0.8 GB/s' },
  { id: 'R42', type: 'Relay', x: 42, y: 25, connections: ['E03', 'E07'], risk: 'high', bandwidth: '2.1 GB/s' },
  { id: 'R88', type: 'Relay', x: 45, y: 50, connections: ['E01', 'E09'], risk: 'critical', bandwidth: '3.4 GB/s' },
  { id: 'R12', type: 'Relay', x: 40, y: 75, connections: ['E07'], risk: 'low', bandwidth: '0.6 GB/s' },
  { id: 'R55', type: 'Relay', x: 50, y: 85, connections: ['E01'], risk: 'medium', bandwidth: '1.1 GB/s' },
  { id: 'R34', type: 'Relay', x: 55, y: 68, connections: ['E09'], risk: 'low', bandwidth: '0.9 GB/s' },
  { id: 'E03', type: 'Exit', x: 75, y: 20, connections: [], risk: 'critical', bandwidth: '4.2 GB/s' },
  { id: 'E01', type: 'Exit', x: 78, y: 48, connections: [], risk: 'critical', bandwidth: '5.1 GB/s' },
  { id: 'E07', type: 'Exit', x: 74, y: 72, connections: [], risk: 'high', bandwidth: '2.8 GB/s' },
  { id: 'E09', type: 'Exit', x: 80, y: 90, connections: [], risk: 'medium', bandwidth: '1.7 GB/s' },
];

const sevColor = { critical: '#ef5350', high: '#ff9800', medium: '#ffd740', low: '#66bb6a' };
const sevBg = { critical: 'rgba(239,83,80,0.12)', high: 'rgba(255,152,0,0.12)', medium: 'rgba(255,215,64,0.10)', low: 'rgba(102,187,106,0.12)' };
const nodeColor = { Guard: '#42a5f5', Relay: '#ab47bc', Exit: '#ef5350', DNS: '#26a69a' };

// ─── Sparkline Component ──────────────────────────────────────────────────────
function Sparkline({ data, color = '#2196f3', height = 36 }) {
  const max = Math.max(...data, 1);
  const w = 120, h = height;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <polyline
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`${color}22`}
        stroke="none"
      />
    </svg>
  );
}

// ─── Node Graph Canvas ────────────────────────────────────────────────────────
function NodeGraph({ nodes, selectedNode, onSelect }) {
  const canvasRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    nodes.forEach(node => {
      node.connections.forEach(connId => {
        const target = nodes.find(n => n.id === connId);
        if (!target) return;
        const x1 = (node.x / 100) * W, y1 = (node.y / 100) * H;
        const x2 = (target.x / 100) * W, y2 = (target.y / 100) * H;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        const isRisky = node.risk === 'critical' || target.risk === 'critical';
        ctx.strokeStyle = isRisky ? 'rgba(239,83,80,0.4)' : 'rgba(33,150,243,0.2)';
        ctx.lineWidth = isRisky ? 1.5 : 1;
        if (isRisky) ctx.setLineDash([4, 4]);
        else ctx.setLineDash([]);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    });

    // Draw nodes
    nodes.forEach(node => {
      const x = (node.x / 100) * W, y = (node.y / 100) * H;
      const r = node.type === 'Guard' ? 14 : node.type === 'Exit' ? 16 : 12;
      const color = nodeColor[node.type] || '#90caf9';
      const isSelected = selectedNode === node.id;

      // Glow for critical/selected
      if (node.risk === 'critical' || isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, r + 8, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? 'rgba(33,150,243,0.15)' : 'rgba(239,83,80,0.12)';
        ctx.fill();
      }

      // Outer ring
      ctx.beginPath();
      ctx.arc(x, y, r + 2, 0, Math.PI * 2);
      ctx.strokeStyle = sevColor[node.risk] || color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Node fill
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color + '33';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.font = `bold 9px 'JetBrains Mono', monospace`;
      ctx.fillStyle = '#e3f2fd';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.id, x, y);
    });
  }, [nodes, selectedNode]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const W = canvas.width, H = canvas.height;
    const hit = nodes.find(n => {
      const x = (n.x / 100) * W, y = (n.y / 100) * H;
      return Math.hypot(cx - x, cy - y) < 18;
    });
    if (hit) onSelect(hit.id === selectedNode ? null : hit.id);
  };

  return (
    <canvas
      ref={canvasRef}
      width={520}
      height={300}
      onClick={handleClick}
      style={{ width: '100%', height: '100%', cursor: 'pointer', borderRadius: '8px' }}
    />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const CorrelationPage = () => {
  const [tab, setTab] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [threshold, setThreshold] = useState(0.7);
  const [timeframe, setTimeframe] = useState(60000);
  const [realTime, setRealTime] = useState(true);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [ticker, setTicker] = useState(0);
  const [rules, setRules] = useState(MOCK_RULES);
  const [filterSev, setFilterSev] = useState('all');

  // Live tick for animated counters
  useEffect(() => {
    const id = setInterval(() => setTicker(t => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const sparkData = Array.from({ length: 12 }, () => Math.floor(Math.random() * 80) + 20);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise(r => setTimeout(r, 2200));
    setIsAnalyzing(false);
  };

  const handleExport = () => {
    const data = JSON.stringify(MOCK_PATTERNS, null, 2);
    const el = document.createElement('a');
    el.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(data);
    el.download = `correlation_export_${Date.now()}.json`;
    el.click();
  };

  const filteredPatterns = filterSev === 'all' ? MOCK_PATTERNS : MOCK_PATTERNS.filter(p => p.severity === filterSev);
  const selectedNodeData = NODE_GRAPH.find(n => n.id === selectedNode);

  const statCards = [
    { label: 'Total Patterns', value: MOCK_PATTERNS.length, icon: <InsightsIcon />, color: '#2196f3', spark: true },
    { label: 'Critical Threats', value: MOCK_PATTERNS.filter(p => p.severity === 'critical').length, icon: <ErrorIcon />, color: '#ef5350', spark: true },
    { label: 'Avg Confidence', value: `${(MOCK_PATTERNS.reduce((a, p) => a + p.confidence, 0) / MOCK_PATTERNS.length * 100).toFixed(1)}%`, icon: <CheckCircleIcon />, color: '#66bb6a', spark: false },
    { label: 'Detection Rate', value: '94.7%', icon: <ShieldIcon />, color: '#ab47bc', spark: false },
    { label: 'Events/Hour', value: (MOCK_PATTERNS.reduce((a, p) => a + p.eventCount, 0)).toLocaleString(), icon: <BoltIcon />, color: '#ff9800', spark: true },
    { label: 'Active Rules', value: `${rules.filter(r => r.enabled).length}/${rules.length}`, icon: <NetworkCheckIcon />, color: '#26a69a', spark: false },
  ];

  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: 'linear-gradient(180deg, #050f1a 0%, #0a1929 100%)' }}>

      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <HubIcon sx={{ color: '#2196f3', fontSize: 32 }} />
            <Typography variant="h4" sx={{
              fontWeight: 800, letterSpacing: 1,
              background: 'linear-gradient(90deg, #42a5f5, #ab47bc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              Correlation Engine
            </Typography>
            <Chip
              label="LIVE"
              size="small"
              icon={<DotIcon sx={{ fontSize: '10px !important', color: '#66bb6a !important', animation: 'pulse 1.5s infinite' }} />}
              sx={{ background: 'rgba(102,187,106,0.12)', border: '1px solid rgba(102,187,106,0.3)', color: '#66bb6a', fontSize: '10px', height: 22 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Advanced multi-source threat correlation, pattern analysis & real-time node graph — NTRO PS-26151
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControlLabel
            control={<Switch checked={realTime} onChange={e => setRealTime(e.target.checked)} size="small" color="primary" />}
            label={<Typography variant="caption" color="text.secondary">Real-time</Typography>}
          />
          <Tooltip title="Export JSON">
            <IconButton onClick={handleExport} size="small" sx={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={() => setTicker(t => t + 1)}>
            Refresh
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={isAnalyzing ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <PlayIcon />}
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            sx={{ background: 'linear-gradient(135deg, #1565c0, #7b1fa2)', boxShadow: '0 4px 20px rgba(33,150,243,0.3)' }}
          >
            {isAnalyzing ? 'Analyzing…' : 'Run Correlation'}
          </Button>
        </Box>
      </Box>

      {/* ── Stat Cards ── */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map((s, i) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
            <Card sx={{
              background: `linear-gradient(135deg, ${s.color}15 0%, ${s.color}06 100%)`,
              border: `1px solid ${s.color}30`,
              p: 0, height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${s.color}25` }
            }}>
              <CardContent sx={{ p: '16px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ p: 0.8, borderRadius: '8px', background: `${s.color}20`, color: s.color, display: 'flex' }}>
                    {React.cloneElement(s.icon, { sx: { fontSize: 18 } })}
                  </Box>
                  {s.spark && <Sparkline data={sparkData} color={s.color} height={28} />}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: s.color, fontFamily: '"JetBrains Mono", monospace' }}>
                  {s.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                  {s.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Alert Banner ── */}
      <Alert
        severity="error"
        icon={<AlertActiveIcon />}
        sx={{ mb: 3, background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.25)', borderRadius: 2 }}
        action={
          <Button size="small" color="error" variant="outlined" sx={{ fontSize: '10px' }}>
            Investigate
          </Button>
        }
      >
        <strong>3 CRITICAL correlations</strong> detected in the last 15 minutes — DDoS Flood, Data Exfiltration, and MITM Interception require immediate attention.
      </Alert>

      {/* ── Tabs ── */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': { fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', minHeight: 40 },
          '& .MuiTabs-indicator': { background: 'linear-gradient(90deg, #2196f3, #ab47bc)', height: 3, borderRadius: 2 },
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Tab icon={<InsightsIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Patterns" />
        <Tab icon={<BubbleChartIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Node Graph" />
        <Tab icon={<TimelineIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Timeline" />
        <Tab icon={<SecurityIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Rules Engine" />
        <Tab icon={<AnalyticsIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Analytics" />
      </Tabs>

      {/* ────────────────────── TAB 0: PATTERNS ────────────────────── */}
      {tab === 0 && (
        <Grid container spacing={3}>
          {/* Patterns Table */}
          <Grid item xs={12} md={9}>
            <Paper sx={{ p: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Detected Correlation Patterns
                  <Chip label={filteredPatterns.length} size="small" sx={{ ml: 1, height: 20, fontSize: '10px', background: 'rgba(33,150,243,0.2)', color: '#90caf9' }} />
                </Typography>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel sx={{ fontSize: '12px' }}>Severity Filter</InputLabel>
                  <Select value={filterSev} label="Severity Filter" onChange={e => setFilterSev(e.target.value)} sx={{ fontSize: '12px' }}>
                    <MenuItem value="all">All Severities</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <TableContainer sx={{ maxHeight: 540, overflowY: 'auto' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {['ID', 'Pattern Type', 'Source / Actor', 'Protocol', 'Confidence', 'Severity', 'Events', 'Duration', 'Detected', 'Actions'].map(h => (
                        <TableCell key={h} sx={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', color: '#546e7a', background: '#080f1a', borderBottom: '1px solid rgba(255,255,255,0.07)', py: 1 }}>
                          {h.toUpperCase()}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPatterns.map((p) => (
                      <TableRow
                        key={p.id}
                        hover
                        onClick={() => { setSelectedPattern(p); setOpenDialog(true); }}
                        sx={{
                          cursor: 'pointer',
                          borderLeft: `3px solid ${sevColor[p.severity]}`,
                          '&:hover': { background: `${sevBg[p.severity]}` },
                          '&:hover .action-btn': { opacity: 1 }
                        }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '11px', color: '#42a5f5', py: 1 }}>{p.id}</TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '12px' }}>{p.ruleName}</Typography>
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '11px', color: '#90a4ae', py: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 14, height: 14, borderRadius: '2px', background: 'rgba(33,150,243,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', fontWeight: 700, color: '#42a5f5' }}>
                              {p.country.slice(0, 2)}
                            </Box>
                            {p.source}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Chip label={p.protocol} size="small" sx={{ fontSize: '9px', height: 18, background: 'rgba(171,71,188,0.15)', color: '#ce93d8', border: '1px solid rgba(171,71,188,0.2)' }} />
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LinearProgress variant="determinate" value={p.confidence * 100} sx={{
                              width: 60, height: 5, borderRadius: 3,
                              background: 'rgba(255,255,255,0.08)',
                              '& .MuiLinearProgress-bar': { background: p.confidence > 0.9 ? '#66bb6a' : p.confidence > 0.8 ? '#ff9800' : '#ef5350', borderRadius: 3 }
                            }} />
                            <Typography variant="caption" sx={{ fontSize: '10px', fontFamily: 'monospace', color: p.confidence > 0.9 ? '#66bb6a' : p.confidence > 0.8 ? '#ff9800' : '#ef5350' }}>
                              {Math.round(p.confidence * 100)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Chip label={p.severity.toUpperCase()} size="small" sx={{
                            fontSize: '9px', height: 20, fontWeight: 700,
                            background: sevBg[p.severity], color: sevColor[p.severity],
                            border: `1px solid ${sevColor[p.severity]}50`
                          }} />
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, color: '#e3f2fd', py: 1 }}>
                          {p.eventCount.toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ fontSize: '11px', color: '#78909c', py: 1 }}>{p.duration}</TableCell>
                        <TableCell sx={{ fontSize: '10px', color: '#546e7a', fontFamily: 'monospace', py: 1 }}>
                          {new Date(p.detectedAt).toLocaleTimeString()}
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Box sx={{ display: 'flex', gap: 0.5, opacity: 0, transition: '0.2s' }} className="action-btn">
                            <Tooltip title="View Details">
                              <IconButton size="small" sx={{ p: 0.3 }} onClick={e => { e.stopPropagation(); setSelectedPattern(p); setOpenDialog(true); }}>
                                <VisibilityIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Block Source">
                              <IconButton size="small" sx={{ p: 0.3, color: '#ef5350' }}>
                                <BlockIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Settings Panel */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2.5, mb: 2, border: '1px solid rgba(255,255,255,0.07)' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, letterSpacing: '0.5px' }}>
                Correlation Settings
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Confidence Threshold: <strong style={{ color: '#42a5f5' }}>{Math.round(threshold * 100)}%</strong>
              </Typography>
              <Slider value={threshold} onChange={(_, v) => setThreshold(v)} min={0.5} max={1} step={0.05}
                valueLabelDisplay="auto" valueLabelFormat={v => `${Math.round(v * 100)}%`}
                sx={{ color: '#2196f3', my: 1 }} />

              <FormControl fullWidth size="small" sx={{ mb: 2, mt: 1 }}>
                <InputLabel sx={{ fontSize: '12px' }}>Time Window</InputLabel>
                <Select value={timeframe} label="Time Window" onChange={e => setTimeframe(e.target.value)} sx={{ fontSize: '12px' }}>
                  {[[30000, '30 seconds'], [60000, '1 minute'], [300000, '5 minutes'], [600000, '10 minutes'], [3600000, '1 hour']].map(([v, l]) => (
                    <MenuItem key={v} value={v}>{l}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {[['Auto-correlation', true], ['Cross-source analysis', true], ['Alert on high confidence', true], ['ML anomaly boost', false]].map(([label, def]) => (
                <FormControlLabel key={label}
                  control={<Switch defaultChecked={def} size="small" color="primary" />}
                  label={<Typography variant="caption" color="text.secondary">{label}</Typography>}
                  sx={{ display: 'flex', mb: 0.5 }}
                />
              ))}
            </Paper>

            {/* Quick Stats */}
            <Paper sx={{ p: 2.5, border: '1px solid rgba(255,255,255,0.07)' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Live Counters</Typography>
              {[
                { label: 'Events/sec', value: (283 + ticker % 50).toLocaleString(), color: '#42a5f5' },
                { label: 'Correlations/min', value: (14 + ticker % 8).toString(), color: '#ab47bc' },
                { label: 'False Positive Rate', value: '2.3%', color: '#66bb6a' },
                { label: 'Blocked IPs', value: (1247 + ticker).toLocaleString(), color: '#ef5350' },
                { label: 'Avg Response Time', value: `${(48 + ticker % 20)}ms`, color: '#ff9800' },
              ].map((s, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8, borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: s.color }}>{s.value}</Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ────────────────────── TAB 1: NODE GRAPH ────────────────────── */}
      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2.5, border: '1px solid rgba(255,255,255,0.07)', height: 400 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Tor Circuit Node Correlation Graph
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[['Guard', '#42a5f5'], ['Relay', '#ab47bc'], ['Exit', '#ef5350']].map(([t, c]) => (
                    <Chip key={t} label={t} size="small" sx={{ fontSize: '9px', height: 18, background: `${c}20`, color: c, border: `1px solid ${c}40` }} />
                  ))}
                </Box>
              </Box>
              <NodeGraph nodes={NODE_GRAPH} selectedNode={selectedNode} onSelect={setSelectedNode} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2.5, border: '1px solid rgba(255,255,255,0.07)', height: 400, overflowY: 'auto' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                {selectedNodeData ? `Node: ${selectedNodeData.id}` : 'Node Details'}
              </Typography>
              {selectedNodeData ? (
                <>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip label={selectedNodeData.type} size="small" sx={{ background: `${nodeColor[selectedNodeData.type]}20`, color: nodeColor[selectedNodeData.type] }} />
                    <Chip label={selectedNodeData.risk.toUpperCase()} size="small" sx={{ background: sevBg[selectedNodeData.risk], color: sevColor[selectedNodeData.risk] }} />
                  </Box>
                  {[
                    ['Node ID', selectedNodeData.id],
                    ['Type', selectedNodeData.type],
                    ['Risk Level', selectedNodeData.risk.toUpperCase()],
                    ['Bandwidth', selectedNodeData.bandwidth],
                    ['Connections', selectedNodeData.connections.join(', ') || 'None'],
                  ].map(([k, v]) => (
                    <Box key={k} sx={{ mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px', letterSpacing: '0.5px' }}>{k.toUpperCase()}</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '12px', color: '#e3f2fd' }}>{v}</Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.07)' }} />
                  <Button size="small" variant="outlined" color="error" startIcon={<BlockIcon />} fullWidth sx={{ fontSize: '11px' }}>
                    Isolate Node
                  </Button>
                </>
              ) : (
                <Box sx={{ height: '80%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#546e7a' }}>
                  <HubIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                  <Typography variant="caption" color="text.secondary" textAlign="center">
                    Click any node in the graph to view details and correlation info
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Node Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 0, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>All Nodes — Correlation Risk Matrix</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['Node ID', 'Type', 'Risk', 'Bandwidth', 'Connections', 'Status'].map(h => (
                        <TableCell key={h} sx={{ fontSize: '10px', fontWeight: 700, color: '#546e7a', background: '#080f1a', py: 1 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {NODE_GRAPH.map(n => (
                      <TableRow key={n.id} hover sx={{ cursor: 'pointer', '&:hover': { background: 'rgba(33,150,243,0.05)' } }} onClick={() => setSelectedNode(n.id)}>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '11px', color: '#42a5f5', py: 0.8 }}>{n.id}</TableCell>
                        <TableCell><Chip label={n.type} size="small" sx={{ fontSize: '9px', height: 18, background: `${nodeColor[n.type]}15`, color: nodeColor[n.type] }} /></TableCell>
                        <TableCell><Chip label={n.risk.toUpperCase()} size="small" sx={{ fontSize: '9px', height: 18, background: sevBg[n.risk], color: sevColor[n.risk] }} /></TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '11px' }}>{n.bandwidth}</TableCell>
                        <TableCell sx={{ fontSize: '11px', color: '#78909c' }}>{n.connections.length > 0 ? n.connections.join(' → ') : '—'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: n.risk === 'critical' ? '#ef5350' : n.risk === 'high' ? '#ff9800' : '#66bb6a' }} />
                            <Typography variant="caption" sx={{ fontSize: '10px' }}>
                              {n.risk === 'critical' ? 'Under Attack' : n.risk === 'high' ? 'Suspicious' : 'Normal'}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ────────────────────── TAB 2: TIMELINE ────────────────────── */}
      {tab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2.5, border: '1px solid rgba(255,255,255,0.07)' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>24-Hour Correlation Event Timeline</Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, minWidth: 900, height: 200, px: 1 }}>
                  {TIMELINE_EVENTS.map((ev, i) => {
                    const total = ev.critical + ev.high + ev.medium;
                    const maxTotal = Math.max(...TIMELINE_EVENTS.map(e => e.critical + e.high + e.medium), 1);
                    const barH = (total / maxTotal) * 160;
                    return (
                      <Tooltip key={i} title={
                        <Box>
                          <Typography variant="caption" display="block">{ev.hour}</Typography>
                          <Typography variant="caption" display="block" color="#ef5350">Critical: {ev.critical}</Typography>
                          <Typography variant="caption" display="block" color="#ff9800">High: {ev.high}</Typography>
                          <Typography variant="caption" display="block" color="#ffd740">Medium: {ev.medium}</Typography>
                        </Box>
                      }>
                        <Box sx={{ flex: 1, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column-reverse', height: barH, borderRadius: '3px 3px 0 0', overflow: 'hidden' }}>
                            {ev.critical > 0 && <Box sx={{ height: `${(ev.critical / total) * 100}%`, background: '#ef5350', minHeight: ev.critical > 0 ? 2 : 0 }} />}
                            {ev.high > 0 && <Box sx={{ height: `${(ev.high / total) * 100}%`, background: '#ff9800', minHeight: ev.high > 0 ? 2 : 0 }} />}
                            {ev.medium > 0 && <Box sx={{ height: `${(ev.medium / total) * 100}%`, background: '#ffd740', minHeight: ev.medium > 0 ? 2 : 0 }} />}
                          </Box>
                          <Typography variant="caption" sx={{ fontSize: '8px', color: '#546e7a', writingMode: 'vertical-rl', transform: 'rotate(180deg)', mt: 0.5 }}>
                            {ev.hour}
                          </Typography>
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center' }}>
                  {[['Critical', '#ef5350'], ['High', '#ff9800'], ['Medium', '#ffd740']].map(([l, c]) => (
                    <Box key={l} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: 1, background: c }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>{l}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Event feed */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2.5, border: '1px solid rgba(255,255,255,0.07)', maxHeight: 420, overflowY: 'auto' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Live Event Feed</Typography>
              {MOCK_PATTERNS.map((p, i) => (
                <Box key={p.id} sx={{
                  display: 'flex', gap: 1.5, mb: 1.5, p: 1.5,
                  borderRadius: 1.5, background: sevBg[p.severity],
                  border: `1px solid ${sevColor[p.severity]}20`,
                  animation: i === 0 ? 'none' : 'none'
                }}>
                  <Box sx={{ pt: 0.2 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: sevColor[p.severity], mt: 0.5 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '11px', color: sevColor[p.severity] }}>
                        {p.ruleName}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '9px', fontFamily: 'monospace', color: '#546e7a' }}>
                        {new Date(p.detectedAt).toLocaleTimeString()}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
                      {p.description.slice(0, 80)}…
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Heatmap */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2.5, border: '1px solid rgba(255,255,255,0.07)' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Source IP Heatmap</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '3px' }}>
                {Array.from({ length: 100 }, (_, i) => {
                  const intensity = Math.random();
                  const color = intensity > 0.85 ? '#ef5350' : intensity > 0.65 ? '#ff9800' : intensity > 0.4 ? '#ffd740' : intensity > 0.2 ? '#42a5f5' : '#1a3a5c';
                  return (
                    <Tooltip key={i} title={`${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.x.x — ${Math.floor(intensity * 100)} events`}>
                      <Box sx={{ height: 22, borderRadius: '3px', background: color, opacity: 0.7 + intensity * 0.3, cursor: 'pointer', '&:hover': { opacity: 1, transform: 'scale(1.2)' }, transition: 'all 0.15s' }} />
                    </Tooltip>
                  );
                })}
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center' }}>
                {[['No activity', '#1a3a5c'], ['Low', '#42a5f5'], ['Medium', '#ffd740'], ['High', '#ff9800'], ['Critical', '#ef5350']].map(([l, c]) => (
                  <Box key={l} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: 1, background: c }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '9px' }}>{l}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ────────────────────── TAB 3: RULES ENGINE ────────────────────── */}
      {tab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 0, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Correlation Rules Engine
                  <Chip label={`${rules.filter(r => r.enabled).length} active`} size="small" sx={{ ml: 1, height: 20, fontSize: '10px', background: 'rgba(102,187,106,0.15)', color: '#66bb6a' }} />
                </Typography>
                <Button size="small" variant="outlined" startIcon={<PlayIcon />} onClick={handleRunAnalysis}>
                  Test All Rules
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['Enabled', 'Rule Name', 'Trigger Threshold', 'Severity', 'Total Hits', 'Accuracy', 'Action'].map(h => (
                        <TableCell key={h} sx={{ fontSize: '10px', fontWeight: 700, color: '#546e7a', background: '#080f1a', py: 1 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rules.map((r, i) => (
                      <TableRow key={i} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell sx={{ py: 1 }}>
                          <Switch size="small" checked={r.enabled} onChange={() => setRules(prev => prev.map((x, j) => j === i ? { ...x, enabled: !x.enabled } : x))} color="primary" />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '13px', py: 1 }}>{r.name}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '11px', color: '#78909c', py: 1 }}>{r.threshold}</TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Chip label={r.severity.toUpperCase()} size="small" sx={{ fontSize: '9px', height: 18, background: sevBg[r.severity], color: sevColor[r.severity], fontWeight: 700 }} />
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: '#e3f2fd', py: 1 }}>
                          {r.hits.toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress variant="determinate" value={r.accuracy} sx={{
                              width: 70, height: 5, borderRadius: 3,
                              background: 'rgba(255,255,255,0.08)',
                              '& .MuiLinearProgress-bar': { background: r.accuracy > 90 ? '#66bb6a' : r.accuracy > 80 ? '#ff9800' : '#ef5350', borderRadius: 3 }
                            }} />
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '10px' }}>{r.accuracy}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Button size="small" variant="text" sx={{ fontSize: '10px', py: 0.2, px: 1, minWidth: 0 }}>Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2.5, border: '1px solid rgba(255,255,255,0.07)' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Rule Effectiveness Matrix</Typography>
              {rules.map((r, i) => (
                <Box key={i} sx={{ mb: 1.5, p: 1.5, borderRadius: 1.5, background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${sevColor[r.severity]}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '11px' }}>{r.name}</Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#42a5f5', fontSize: '10px' }}>{r.hits.toLocaleString()} hits</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={r.accuracy} sx={{
                    height: 4, borderRadius: 2,
                    background: 'rgba(255,255,255,0.06)',
                    '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg, ${sevColor[r.severity]}, ${sevColor[r.severity]}88)`, borderRadius: 2 }
                  }} />
                </Box>
              ))}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2.5, border: '1px solid rgba(255,255,255,0.07)', height: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Rule Configuration Guide</Typography>
              {[
                { title: 'Threshold Tuning', desc: 'Set thresholds based on baseline traffic analysis. Use 3σ for statistical anomalies and fixed counts for known attack signatures.' },
                { title: 'Cross-Source Correlation', desc: 'Enable multi-source correlation to reduce false positives by 40%. Combine DNS, TCP, and application layer signals.' },
                { title: 'Temporal Windows', desc: 'Use sliding windows for DDoS (30s) and longer windows for exfiltration (5-10min). Match window to attack velocity.' },
                { title: 'Severity Escalation', desc: 'Auto-escalate from Medium→High if pattern persists >5min. Critical patterns trigger immediate SOC notification.' },
              ].map((item, i) => (
                <Box key={i} sx={{ mb: 2, pb: 2, borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#42a5f5', display: 'block', mb: 0.5 }}>{item.title}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>{item.desc}</Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ────────────────────── TAB 4: ANALYTICS ────────────────────── */}
      {tab === 4 && (
        <Grid container spacing={3}>
          {/* Protocol Breakdown */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2.5, border: '1px solid rgba(255,255,255,0.07)', height: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 3 }}>Protocol Distribution</Typography>
              {[
                { protocol: 'TCP/SYN', pct: 34, color: '#ef5350', count: 4210 },
                { protocol: 'DNS/UDP', pct: 28, color: '#42a5f5', count: 2840 },
                { protocol: 'HTTPS/TLS', pct: 18, color: '#ab47bc', count: 1247 },
                { protocol: 'Tor Circuit', pct: 12, color: '#ff9800', count: 892 },
                { protocol: 'SSH/SMB', pct: 5, color: '#26a69a', count: 341 },
                { protocol: 'Other', pct: 3, color: '#546e7a', count: 156 },
              ].map((p, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px' }}>{p.protocol}</Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '10px', color: p.color }}>{p.pct}% · {p.count.toLocaleString()}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={p.pct} sx={{
                    height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)',
                    '& .MuiLinearProgress-bar': { background: p.color, borderRadius: 3 }
                  }} />
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Geo Distribution */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2.5, border: '1px solid rgba(255,255,255,0.07)', height: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 3 }}>Top Attack Origins</Typography>
              {[
                { country: 'Russia', code: 'RU', events: 3420, pct: 28 },
                { country: 'China', code: 'CN', events: 2890, pct: 23 },
                { country: 'North Korea', code: 'KP', events: 2100, pct: 17 },
                { country: 'Iran', code: 'IR', events: 1750, pct: 14 },
                { country: 'Ukraine', code: 'UA', events: 980, pct: 8 },
                { country: 'Belarus', code: 'BY', events: 750, pct: 6 },
                { country: 'Others', code: '??', events: 610, pct: 4 },
              ].map((g, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ width: 28, height: 20, borderRadius: '3px', background: 'rgba(33,150,243,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#42a5f5', fontFamily: 'monospace', flexShrink: 0 }}>
                    {g.code}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                      <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600 }}>{g.country}</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '10px', color: '#ef5350' }}>{g.events.toLocaleString()}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={g.pct} sx={{
                      height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)',
                      '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg, #ef5350, #ff9800)`, borderRadius: 2 }
                    }} />
                  </Box>
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Summary Metrics */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2.5, border: '1px solid rgba(255,255,255,0.07)', height: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 3 }}>Correlation Health Score</Typography>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress variant="determinate" value={94.7} size={120} thickness={5} sx={{ color: '#66bb6a' }} />
                  <CircularProgress variant="determinate" value={100} size={120} thickness={5} sx={{ color: 'rgba(255,255,255,0.05)', position: 'absolute', top: 0, left: 0 }} />
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#66bb6a', fontFamily: 'monospace' }}>94.7</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '9px' }}>HEALTH %</Typography>
                  </Box>
                </Box>
              </Box>
              <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.07)' }} />
              {[
                { label: 'SIEM Integration', status: 'Synced', ok: true },
                { label: 'ML Engine', status: 'Active', ok: true },
                { label: 'Threat Intel Feed', status: 'Updated 2m ago', ok: true },
                { label: 'Packet Capture', status: 'Running', ok: true },
                { label: 'Alert Dispatcher', status: 'Active', ok: true },
                { label: 'Geo-IP Database', status: 'Stale (1d)', ok: false },
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.7, borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>{item.label}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: item.ok ? '#66bb6a' : '#ff9800' }} />
                    <Typography variant="caption" sx={{ fontSize: '10px', color: item.ok ? '#66bb6a' : '#ff9800' }}>{item.status}</Typography>
                  </Box>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ── Pattern Detail Dialog ── */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { background: '#080f1a', border: '1px solid rgba(33,150,243,0.2)', borderRadius: 3 } }}>
        {selectedPattern && (
          <>
            <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.07)', pb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 0.8, borderRadius: 1.5, background: `${sevColor[selectedPattern.severity]}20` }}>
                  <SecurityIcon sx={{ color: sevColor[selectedPattern.severity], fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '15px' }}>{selectedPattern.ruleName}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>Pattern ID: {selectedPattern.id}</Typography>
                </Box>
                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                  <Chip label={selectedPattern.severity.toUpperCase()} size="small" sx={{ background: sevBg[selectedPattern.severity], color: sevColor[selectedPattern.severity], fontWeight: 700 }} />
                  <Chip label={selectedPattern.protocol} size="small" sx={{ background: 'rgba(171,71,188,0.15)', color: '#ce93d8' }} />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Alert severity={selectedPattern.severity === 'critical' ? 'error' : 'warning'} sx={{ mb: 3, fontSize: '12px' }}>
                {selectedPattern.description}
              </Alert>
              <Grid container spacing={2}>
                {[
                  { label: 'Source / Actor', value: selectedPattern.source, mono: true },
                  { label: 'Country of Origin', value: selectedPattern.country, mono: false },
                  { label: 'Confidence Score', value: `${Math.round(selectedPattern.confidence * 100)}%`, mono: true },
                  { label: 'Event Count', value: selectedPattern.eventCount.toLocaleString(), mono: true },
                  { label: 'Duration', value: selectedPattern.duration, mono: true },
                  { label: 'Blocked At', value: selectedPattern.blockedAt, mono: true },
                  { label: 'Detected At', value: new Date(selectedPattern.detectedAt).toLocaleString(), mono: false },
                  { label: 'Protocol', value: selectedPattern.protocol, mono: true },
                ].map(({ label, value, mono }) => (
                  <Grid item xs={6} key={label}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px', letterSpacing: '0.5px', display: 'block', mb: 0.3 }}>
                      {label.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: mono ? 'monospace' : 'inherit', color: '#e3f2fd', fontSize: '13px' }}>
                      {value}
                    </Typography>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px', letterSpacing: '0.5px', display: 'block', mb: 1 }}>
                    AFFECTED NODES
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedPattern.affectedNodes.map((n, i) => (
                      <Chip key={i} label={n} size="small" sx={{ fontFamily: 'monospace', fontSize: '10px', background: 'rgba(239,83,80,0.1)', color: '#ef9a9a', border: '1px solid rgba(239,83,80,0.2)' }} />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.07)', px: 3, py: 2, gap: 1 }}>
              <Button onClick={() => setOpenDialog(false)} size="small">Close</Button>
              <Button variant="outlined" color="warning" size="small" startIcon={<WarningIcon />}>Flag for Review</Button>
              <Button variant="contained" color="error" size="small" startIcon={<BlockIcon />}>
                Block Source
              </Button>
              <Button variant="contained" size="small" startIcon={<DownloadIcon />} sx={{ background: 'linear-gradient(135deg, #1565c0, #7b1fa2)' }}>
                Export Report
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }`}</style>
    </Box>
  );
};

export default CorrelationPage;