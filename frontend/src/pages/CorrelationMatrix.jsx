import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Typography, Button, Paper, Chip,
  Divider, LinearProgress, Alert, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  Compare as CorrelateIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

const API_CASES = '/api/cases';
const API_DARKWEB = '/api/darkweb';

const glassCard = {
  background: 'linear-gradient(135deg, rgba(19,47,76,0.85), rgba(10,25,41,0.9))',
  border: '1px solid rgba(33,150,243,0.18)',
  borderRadius: 3,
};

// All the cross-actor attributes to check
const ATTRIBUTE_DEFS = [
  { key: 'category', label: 'Threat Category', icon: '🎯', weight: 1 },
  { key: 'originCountry', label: 'Origin Country', icon: '🌍', weight: 3 },
  { key: 'hostingProvider', label: 'Hosting Provider', icon: '🖥️', weight: 3 },
  { key: 'timezone', label: 'Inferred Timezone', icon: '🕐', weight: 4 },
  { key: 'language', label: 'Writing Language', icon: '📝', weight: 2 },
  { key: 'scriptStyle', label: 'Script / Alphabet', icon: '✍️', weight: 3 },
  { key: 'pgpIssuer', label: 'PGP Key Issuer', icon: '🔑', weight: 5 },
  { key: 'walletCurrencies', label: 'Crypto Currencies', icon: '💰', weight: 2 },
  { key: 'marketplaceTypes', label: 'Marketplace Types', icon: '🛒', weight: 2 },
  { key: 'contactPlatform', label: 'Communication Platform', icon: '💬', weight: 3 },
  { key: 'asn', label: 'Hosting ASN', icon: '🔗', weight: 4 },
  { key: 'activeHours', label: 'Active Hours Window', icon: '⏰', weight: 4 },
];

// Seed actor data for correlation
const SEED_ACTORS = [
  {
    actorId: 'ACTOR-001', primaryHandle: 'DarkPhantom_v2', category: 'Ransomware',
    originCountry: 'Russia', hostingProvider: 'Frantech Solutions', timezone: 'UTC+3',
    language: 'English (native)', scriptStyle: 'Latin', pgpIssuer: "Let's Encrypt X3",
    walletCurrencies: 'BTC, XMR', marketplaceTypes: 'RaaS, Forum', contactPlatform: 'Telegram, Jabber',
    asn: 'AS53667', activeHours: '14:00-23:00 UTC', attributionConfidence: 94, tags: ['confirmed', 'decloaked'],
  },
  {
    actorId: 'ACTOR-002', primaryHandle: 'phantom_ops', category: 'Ransomware',
    originCountry: 'Russia', hostingProvider: 'Frantech Solutions', timezone: 'UTC+3',
    language: 'English (native)', scriptStyle: 'Latin', pgpIssuer: "Let's Encrypt X3",
    walletCurrencies: 'BTC, XMR', marketplaceTypes: 'RaaS, Forum', contactPlatform: 'Telegram',
    asn: 'AS53667', activeHours: '14:00-23:00 UTC', attributionConfidence: 87, tags: ['alias-suspected'],
  },
  {
    actorId: 'ACTOR-003', primaryHandle: 'SilkReborn_Admin', category: 'Drug Trafficking',
    originCountry: 'Netherlands', hostingProvider: 'Leaseweb', timezone: 'UTC+1',
    language: 'English (fluent)', scriptStyle: 'Latin', pgpIssuer: 'Self-signed',
    walletCurrencies: 'BTC, LTC', marketplaceTypes: 'DNM', contactPlatform: 'Wickr, Session',
    asn: 'AS60781', activeHours: '09:00-22:00 UTC', attributionConfidence: 81, tags: ['stylometry-87pct'],
  },
  {
    actorId: 'ACTOR-004', primaryHandle: 'BreachKing_v4', category: 'Data Trafficking',
    originCountry: 'Romania', hostingProvider: 'M247 Ltd', timezone: 'UTC+2',
    language: 'English (non-native)', scriptStyle: 'Latin', pgpIssuer: 'Self-signed',
    walletCurrencies: 'BTC', marketplaceTypes: 'Data Market, Forum', contactPlatform: 'Telegram, Session',
    asn: 'AS9009', activeHours: '10:00-20:00 UTC', attributionConfidence: 67, tags: ['suspected'],
  },
  {
    actorId: 'ACTOR-005', primaryHandle: 'DarkP_Admin', category: 'Ransomware',
    originCountry: 'Russia', hostingProvider: 'Frantech Solutions', timezone: 'UTC+3',
    language: 'English (native)', scriptStyle: 'Latin', pgpIssuer: "Let's Encrypt X3",
    walletCurrencies: 'BTC, XMR', marketplaceTypes: 'RaaS', contactPlatform: 'Telegram',
    asn: 'AS53667', activeHours: '13:00-23:00 UTC', attributionConfidence: 79, tags: ['new-alias'],
  },
];

function computePairSimilarity(a, b) {
  const shared = [];
  const different = [];
  ATTRIBUTE_DEFS.forEach(attr => {
    const va = a[attr.key];
    const vb = b[attr.key];
    if (va && vb) {
      if (va === vb) shared.push({ ...attr, value: va });
      else different.push({ ...attr, valueA: va, valueB: vb });
    }
  });
  const totalWeight = ATTRIBUTE_DEFS.reduce((s, a) => s + a.weight, 0);
  const sharedWeight = shared.reduce((s, a) => s + a.weight, 0);
  const score = Math.round((sharedWeight / totalWeight) * 100);
  const verdict = score >= 65 ? 'LIKELY_SAME_ENTITY' : score >= 40 ? 'POSSIBLE_LINK' : 'UNRELATED';
  return { shared, different, score, verdict, sharedCount: shared.length, totalAttrs: ATTRIBUTE_DEFS.length };
}

const verdictConfig = {
  LIKELY_SAME_ENTITY: { label: 'LIKELY SAME ENTITY', color: '#f44336', bg: 'rgba(244,67,54,0.15)', border: 'rgba(244,67,54,0.4)' },
  POSSIBLE_LINK: { label: 'POSSIBLE LINK', color: '#ff9800', bg: 'rgba(255,152,0,0.15)', border: 'rgba(255,152,0,0.4)' },
  UNRELATED: { label: 'UNRELATED', color: '#4caf50', bg: 'rgba(76,175,80,0.1)', border: 'rgba(76,175,80,0.2)' },
};

export default function CorrelationMatrix() {
  const [actors, setActors] = useState(SEED_ACTORS);
  const [selectedIds, setSelectedIds] = useState(['ACTOR-001', 'ACTOR-002', 'ACTOR-005']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedPair, setSelectedPair] = useState(null);

  useEffect(() => {
    fetch(`${API_DARKWEB}/actors`)
      .then(r => r.json())
      .then(d => { if (d.success && d.data.length > 0) { setActors(SEED_ACTORS); } })
      .catch(() => {});
  }, []);

  const runCorrelation = useCallback(async () => {
    if (selectedIds.length < 2) return;
    setLoading(true);
    setResult(null);
    setSelectedPair(null);
    await new Promise(r => setTimeout(r, 600));

    try {
      const res = await fetch(`${API_CASES}/correlate/actors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorIds: selectedIds })
      });
      const data = await res.json();
      if (data.success) { setResult(data.data); setLoading(false); return; }
    } catch {}

    // Fallback: local computation
    const selected = actors.filter(a => selectedIds.includes(a.actorId));
    const pairs = [];
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const sim = computePairSimilarity(selected[i], selected[j]);
        pairs.push({ actorA: { id: selected[i].actorId, handle: selected[i].primaryHandle, confidence: selected[i].attributionConfidence }, actorB: { id: selected[j].actorId, handle: selected[j].primaryHandle, confidence: selected[j].attributionConfidence }, ...sim });
      }
    }
    const topClusters = pairs.filter(p => p.verdict === 'LIKELY_SAME_ENTITY');
    const allSharedAttrs = ATTRIBUTE_DEFS.map(attr => {
      const vals = selected.map(a => a[attr.key]).filter(Boolean);
      const unique = [...new Set(vals)];
      return { ...attr, sharedAcrossAll: unique.length === 1 && vals.length === selected.length, uniqueValues: unique };
    }).filter(a => a.sharedAcrossAll);

    setResult({
      analysisDate: new Date().toISOString(),
      actorCount: selected.length,
      attributeCount: ATTRIBUTE_DEFS.length,
      pairwiseComparison: pairs,
      clusterVerdict: topClusters.length > 0 ? `HIGH PROBABILITY: ${topClusters.length} pair(s) likely same entity` : 'No definitive same-entity clusters detected',
      topSharedAttributes: allSharedAttrs,
      selectedActors: selected,
    });
    setLoading(false);
  }, [selectedIds, actors]);

  const toggleActor = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filteredPairs = result?.pairwiseComparison || [];

  const exportResult = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `NTRO_Correlation_Matrix_${Date.now()}.json`;
    a.click();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #00bcd4, #80deea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5 }}>
            Cross-Actor Correlation Matrix
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
            <Chip label="NTRO PS-26151" size="small" sx={{ background: 'rgba(244,67,54,0.15)', color: '#f44336', fontWeight: 800, fontSize: '0.62rem' }} />
            <Chip label={`${ATTRIBUTE_DEFS.length} Attributes`} size="small" sx={{ background: 'rgba(0,188,212,0.12)', color: '#80deea', fontSize: '0.62rem' }} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Pairwise attribute comparison · Same-entity cluster detection · {ATTRIBUTE_DEFS.length}-dimensional analysis
          </Typography>
        </Box>
        {result && (
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportResult}
            sx={{ borderColor: '#00bcd4', color: '#00bcd4' }}>
            Export Matrix (.json)
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Left: Actor Selection */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, ...glassCard, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 800, mb: 0.5 }}>Select Actors to Correlate</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 2 }}>Select 2–5 actors. Correlation will run on all attribute pairs.</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {actors.map(actor => {
                const isSelected = selectedIds.includes(actor.actorId);
                return (
                  <Box key={actor.actorId} onClick={() => toggleActor(actor.actorId)} sx={{
                    p: 1.5, borderRadius: 2, cursor: 'pointer',
                    background: isSelected ? 'rgba(0,188,212,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? 'rgba(0,188,212,0.5)' : 'rgba(255,255,255,0.07)'}`,
                    transition: 'all 0.2s',
                    '&:hover': { background: isSelected ? 'rgba(0,188,212,0.16)' : 'rgba(255,255,255,0.06)' }
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: isSelected ? '#00bcd4' : 'white', fontWeight: 700, display: 'block', fontSize: '0.82rem' }}>{actor.primaryHandle}</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3, flexWrap: 'wrap' }}>
                          <Chip label={actor.category} size="small" sx={{ height: 14, fontSize: '0.5rem', color: '#ff9800', background: 'rgba(255,152,0,0.1)' }} />
                          <Chip label={actor.originCountry} size="small" sx={{ height: 14, fontSize: '0.5rem', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)' }} />
                          <Chip label={`${actor.attributionConfidence}%`} size="small" sx={{ height: 14, fontSize: '0.5rem', color: '#4caf50', background: 'rgba(76,175,80,0.1)' }} />
                        </Box>
                      </Box>
                      <Box sx={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${isSelected ? '#00bcd4' : 'rgba(255,255,255,0.2)'}`, background: isSelected ? '#00bcd4' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isSelected && <Typography sx={{ color: '#000', fontSize: '0.7rem', fontWeight: 800 }}>✓</Typography>}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            <Button fullWidth variant="contained" startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <CorrelateIcon />}
              onClick={runCorrelation} disabled={loading || selectedIds.length < 2}
              sx={{ mt: 2, background: 'linear-gradient(135deg, #00bcd4, #80deea)', color: '#000', fontWeight: 800 }}>
              {loading ? 'Analysing...' : `Correlate ${selectedIds.length} Actors`}
            </Button>
            {selectedIds.length < 2 && <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', display: 'block', mt: 0.5, textAlign: 'center' }}>Select at least 2 actors</Typography>}
          </Paper>

          {/* Legend */}
          <Paper sx={{ p: 2, ...glassCard }}>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, mb: 1.5 }}>Verdict Legend</Typography>
            {Object.values(verdictConfig).map(v => (
              <Box key={v.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: v.color, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: v.color, fontWeight: 700, fontSize: '0.7rem' }}>{v.label}</Typography>
              </Box>
            ))}
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1.5 }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', display: 'block' }}>
              Similarity score computed from weighted attribute comparison across {ATTRIBUTE_DEFS.length} dimensions. Weights are assigned by forensic significance.
            </Typography>
          </Paper>
        </Grid>

        {/* Right: Results */}
        <Grid item xs={12} md={8}>
          {!result && !loading && (
            <Paper sx={{ p: 6, ...glassCard, textAlign: 'center' }}>
              <CorrelateIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.4)', mb: 1 }}>Select actors and run correlation</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)' }}>The engine will compare all selected actors across {ATTRIBUTE_DEFS.length} forensic attributes</Typography>
            </Paper>
          )}
          {loading && (
            <Paper sx={{ p: 6, ...glassCard, textAlign: 'center' }}>
              <CircularProgress sx={{ color: '#00bcd4', mb: 2 }} size={48} />
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>Running cross-actor correlation analysis...</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mt: 0.5 }}>Comparing {selectedIds.length} actors across {ATTRIBUTE_DEFS.length} attributes</Typography>
            </Paper>
          )}

          {result && (
            <Box>
              {/* Cluster Verdict Banner */}
              <Alert severity={result.clusterVerdict.includes('HIGH') ? 'error' : 'info'} sx={{ mb: 2, fontWeight: 700 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>🔬 CORRELATION VERDICT: {result.clusterVerdict}</Typography>
              </Alert>

              {/* Global Shared Attributes */}
              {result.topSharedAttributes && result.topSharedAttributes.length > 0 && (
                <Paper sx={{ p: 2, mb: 2, ...glassCard, border: '1px solid rgba(244,67,54,0.3)' }}>
                  <Typography variant="subtitle2" sx={{ color: '#f44336', fontWeight: 800, mb: 1.5 }}>
                    ⚠️ Attributes Shared Across ALL Selected Actors ({result.topSharedAttributes.length})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {result.topSharedAttributes.map(attr => (
                      <Chip key={attr.key} label={`${attr.icon} ${attr.label}: "${attr.uniqueValues[0]}"`} size="small"
                        sx={{ background: 'rgba(244,67,54,0.15)', color: '#f44336', border: '1px solid rgba(244,67,54,0.35)', fontWeight: 700, fontSize: '0.72rem', height: 24 }}
                      />
                    ))}
                  </Box>
                </Paper>
              )}

              {/* Pairwise Comparison Table */}
              <Paper sx={{ p: 2, mb: 2, ...glassCard }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700 }}>Pairwise Similarity Matrix</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>{filteredPairs.length} pairs</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {filteredPairs.sort((a, b) => b.score - a.score).map((pair, i) => {
                    const vc = verdictConfig[pair.verdict];
                    const isExpanded = selectedPair === i;
                    return (
                      <Box key={i}>
                        <Box onClick={() => setSelectedPair(isExpanded ? null : i)} sx={{
                          p: 2, borderRadius: 2, cursor: 'pointer',
                          background: vc.bg, border: `1px solid ${isExpanded ? vc.color : vc.border}`,
                          transition: 'all 0.2s', '&:hover': { borderColor: vc.color }
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box>
                                <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, display: 'block', fontSize: '0.85rem' }}>{pair.actorA.handle}</Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>{pair.actorA.confidence}% conf</Typography>
                              </Box>
                              <Box sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>↔</Box>
                              <Box>
                                <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, display: 'block', fontSize: '0.85rem' }}>{pair.actorB.handle}</Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>{pair.actorB.confidence}% conf</Typography>
                              </Box>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="h5" sx={{ color: vc.color, fontWeight: 900, lineHeight: 1 }}>{pair.score}%</Typography>
                              <Chip label={vc.label} size="small" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 800, color: vc.color, background: vc.bg, mt: 0.3 }} />
                            </Box>
                          </Box>
                          <LinearProgress variant="determinate" value={pair.score}
                            sx={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)', '& .MuiLinearProgress-bar': { backgroundColor: vc.color, borderRadius: 3 } }}
                          />
                          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                            <Chip label={`${pair.sharedCount}/${pair.totalAttrs} shared`} size="small" sx={{ height: 16, fontSize: '0.6rem', color: vc.color, background: 'rgba(255,255,255,0.05)' }} />
                            {pair.shared.slice(0, 4).map(attr => (
                              <Chip key={attr.key} label={`${attr.icon} ${attr.label}`} size="small" sx={{ height: 16, fontSize: '0.55rem', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.05)' }} />
                            ))}
                            {pair.sharedCount > 4 && <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem' }}>+{pair.sharedCount - 4} more</Typography>}
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', ml: 'auto', fontSize: '0.62rem' }}>Click to expand</Typography>
                          </Box>
                        </Box>

                        {isExpanded && (
                          <Box sx={{ mt: 1, p: 2, borderRadius: 2, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 700, display: 'block', mb: 1 }}>✓ SHARED ATTRIBUTES ({pair.shared.length})</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                  {pair.shared.map(attr => (
                                    <Box key={attr.key} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                      <Typography sx={{ fontSize: '0.8rem' }}>{attr.icon}</Typography>
                                      <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', fontSize: '0.62rem' }}>{attr.label}</Typography>
                                        <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 700, fontSize: '0.72rem' }}>{attr.value}</Typography>
                                      </Box>
                                      {attr.weight >= 4 && <Chip label="HIGH WEIGHT" size="small" sx={{ height: 14, fontSize: '0.48rem', color: '#f44336', background: 'rgba(244,67,54,0.1)', ml: 'auto' }} />}
                                    </Box>
                                  ))}
                                </Box>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 700, display: 'block', mb: 1 }}>✗ DIFFERENT ATTRIBUTES ({pair.different.length})</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                  {pair.different.map(attr => (
                                    <Box key={attr.key} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                      <Typography sx={{ fontSize: '0.8rem' }}>{attr.icon}</Typography>
                                      <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', fontSize: '0.62rem' }}>{attr.label}</Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.68rem' }}>A: <span style={{ color: '#2196f3' }}>{attr.valueA}</span></Typography>
                                        <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.68rem' }}>B: <span style={{ color: '#ff9800' }}>{attr.valueB}</span></Typography>
                                      </Box>
                                    </Box>
                                  ))}
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Paper>

              {/* Attribute Coverage Heatmap-style Table */}
              <Paper sx={{ p: 2, ...glassCard }}>
                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
                  Full Attribute Matrix — {result.actorCount} Actors × {result.attributeCount} Attributes
                </Typography>
                <TableContainer sx={{ background: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.06)', fontSize: '0.65rem', fontWeight: 700 }}>Attribute</TableCell>
                        {(result.selectedActors || actors.filter(a => selectedIds.includes(a.actorId))).map(a => (
                          <TableCell key={a.actorId} sx={{ color: '#00bcd4', borderColor: 'rgba(255,255,255,0.06)', fontSize: '0.65rem', fontWeight: 700 }}>{a.primaryHandle}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ATTRIBUTE_DEFS.map(attr => {
                        const actorsData = (result.selectedActors || actors.filter(a => selectedIds.includes(a.actorId)));
                        const vals = actorsData.map(a => a[attr.key]).filter(Boolean);
                        const unique = [...new Set(vals)];
                        const allSame = unique.length === 1 && vals.length === actorsData.length;
                        return (
                          <TableRow key={attr.key} sx={{ background: allSame ? 'rgba(244,67,54,0.06)' : 'transparent' }}>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.04)', fontSize: '0.68rem', py: 0.8, fontWeight: allSame ? 700 : 400 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {allSame && <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#f44336', flexShrink: 0 }} />}
                                {attr.icon} {attr.label}
                              </Box>
                            </TableCell>
                            {actorsData.map(a => {
                              const val = a[attr.key];
                              const otherVals = actorsData.filter(x => x.actorId !== a.actorId).map(x => x[attr.key]).filter(Boolean);
                              const matchesOther = otherVals.some(v => v === val);
                              return (
                                <TableCell key={a.actorId} sx={{ borderColor: 'rgba(255,255,255,0.04)', fontSize: '0.65rem', py: 0.8, color: allSame ? '#f44336' : matchesOther ? '#ff9800' : 'rgba(255,255,255,0.5)', fontWeight: (allSame || matchesOther) ? 700 : 400, fontFamily: 'monospace' }}>
                                  {val || <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ mt: 1.5, display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#f44336' }} /><Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62rem' }}>Shared by all</Typography></Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#ff9800' }} /><Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62rem' }}>Shared by some</Typography></Box>
                </Box>
              </Paper>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
