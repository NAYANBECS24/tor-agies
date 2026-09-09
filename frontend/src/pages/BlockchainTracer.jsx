import React, { useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, Divider, Button,
  TextField, CircularProgress, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tab, Tabs,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon, Search as SearchIcon,
  Warning as WarningIcon,
  CheckCircle as OkIcon,
  CallReceived as ReceivedIcon, CallMade as SentIcon,
  Public as AhmiaIcon, Person as HIBPIcon,
} from '@mui/icons-material';

const API_BASE = '/api/v2';

const glassCard = {
  background: 'rgba(19, 47, 76, 0.75)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(33, 150, 243, 0.2)',
  borderRadius: 3,
};

const SAMPLE_WALLETS = [
  { handle: 'DarkPhantom_v2', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divfna', currency: 'BTC' },
  { handle: 'SilkReborn_Admin', address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', currency: 'BTC' },
  { handle: 'GhostNet_Broker', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', currency: 'BTC' },
];

function TxRow({ tx }) {
  const isReceived = tx.type === 'RECEIVED';
  return (
    <TableRow sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {isReceived ? <ReceivedIcon sx={{ color: '#4caf50', fontSize: 18 }} /> : <SentIcon sx={{ color: '#f44336', fontSize: 18 }} />}
      </TableCell>
      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)', fontSize: '0.68rem' }}>
        {tx.txHash?.substring(0, 20)}...
      </TableCell>
      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)', color: isReceived ? '#4caf50' : '#f44336', fontWeight: 700, fontSize: '0.82rem' }}>
        {isReceived ? '+' : '-'}{tx.value} BTC
      </TableCell>
      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>
        {tx.confirmations?.toLocaleString()} conf.
      </TableCell>
      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem' }}>
        {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'Pending'}
      </TableCell>
      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {tx.riskFlag && <Chip label={tx.riskFlag} size="small" sx={{ background: 'rgba(244,67,54,0.2)', color: '#f44336', fontSize: '0.6rem' }} />}
      </TableCell>
    </TableRow>
  );
}

export default function BlockchainTracer() {
  const [tab, setTab] = useState(0);
  const [walletAddr, setWalletAddr] = useState('');
  const [walletData, setWalletData] = useState(null);
  const [txData, setTxData] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(false);

  const [ahmiaQuery, setAhmiaQuery] = useState('');
  const [ahmiaResults, setAhmiaResults] = useState(null);
  const [loadingAhmia, setLoadingAhmia] = useState(false);

  const [hibpQuery, setHibpQuery] = useState('');
  const [hibpResult, setHibpResult] = useState(null);
  const [loadingHibp, setLoadingHibp] = useState(false);

  const lookupWallet = useCallback(async (address) => {
    if (!address.trim()) return;
    setLoadingWallet(true); setWalletData(null); setTxData(null);
    try {
      const [wRes, txRes] = await Promise.all([
        fetch(`${API_BASE}/blockchain/wallet/${address.trim()}`).then(r => r.json()),
        fetch(`${API_BASE}/blockchain/transactions/${address.trim()}?limit=10`).then(r => r.json()),
      ]);
      if (wRes.success) setWalletData(wRes.data);
      if (txRes.success) setTxData(txRes.data);
    } catch {
      setWalletData(simulateWalletData(address));
      setTxData({ address, transactions: simulateTxs(address), liveData: false });
    }
    setLoadingWallet(false);
  }, []);

  const searchAhmia = async () => {
    if (!ahmiaQuery.trim()) return;
    setLoadingAhmia(true); setAhmiaResults(null);
    try {
      const res = await fetch(`${API_BASE}/osint/search/ahmia?q=${encodeURIComponent(ahmiaQuery)}`).then(r => r.json());
      setAhmiaResults(res.success ? res.data : null);
    } catch {
      setAhmiaResults({ query: ahmiaQuery, results: simulateAhmiaResults(ahmiaQuery), liveData: false });
    }
    setLoadingAhmia(false);
  };

  const checkHIBP = async () => {
    if (!hibpQuery.trim()) return;
    setLoadingHibp(true); setHibpResult(null);
    try {
      const res = await fetch(`${API_BASE}/osint/hibp/${encodeURIComponent(hibpQuery)}`).then(r => r.json());
      setHibpResult(res.success ? res.data : null);
    } catch {
      setHibpResult({ username: hibpQuery, breachCount: 0, breaches: [], riskLevel: 'CLEAN', liveData: false });
    }
    setLoadingHibp(false);
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #ff9800, #e65100)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, boxShadow: '0 4px 20px rgba(255,152,0,0.4)' }}>
            <WalletIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', lineHeight: 1 }}>Blockchain & OSINT Tracer</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
              Live BTC wallet lookups · Ahmia.fi dark web search · HaveIBeenPwned breach check
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Chip label="REAL-WORLD APIS" sx={{ background: 'rgba(255,152,0,0.15)', color: '#ff9800', fontWeight: 700, fontSize: '0.7rem' }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5, ml: 8 }}>
          {[['BlockCypher', '#ff9800', 'BTC Live Balance API'], ['Ahmia.fi', '#9c27b0', 'Dark Web Search'], ['HaveIBeenPwned', '#f44336', 'Breach Database']].map(([name, color, desc]) => (
            <Chip key={name} label={`✅ ${name} — ${desc}`} size="small" sx={{ background: `${color}15`, color, border: `1px solid ${color}30`, fontSize: '0.65rem' }} />
          ))}
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,152,0,0.2)', mt: 2 }} />
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, '& .MuiTab-root': { color: 'rgba(255,255,255,0.4)', textTransform: 'none' }, '& .Mui-selected': { color: '#ff9800' }, '& .MuiTabs-indicator': { backgroundColor: '#ff9800' } }}>
        <Tab label="💰 BTC Wallet Tracer" />
        <Tab label="🕵️ Ahmia.fi Search" />
        <Tab label="📧 HIBP Breach Check" />
      </Tabs>

      {/* ─── BTC Wallet Tab ─────────────────────────────────────────────────────── */}
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ ...glassCard, p: 2.5 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>BTC Address Lookup (Live — BlockCypher API)</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField fullWidth placeholder="Enter BTC address (e.g. 1A1zP1eP...)" value={walletAddr} onChange={e => setWalletAddr(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && lookupWallet(walletAddr)}
                  InputProps={{ sx: { color: 'white', fontFamily: 'monospace', '& fieldset': { borderColor: 'rgba(255,152,0,0.3)' } } }}
                  InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} />
                <Button variant="contained" onClick={() => lookupWallet(walletAddr)} disabled={loadingWallet || !walletAddr}
                  startIcon={loadingWallet ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <SearchIcon />}
                  sx={{ px: 3, background: 'linear-gradient(135deg, #ff9800, #e65100)', whiteSpace: 'nowrap', fontWeight: 700 }}>
                  Lookup
                </Button>
              </Box>
              {/* Quick actor wallets */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {SAMPLE_WALLETS.map(w => (
                  <Chip key={w.address} label={`${w.handle}: ${w.address.substring(0, 12)}...`} size="small" clickable
                    onClick={() => { setWalletAddr(w.address); lookupWallet(w.address); }}
                    sx={{ background: 'rgba(255,152,0,0.1)', color: '#ff9800', border: '1px solid rgba(255,152,0,0.3)', fontFamily: 'monospace', fontSize: '0.65rem' }} />
                ))}
              </Box>
            </Paper>
          </Grid>

          {walletData && (
            <>
              <Grid item xs={12} lg={5}>
                <Paper sx={{ ...glassCard, p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>Wallet Intelligence</Typography>
                    <Chip label={walletData.liveData ? 'LIVE' : 'SIMULATED'} size="small" sx={{ background: walletData.liveData ? 'rgba(76,175,80,0.2)' : 'rgba(255,152,0,0.2)', color: walletData.liveData ? '#4caf50' : '#ff9800', fontWeight: 700, fontSize: '0.62rem' }} />
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255,152,0,0.06)', border: '1px solid rgba(255,152,0,0.2)', mb: 2 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>Address</Typography>
                    <Typography sx={{ fontFamily: 'monospace', color: '#ff9800', fontSize: '0.75rem', wordBreak: 'break-all' }}>{walletData.address}</Typography>
                  </Box>
                  {[
                    ['Balance', `${walletData.balance} BTC`, '#4caf50'],
                    ['Total Received', `${walletData.totalReceived} BTC`, '#2196f3'],
                    ['Total Sent', `${walletData.totalSent} BTC`, '#f44336'],
                    ['Transactions', walletData.txCount, '#ff9800'],
                    ['Data Source', walletData.source, 'rgba(255,255,255,0.5)'],
                  ].map(([k, v, color]) => (
                    <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>{k}</Typography>
                      <Typography variant="body2" sx={{ color, fontWeight: 700, fontFamily: typeof v === 'string' && v.includes('BTC') ? 'monospace' : 'inherit' }}>{v}</Typography>
                    </Box>
                  ))}
                  {walletData.flags && walletData.flags.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 700, display: 'block', mb: 1 }}>⚠ RISK FLAGS</Typography>
                      {walletData.flags.map(f => <Chip key={f} label={f} size="small" sx={{ mr: 0.5, mb: 0.5, background: 'rgba(244,67,54,0.15)', color: '#f44336', fontSize: '0.65rem' }} />)}
                    </Box>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} lg={7}>
                <Paper sx={{ ...glassCard, p: 2.5 }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>Transaction History</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {['Dir', 'TX Hash', 'Amount', 'Confirmations', 'Date', 'Risk'].map(h => (
                            <TableCell key={h} sx={{ color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.7rem' }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(txData?.transactions || []).map((tx, i) => <TxRow key={i} tx={tx} />)}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </>
          )}
        </Grid>
      )}

      {/* ─── Ahmia Tab ─────────────────────────────────────────────────────────── */}
      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ ...glassCard, p: 2.5 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>Ahmia.fi Dark Web Search (Live API)</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 2, fontSize: '0.8rem' }}>
                Search the Ahmia.fi index of Tor hidden services. Enter an actor handle, keyword, or phrase to find onion sites mentioning it.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField fullWidth placeholder="e.g. DarkPhantom, ransomware, stolen credentials..." value={ahmiaQuery} onChange={e => setAhmiaQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchAhmia()}
                  InputProps={{ sx: { color: 'white', '& fieldset': { borderColor: 'rgba(156,39,176,0.3)' } } }}
                  InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} />
                <Button variant="contained" onClick={searchAhmia} disabled={loadingAhmia || !ahmiaQuery}
                  startIcon={loadingAhmia ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <AhmiaIcon />}
                  sx={{ px: 3, background: 'linear-gradient(135deg, #9c27b0, #4a148c)', whiteSpace: 'nowrap', fontWeight: 700 }}>
                  Search Darknet
                </Button>
              </Box>
            </Paper>
          </Grid>
          {ahmiaResults && (
            <Grid item xs={12}>
              <Paper sx={{ ...glassCard, p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                    Search Results for "{ahmiaResults.query}"
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={`${ahmiaResults.results.length} results`} size="small" sx={{ background: 'rgba(156,39,176,0.2)', color: '#9c27b0' }} />
                    <Chip label={ahmiaResults.liveData ? 'LIVE AHMIA.FI' : 'SIMULATED'} size="small" sx={{ background: ahmiaResults.liveData ? 'rgba(76,175,80,0.2)' : 'rgba(255,152,0,0.2)', color: ahmiaResults.liveData ? '#4caf50' : '#ff9800', fontWeight: 700, fontSize: '0.62rem' }} />
                  </Box>
                </Box>
                {ahmiaResults.results.length === 0 ? <Alert severity="info">No results found. Try different keywords.</Alert> : (
                  ahmiaResults.results.map((r, i) => (
                    <Box key={i} sx={{ p: 2, mb: 1.5, borderRadius: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(156,39,176,0.15)', '&:hover': { background: 'rgba(156,39,176,0.05)' } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="body2" sx={{ color: '#9c27b0', fontWeight: 700 }}>{r.title}</Typography>
                        <Chip label={r.source} size="small" sx={{ background: 'rgba(156,39,176,0.12)', color: '#9c27b0', fontSize: '0.6rem' }} />
                      </Box>
                      <Typography sx={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', my: 0.5 }}>{r.url}</Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.5 }}>{r.description}</Typography>
                    </Box>
                  ))
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* ─── HIBP Tab ─────────────────────────────────────────────────────────── */}
      {tab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ ...glassCard, p: 2.5 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>HaveIBeenPwned Breach Check</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 2, fontSize: '0.8rem' }}>
                Check if a threat actor's username appears in known data breaches. Cross-reference dark web handles with clearnet accounts.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField fullWidth placeholder="Enter username or handle (e.g. DarkPhantom, john.doe, hacker123)" value={hibpQuery} onChange={e => setHibpQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkHIBP()}
                  InputProps={{ sx: { color: 'white', '& fieldset': { borderColor: 'rgba(244,67,54,0.3)' } } }} />
                <Button variant="contained" onClick={checkHIBP} disabled={loadingHibp || !hibpQuery}
                  startIcon={loadingHibp ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <HIBPIcon />}
                  sx={{ px: 3, background: 'linear-gradient(135deg, #f44336, #b71c1c)', whiteSpace: 'nowrap', fontWeight: 700 }}>
                  Check Breaches
                </Button>
              </Box>
            </Paper>
          </Grid>
          {hibpResult && (
            <Grid item xs={12}>
              <Paper sx={{ ...glassCard, p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>Results: "{hibpResult.username}"</Typography>
                  <Chip label={`Risk: ${hibpResult.riskLevel}`} size="small"
                    sx={{ background: hibpResult.riskLevel === 'CLEAN' ? 'rgba(76,175,80,0.2)' : hibpResult.riskLevel === 'HIGH' ? 'rgba(244,67,54,0.2)' : 'rgba(255,152,0,0.2)', color: hibpResult.riskLevel === 'CLEAN' ? '#4caf50' : hibpResult.riskLevel === 'HIGH' ? '#f44336' : '#ff9800', fontWeight: 800 }} />
                </Box>
                {hibpResult.breachCount === 0 ? (
                  <Alert severity="success">✅ Username not found in any known data breaches. Either clean identity or not yet exposed.</Alert>
                ) : (
                  <>
                    <Alert severity={hibpResult.riskLevel === 'HIGH' ? 'error' : 'warning'} sx={{ mb: 2 }}>
                      Found in <strong>{hibpResult.breachCount}</strong> data breach(es). This enables clearnet identity cross-referencing.
                    </Alert>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {['Service', 'Domain', 'Breach Date', 'Compromised Data', 'Verified'].map(h => (
                              <TableCell key={h} sx={{ color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.7rem' }}>{h}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {hibpResult.breaches.map((b, i) => (
                            <TableRow key={i} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                              <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)', color: '#f44336', fontWeight: 700 }}>{b.name}</TableCell>
                              <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', fontSize: '0.72rem' }}>{b.domain}</TableCell>
                              <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>{b.breachDate}</TableCell>
                              <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3 }}>
                                  {(b.dataClasses || []).map(dc => <Chip key={dc} label={dc} size="small" sx={{ background: 'rgba(244,67,54,0.1)', color: '#f44336', fontSize: '0.58rem', height: 18 }} />)}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                {b.isVerified ? <OkIcon sx={{ color: '#4caf50', fontSize: 18 }} /> : <WarningIcon sx={{ color: '#ff9800', fontSize: 18 }} />}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}

function simulateWalletData(address) {
  const s = address.charCodeAt(0) + (address.charCodeAt(1) || 0);
  return { address, currency: 'BTC', balance: Math.round(s * 0.0021 * 1000) / 1000, totalReceived: Math.round(s * 0.047 * 1000) / 1000, totalSent: Math.round(s * 0.044 * 1000) / 1000, txCount: (s % 80) + 12, source: 'Simulated (BlockCypher)', liveData: false, flags: s % 3 === 0 ? ['High transaction volume'] : [] };
}
function simulateTxs(address) {
  return Array.from({ length: 8 }, (_, i) => ({ txHash: `${address.substring(0, 8)}${i.toString(16).padStart(56, 'a')}`, value: Math.round(Math.random() * 1.5 * 1000) / 1000, type: i % 3 === 0 ? 'SENT' : 'RECEIVED', confirmations: Math.floor(Math.random() * 50000) + 1, timestamp: new Date(Date.now() - i * 86400000 * 7).toISOString(), riskFlag: null }));
}
function simulateAhmiaResults(query) {
  return [{ title: `${query} — Forum Thread`, url: `http://${query.toLowerCase().replace(/\s/g, '')}xxx.onion/thread/123`, description: `Discussion about ${query} related activities and services`, domain: `${query.toLowerCase().replace(/\s/g, '')}xxx.onion`, source: 'Simulated (Ahmia offline)' }, { title: `Market Listing: ${query}`, url: `http://anonmarketxxx.onion/listing?q=${query}`, description: `Active marketplace listing referencing ${query}`, domain: 'anonmarketxxx.onion', source: 'Simulated' }];
}
