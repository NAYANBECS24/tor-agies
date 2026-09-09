import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, Divider, IconButton, Button,
  Select, MenuItem, FormControl, InputLabel, Slider, Tooltip,
  CircularProgress, Alert, TextField,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Download as DownloadIcon, PlayArrow as PlayIcon, Pause as PauseIcon,
  Search as SearchIcon, Refresh as RefreshIcon,
} from '@mui/icons-material';

const API_BASE = '/api/v2';

const glassCard = {
  background: 'rgba(19, 47, 76, 0.75)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(33, 150, 243, 0.2)',
  borderRadius: 3,
};

const EVENT_CONFIG = {
  ACTOR_DISCOVERED: { color: '#2196f3', icon: '👤', label: 'Actor Discovered' },
  ACTOR_RESCANNED:  { color: '#00bcd4', icon: '🔄', label: 'Actor Rescanned' },
  IP_DECLOAKED:     { color: '#f44336', icon: '🌐', label: 'IP De-cloaked' },
  WALLET_LINKED:    { color: '#ff9800', icon: '💰', label: 'Wallet Linked' },
  ALIAS_DETECTED:   { color: '#9c27b0', icon: '⚠', label: 'Alias Detected' },
  SCAN_COMPLETED:   { color: '#4caf50', icon: '✅', label: 'Scan Completed' },
  STYLOMETRY_MATCH: { color: '#e91e63', icon: '🧠', label: 'Stylometry Match' },
};

const CATEGORY_OPTIONS = ['All', 'Ransomware', 'Drugs', 'Weapons', 'Stolen Data', 'Money Laundering', 'Terror Financing', 'Hacking Services', 'Fraud'];

function getRelativeTime(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const d = Math.floor(diff / 86400000), h = Math.floor(diff / 3600000), m = Math.floor(diff / 60000);
  return d > 0 ? `${d}d ago` : h > 0 ? `${h}h ago` : `${m}m ago`;
}

function TimelineEventItem({ event, idx }) {
  const cfg = EVENT_CONFIG[event.type] || { color: '#607d8b', icon: '•', label: event.type };
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2, position: 'relative' }}>
      {/* Line */}
      <Box sx={{ position: 'absolute', left: 17, top: 36, bottom: -8, width: 2, background: `${cfg.color}22`, zIndex: 0 }} />
      {/* Icon bubble */}
      <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: `${cfg.color}20`, border: `2px solid ${cfg.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, zIndex: 1 }}>
        {cfg.icon}
      </Box>
      {/* Content */}
      <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, background: 'rgba(255,255,255,0.03)', border: `1px solid ${cfg.color}22`, '&:hover': { background: 'rgba(255,255,255,0.05)' }, transition: 'background 0.15s' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={cfg.label} size="small" sx={{ background: `${cfg.color}18`, color: cfg.color, fontWeight: 700, fontSize: '0.62rem', height: 20 }} />
            {event.handle && <Chip label={event.handle} size="small" sx={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontSize: '0.62rem', height: 20 }} />}
            {event.category && <Chip label={event.category} size="small" sx={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', fontSize: '0.58rem', height: 18 }} />}
          </Box>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', flexShrink: 0 }}>{getRelativeTime(event.timestamp)}</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', lineHeight: 1.5 }}>{event.description}</Typography>
        {event.confidence && (
          <Typography variant="caption" sx={{ color: `${event.confidence >= 80 ? '#4caf50' : event.confidence >= 60 ? '#ff9800' : '#f44336'}`, fontWeight: 700, fontSize: '0.65rem' }}>
            Attribution: {event.confidence}%
          </Typography>
        )}
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', display: 'block', mt: 0.3, fontFamily: 'monospace', fontSize: '0.6rem' }}>
          {new Date(event.timestamp).toISOString()}
        </Typography>
      </Box>
    </Box>
  );
}

export default function TimelineQueryEngine() {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 90); return d.toISOString().split('T')[0]; });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('All');
  const [minConf, setMinConf] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState([]);
  const [replaying, setReplaying] = useState(false);
  const [replayIdx, setReplayIdx] = useState(0);
  const replayRef = React.useRef(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ from: fromDate, to: toDate, limit: 200 });
      if (category !== 'All') params.set('category', category);
      if (minConf > 0) params.set('minConfidence', minConf);
      const evRes = await fetch(`${API_BASE}/timeline/events?${params}`).then(r => r.json());
      if (evRes.success) setEvents(evRes.data);
    } catch {
      setEvents(generateSampleEvents());
    }
    setLoading(false);
  }, [fromDate, toDate, category, minConf]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  useEffect(() => {
    let result = events;
    if (search) result = result.filter(e => JSON.stringify(e).toLowerCase().includes(search.toLowerCase()));
    if (typeFilter.length > 0) result = result.filter(e => typeFilter.includes(e.type));
    setFiltered(result);
  }, [events, search, typeFilter]);

  const startReplay = () => {
    setReplaying(true); setReplayIdx(0);
    const sorted = [...filtered].reverse();
    let i = 0;
    replayRef.current = setInterval(() => {
      setReplayIdx(++i);
      if (i >= sorted.length) { clearInterval(replayRef.current); setReplaying(false); }
    }, 300);
  };
  const stopReplay = () => { clearInterval(replayRef.current); setReplaying(false); };

  const exportCSV = () => {
    const hdr = 'timestamp,type,handle,category,confidence,description';
    const rows = filtered.map(e => `"${e.timestamp}","${e.type}","${e.handle || ''}","${e.category || ''}","${e.confidence || ''}","${e.description}"`);
    const blob = new Blob([[hdr, ...rows].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `timeline_export_${Date.now()}.csv`; a.click();
  };

  const displayedEvents = replaying ? filtered.slice(0, replayIdx) : filtered;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #ff9800, #e65100)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, boxShadow: '0 4px 20px rgba(255,152,0,0.4)' }}>
            <TimelineIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', lineHeight: 1 }}>Timeline Query Engine</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
              Query intelligence database across a chosen timeline · Export filtered result sets
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Chip label="PS REQUIREMENT" sx={{ background: 'rgba(255,152,0,0.15)', color: '#ff9800', fontWeight: 700, fontSize: '0.7rem' }} />
            <Tooltip title={replaying ? 'Stop Replay' : 'Replay Timeline'}>
              <Button variant="outlined" size="small" startIcon={replaying ? <PauseIcon /> : <PlayIcon />}
                onClick={replaying ? stopReplay : startReplay}
                sx={{ borderColor: '#ff9800', color: '#ff9800', '&:hover': { background: 'rgba(255,152,0,0.1)' } }}>
                {replaying ? 'Stop' : 'Replay'}
              </Button>
            </Tooltip>
            <Tooltip title="Export CSV"><IconButton onClick={exportCSV} sx={{ color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' }}><DownloadIcon /></IconButton></Tooltip>
            <Tooltip title="Refresh"><IconButton onClick={loadEvents} sx={{ color: '#ff9800', border: '1px solid rgba(255,152,0,0.3)' }}><RefreshIcon /></IconButton></Tooltip>
          </Box>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,152,0,0.2)', mt: 2 }} />
      </Box>

      {/* Filters */}
      <Paper sx={{ ...glassCard, p: 2.5, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.68rem' }}>Query Parameters</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField fullWidth label="From Date" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' }, shrink: true }}
              InputProps={{ sx: { color: 'white', '& fieldset': { borderColor: 'rgba(255,152,0,0.3)' } } }} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField fullWidth label="To Date" type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' }, shrink: true }}
              InputProps={{ sx: { color: 'white', '& fieldset': { borderColor: 'rgba(255,152,0,0.3)' } } }} />
          </Grid>
          <Grid item xs={6} sm={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Category</InputLabel>
              <Select value={category} onChange={e => setCategory(e.target.value)} label="Category"
                sx={{ color: 'white', '& fieldset': { borderColor: 'rgba(255,152,0,0.3)' } }}>
                {CATEGORY_OPTIONS.map(c => <MenuItem key={c} value={c} sx={{ fontSize: '0.82rem' }}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Min Confidence: {minConf}%</Typography>
            <Slider value={minConf} onChange={(_, v) => setMinConf(v)} min={0} max={90} step={5}
              sx={{ color: '#ff9800', '& .MuiSlider-thumb': { width: 14, height: 14 } }} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField fullWidth size="small" label="Search events" value={search} onChange={e => setSearch(e.target.value)}
              InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }}
              InputProps={{ sx: { color: 'white', '& fieldset': { borderColor: 'rgba(255,152,0,0.3)' } }, startAdornment: <SearchIcon sx={{ color: 'rgba(255,255,255,0.4)', mr: 0.5, fontSize: 18 }} /> }} />
          </Grid>
        </Grid>

        {/* Event type filter chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 2 }}>
          {Object.entries(EVENT_CONFIG).map(([type, cfg]) => (
            <Chip key={type} label={`${cfg.icon} ${cfg.label}`} size="small" clickable
              onClick={() => setTypeFilter(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])}
              sx={{ background: typeFilter.includes(type) ? `${cfg.color}30` : 'rgba(255,255,255,0.05)', color: typeFilter.includes(type) ? cfg.color : 'rgba(255,255,255,0.5)', border: `1px solid ${typeFilter.includes(type) ? cfg.color : 'rgba(255,255,255,0.08)'}`, fontSize: '0.68rem', transition: 'all 0.15s' }} />
          ))}
          {typeFilter.length > 0 && <Chip label="Clear" size="small" onClick={() => setTypeFilter([])} sx={{ background: 'rgba(244,67,54,0.15)', color: '#f44336', fontSize: '0.68rem' }} />}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Stats */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {[
              { label: 'Events in Range', value: filtered.length, color: '#ff9800' },
              { label: 'Actor Discoveries', value: filtered.filter(e => e.type === 'ACTOR_DISCOVERED').length, color: '#2196f3' },
              { label: 'IPs De-cloaked', value: filtered.filter(e => e.type === 'IP_DECLOAKED').length, color: '#f44336' },
              { label: 'Wallet Links', value: filtered.filter(e => e.type === 'WALLET_LINKED').length, color: '#ff9800' },
              { label: 'Scans Completed', value: filtered.filter(e => e.type === 'SCAN_COMPLETED').length, color: '#4caf50' },
            ].map((k, i) => (
              <Grid item xs={6} sm={2.4} key={i}>
                <Paper sx={{ ...glassCard, p: 2, textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ color: k.color, fontWeight: 800 }}>{k.value}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.68rem' }}>{k.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Timeline */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ ...glassCard, p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                Intelligence Timeline {replaying && <Chip label={`REPLAYING ${replayIdx}/${filtered.length}`} size="small" sx={{ ml: 1, background: 'rgba(255,152,0,0.2)', color: '#ff9800', animation: 'pulse 1s infinite', fontSize: '0.65rem' }} />}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)' }}>{displayedEvents.length} events</Typography>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#ff9800' }} /></Box>
            ) : displayedEvents.length === 0 ? (
              <Alert severity="info">No events found for the selected filters. Try widening the date range or adjusting the confidence threshold.</Alert>
            ) : (
              <Box sx={{ maxHeight: 600, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,152,0,0.3)', borderRadius: 2 } }}>
                {displayedEvents.map((e, i) => <TimelineEventItem key={`${e.timestamp}-${i}`} event={e} idx={i} />)}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Event Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ ...glassCard, p: 2.5, mb: 3 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>Event Distribution</Typography>
            {Object.entries(EVENT_CONFIG).map(([type, cfg]) => {
              const count = filtered.filter(e => e.type === type).length;
              const pct = filtered.length > 0 ? Math.round((count / filtered.length) * 100) : 0;
              return (
                <Box key={type} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem' }}>{cfg.icon} {cfg.label}</Typography>
                    <Typography variant="caption" sx={{ color: cfg.color, fontWeight: 700 }}>{count}</Typography>
                  </Box>
                  <Box sx={{ height: 5, borderRadius: 2.5, background: 'rgba(255,255,255,0.06)' }}>
                    <Box sx={{ height: '100%', borderRadius: 2.5, width: `${pct}%`, background: cfg.color, opacity: 0.7, transition: 'width 0.5s' }} />
                  </Box>
                </Box>
              );
            })}
          </Paper>

          <Paper sx={{ ...glassCard, p: 2.5 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>Export Result Set</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 2, fontSize: '0.8rem' }}>
              Export the current filtered timeline across the selected date range as required by NTRO PS-26151.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[['CSV', '#4caf50', 'exportCSV'], ['JSON', '#ff9800', null]].map(([fmt, color]) => (
                <Button key={fmt} variant="outlined" size="small" startIcon={<DownloadIcon />}
                  onClick={() => { if (fmt === 'JSON') { const blob = new Blob([JSON.stringify({ query: { from: fromDate, to: toDate, category, minConf }, count: filtered.length, events: filtered }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `timeline_${Date.now()}.json`; a.click(); } else exportCSV(); }}
                  sx={{ borderColor: `${color}66`, color, justifyContent: 'flex-start' }}>
                  Export as {fmt} ({filtered.length} events)
                </Button>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function generateSampleEvents() {
  const actors = [
    { actorId: 'ACTOR-AA01', handle: 'DarkPhantom_v2', category: 'Ransomware', confidence: 94 },
    { actorId: 'ACTOR-BB02', handle: 'SilkReborn_Admin', category: 'Drugs', confidence: 88 },
    { actorId: 'ACTOR-CC03', handle: 'GhostNet_Broker', category: 'Hacking Services', confidence: 71 },
  ];
  const events = [];
  actors.forEach((a, ai) => {
    const base = Date.now() - (90 - ai * 30) * 86400000;
    events.push({ type: 'ACTOR_DISCOVERED', timestamp: new Date(base).toISOString(), ...a, description: `Threat actor "${a.handle}" first identified via forum crawler` });
    events.push({ type: 'WALLET_LINKED', timestamp: new Date(base + 3 * 86400000).toISOString(), ...a, confidence: 92, description: `BTC wallet linked via blockchain analysis` });
    if (ai < 2) events.push({ type: 'IP_DECLOAKED', timestamp: new Date(base + 7 * 86400000).toISOString(), ...a, confidence: 89, description: `Origin server de-cloaked via TLS certificate SAN leak` });
    events.push({ type: 'ACTOR_RESCANNED', timestamp: new Date(base + 14 * 86400000).toISOString(), ...a, description: `Scheduled rescan completed` });
  });
  for (let i = 0; i < 10; i++) events.push({ type: 'SCAN_COMPLETED', timestamp: new Date(Date.now() - i * 7 * 86400000).toISOString(), actorId: null, handle: null, category: null, confidence: null, description: `Batch scan completed: ${15 + i * 3} onion sites analyzed` });
  return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}
