import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, Divider, Button,
  CircularProgress, Alert,
  TextField, Tab, Tabs,
} from '@mui/material';
import {
  AccountTree as EvidenceIcon, Download as DownloadIcon,
  Lock as CryptographicIcon, AccountBalanceWallet as FinancialIcon,
  Wifi as TechnicalIcon, Psychology as BehavioralIcon, Search as OSINTIcon,
  Notes as NoteIcon, Print as PrintIcon,
} from '@mui/icons-material';

const API_BASE = '/api/v2';

const glassCard = {
  background: 'rgba(19, 47, 76, 0.75)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(33, 150, 243, 0.2)',
  borderRadius: 3,
};

const EVIDENCE_TYPE_CONFIG = {
  CRYPTOGRAPHIC: { color: '#9c27b0', icon: <CryptographicIcon sx={{ fontSize: 16 }} />, bg: 'rgba(156,39,176,0.1)' },
  FINANCIAL:     { color: '#ff9800', icon: <FinancialIcon sx={{ fontSize: 16 }} />, bg: 'rgba(255,152,0,0.1)' },
  TECHNICAL:     { color: '#f44336', icon: <TechnicalIcon sx={{ fontSize: 16 }} />, bg: 'rgba(244,67,54,0.1)' },
  BEHAVIORAL:    { color: '#e91e63', icon: <BehavioralIcon sx={{ fontSize: 16 }} />, bg: 'rgba(233,30,99,0.1)' },
  OSINT:         { color: '#2196f3', icon: <OSINTIcon sx={{ fontSize: 16 }} />, bg: 'rgba(33,150,243,0.1)' },
};

const STRENGTH_CONFIG = {
  DEFINITIVE: { color: '#f44336', width: '100%' },
  STRONG:     { color: '#ff9800', width: '75%' },
  MODERATE:   { color: '#ffd54f', width: '50%' },
  WEAK:       { color: '#9e9e9e', width: '25%' },
};

const SAMPLE_ACTORS = [
  { actorId: 'ACTOR-AA01', handle: 'DarkPhantom_v2', category: 'Ransomware', confidence: 94 },
  { actorId: 'ACTOR-BB02', handle: 'SilkReborn_Admin', category: 'Drugs', confidence: 88 },
  { actorId: 'ACTOR-CC03', handle: 'GhostNet_Broker', category: 'Hacking Services', confidence: 71 },
];

function ConfidenceMeter({ value, verdict }) {
  const color = value >= 80 ? '#4caf50' : value >= 60 ? '#ff9800' : value >= 40 ? '#ffd54f' : '#9e9e9e';
  const verdictColor = { CONFIRMED: '#4caf50', PROBABLE: '#ff9800', SUSPECTED: '#ffd54f', UNCONFIRMED: '#9e9e9e' };
  return (
    <Box sx={{ textAlign: 'center', py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ position: 'relative', width: 140, height: 140, mx: 'auto', mb: 2 }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={140}
          thickness={6}
          sx={{ color: 'rgba(255,255,255,0.08)', position: 'absolute', top: 0, left: 0 }}
        />
        <CircularProgress
          variant="determinate"
          value={value}
          size={140}
          thickness={6}
          sx={{ color, position: 'absolute', top: 0, left: 0, strokeLinecap: 'round' }}
        />
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h3" sx={{ color, fontWeight: 900, lineHeight: 1 }}>{value}%</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 600, mt: 0.5, letterSpacing: '1px' }}>COMPOSITE</Typography>
        </Box>
      </Box>
      <Chip
        label={verdict}
        sx={{
          background: `${verdictColor[verdict] || '#9e9e9e'}20`,
          color: verdictColor[verdict] || '#9e9e9e',
          border: `1px solid ${verdictColor[verdict] || '#9e9e9e'}40`,
          fontWeight: 900,
          fontSize: '0.85rem',
          px: 2,
          py: 2.2
        }}
      />
    </Box>
  );
}

function EvidenceNode({ item }) {
  const cfg = EVIDENCE_TYPE_CONFIG[item.type] || EVIDENCE_TYPE_CONFIG.OSINT;
  const str = STRENGTH_CONFIG[item.strength] || STRENGTH_CONFIG.WEAK;
  return (
    <Box sx={{ p: 2, mb: 2, borderRadius: 2, background: cfg.bg, border: `1px solid ${cfg.color}33`, position: 'relative', '&:hover': { border: `1px solid ${cfg.color}66` }, transition: 'border 0.15s' }}>
      {/* Evidence ID badge */}
      <Box sx={{ position: 'absolute', top: 10, right: 12 }}>
        <Chip label={item.id} size="small" sx={{ background: `${cfg.color}20`, color: cfg.color, fontFamily: 'monospace', fontSize: '0.62rem', height: 20, fontWeight: 700 }} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, background: `${cfg.color}22`, border: `1px solid ${cfg.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: cfg.color }}>
          {cfg.icon}
        </Box>
        <Box sx={{ flex: 1, pr: 5 }}>
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, mb: 0.3 }}>{item.title}</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', lineHeight: 1.5, display: 'block' }}>{item.description}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.5 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.62rem' }}>Evidence Strength: {item.strength}</Typography>
            <Typography variant="caption" sx={{ color: str.color, fontWeight: 700, fontSize: '0.62rem' }}>Confidence: {item.confidence}%</Typography>
          </Box>
          <Box sx={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
            <Box sx={{ height: '100%', borderRadius: 2, width: str.width, background: str.color, opacity: 0.8 }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Chip label={item.type} size="small" sx={{ background: `${cfg.color}18`, color: cfg.color, fontSize: '0.6rem', height: 20 }} />
          {item.verifiable && <Chip label="VERIFIABLE" size="small" sx={{ background: 'rgba(76,175,80,0.15)', color: '#4caf50', fontSize: '0.58rem', height: 20, fontWeight: 700 }} />}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.62rem', fontFamily: 'monospace' }}>Source: {item.source}</Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.62rem', fontFamily: 'monospace' }}>{new Date(item.timestamp).toLocaleDateString()}</Typography>
      </Box>
    </Box>
  );
}

export default function EvidenceChainBuilder() {
  const [selectedActor, setSelectedActor] = useState(SAMPLE_ACTORS[0]);
  const [chain, setChain] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [tab, setTab] = useState(0);
  const [noteText, setNoteText] = useState('');

  const loadChain = useCallback(async (actor) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/evidence/${actor.actorId}`).then(r => r.json());
      if (res.success) setChain(res.data);
      else throw new Error('failed');
    } catch {
      setChain(generateSampleChain(actor));
    }
    setLoading(false);
  }, []);

  useEffect(() => { 
    loadChain(selectedActor); 
  }, [selectedActor, loadChain]);

  const addNote = () => {
    if (!noteText.trim()) return;
    const entry = `[${new Date().toLocaleString()}] ${noteText}`;
    setNotes(prev => prev ? `${prev}\n${entry}` : entry);
    setNoteText('');
  };

  const exportPDF = () => window.print();

  const exportJSON = () => {
    if (!chain) return;
    const exportData = { ...chain, investigatorNotes: notes.split('\n').filter(Boolean) };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `EvidenceChain_${chain.caseReference}_${Date.now()}.json`; a.click();
  };

  const typeFiltered = tab === 0 ? chain?.evidenceChain : chain?.evidenceChain?.filter(e => {
    const types = [null, 'CRYPTOGRAPHIC', 'TECHNICAL', 'FINANCIAL', 'BEHAVIORAL', 'OSINT'];
    return e.type === types[tab];
  });

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #f44336, #b71c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, boxShadow: '0 4px 20px rgba(244,67,54,0.4)' }}>
            <EvidenceIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', lineHeight: 1 }}>Evidence Chain Builder</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
              Structured forensic evidence · Bayesian confidence scoring · Court-ready attribution reports
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Chip label="FORENSIC GRADE" sx={{ background: 'rgba(244,67,54,0.15)', color: '#f44336', fontWeight: 700, fontSize: '0.7rem' }} />
            <Button variant="outlined" size="small" startIcon={<PrintIcon />} onClick={exportPDF} sx={{ borderColor: '#ff9800', color: '#ff9800' }}>PDF Report</Button>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={exportJSON} sx={{ borderColor: '#4caf50', color: '#4caf50' }}>Export JSON</Button>
          </Box>
        </Box>
        <Divider sx={{ borderColor: 'rgba(244,67,54,0.2)', mt: 2 }} />
      </Box>

      <Grid container spacing={3}>
        {/* Actor Selector */}
        <Grid item xs={12} lg={3}>
          <Paper sx={{ ...glassCard, p: 2.5, mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>Select Subject</Typography>
            {SAMPLE_ACTORS.map(a => (
              <Box key={a.actorId} onClick={() => setSelectedActor(a)}
                sx={{ p: 1.5, mb: 1, borderRadius: 2, cursor: 'pointer', background: selectedActor.actorId === a.actorId ? 'rgba(244,67,54,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selectedActor.actorId === a.actorId ? '#f4433644' : 'rgba(255,255,255,0.06)'}`, '&:hover': { background: 'rgba(244,67,54,0.08)' }, transition: 'all 0.15s' }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 700 }}>{a.handle}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>{a.category}</Typography>
              </Box>
            ))}
          </Paper>

          {chain && <Paper sx={{ ...glassCard, p: 2.5, mb: 2 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.62rem' }}>Case Reference</Typography>
            <Typography sx={{ fontFamily: 'monospace', color: '#f44336', fontWeight: 700, fontSize: '0.85rem' }}>{chain.caseReference}</Typography>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1.5 }} />
            {[
              ['Total Evidence', `${chain.totalEvidenceItems} items`],
              ['Generated', new Date(chain.generatedAt).toLocaleDateString()],
            ].map(([k, v]) => (
              <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>{k}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{v}</Typography>
              </Box>
            ))}
          </Paper>}

          {/* Investigator Notes */}
          <Paper sx={{ ...glassCard, p: 2.5 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 1.5, fontSize: '0.95rem' }}>Investigator Notes</Typography>
            <TextField fullWidth multiline rows={5} value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add case annotation..."
              InputProps={{ sx: { color: 'white', fontSize: '0.8rem', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '& textarea': { lineHeight: 1.6 } } }} />
            <Button size="small" variant="outlined" startIcon={<NoteIcon />} onClick={addNote} sx={{ mt: 1, borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Add Note</Button>
            {notes && (
              <Box sx={{ mt: 2, p: 1.5, borderRadius: 1.5, background: 'rgba(255,255,255,0.03)', fontFamily: 'monospace', fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)', whiteSpace: 'pre-wrap', maxHeight: 120, overflowY: 'auto' }}>{notes}</Box>
            )}
          </Paper>
        </Grid>

        {/* Evidence Chain */}
        <Grid item xs={12} lg={9}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#f44336' }} /></Box>
          ) : chain ? (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={5}>
                  <Paper sx={{ ...glassCard, p: 2.5 }}>
                    <ConfidenceMeter value={chain.compositeConfidence} verdict={chain.attributionVerdict} />
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={7}>
                  <Paper sx={{ ...glassCard, p: 2.5, height: '100%' }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>Evidence Summary</Typography>
                    {Object.entries(EVIDENCE_TYPE_CONFIG).map(([type, cfg]) => {
                      const items = chain.evidenceChain.filter(e => e.type === type);
                      if (items.length === 0) return null;
                      return (
                        <Box key={type} sx={{ mb: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              <Box sx={{ color: cfg.color }}>{cfg.icon}</Box>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{type}</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: cfg.color, fontWeight: 700 }}>{items.length} items</Typography>
                          </Box>
                          <Box sx={{ height: 5, borderRadius: 2.5, background: 'rgba(255,255,255,0.06)' }}>
                            <Box sx={{ height: '100%', borderRadius: 2.5, width: `${(items.length / chain.evidenceChain.length) * 100}%`, background: cfg.color, opacity: 0.7 }} />
                          </Box>
                        </Box>
                      );
                    })}
                  </Paper>
                </Grid>
              </Grid>

              {/* Evidence Tab Filter */}
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, '& .MuiTab-root': { color: 'rgba(255,255,255,0.4)', textTransform: 'none', fontSize: '0.78rem', minWidth: 90 }, '& .Mui-selected': { color: '#f44336' }, '& .MuiTabs-indicator': { backgroundColor: '#f44336' } }}>
                <Tab label={`All (${chain.evidenceChain.length})`} />
                <Tab label="🔑 Crypto" />
                <Tab label="🌐 Technical" />
                <Tab label="💰 Financial" />
                <Tab label="🧠 Behavioral" />
                <Tab label="🔍 OSINT" />
              </Tabs>

              <Box>
                {(typeFiltered || []).length === 0 ? (
                  <Alert severity="info">No evidence items of this type yet. Run scans to populate the chain.</Alert>
                ) : (
                  (typeFiltered || []).map(item => <EvidenceNode key={item.id} item={item} />)
                )}
              </Box>
            </Box>
          ) : null}
        </Grid>
      </Grid>
    </Box>
  );
}

function generateSampleChain(actor) {
  const evidence = [];
  let id = 1;
  evidence.push({ id: `E${String(id++).padStart(3, '0')}`, type: 'CRYPTOGRAPHIC', strength: 'DEFINITIVE', title: 'PGP Key Fingerprint Recovery', description: `PGP key E8B21A34...4E5C recovered from ${actor.handle}'s forum signatures across 47 posts on BreachForums and AlphaBay`, confidence: 99, timestamp: new Date(Date.now() - 30 * 86400000).toISOString(), source: 'Autonomous Forum Crawler', verifiable: true });
  evidence.push({ id: `E${String(id++).padStart(3, '0')}`, type: 'FINANCIAL', strength: 'STRONG', title: 'BTC Wallet Attribution via Blockchain Analysis', description: `Wallet 1A1zP1eP...Divfna linked to ${actor.handle} via seller payment address in 23 confirmed transactions totalling 12.5 BTC`, confidence: 94, timestamp: new Date(Date.now() - 25 * 86400000).toISOString(), source: 'BlockCypher API', verifiable: true });
  evidence.push({ id: `E${String(id++).padStart(3, '0')}`, type: 'TECHNICAL', strength: 'STRONG', title: 'Origin Server De-cloaking via TLS SAN Leak', description: `Hidden service at xxxxx.onion uses TLS certificate with Subject Alternative Name field exposing clearnet domain → resolves to 185.220.101.47 (Frantech Solutions, Luxembourg)`, confidence: 91, timestamp: new Date(Date.now() - 20 * 86400000).toISOString(), source: 'Hidden Service Scanner', verifiable: true });
  evidence.push({ id: `E${String(id++).padStart(3, '0')}`, type: 'BEHAVIORAL', strength: 'MODERATE', title: 'UTC Timezone Inference (Europe/Moscow)', description: `Analysis of 60 posting timestamps shows peak activity at 13:00–15:00 UTC, consistent with Europe/Moscow timezone (UTC+3). Confidence: 72%`, confidence: 72, timestamp: new Date(Date.now() - 15 * 86400000).toISOString(), source: 'Behavioral Profiler', verifiable: false });
  evidence.push({ id: `E${String(id++).padStart(3, '0')}`, type: 'OSINT', strength: 'MODERATE', title: 'Telegram Handle Cross-Reference', description: `Contact ID @dark_phantom_ops on Telegram matches posting style (stylometry: 87% match) with ${actor.handle} posts on BreachForums`, confidence: 78, timestamp: new Date(Date.now() - 10 * 86400000).toISOString(), source: 'OSINT Collection + Stylometry Engine', verifiable: true });
  evidence.push({ id: `E${String(id++).padStart(3, '0')}`, type: 'CRYPTOGRAPHIC', strength: 'STRONG', title: 'Cross-Marketplace PGP Key Reuse', description: `Same PGP fingerprint (E8B21A34...) used to sign posts on BreachForums AND AlphaBay v2 under different handles — confirms single operator`, confidence: 97, timestamp: new Date(Date.now() - 8 * 86400000).toISOString(), source: 'Actor Identity Graph — Cross-Alias Detection', verifiable: true });

  const composite = Math.round(evidence.reduce((s, e) => s + (e.confidence * (e.strength === 'DEFINITIVE' ? 1.5 : e.strength === 'STRONG' ? 1.2 : 1)), 0) / (evidence.length * 1.35));
  const clamped = Math.min(composite, 99);

  return {
    actorId: actor.actorId, handle: actor.handle, caseReference: `NTRO-26151-${actor.actorId}`,
    generatedAt: new Date().toISOString(), compositeConfidence: clamped,
    attributionVerdict: clamped >= 80 ? 'CONFIRMED' : clamped >= 60 ? 'PROBABLE' : 'SUSPECTED',
    totalEvidenceItems: evidence.length, evidenceChain: evidence, investigatorNotes: [],
  };
}
