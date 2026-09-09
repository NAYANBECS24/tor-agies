import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, Button,
  Divider, List, ListItem, ListItemIcon, ListItemText, Alert,
  CircularProgress,
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Select, MenuItem, FormControl,
  Tab, Tabs,
} from '@mui/material';
import {
  Article as DossierIcon, PictureAsPdf as PDFIcon,
  DataObject as JSONIcon, TableChart as CSVIcon,
  VpnKey as PGPIcon,
  Public as IPIcon,
} from '@mui/icons-material';

const API_BASE = '/api/darkweb';

const glassCard = {
  background: 'rgba(19, 47, 76, 0.7)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(33, 150, 243, 0.2)',
  borderRadius: 3,
};

const categoryColor = {
  Ransomware: '#f44336', Weapons: '#ff5722', Drugs: '#ff9800', 'Stolen Data': '#9c27b0',
  'Money Laundering': '#2196f3', 'Terror Financing': '#f44336', 'Hacking Services': '#00bcd4',
  Fraud: '#ffd54f', CSAM: '#f44336', Unknown: '#607d8b',
};

const SAMPLE_ACTORS = [
  {
    actorId: 'ACTOR-AA01', primaryHandle: 'DarkPhantom_v2',
    aliases: [{ handle: 'D4rkPh4ntom', marketplace: 'AlphaBay v2' }, { handle: 'PhantomDark', marketplace: 'BreachForums' }],
    category: 'Ransomware', attributionConfidence: 94,
    pgpFingerprint: 'E8B2 1A34 99F0 C3D7 B2A1 9E4F 5C8D 7E6A 1B3F 4E5C',
    cryptoWallets: [
      { currency: 'BTC', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divfna', totalReceived: 12.5, transactionCount: 47 },
      { currency: 'BTC', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', totalReceived: 8.2, transactionCount: 23 },
    ],
    marketplaces: [{ name: 'BreachForums', url: 'breachforums.st', postCount: 1247 }, { name: 'AlphaBay v2', url: 'alphabay.onion', postCount: 543 }],
    contactIds: [{ platform: 'Telegram', handle: '@dark_phantom_ops' }, { platform: 'Tox', handle: 'A3B2C1D4...' }],
    originIpAttribution: '185.220.101.47', hostingProvider: 'Frantech Solutions', originCountry: 'Russia',
    active: true, source: 'Autonomous Crawler', lastScanDate: new Date().toISOString(),
    firstDiscovered: new Date(Date.now() - 180 * 86400000).toISOString(),
    tags: ['LockBit affiliate', 'double-extortion', 'high-value', 'active'],
  },
  {
    actorId: 'ACTOR-BB02', primaryHandle: 'SilkReborn_Admin',
    aliases: [{ handle: 'SilkAdmin2', marketplace: 'Hydra Reborn' }],
    category: 'Drugs', attributionConfidence: 88,
    pgpFingerprint: 'E8B2 1A34 99F0 C3D7 B2A1 9E4F 5C8D 7E6A 1B3F 4E5C',
    cryptoWallets: [{ currency: 'XMR', address: '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7...', totalReceived: 234.7, transactionCount: 89 }],
    marketplaces: [{ name: 'Hydra Reborn', url: 'hydra.onion', postCount: 3421 }, { name: 'AlphaBay v2', url: 'alphabay.onion', postCount: 891 }],
    contactIds: [{ platform: 'Jabber', handle: 'silkreborn@thesecure.biz' }],
    originIpAttribution: null, originCountry: null,
    active: true, source: 'Autonomous Crawler', lastScanDate: new Date().toISOString(),
    firstDiscovered: new Date(Date.now() - 90 * 86400000).toISOString(),
    tags: ['marketplace admin', 'fentanyl', 'high-volume'],
  },
  {
    actorId: 'ACTOR-CC03', primaryHandle: 'GhostNet_Broker',
    aliases: [],
    category: 'Hacking Services', attributionConfidence: 71,
    pgpFingerprint: 'A1B2 C3D4 E5F6 A7B8 C9D0 E1F2 A3B4 C5D6 E7F8 A9B0',
    cryptoWallets: [{ currency: 'BTC', address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', totalReceived: 45.1, transactionCount: 112 }],
    marketplaces: [{ name: 'RaidForums Mirror', url: 'raidforums.onion', postCount: 672 }],
    contactIds: [{ platform: 'Session', handle: '05d1b7c3e9f2...' }],
    originIpAttribution: '178.162.204.51', hostingProvider: 'Hetzner Online', originCountry: 'Germany',
    active: true, source: 'Manual Entry', lastScanDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    firstDiscovered: new Date(Date.now() - 45 * 86400000).toISOString(),
    tags: ['initial access broker', 'zero-day seller'],
  },
];

function ConfidenceBadge({ value }) {
  const color = value >= 85 ? '#4caf50' : value >= 65 ? '#ff9800' : '#f44336';
  return (
    <Box sx={{ position: 'relative', width: 56, height: 56, display: 'inline-flex' }}>
      <CircularProgress variant="determinate" value={100} size={56} sx={{ color: 'rgba(255,255,255,0.08)', position: 'absolute', top: 0, left: 0 }} />
      <CircularProgress variant="determinate" value={value} size={56} sx={{ color, position: 'absolute', top: 0, left: 0, strokeLinecap: 'round' }} />
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color, fontWeight: 800, fontSize: '0.75rem' }}>{value}%</Typography>
      </Box>
    </Box>
  );
}

export default function DossierExport() {
  const [actors, setActors] = useState(SAMPLE_ACTORS);
  const [selected, setSelected] = useState(SAMPLE_ACTORS[0]);
  const [exporting, setExporting] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [tab, setTab] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/actors`).then(r => r.json()).then(d => { if (d.success && d.data.length > 0) setActors(d.data); }).catch(() => {});
  }, []);

  const filteredActors = filterCat === 'All' ? actors : actors.filter(a => a.category === filterCat);

  const exportDossier = async (format) => {
    setExporting(format);

    // Auto-archive in central Report Vault
    try {
      fetch('/api/cases/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: selected.actorId,
          reportType: 'ACTOR_PROFILE',
          title: `ACTOR PROFILE — ${selected.primaryHandle} Forensic Dossier`,
          classification: 'TOP SECRET',
          authorName: 'Analyst-Alpha',
          authorBadge: 'NTRO-CY-0842'
        })
      }).catch(() => {});
    } catch (e) {}

    try {
      if (format === 'json') {
        const res = await fetch(`${API_BASE}/dossier/${selected.actorId}/export?format=json`, { method: 'POST' });
        if (!res.ok) throw new Error('offline');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `NTRO_Dossier_${selected.actorId}.json`; a.click();
      } else if (format === 'csv') {
        const res = await fetch(`${API_BASE}/dossier/${selected.actorId}/export?format=csv`, { method: 'POST' });
        if (!res.ok) throw new Error('offline');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `NTRO_Dossier_${selected.actorId}.csv`; a.click();
      } else if (format === 'pdf') {
        window.open(`/api/cases/reports/generate?format=html`, '_blank');
      }
    } catch {
      // Client-side fallback export
      if (format === 'json') {
        const blob = new Blob([JSON.stringify({ caseReference: `NTRO-26151-${selected.actorId}`, generatedAt: new Date().toISOString(), actor: selected }, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `NTRO_Dossier_${selected.actorId}.json`; a.click();
      } else if (format === 'csv') {
        const rows = [['Field', 'Value'], ['Case Ref', `NTRO-26151-${selected.actorId}`], ['Handle', selected.primaryHandle], ['Category', selected.category], ['Confidence', `${selected.attributionConfidence}%`], ['PGP', selected.pgpFingerprint || 'N/A'], ['Origin IP', selected.originIpAttribution || 'N/A'], ['Markets', (selected.marketplaces || []).map(m => m.name).join('; ')], ['Wallets', (selected.cryptoWallets || []).map(w => `${w.currency}:${w.address}`).join('; ')], ['Tags', (selected.tags || []).join('; ')]];
        const csv = rows.map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `NTRO_Dossier_${selected.actorId}.csv`; a.click();
      } else if (format === 'pdf') {
        window.print();
      }
    }
    setTimeout(() => setExporting(''), 1000);
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #4caf50, #1b5e20)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, boxShadow: '0 4px 20px rgba(76,175,80,0.4)' }}>
            <DossierIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', lineHeight: 1 }}>Threat Actor Dossier Suite</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>Forensic intelligence reports · Multi-format export (PDF / JSON / CSV) · Court-ready dossiers</Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Chip label="NTRO EXPORT MODULE" sx={{ background: 'rgba(76,175,80,0.15)', color: '#4caf50', fontWeight: 700, fontSize: '0.7rem' }} />
          </Box>
        </Box>
        <Divider sx={{ borderColor: 'rgba(76,175,80,0.2)', mt: 2 }} />
      </Box>

      <Grid container spacing={3}>
        {/* Actor Selector */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ ...glassCard, p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>Actor Registry</Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                  sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', '& fieldset': { borderColor: 'rgba(33,150,243,0.3)' }, '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.5)' } }}>
                  <MenuItem value="All">All Categories</MenuItem>
                  {Object.keys(categoryColor).map(c => <MenuItem key={c} value={c} sx={{ fontSize: '0.82rem' }}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <List disablePadding>
              {filteredActors.map(a => (
                <ListItem key={a.actorId} disablePadding sx={{ mb: 1 }}>
                  <Box onClick={() => setSelected(a)} sx={{ width: '100%', p: 1.5, borderRadius: 2, cursor: 'pointer', background: selected?.actorId === a.actorId ? 'rgba(76,175,80,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selected?.actorId === a.actorId ? '#4caf5044' : 'rgba(255,255,255,0.06)'}`, '&:hover': { background: 'rgba(76,175,80,0.08)' }, transition: 'all 0.15s' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 700 }}>{a.primaryHandle}</Typography>
                        <Chip label={a.category} size="small" sx={{ mt: 0.5, height: 18, background: `${categoryColor[a.category] || '#607d8b'}22`, color: categoryColor[a.category] || '#607d8b', fontSize: '0.6rem', fontWeight: 700 }} />
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ color: a.attributionConfidence >= 85 ? '#4caf50' : '#ff9800', fontWeight: 700 }}>{a.attributionConfidence}%</Typography>
                        <Chip label={a.active ? 'ACTIVE' : 'INACTIVE'} size="small" sx={{ display: 'block', mt: 0.5, height: 16, background: a.active ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.08)', color: a.active ? '#4caf50' : 'rgba(255,255,255,0.4)', fontSize: '0.58rem' }} />
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Dossier View */}
        <Grid item xs={12} lg={8}>
          {selected ? (
            <Box>
              {/* Export Actions */}
              <Paper sx={{ ...glassCard, p: 2.5, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>Case Reference: <span style={{ fontFamily: 'monospace', color: '#4caf50' }}>NTRO-26151-{selected.actorId}</span></Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Generated: {new Date().toLocaleString()} · Source: {selected.source || 'Autonomous Crawler'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {[
                      { format: 'pdf', label: 'PDF Report', icon: <PDFIcon sx={{ fontSize: 16 }} />, color: '#f44336' },
                      { format: 'json', label: 'JSON', icon: <JSONIcon sx={{ fontSize: 16 }} />, color: '#ff9800' },
                      { format: 'csv', label: 'CSV', icon: <CSVIcon sx={{ fontSize: 16 }} />, color: '#4caf50' },
                    ].map(({ format, label, icon, color }) => (
                      <Button key={format} variant="outlined" size="small" startIcon={exporting === format ? <CircularProgress size={14} sx={{ color }} /> : icon}
                        onClick={() => exportDossier(format)} disabled={!!exporting}
                        sx={{ borderColor: `${color}66`, color, '&:hover': { borderColor: color, background: `${color}11` }, fontSize: '0.75rem' }}>
                        {label}
                      </Button>
                    ))}
                  </Box>
                </Box>
              </Paper>

              {/* Actor Profile Card */}
              <Paper sx={{ ...glassCard, p: 3, mb: 3, background: 'rgba(10,25,41,0.9)', border: '1px solid rgba(76,175,80,0.2)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ width: 60, height: 60, borderRadius: 3, background: `${categoryColor[selected.category] || '#607d8b'}22`, border: `2px solid ${categoryColor[selected.category] || '#607d8b'}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>👤</Box>
                    <Box>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 800 }}>{selected.primaryHandle}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                        <Chip label={selected.category} sx={{ background: `${categoryColor[selected.category]}22`, color: categoryColor[selected.category], fontWeight: 700, height: 22, fontSize: '0.7rem' }} />
                        {(selected.tags || []).map(t => <Chip key={t} label={t} size="small" sx={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', height: 20, fontSize: '0.65rem' }} />)}
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <ConfidenceBadge value={selected.attributionConfidence} />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mt: 0.5, fontSize: '0.62rem' }}>CONFIDENCE</Typography>
                  </Box>
                </Box>

                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid rgba(255,255,255,0.08)', '& .MuiTab-root': { color: 'rgba(255,255,255,0.4)', textTransform: 'none', fontSize: '0.82rem', minWidth: 100 }, '& .Mui-selected': { color: '#4caf50' }, '& .MuiTabs-indicator': { backgroundColor: '#4caf50' } }}>
                  <Tab label="Identity" />
                  <Tab label="Infrastructure" />
                  <Tab label="Financials" />
                  <Tab label="Activity" />
                </Tabs>

                {tab === 0 && (
                  <Grid container spacing={2}>
                    {/* PGP */}
                    <Grid item xs={12}>
                      <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(156,39,176,0.08)', border: '1px solid rgba(156,39,176,0.2)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PGPIcon sx={{ color: '#9c27b0', fontSize: 18 }} />
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.65rem' }}>PGP Key Fingerprint</Typography>
                        </Box>
                        <Typography sx={{ fontFamily: 'monospace', color: '#9c27b0', fontSize: '0.85rem', wordBreak: 'break-all' }}>{selected.pgpFingerprint || 'Not identified'}</Typography>
                      </Box>
                    </Grid>
                    {/* Aliases */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.65rem', display: 'block', mb: 1 }}>Known Aliases</Typography>
                        {(selected.aliases || []).length === 0 ? <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>No aliases detected</Typography> : (selected.aliases || []).map(al => (
                          <Box key={al.handle} sx={{ mb: 0.5 }}>
                            <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace' }}>{al.handle}</Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>{al.marketplace}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                    {/* Contacts */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.65rem', display: 'block', mb: 1 }}>Contact IDs</Typography>
                        {(selected.contactIds || []).map(c => (
                          <Box key={`${c.platform}:${c.handle}`} sx={{ mb: 0.5 }}>
                            <Chip label={c.platform} size="small" sx={{ background: 'rgba(0,188,212,0.15)', color: '#00bcd4', fontSize: '0.6rem', mr: 0.5 }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>{c.handle}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                    {/* Marketplaces */}
                    <Grid item xs={12}>
                      <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.65rem', display: 'block', mb: 1.5 }}>Active Marketplaces</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {(selected.marketplaces || []).map(m => (
                            <Box key={m.name} sx={{ p: 1.5, borderRadius: 1.5, background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.2)' }}>
                              <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 700 }}>{m.name}</Typography>
                              {m.postCount && <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>{m.postCount?.toLocaleString()} posts</Typography>}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                )}

                {tab === 1 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ p: 2.5, borderRadius: 2, background: selected.originIpAttribution ? 'rgba(244,67,54,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selected.originIpAttribution ? 'rgba(244,67,54,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <IPIcon sx={{ color: selected.originIpAttribution ? '#f44336' : 'rgba(255,255,255,0.3)', fontSize: 20 }} />
                          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700 }}>Origin Server Attribution</Typography>
                          {selected.originIpAttribution && <Chip label="DE-CLOAKED" size="small" sx={{ background: 'rgba(244,67,54,0.2)', color: '#f44336', fontWeight: 700, fontSize: '0.6rem' }} />}
                        </Box>
                        <Grid container spacing={1.5}>
                          {[
                            ['Origin IP', selected.originIpAttribution || 'Pending Attribution', selected.originIpAttribution ? '#f44336' : 'rgba(255,255,255,0.3)'],
                            ['Hosting Provider', selected.hostingProvider || 'Unknown', '#ff9800'],
                            ['Country', selected.originCountry || 'Unknown', '#2196f3'],
                          ].map(([label, value, color]) => (
                            <Grid item xs={12} sm={4} key={label}>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>{label}</Typography>
                              <Typography sx={{ color, fontFamily: 'monospace', fontWeight: 700 }}>{value}</Typography>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    </Grid>
                    {!selected.originIpAttribution && (
                      <Grid item xs={12}>
                        <Alert severity="info" sx={{ fontSize: '0.82rem' }}>
                          No origin server de-cloaked yet. Run the <strong>Hidden Service Scanner</strong> on this actor's .onion domains to attempt attribution.
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                )}

                {tab === 2 && (
                  <Box>
                    {(selected.cryptoWallets || []).length === 0 ? (
                      <Alert severity="info">No cryptocurrency wallets linked to this actor.</Alert>
                    ) : (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              {['Currency', 'Address', 'Total Received', 'Transactions'].map(h => (
                                <TableCell key={h} sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.72rem' }}>{h}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(selected.cryptoWallets || []).map((w, i) => (
                              <TableRow key={i} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                                <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                  <Chip label={w.currency} size="small" sx={{ background: w.currency === 'BTC' ? 'rgba(255,152,0,0.15)' : 'rgba(105,240,174,0.1)', color: w.currency === 'BTC' ? '#ff9800' : '#69f0ae', fontWeight: 700, fontSize: '0.65rem' }} />
                                </TableCell>
                                <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem' }}>{w.address}</TableCell>
                                <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)', color: '#ff9800', fontWeight: 700, fontSize: '0.8rem' }}>{w.totalReceived || 'N/A'} {w.currency}</TableCell>
                                <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{w.transactionCount || 'N/A'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}

                {tab === 3 && (
                  <Grid container spacing={2}>
                    {[
                      ['First Discovered', selected.firstDiscovered ? new Date(selected.firstDiscovered).toLocaleDateString() : 'Unknown'],
                      ['Last Scan Date', selected.lastScanDate ? new Date(selected.lastScanDate).toLocaleDateString() : 'Unknown'],
                      ['Source', selected.source || 'Autonomous Crawler'],
                      ['Status', selected.active ? 'Active' : 'Inactive'],
                    ].map(([label, value]) => (
                      <Grid item xs={6} sm={3} key={label}>
                        <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>{label}</Typography>
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>{value}</Typography>
                        </Box>
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 1 }}>Intelligence Tags</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected.tags || []).map(t => <Chip key={t} label={t} size="small" sx={{ background: 'rgba(33,150,243,0.1)', color: '#2196f3', fontSize: '0.68rem' }} />)}
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Box>
          ) : (
            <Paper sx={{ ...glassCard, p: 6, textAlign: 'center' }}>
              <DossierIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.15)', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.4)' }}>Select a threat actor to generate dossier</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
