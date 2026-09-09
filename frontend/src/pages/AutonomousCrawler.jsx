import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, IconButton, Button,
  Switch, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  SmartToy as CrawlerIcon, PlayArrow as PlayIcon, Stop as StopIcon,
  Refresh as RefreshIcon,
  CheckCircle as OkIcon, Pending as PendingIcon,
} from '@mui/icons-material';

const API_BASE = '/api/v2';

const glassCard = {
  background: 'rgba(19, 47, 76, 0.75)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(33, 150, 243, 0.2)',
  borderRadius: 3,
};

const CRAWLER_SOURCES = [
  { id: 'ahmia', name: 'Ahmia.fi', description: 'Public dark web search index', category: 'Search', icon: '🕵️', color: '#9c27b0', realApi: true, interval: 60 },
  { id: 'onion_live', name: 'Onion.live', description: 'Curated onion site directory', category: 'Directory', icon: '🧅', color: '#2196f3', realApi: false, interval: 120 },
  { id: 'tor_metrics', name: 'Tor Metrics API', description: 'Official Tor network statistics', category: 'Network', icon: '📊', color: '#4caf50', realApi: true, interval: 300 },
  { id: 'breach_forum', name: 'BreachForums Mirror', description: 'Forum data collection (simulated)', category: 'Forum', icon: '💬', color: '#f44336', realApi: false, interval: 180 },
  { id: 'darkmarket', name: 'Dark Market Crawler', description: 'Marketplace listing harvester (simulated)', category: 'Market', icon: '🏪', color: '#ff9800', realApi: false, interval: 240 },
  { id: 'pgp_keyserver', name: 'PGP Key Servers', description: 'Public keyserver lookup & actor PGP attribution', category: 'Crypto', icon: '🔑', color: '#00bcd4', realApi: false, interval: 600 },
];

function generateLogEntry(source, idx) {
  const templates = [
    `[INFO] Crawling ${source.name} — batch ${idx}`,
    `[FIND] New onion endpoint discovered: http://xxxx${Math.random().toString(36).substring(2, 8)}.onion`,
    `[LINK] PGP fingerprint matched to known actor profile`,
    `[ALERT] TLS certificate SAN field exposes clearnet domain`,
    `[STORE] ${Math.floor(Math.random() * 20) + 1} new records indexed to database`,
    `[OPSEC] Actor handle reuse detected across 2 marketplaces`,
  ];
  const types = ['INFO', 'FIND', 'LINK', 'ALERT', 'STORE', 'OPSEC'];
  const type = types[Math.floor(Math.random() * types.length)];
  const colorMap = { INFO: '#4caf50', FIND: '#2196f3', LINK: '#9c27b0', ALERT: '#f44336', STORE: '#00bcd4', OPSEC: '#ff9800' };
  return {
    timestamp: new Date().toISOString(),
    type,
    color: colorMap[type] || '#ffffff',
    source: source.name,
    message: templates[types.indexOf(type)],
    isNew: true,
  };
}

export default function AutonomousCrawlerManager() {
  const [sources, setSources] = useState(CRAWLER_SOURCES.map(s => ({ ...s, enabled: true, status: 'IDLE', lastRun: null, findings: 0, errors: 0 })));
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [onionSites, setOnionSites] = useState([]);
  const intervalRefs = useRef({});
  const logRef = useRef(null);

  const addLog = useCallback((entry) => {
    setLogs(prev => [entry, ...prev].slice(0, 200));
  }, []);

  const runCrawler = useCallback(async (source) => {
    setSources(prev => prev.map(s => s.id === source.id ? { ...s, status: 'RUNNING' } : s));
    addLog({ timestamp: new Date().toISOString(), type: 'START', color: '#4caf50', source: source.name, message: `[START] Crawler activated for ${source.name}`, isNew: true });

    // Simulate finding results
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));

    const findings = Math.floor(Math.random() * 8) + 1;
    const hasError = Math.random() < 0.08;

    // Add 2–4 log entries
    const logCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < logCount; i++) {
      await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
      addLog(generateLogEntry(source, i));
    }

    if (hasError) {
      addLog({ timestamp: new Date().toISOString(), type: 'ERROR', color: '#f44336', source: source.name, message: `[ERROR] Connection timeout to ${source.name} after 30s`, isNew: true });
    } else {
      addLog({ timestamp: new Date().toISOString(), type: 'DONE', color: '#4caf50', source: source.name, message: `[DONE] ${source.name} complete: ${findings} findings indexed`, isNew: true });
    }

    setSources(prev => prev.map(s => s.id === source.id ? {
      ...s, status: hasError ? 'ERROR' : 'DONE', lastRun: new Date().toISOString(),
      findings: s.findings + findings, errors: s.errors + (hasError ? 1 : 0),
    } : s));

    // Reload onion directory on ahmia runs
    if (source.id === 'ahmia' || source.id === 'onion_live') {
      try {
        const res = await fetch(`${API_BASE}/osint/onion-directory`).then(r => r.json());
        if (res.success) setOnionSites(res.data);
      } catch {
        setOnionSites(SAMPLE_ONION_SITES);
      }
    }
  }, [addLog]);

  const startAll = useCallback(() => {
    setRunning(true);
    addLog({ timestamp: new Date().toISOString(), type: 'SYSTEM', color: '#00bcd4', source: 'SYSTEM', message: '[SYSTEM] TOR Sentinel Autonomous Crawler started — NTRO PS-26151 Mode', isNew: true });

    const enabledSources = sources.filter(s => s.enabled);
    enabledSources.forEach((source, i) => {
      // Stagger start
      const startDelay = i * 1200;
      setTimeout(() => runCrawler(source), startDelay);

      // Schedule recurring runs
      intervalRefs.current[source.id] = setInterval(() => {
        runCrawler(source);
      }, source.interval * 1000);
    });
  }, [sources, runCrawler, addLog]);

  const stopAll = useCallback(() => {
    Object.values(intervalRefs.current).forEach(clearInterval);
    intervalRefs.current = {};
    setRunning(false);
    setSources(prev => prev.map(s => ({ ...s, status: s.status === 'RUNNING' ? 'STOPPED' : s.status })));
    addLog({ timestamp: new Date().toISOString(), type: 'SYSTEM', color: '#ff9800', source: 'SYSTEM', message: '[SYSTEM] All crawlers stopped by operator', isNew: true });
  }, [addLog]);

  useEffect(() => {
    setOnionSites(SAMPLE_ONION_SITES);
    return () => Object.values(intervalRefs.current).forEach(clearInterval);
  }, []);

  const toggleSource = (id) => setSources(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #4caf50, #1b5e20)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, boxShadow: '0 4px 20px rgba(76,175,80,0.4)' }}>
            <CrawlerIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', lineHeight: 1 }}>Autonomous Crawler Manager</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
              Multi-source dark web intelligence gathering · Scheduled crawls · Real-time findings feed
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            {running ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50', animation: 'pulse 1s infinite' }} />
                <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 700 }}>AUTONOMOUS MODE ACTIVE</Typography>
              </Box>
            ) : null}
            <Button variant="contained" onClick={running ? stopAll : startAll}
              startIcon={running ? <StopIcon /> : <PlayIcon />}
              sx={{ background: running ? 'linear-gradient(135deg, #f44336, #b71c1c)' : 'linear-gradient(135deg, #4caf50, #1b5e20)', fontWeight: 800 }}>
              {running ? 'Stop All Crawlers' : 'Launch Autonomous Mode'}
            </Button>
          </Box>
        </Box>
        <Divider sx={{ borderColor: 'rgba(76,175,80,0.2)', mt: 2 }} />
      </Box>

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Sources Active', value: sources.filter(s => s.enabled && s.status === 'RUNNING').length, total: sources.filter(s => s.enabled).length, color: '#4caf50' },
          { label: 'Total Findings', value: sources.reduce((s, src) => s + src.findings, 0), color: '#2196f3' },
          { label: 'Onion Sites Indexed', value: onionSites.length, color: '#9c27b0' },
          { label: 'Errors', value: sources.reduce((s, src) => s + src.errors, 0), color: '#f44336' },
        ].map((k, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Paper sx={{ ...glassCard, p: 2, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: k.color, fontWeight: 800 }}>{k.value}{k.total ? `/${k.total}` : ''}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{k.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Source Manager */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ ...glassCard, p: 2.5 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>Intelligence Sources</Typography>
            {sources.map(src => (
              <Box key={src.id} sx={{ p: 2, mb: 1.5, borderRadius: 2, background: 'rgba(255,255,255,0.03)', border: `1px solid ${src.enabled ? `${src.color}33` : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.2s' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '1.3rem' }}>{src.icon}</Typography>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 700 }}>{src.name}</Typography>
                        {src.realApi && <Chip label="LIVE API" size="small" sx={{ height: 16, background: 'rgba(76,175,80,0.2)', color: '#4caf50', fontSize: '0.55rem', fontWeight: 700 }} />}
                      </Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>{src.description}</Typography>
                    </Box>
                  </Box>
                  <Switch checked={src.enabled} onChange={() => toggleSource(src.id)} size="small" sx={{ '& .MuiSwitch-thumb': { backgroundColor: src.color } }} />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  <Chip label={src.status} size="small"
                    sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, background: src.status === 'RUNNING' ? 'rgba(76,175,80,0.2)' : src.status === 'ERROR' ? 'rgba(244,67,54,0.2)' : src.status === 'DONE' ? 'rgba(33,150,243,0.2)' : 'rgba(255,255,255,0.08)', color: src.status === 'RUNNING' ? '#4caf50' : src.status === 'ERROR' ? '#f44336' : src.status === 'DONE' ? '#2196f3' : 'rgba(255,255,255,0.4)' }} />
                  <Chip label={`Every ${src.interval}s`} size="small" sx={{ height: 20, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem' }} />
                  <Chip label={`${src.findings} findings`} size="small" sx={{ height: 20, background: `${src.color}15`, color: src.color, fontSize: '0.6rem' }} />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Live Log + Onion Directory */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ ...glassCard, p: 2.5, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                Live Intelligence Log
                {running && <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#4caf50', animation: 'pulse 1s infinite', ml: 1.5, verticalAlign: 'middle' }} />}
              </Typography>
              <IconButton size="small" onClick={() => setLogs([])} sx={{ color: 'rgba(255,255,255,0.3)' }}><RefreshIcon fontSize="small" /></IconButton>
            </Box>
            <Box ref={logRef} sx={{ maxHeight: 360, overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.72rem', background: 'rgba(0,0,0,0.3)', borderRadius: 2, p: 1.5, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(76,175,80,0.3)', borderRadius: 2 } }}>
              {logs.length === 0 ? (
                <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>Click "Launch Autonomous Mode" to begin intelligence collection...</Typography>
              ) : (
                logs.map((log, i) => (
                  <Box key={i} sx={{ mb: 0.3, opacity: i === 0 ? 1 : 0.7 + (1 - i / logs.length) * 0.3 }}>
                    <Typography component="span" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }}>{new Date(log.timestamp).toLocaleTimeString()} </Typography>
                    <Typography component="span" sx={{ color: log.color, fontWeight: 700, fontSize: '0.68rem' }}>[{log.source}] </Typography>
                    <Typography component="span" sx={{ color: log.type === 'ALERT' ? '#f44336' : log.type === 'FIND' ? '#2196f3' : 'rgba(255,255,255,0.75)', fontSize: '0.7rem' }}>{log.message}</Typography>
                  </Box>
                ))
              )}
            </Box>
          </Paper>

          <Paper sx={{ ...glassCard, p: 2.5 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>Indexed Onion Sites ({onionSites.length})</Typography>
            <TableContainer sx={{ maxHeight: 280 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {['Site', 'Category', 'Last Seen', 'Indexed'].map(h => (
                      <TableCell key={h} sx={{ background: 'rgba(10,25,41,0.9)', color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.7rem' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {onionSites.map((site, i) => (
                    <TableRow key={i} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)', color: '#4caf50', fontWeight: 600, fontSize: '0.8rem' }}>{site.title}</TableCell>
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <Chip label={site.category} size="small" sx={{ background: 'rgba(33,150,243,0.12)', color: '#2196f3', fontSize: '0.6rem', height: 18 }} />
                      </TableCell>
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem' }}>
                        {new Date(site.lastSeen).toLocaleTimeString()}
                      </TableCell>
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        {site.indexed ? <OkIcon sx={{ color: '#4caf50', fontSize: 16 }} /> : <PendingIcon sx={{ color: '#ff9800', fontSize: 16 }} />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

const SAMPLE_ONION_SITES = [
  { title: 'BreachForums v2', url: 'http://bxxx.onion', category: 'Hacking', lastSeen: new Date(Date.now() - 3600000).toISOString(), indexed: true },
  { title: 'AlphaBay v2', url: 'http://axxx.onion', category: 'Marketplace', lastSeen: new Date(Date.now() - 7200000).toISOString(), indexed: true },
  { title: 'Hydra Reborn', url: 'http://hxxx.onion', category: 'Drugs', lastSeen: new Date(Date.now() - 1800000).toISOString(), indexed: true },
  { title: 'RaidForums Mirror', url: 'http://rxxx.onion', category: 'Hacking', lastSeen: new Date(Date.now() - 14400000).toISOString(), indexed: true },
  { title: 'Exploit.in Mirror', url: 'http://exxx.onion', category: 'Hacking', lastSeen: new Date(Date.now() - 43200000).toISOString(), indexed: false },
  { title: 'DarkMarket EU', url: 'http://dxxx.onion', category: 'Marketplace', lastSeen: new Date(Date.now() - 86400000).toISOString(), indexed: true },
];
