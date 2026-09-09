import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, Button,
  TextField, Divider, LinearProgress, Alert, CircularProgress, Tooltip,
  IconButton, Tab, Tabs,
} from '@mui/material';
import {
  Psychology as AIIcon,
  Download as DownloadIcon, TextFields as TextIcon,
  Check as CheckIcon,
  Close as CloseIcon, Warning as WarningIcon,
} from '@mui/icons-material';

const API_BASE = '/api/darkweb';

const glassCard = {
  background: 'rgba(19, 47, 76, 0.7)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(33, 150, 243, 0.2)',
  borderRadius: 3,
};

// ─── Gauge Component ──────────────────────────────────────────────────────────
function SimilarityGauge({ score }) {
  const pct = Math.round(score * 100);
  const color = pct >= 72 ? '#f44336' : pct >= 55 ? '#ff9800' : '#4caf50';
  const label = pct >= 72 ? 'LIKELY SAME ACTOR' : pct >= 55 ? 'UNCERTAIN' : 'LIKELY DIFFERENT';
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ position: 'relative', width: 160, height: 160, mx: 'auto', mb: 2 }}>
        <svg viewBox="0 0 160 160" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {/* Background arc */}
          <path d="M 20 140 A 70 70 0 1 1 140 140" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" strokeLinecap="round" />
          {/* Foreground arc */}
          {(() => {
            const R = 70, cx = 80, cy = 140;
            const startAngle = Math.PI;
            const endAngle = startAngle + (pct / 100) * Math.PI;
            const x1 = cx + R * Math.cos(startAngle);
            const y1 = cy + R * Math.sin(startAngle);
            const x2 = cx + R * Math.cos(endAngle);
            const y2 = cy + R * Math.sin(endAngle);
            const largeArc = pct > 50 ? 1 : 0;
            return <path d={`M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />;
          })()}
        </svg>
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pb: 1 }}>
          <Typography variant="h3" sx={{ color, fontWeight: 900, lineHeight: 1 }}>{pct}%</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62rem' }}>COMPOSITE SCORE</Typography>
        </Box>
      </Box>
      <Chip label={label} sx={{ background: `${color}22`, color, fontWeight: 800, fontSize: '0.75rem', px: 1 }} />
    </Box>
  );
}

// ─── Feature Bar Chart ─────────────────────────────────────────────────────────
function FeatureDeltaBar({ label, valueA, valueB, max }) {
  const normA = max > 0 ? (valueA / max) * 100 : 0;
  const normB = max > 0 ? (valueB / max) * 100 : 0;
  const delta = Math.abs(valueA - valueB);
  const match = delta / (max || 1) < 0.15;
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>{label}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: '#2196f3', fontSize: '0.7rem', fontFamily: 'monospace' }}>{valueA?.toFixed ? valueA.toFixed(3) : valueA}</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>vs</Typography>
          <Typography variant="caption" sx={{ color: '#ff9800', fontSize: '0.7rem', fontFamily: 'monospace' }}>{valueB?.toFixed ? valueB.toFixed(3) : valueB}</Typography>
          {match ? <CheckIcon sx={{ fontSize: 14, color: '#4caf50' }} /> : <CloseIcon sx={{ fontSize: 14, color: '#f44336' }} />}
        </Box>
      </Box>
      <Box sx={{ position: 'relative', height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
        <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${normA}%`, background: 'linear-gradient(90deg, #2196f3, #42a5f5)', borderRadius: 4, opacity: 0.8 }} />
        <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${normB}%`, background: 'linear-gradient(90deg, #ff9800, #ffa726)', borderRadius: 4, opacity: 0.5 }} />
      </Box>
    </Box>
  );
}

const SAMPLE_TEXTS = {
  sameActor: [
    `Hey bro, the shipment is confirmed. OPSEC is key — never reuse wallets lol. 
     Price is 2.3 BTC per unit, final. No refunds, no exceptions mate. 
     PGP sign everything or we dont talk. Trusted vendors only fr fr.`,
    `Alright listen up. OPSEC always comes first, dont be dumb about wallets ever lol. 
     New listing is 2.1 BTC, price is firm no exceptions mate. 
     Always sign with PGP or I wont respond, trusted buyers only fr.`
  ],
  diffActor: [
    `The merchandise has been dispatched per the agreed schedule. Payment confirmation required 
     upon receipt. Please ensure all communications remain encrypted. Best regards.`,
    `yo dawg got them goods ready 2 ship lmao hmu on wickr. price negotiable 4 bulk orders. 
     no escrow bs just trust. hit me up quick before i bounce k thx bye!!!`
  ]
};

export default function StylometryEngine() {
  const [corpusA, setCorpusA] = useState('');
  const [corpusB, setCorpusB] = useState('');
  const [results, setResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const [history, setHistory] = useState([]);

  const loadSample = (type) => {
    setCorpusA(SAMPLE_TEXTS[type][0]);
    setCorpusB(SAMPLE_TEXTS[type][1]);
    setResults(null);
  };

  const runAnalysis = async () => {
    if (!corpusA.trim() || !corpusB.trim()) { setError('Both corpora are required'); return; }
    if (corpusA.trim().length < 50 || corpusB.trim().length < 50) { setError('Each corpus needs at least 50 characters for meaningful analysis'); return; }
    setError(''); setAnalyzing(true); setResults(null);

    try {
      const res = await fetch(`${API_BASE}/stylometry/analyze`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ corpusA: corpusA.trim(), corpusB: corpusB.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
        setHistory(prev => [{ id: Date.now(), verdict: data.data.verdict, score: data.data.compositeSimilarity, ts: new Date().toLocaleTimeString() }, ...prev.slice(0, 4)]);
      } else { setError(data.message); }
    } catch {
      // Offline: run client-side stylometry
      const simResult = clientSideStylemetry(corpusA, corpusB);
      setResults(simResult);
      setHistory(prev => [{ id: Date.now(), verdict: simResult.verdict, score: simResult.compositeSimilarity, ts: new Date().toLocaleTimeString() }, ...prev.slice(0, 4)]);
    }
    setAnalyzing(false);
  };

  function clientSideStylemetry(textA, textB) {
    const extractFeats = (text) => {
      const words = text.match(/\b\w+\b/g) || [];
      const sents = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const avgWL = words.length ? words.reduce((s, w) => s + w.length, 0) / words.length : 0;
      const avgSL = sents.length ? words.length / sents.length : words.length;
      const uniq = new Set(words.map(w => w.toLowerCase()));
      const vr = words.length ? uniq.size / words.length : 0;
      const pc = (text.match(/[.,;:!?'"()-]/g) || []).length / (text.length + 1);
      const caps = (text.match(/[A-Z]/g) || []).length / (text.length + 1);
      const freq = {}; words.forEach(w => { const lw = w.toLowerCase(); freq[lw] = (freq[lw] || 0) + 1; });
      const fv = Object.values(freq); const N = words.length;
      const yuleK = N ? 10000 * (fv.reduce((s, f) => s + f * f, 0) - N) / (N * N + 1) : 0;
      return { avgWordLength: avgWL, avgSentenceLength: avgSL, vocabRichness: vr, punctuationDensity: pc, capsRatio: caps, yuleK };
    };

    function getNgrams(text, n) {
      const ng = {}; text = text.toLowerCase();
      for (let i = 0; i <= text.length - n; i++) { const g = text.substring(i, i + n); ng[g] = (ng[g] || 0) + 1; }
      return ng;
    }
    function cosSim(a, b) {
      const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
      const va = [...keys].map(k => a[k] || 0); const vb = [...keys].map(k => b[k] || 0);
      const dot = va.reduce((s, v, i) => s + v * vb[i], 0);
      const magA = Math.sqrt(va.reduce((s, v) => s + v * v, 0)); const magB = Math.sqrt(vb.reduce((s, v) => s + v * v, 0));
      return (magA && magB) ? dot / (magA * magB) : 0;
    }

    const fA = extractFeats(textA); const fB = extractFeats(textB);
    const fvA = [fA.avgWordLength, fA.avgSentenceLength, fA.vocabRichness * 10, fA.punctuationDensity * 100, fA.capsRatio * 100, fA.yuleK / 10];
    const fvB = [fB.avgWordLength, fB.avgSentenceLength, fB.vocabRichness * 10, fB.punctuationDensity * 100, fB.capsRatio * 100, fB.yuleK / 10];
    const dot = fvA.reduce((s, v, i) => s + v * fvB[i], 0);
    const magA = Math.sqrt(fvA.reduce((s, v) => s + v * v, 0)); const magB = Math.sqrt(fvB.reduce((s, v) => s + v * v, 0));
    const lexSim = (magA && magB) ? dot / (magA * magB) : 0;

    const char3 = cosSim(getNgrams(textA, 3), getNgrams(textB, 3));
    const char4 = cosSim(getNgrams(textA, 4), getNgrams(textB, 4));
    const char5 = cosSim(getNgrams(textA, 5), getNgrams(textB, 5));
    const avgChar = (char3 + char4 + char5) / 3;
    const composite = Math.min((0.65 * avgChar) + (0.35 * lexSim), 1.0);
    const isRebrand = composite >= 0.72;
    const pct = Math.min(Math.round(composite * 1000) / 10, 99.0);

    const fd = {};
    ['avgWordLength', 'avgSentenceLength', 'vocabRichness', 'punctuationDensity', 'capsRatio', 'yuleK'].forEach(k => {
      fd[k] = { a: Math.round(fA[k] * 1000) / 1000, b: Math.round(fB[k] * 1000) / 1000, delta: Math.abs(fA[k] - fB[k]) };
    });

    return {
      analysisId: `STYLO-${Date.now()}`, timestamp: new Date().toISOString(),
      compositeSimilarity: Math.round(composite * 10000) / 10000,
      charNgramSimilarity: Math.round(avgChar * 10000) / 10000,
      lexicalSimilarity: Math.round(lexSim * 10000) / 10000,
      charNgramBreakdown: { trigram: Math.round(char3 * 10000) / 10000, quadgram: Math.round(char4 * 10000) / 10000, pentagram: Math.round(char5 * 10000) / 10000 },
      isLikelyRebranded: isRebrand,
      attributionConfidence: `${pct}%`,
      verdict: isRebrand ? 'LIKELY SAME ACTOR' : composite >= 0.55 ? 'UNCERTAIN — FURTHER ANALYSIS REQUIRED' : 'LIKELY DIFFERENT ACTOR',
      verdictColor: isRebrand ? 'error' : composite >= 0.55 ? 'warning' : 'success',
      featuresA: fA, featuresB: fB, featureDelta: fd,
      interpretations: composite >= 0.85 ? ['Composite score exceeds 85% — high confidence same author'] : isRebrand ? ['Composite score exceeds 72% threshold — probable same author'] : ['Low-moderate similarity — distinct authorship profiles'],
    };
  }

  const exportResults = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `stylometry_${results.analysisId}_${Date.now()}.json`; a.click();
  };

  const verdictBg = { error: 'rgba(244,67,54,0.1)', warning: 'rgba(255,152,0,0.1)', success: 'rgba(76,175,80,0.1)' };
  const verdictClr = { error: '#f44336', warning: '#ff9800', success: '#4caf50' };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #9c27b0, #4a148c)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, boxShadow: '0 4px 20px rgba(156,39,176,0.4)' }}>
            <AIIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', lineHeight: 1 }}>AI Stylometry Engine</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
              Character N-gram TF-IDF · Lexical feature vectors · Persona rebranding detection · Authorship attribution
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Chip label="NTRO CAPABILITY 3" sx={{ background: 'rgba(156,39,176,0.15)', color: '#9c27b0', fontWeight: 700, fontSize: '0.7rem' }} />
          </Box>
        </Box>
        <Divider sx={{ borderColor: 'rgba(156,39,176,0.2)', mt: 2 }} />
      </Box>

      <Grid container spacing={3}>
        {/* Input Panel */}
        <Grid item xs={12} xl={7}>
          <Paper sx={{ ...glassCard, p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>Text Corpus Comparison</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" onClick={() => loadSample('sameActor')} sx={{ borderColor: '#f44336', color: '#f44336', fontSize: '0.7rem' }}>Load Same Actor Sample</Button>
                <Button size="small" variant="outlined" onClick={() => loadSample('diffActor')} sx={{ borderColor: '#4caf50', color: '#4caf50', fontSize: '0.7rem' }}>Load Different Actor Sample</Button>
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" sx={{ color: '#2196f3', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <TextIcon sx={{ fontSize: 14 }} /> CORPUS A — Known Actor Posts
                </Typography>
                <TextField fullWidth multiline rows={10} value={corpusA} onChange={e => setCorpusA(e.target.value)}
                  placeholder="Paste forum posts, product listings, or messages from the known threat actor alias..."
                  InputProps={{ sx: { fontFamily: 'monospace', fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', background: 'rgba(33,150,243,0.05)', '& fieldset': { borderColor: 'rgba(33,150,243,0.3)' }, '&:hover fieldset': { borderColor: '#2196f3' }, '& textarea': { lineHeight: 1.6 } } }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>{corpusA.length} chars · {(corpusA.match(/\b\w+\b/g) || []).length} words</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <TextIcon sx={{ fontSize: 14 }} /> CORPUS B — Suspect Alias Posts
                </Typography>
                <TextField fullWidth multiline rows={10} value={corpusB} onChange={e => setCorpusB(e.target.value)}
                  placeholder="Paste forum posts, product listings, or messages from the suspect alias to compare..."
                  InputProps={{ sx: { fontFamily: 'monospace', fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', background: 'rgba(255,152,0,0.05)', '& fieldset': { borderColor: 'rgba(255,152,0,0.3)' }, '&:hover fieldset': { borderColor: '#ff9800' }, '& textarea': { lineHeight: 1.6 } } }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>{corpusB.length} chars · {(corpusB.match(/\b\w+\b/g) || []).length} words</Typography>
              </Grid>
            </Grid>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button variant="contained" size="large" onClick={runAnalysis} disabled={analyzing}
                startIcon={analyzing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <AIIcon />}
                sx={{ px: 5, py: 1.5, background: 'linear-gradient(135deg, #9c27b0, #6a1b9a)', fontWeight: 800, fontSize: '1rem', boxShadow: '0 4px 20px rgba(156,39,176,0.4)', '&:hover': { background: 'linear-gradient(135deg, #8e24aa, #5e1283)' } }}>
                {analyzing ? 'Analyzing Authorship...' : 'Run Stylometric Analysis'}
              </Button>
            </Box>
          </Paper>

          {/* Results */}
          {results && (
            <Paper sx={{ ...glassCard, p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>Analysis Results</Typography>
                <Tooltip title="Export JSON"><IconButton size="small" onClick={exportResults} sx={{ color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' }}><DownloadIcon /></IconButton></Tooltip>
              </Box>

              {/* Verdict Banner */}
              <Box sx={{ p: 2, borderRadius: 2, background: verdictBg[results.verdictColor], border: `1px solid ${verdictClr[results.verdictColor]}44`, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                {results.isLikelyRebranded ? <WarningIcon sx={{ color: '#f44336', fontSize: 32 }} /> : results.verdictColor === 'warning' ? <WarningIcon sx={{ color: '#ff9800', fontSize: 32 }} /> : <AIIcon sx={{ color: '#4caf50', fontSize: 32 }} />}
                <Box>
                  <Typography variant="h6" sx={{ color: verdictClr[results.verdictColor], fontWeight: 800 }}>{results.verdict}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Attribution Confidence: <strong style={{ color: 'white' }}>{results.attributionConfidence}</strong> · Analysis ID: <span style={{ fontFamily: 'monospace' }}>{results.analysisId}</span></Typography>
                </Box>
              </Box>

              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, '& .MuiTab-root': { color: 'rgba(255,255,255,0.5)', textTransform: 'none' }, '& .Mui-selected': { color: '#9c27b0' }, '& .MuiTabs-indicator': { backgroundColor: '#9c27b0' } }}>
                <Tab label="Score Breakdown" />
                <Tab label="Feature Delta" />
                <Tab label="Interpretations" />
              </Tabs>

              {tab === 0 && (
                <Grid container spacing={2}>
                  {[
                    { label: 'Composite Similarity', value: results.compositeSimilarity, description: 'Weighted: 65% char n-gram + 35% lexical' },
                    { label: 'Char N-gram Similarity', value: results.charNgramSimilarity, description: `Trigram: ${results.charNgramBreakdown?.trigram} · Quadgram: ${results.charNgramBreakdown?.quadgram} · Pentagram: ${results.charNgramBreakdown?.pentagram}` },
                    { label: 'Lexical Feature Similarity', value: results.lexicalSimilarity, description: 'Based on 7 stylistic metrics' },
                  ].map(s => {
                    const pct = Math.round(s.value * 100);
                    const c = pct >= 72 ? '#f44336' : pct >= 55 ? '#ff9800' : '#4caf50';
                    return (
                      <Grid item xs={12} key={s.label}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{s.label}</Typography>
                            <Typography variant="body2" sx={{ color: c, fontWeight: 800 }}>{pct}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={pct} sx={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg, ${c}88, ${c})`, borderRadius: 5 } }} />
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem' }}>{s.description}</Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              )}

              {tab === 1 && results.featureDelta && (
                <Box>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Chip label="■ Corpus A" sx={{ background: 'rgba(33,150,243,0.2)', color: '#2196f3', fontSize: '0.7rem' }} />
                    <Chip label="■ Corpus B" sx={{ background: 'rgba(255,152,0,0.2)', color: '#ff9800', fontSize: '0.7rem' }} />
                  </Box>
                  {Object.entries(results.featureDelta).map(([key, d]) => {
                    const maxVal = Math.max(d.a, d.b, 0.001);
                    const labels = { avgWordLength: 'Avg Word Length', avgSentenceLength: 'Avg Sentence Length', vocabRichness: 'Vocabulary Richness (TTR)', punctuationDensity: 'Punctuation Density', capsRatio: 'Capitalization Ratio', yuleK: "Yule's Characteristic K" };
                    return <FeatureDeltaBar key={key} label={labels[key] || key} valueA={d.a} valueB={d.b} max={maxVal} />;
                  })}
                </Box>
              )}

              {tab === 2 && (
                <Box>
                  {results.interpretations?.map((note, i) => (
                    <Alert key={i} severity={results.isLikelyRebranded ? 'error' : results.verdictColor === 'warning' ? 'warning' : 'success'} sx={{ mb: 1, fontSize: '0.85rem' }}>{note}</Alert>
                  ))}
                  <Box sx={{ mt: 2, p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 1 }}>Analysis ID</Typography>
                    <Typography sx={{ fontFamily: 'monospace', color: '#9c27b0', fontSize: '0.85rem' }}>{results.analysisId}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 1.5, mb: 0.5 }}>Timestamp</Typography>
                    <Typography sx={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{new Date(results.timestamp).toLocaleString()}</Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          )}
        </Grid>

        {/* Right Panel */}
        <Grid item xs={12} xl={5}>
          {/* Gauge */}
          {results && (
            <Paper sx={{ ...glassCard, p: 3, mb: 3, textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}>Persona Match Score</Typography>
              <SimilarityGauge score={results.compositeSimilarity} />
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
              <Grid container spacing={1}>
                {[
                  { label: 'Char N-gram', value: `${Math.round(results.charNgramSimilarity * 100)}%`, color: '#9c27b0' },
                  { label: 'Lexical', value: `${Math.round(results.lexicalSimilarity * 100)}%`, color: '#2196f3' },
                ].map(m => (
                  <Grid item xs={6} key={m.label}>
                    <Box sx={{ p: 1.5, borderRadius: 2, background: `${m.color}10`, border: `1px solid ${m.color}30` }}>
                      <Typography variant="h6" sx={{ color: m.color, fontWeight: 800 }}>{m.value}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem' }}>{m.label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* How It Works */}
          <Paper sx={{ ...glassCard, p: 2.5, mb: 3 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>Algorithm Details</Typography>
            {[
              { step: '1', label: 'Character N-grams (65% weight)', desc: 'Trigram, quadgram, pentagram TF-IDF vectors capture sub-word typing patterns and spelling habits unique to each author.' },
              { step: '2', label: 'Lexical Feature Vector (35% weight)', desc: 'Avg word/sentence length, vocab richness (TTR), punctuation density, caps ratio, and Yule\'s Characteristic K measure structural writing style.' },
              { step: '3', label: 'Cosine Similarity Fusion', desc: 'Weighted composite of both vectors. Score ≥72% triggers LIKELY SAME ACTOR verdict.' },
            ].map(s => (
              <Box key={s.step} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(156,39,176,0.2)', border: '1px solid #9c27b044', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.3 }}>
                  <Typography sx={{ color: '#9c27b0', fontWeight: 800, fontSize: '0.78rem' }}>{s.step}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>{s.label}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.73rem', lineHeight: 1.5, display: 'block' }}>{s.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Paper>

          {/* History */}
          <Paper sx={{ ...glassCard, p: 2.5 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>Recent Analyses</Typography>
            {history.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', py: 2 }}>No analyses run yet</Typography>
            ) : (
              history.map(h => {
                const color = h.verdict.includes('SAME') ? '#f44336' : h.verdict.includes('UNCERTAIN') ? '#ff9800' : '#4caf50';
                return (
                  <Box key={h.id} sx={{ p: 1.5, mb: 1, borderRadius: 1.5, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ color, fontWeight: 700, fontSize: '0.72rem' }}>{h.verdict.split(' ').slice(0, 3).join(' ')}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem', display: 'block' }}>{h.ts}</Typography>
                    </Box>
                    <Chip label={`${Math.round(h.score * 100)}%`} size="small" sx={{ background: `${color}22`, color, fontWeight: 800, fontSize: '0.72rem' }} />
                  </Box>
                );
              })
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
