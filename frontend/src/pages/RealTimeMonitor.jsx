import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Paper, Chip, IconButton,
  TextField, InputAdornment, Tooltip, Divider, LinearProgress, Alert,
  CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Switch,
  FormControlLabel, Badge, Collapse,
} from '@mui/material';
import {
  Monitor as MonitorIcon, Add as AddIcon, Delete as DeleteIcon,
  Refresh as RefreshIcon, CheckCircle as OnlineIcon, Error as OfflineIcon,
  Warning as ChangedIcon, FiberManualRecord as DotIcon, Search as SearchIcon,
  ContentCopy as CopyIcon, Launch as LaunchIcon, Notifications as AlertIcon,
  Timeline as TimelineIcon, Close as CloseIcon,
  ExpandMore as ExpandIcon, ExpandLess as CollapseIcon,
} from '@mui/icons-material';

const glassCard = {
  background: 'linear-gradient(135deg, rgba(19,47,76,0.85), rgba(10,25,41,0.9))',
  border: '1px solid rgba(33,150,243,0.18)',
  borderRadius: 3,
};

const WATCH_PRESETS = [
  { url: 'http://darkphantomxxx.onion', label: 'DarkPhantom Portal', category: 'RaaS Market' },
  { url: 'http://breachforumsxxx.onion', label: 'BreachForums Mirror', category: 'Data Market' },
  { url: 'http://hydraxxx.onion', label: 'Hydra Reborn', category: 'DNM' },
  { url: 'http://alphabayxxx.onion', label: 'AlphaBay v2', category: 'DNM' },
  { url: 'http://silkreborn777.onion', label: 'SilkReborn Market', category: 'DNM' },
];

function generateSiteStatus(url, prev) {
  const rand = Math.random();
  const prevStatus = prev?.status || 'OFFLINE';
  if (prevStatus === 'ONLINE') {
    if (rand < 0.08) return 'CHANGED';
    if (rand < 0.13) return 'OFFLINE';
    return 'ONLINE';
  } else if (prevStatus === 'OFFLINE') {
    if (rand < 0.3) return 'ONLINE';
    return 'OFFLINE';
  } else {
    return rand < 0.6 ? 'ONLINE' : 'CHANGED';
  }
}

function generateMockSiteData(url, status) {
  const headers = status !== 'OFFLINE' ? {
    'Server': 'nginx/1.22.1',
    'Content-Type': 'text/html; charset=UTF-8',
    'X-Powered-By': `PHP/${['7.4.33', '8.0.28', '8.1.18'][Math.floor(Math.random() * 3)]}`,
    'X-Content-Type-Options': 'nosniff',
    'ETag': `"${Math.random().toString(16).substr(2, 16)}"`,
  } : {};

  return {
    status,
    responseTimeMs: status === 'OFFLINE' ? null : Math.floor(Math.random() * 800 + 150),
    httpStatus: status === 'OFFLINE' ? null : (status === 'CHANGED' ? [200, 301, 403][Math.floor(Math.random() * 3)] : 200),
    headers,
    bodyFingerprint: status !== 'OFFLINE' ? Math.random().toString(16).substr(2, 32) : null,
    extractedAddresses: status !== 'OFFLINE' ? [`1${Math.random().toString(16).substr(2, 32)}`, `bc1q${Math.random().toString(16).substr(2, 30)}`] : [],
    pgpDetected: status !== 'OFFLINE' && Math.random() > 0.6,
    tlsExpiry: status !== 'OFFLINE' ? new Date(Date.now() + Math.floor(Math.random() * 300 * 86400000)).toISOString().split('T')[0] : null,
    lastChecked: new Date().toISOString(),
    changeDetails: status === 'CHANGED' ? {
      type: ['New BTC wallet added', 'Server header changed', 'PGP key rotated', 'New contact handle', 'HTTP status code change'][Math.floor(Math.random() * 5)],
      diff: 'Content fingerprint mismatch detected'
    } : null
  };
}

const statusColor = { ONLINE: '#4caf50', OFFLINE: '#f44336', CHANGED: '#ff9800', CHECKING: '#2196f3', PENDING: 'rgba(255,255,255,0.3)' };

export default function RealTimeMonitor() {
  const [watchlist, setWatchlist] = useState(() =>
    WATCH_PRESETS.map(p => ({
      ...p, id: Math.random().toString(36).substr(2, 9),
      addedAt: new Date().toISOString(), status: 'PENDING', data: null,
      history: [], alertEnabled: true, checkCount: 0,
    }))
  );
  const [events, setEvents] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [pollInterval, setPollInterval] = useState(30000);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const intervalRef = useRef(null);

  const doCheck = useCallback(() => {
    setWatchlist(prev => {
      const updated = prev.map(site => {
        const newData = generateMockSiteData(site.url, generateSiteStatus(site.url, site.data));
        const statusChanged = site.data && site.data.status !== newData.status;
        const contentChanged = site.data && site.data.bodyFingerprint !== newData.bodyFingerprint && newData.status !== 'OFFLINE';

        if ((statusChanged || contentChanged) && site.alertEnabled) {
          const evt = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            site: site.label || site.url,
            url: site.url,
            type: statusChanged ? 'STATUS_CHANGE' : 'CONTENT_CHANGE',
            message: statusChanged
              ? `${site.label || site.url}: ${site.data?.status || '?'} → ${newData.status}`
              : `${site.label || site.url}: content fingerprint changed`,
            severity: newData.status === 'OFFLINE' ? 'warning' : newData.status === 'CHANGED' ? 'error' : 'info',
            details: newData.changeDetails,
          };
          setEvents(ev => [evt, ...ev.slice(0, 99)]);
        }
        return {
          ...site, data: newData, status: newData.status,
          checkCount: site.checkCount + 1,
          history: [...(site.history || []).slice(-20), { timestamp: newData.lastChecked, status: newData.status, responseTimeMs: newData.responseTimeMs }]
        };
      });
      return updated;
    });
  }, []);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    setWatchlist(prev => prev.map(s => ({ ...s, status: 'CHECKING' })));
    setTimeout(doCheck, 1500);
    intervalRef.current = setInterval(doCheck, pollInterval);
  }, [doCheck, pollInterval]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const addToWatchlist = () => {
    if (!newUrl.trim() || !newUrl.includes('.onion')) return;
    const entry = {
      id: Math.random().toString(36).substr(2, 9), url: newUrl.trim(),
      label: newUrl.trim().replace(/^https?:\/\//, '').substring(0, 22), category: 'Custom',
      addedAt: new Date().toISOString(), status: 'PENDING', data: null,
      history: [], alertEnabled: true, checkCount: 0,
    };
    setWatchlist(prev => [...prev, entry]);
    setNewUrl('');
  };

  const removeFromWatchlist = (id) => {
    setWatchlist(prev => prev.filter(s => s.id !== id));
    if (selectedSite?.id === id) { setSelectedSite(null); setDetailOpen(false); }
  };

  const statusIcon = (status) => {
    if (status === 'ONLINE') return <OnlineIcon sx={{ color: '#4caf50', fontSize: 16 }} />;
    if (status === 'OFFLINE') return <OfflineIcon sx={{ color: '#f44336', fontSize: 16 }} />;
    if (status === 'CHANGED') return <ChangedIcon sx={{ color: '#ff9800', fontSize: 16 }} />;
    return <CircularProgress size={14} sx={{ color: '#2196f3' }} />;
  };

  const summaryStats = {
    online: watchlist.filter(s => s.status === 'ONLINE').length,
    offline: watchlist.filter(s => s.status === 'OFFLINE').length,
    changed: watchlist.filter(s => s.status === 'CHANGED').length,
    total: watchlist.length,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #4caf50, #69f0ae)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5 }}>
            Real-Time Onion Monitor
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
            <Chip label={isMonitoring ? `LIVE • ${(pollInterval / 1000).toFixed(0)}s intervals` : 'STANDBY'} size="small"
              sx={{ background: isMonitoring ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.08)', color: isMonitoring ? '#4caf50' : 'rgba(255,255,255,0.5)', fontWeight: 800, fontSize: '0.62rem' }}
            />
            <Chip label={`${summaryStats.total} Sites`} size="small" sx={{ background: 'rgba(33,150,243,0.1)', color: '#4dabf5', fontSize: '0.62rem' }} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Continuous uptime polling · Content fingerprint diffing · Header change detection · Alert feed
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {!isMonitoring ? (
            <Button variant="contained" startIcon={<MonitorIcon />} onClick={startMonitoring}
              sx={{ background: 'linear-gradient(135deg, #4caf50, #69f0ae)', color: '#000', fontWeight: 800 }}>
              Start Monitoring
            </Button>
          ) : (
            <Button variant="outlined" startIcon={<CloseIcon />} onClick={stopMonitoring}
              sx={{ borderColor: '#f44336', color: '#f44336' }}>
              Stop
            </Button>
          )}
        </Box>
      </Box>

      {/* KPI Bar */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Sites Online', value: summaryStats.online, color: '#4caf50' },
          { label: 'Sites Offline', value: summaryStats.offline, color: '#f44336' },
          { label: 'Content Changed', value: summaryStats.changed, color: '#ff9800' },
          { label: 'Change Events', value: events.length, color: '#2196f3' },
        ].map((k, i) => (
          <Grid item xs={6} md={3} key={i}>
            <Card sx={{ ...glassCard, border: `1px solid ${k.color}30` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: k.color }}>{k.value}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>{k.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add to Watchlist */}
      <Paper sx={{ p: 2, mb: 3, ...glassCard, border: '1px solid rgba(76,175,80,0.25)' }}>
        <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, mb: 1.5 }}>Add Onion to Watchlist</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <TextField size="small" placeholder="http://example.onion" value={newUrl} onChange={e => setNewUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addToWatchlist()}
            sx={{ flex: 1, minWidth: 220 }}
            InputProps={{ sx: { color: 'white', fontFamily: 'monospace', fontSize: '0.85rem', background: 'rgba(0,0,0,0.2)', '& fieldset': { borderColor: 'rgba(76,175,80,0.3)' } } }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={addToWatchlist} sx={{ background: '#4caf50', color: '#000', fontWeight: 700 }}>Add</Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Watchlist */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, ...glassCard }}>
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>Watchlist ({watchlist.length} sites)</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 520, overflowY: 'auto' }}>
              {watchlist.map(site => (
                <Box key={site.id} sx={{
                  p: 1.5, borderRadius: 2, cursor: 'pointer',
                  background: selectedSite?.id === site.id ? 'rgba(76,175,80,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selectedSite?.id === site.id ? 'rgba(76,175,80,0.4)' : `${statusColor[site.status] || 'rgba(255,255,255,0.08)'}30`}`,
                  transition: 'all 0.2s',
                  '&:hover': { background: 'rgba(76,175,80,0.06)' }
                }} onClick={() => { setSelectedSite(site); setDetailOpen(true); }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, overflow: 'hidden' }}>
                      {statusIcon(site.status)}
                      <Box>
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, display: 'block', fontSize: '0.8rem' }}>{site.label}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: '0.62rem' }}>{site.url.substring(0, 38)}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                      <Chip label={site.status} size="small" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 700, color: statusColor[site.status], background: `${statusColor[site.status]}20` }} />
                      <IconButton size="small" onClick={e => { e.stopPropagation(); removeFromWatchlist(site.id); }} sx={{ color: 'rgba(255,255,255,0.2)', '&:hover': { color: '#f44336' }, p: 0.3 }}>
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <Chip label={site.category} size="small" sx={{ height: 14, fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)' }} />
                    {site.data?.responseTimeMs && <Chip label={`${site.data.responseTimeMs}ms`} size="small" sx={{ height: 14, fontSize: '0.55rem', color: site.data.responseTimeMs < 400 ? '#4caf50' : '#ff9800', background: 'rgba(255,255,255,0.04)' }} />}
                    {site.data?.pgpDetected && <Chip label="PGP" size="small" sx={{ height: 14, fontSize: '0.55rem', color: '#9c27b0', background: 'rgba(156,39,176,0.1)' }} />}
                    {site.checkCount > 0 && <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem', ml: 'auto' }}>checked {site.checkCount}×</Typography>}
                  </Box>
                  {site.status === 'CHANGED' && site.data?.changeDetails && (
                    <Alert severity="warning" sx={{ mt: 0.5, py: 0, px: 1, fontSize: '0.65rem', '& .MuiAlert-icon': { fontSize: 14, mr: 0.5 } }}>
                      {site.data.changeDetails.type}
                    </Alert>
                  )}
                  {site.history.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.3, mt: 0.5, alignItems: 'center' }}>
                      {site.history.slice(-12).map((h, i) => (
                        <Box key={i} sx={{ width: 6, height: 6, borderRadius: '50%', background: statusColor[h.status] || 'rgba(255,255,255,0.2)' }} />
                      ))}
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.58rem', ml: 0.5 }}>history</Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Change Event Feed */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, ...glassCard, border: '1px solid rgba(244,67,54,0.15)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700 }}>Change Detection Feed</Typography>
              {events.length > 0 && <Button size="small" onClick={() => setEvents([])} sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>Clear</Button>}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 520, overflowY: 'auto' }}>
              {events.length === 0 && (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <MonitorIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.1)', mb: 1 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)' }}>{isMonitoring ? 'Monitoring... no changes yet' : 'Start monitoring to detect changes'}</Typography>
                </Box>
              )}
              {events.map(evt => (
                <Box key={evt.id}>
                  <Box sx={{
                    p: 1.5, borderRadius: 2, cursor: 'pointer',
                    background: evt.severity === 'error' ? 'rgba(244,67,54,0.08)' : evt.severity === 'warning' ? 'rgba(255,152,0,0.08)' : 'rgba(33,150,243,0.08)',
                    border: `1px solid ${evt.severity === 'error' ? 'rgba(244,67,54,0.25)' : evt.severity === 'warning' ? 'rgba(255,152,0,0.25)' : 'rgba(33,150,243,0.15)'}`
                  }} onClick={() => setExpandedEvent(expandedEvent === evt.id ? null : evt.id)}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5, flexWrap: 'wrap' }}>
                          <Chip label={evt.type} size="small" sx={{ height: 15, fontSize: '0.55rem', fontWeight: 800, color: evt.severity === 'error' ? '#f44336' : evt.severity === 'warning' ? '#ff9800' : '#2196f3', background: evt.severity === 'error' ? 'rgba(244,67,54,0.15)' : evt.severity === 'warning' ? 'rgba(255,152,0,0.15)' : 'rgba(33,150,243,0.15)' }} />
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem' }}>{new Date(evt.timestamp).toLocaleTimeString()}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.78rem', lineHeight: 1.4 }}>{evt.message}</Typography>
                      </Box>
                      {expandedEvent === evt.id ? <CollapseIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.3)' }} /> : <ExpandIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.3)' }} />}
                    </Box>
                    <Collapse in={expandedEvent === evt.id}>
                      {evt.details && (
                        <Box sx={{ mt: 1, p: 1, borderRadius: 1, background: 'rgba(0,0,0,0.2)' }}>
                          <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 700, display: 'block' }}>Change: {evt.details.type}</Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block' }}>{evt.details.diff}</Typography>
                        </Box>
                      )}
                    </Collapse>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Site Detail Dialog */}
      <Dialog open={detailOpen && !!selectedSite} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { background: 'linear-gradient(135deg, #0a1929, #132f4c)', border: '1px solid rgba(76,175,80,0.3)', borderRadius: 3 } }}>
        {selectedSite && (
          <>
            <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {statusIcon(selectedSite.status)}
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 800, lineHeight: 1.2 }}>{selectedSite.label}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: '0.7rem' }}>{selectedSite.url}</Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={() => setDetailOpen(false)} sx={{ color: 'rgba(255,255,255,0.4)' }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              {!selectedSite.data ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <CircularProgress sx={{ color: '#4caf50' }} />
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)', mt: 1 }}>Awaiting first check...</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {[
                    { label: 'HTTP Status', value: selectedSite.data.httpStatus || 'N/A', color: '#4caf50' },
                    { label: 'Response Time', value: selectedSite.data.responseTimeMs ? `${selectedSite.data.responseTimeMs}ms` : 'Timeout', color: '#2196f3' },
                    { label: 'TLS Expiry', value: selectedSite.data.tlsExpiry || 'N/A', color: '#ff9800' },
                    { label: 'PGP Block', value: selectedSite.data.pgpDetected ? 'Detected' : 'Not Found', color: selectedSite.data.pgpDetected ? '#9c27b0' : 'rgba(255,255,255,0.4)' },
                  ].map((item, i) => (
                    <Grid item xs={6} sm={3} key={i}>
                      <Box sx={{ p: 1.5, borderRadius: 1.5, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: item.color, fontWeight: 800 }}>{item.value}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem' }}>{item.label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                  {Object.keys(selectedSite.data.headers || {}).length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>HTTP Response Headers</Typography>
                      <TableContainer sx={{ background: 'rgba(0,0,0,0.3)', borderRadius: 2 }}>
                        <Table size="small">
                          <TableBody>
                            {Object.entries(selectedSite.data.headers).map(([k, v]) => (
                              <TableRow key={k}>
                                <TableCell sx={{ color: '#2196f3', borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'monospace', fontSize: '0.72rem', py: 0.7 }}>{k}</TableCell>
                                <TableCell sx={{ color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'monospace', fontSize: '0.72rem', py: 0.7 }}>{v}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  )}
                  {(selectedSite.data.extractedAddresses || []).length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ color: '#ff9800', fontWeight: 700, mb: 1 }}>💰 Extracted Crypto Addresses</Typography>
                      {selectedSite.data.extractedAddresses.map((addr, i) => (
                        <Box key={i} sx={{ p: 1, mb: 0.5, borderRadius: 1, background: 'rgba(255,152,0,0.1)', fontFamily: 'monospace', color: '#ffb74d', fontSize: '0.72rem', wordBreak: 'break-all' }}>{addr}</Box>
                      ))}
                    </Grid>
                  )}
                  {selectedSite.data.bodyFingerprint && (
                    <Grid item xs={12}>
                      <Box sx={{ p: 1.5, borderRadius: 1.5, background: 'rgba(255,255,255,0.03)' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 0.3 }}>Content Fingerprint (MD5)</Typography>
                        <Typography sx={{ color: '#9c27b0', fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 600 }}>{selectedSite.data.bodyFingerprint}</Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}