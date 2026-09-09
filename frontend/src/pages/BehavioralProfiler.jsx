import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, Divider,
  CircularProgress, Alert,
  Tooltip, Tab, Tabs,
} from '@mui/material';
import {
  Psychology as BrainIcon,
  Warning as WarningIcon, CheckCircle as CheckIcon,
} from '@mui/icons-material';

const API_BASE = '/api/v2';

const glassCard = {
  background: 'rgba(19, 47, 76, 0.75)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(33, 150, 243, 0.2)',
  borderRadius: 3,
};

const SAMPLE_ACTORS = [
  { actorId: 'ACTOR-AA01', handle: 'DarkPhantom_v2', category: 'Ransomware' },
  { actorId: 'ACTOR-BB02', handle: 'SilkReborn_Admin', category: 'Drugs' },
  { actorId: 'ACTOR-CC03', handle: 'GhostNet_Broker', category: 'Hacking Services' },
];

// ─── Activity Heatmap (24h) ───────────────────────────────────────────────────
function ActivityHeatmap({ heatmap, peakHour }) {
  const max = Math.max(...heatmap, 1);
  const timeLabels = ['00', '03', '06', '09', '12', '15', '18', '21'];
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 0.3, alignItems: 'flex-end', height: 60 }}>
        {heatmap.map((val, h) => {
          const pct = (val / max) * 100;
          const isPeak = h === peakHour;
          const color = isPeak ? '#f44336' : pct > 50 ? '#ff9800' : '#2196f3';
          return (
            <Tooltip key={h} title={`${String(h).padStart(2, '0')}:00 UTC — ${val} posts`}>
              <Box sx={{
                flex: 1, borderRadius: '2px 2px 0 0', cursor: 'help',
                height: `${Math.max(pct, 4)}%`,
                background: isPeak ? `linear-gradient(180deg, ${color}, ${color}88)` : color,
                opacity: pct === 0 ? 0.12 : 0.7 + pct * 0.003,
                transition: 'all 0.3s',
                '&:hover': { opacity: 1 },
              }} />
            </Tooltip>
          );
        })}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        {timeLabels.map(t => <Typography key={t} variant="caption" sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.58rem' }}>{t}h</Typography>)}
      </Box>
    </Box>
  );
}

// ─── OPSEC Score Gauge ─────────────────────────────────────────────────────────
function OpSecGauge({ score, level, color }) {
  return (
    <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ position: 'relative', width: 120, height: 120, mx: 'auto', mb: 1.5 }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={120}
          thickness={6}
          sx={{ color: 'rgba(255,255,255,0.08)', position: 'absolute', top: 0, left: 0 }}
        />
        <CircularProgress
          variant="determinate"
          value={score}
          size={120}
          thickness={6}
          sx={{ color, position: 'absolute', top: 0, left: 0, strokeLinecap: 'round' }}
        />
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h4" sx={{ color, fontWeight: 900, lineHeight: 1 }}>{score}</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62rem', fontWeight: 600, mt: 0.3 }}>/ 100</Typography>
        </Box>
      </Box>
      <Chip label={`OPSEC: ${level}`} sx={{ background: `${color}22`, color, border: `1px solid ${color}40`, fontWeight: 800, fontSize: '0.72rem' }} />
    </Box>
  );
}

export default function BehavioralProfiler() {
  const [selectedActor, setSelectedActor] = useState(SAMPLE_ACTORS[0]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);

  const loadProfile = useCallback(async (actor) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/behavioral/${actor.actorId}/profile`);
      const data = await res.json();
      if (data.success) setProfile(data.data);
      else throw new Error('failed');
    } catch {
      setProfile(generateSampleProfile(actor));
    }
    setLoading(false);
  }, []);

  useEffect(() => { 
    loadProfile(selectedActor); 
  }, [selectedActor, loadProfile]);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #e91e63, #880e4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, boxShadow: '0 4px 20px rgba(233,30,99,0.4)' }}>
            <BrainIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', lineHeight: 1 }}>Behavioral Profiler</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
              UTC timezone inference · OPSEC scoring · Language fingerprinting · Pricing pattern analysis
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Chip label="NTRO BEHAVIORAL PROFILING" sx={{ background: 'rgba(233,30,99,0.15)', color: '#e91e63', fontWeight: 700, fontSize: '0.7rem' }} />
          </Box>
        </Box>
        <Divider sx={{ borderColor: 'rgba(233,30,99,0.2)', mt: 2 }} />
      </Box>

      <Grid container spacing={3}>
        {/* Actor Selector */}
        <Grid item xs={12} lg={3}>
          <Paper sx={{ ...glassCard, p: 2.5 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>Select Actor</Typography>
            {SAMPLE_ACTORS.map(a => (
              <Box key={a.actorId} onClick={() => setSelectedActor(a)}
                sx={{ p: 1.5, mb: 1, borderRadius: 2, cursor: 'pointer', background: selectedActor.actorId === a.actorId ? 'rgba(233,30,99,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selectedActor.actorId === a.actorId ? '#e91e6344' : 'rgba(255,255,255,0.06)'}`, '&:hover': { background: 'rgba(233,30,99,0.08)' }, transition: 'all 0.15s' }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>{a.handle}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>{a.category}</Typography>
              </Box>
            ))}
          </Paper>

          {profile && !loading && (
            <Paper sx={{ ...glassCard, p: 2.5, mt: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2, fontSize: '0.95rem' }}>Language Analysis</Typography>
              {profile.language && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Primary Language</Typography>
                    <Chip label={`${profile.language.primaryLanguage} (${profile.language.languageCode})`} size="small" sx={{ background: 'rgba(33,150,243,0.2)', color: '#2196f3', fontWeight: 700, fontSize: '0.65rem' }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Confidence</Typography>
                    <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 700 }}>{profile.language.confidence}%</Typography>
                  </Box>
                  {profile.language.machineTranslatedFlag && (
                    <Alert severity="warning" sx={{ mt: 1, fontSize: '0.75rem' }}>
                      ⚠ Machine translation detected — actor may not be a native speaker
                    </Alert>
                  )}
                </Box>
              )}
            </Paper>
          )}
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} lg={9}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#e91e63' }} /></Box>
          ) : profile ? (
            <Box>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, '& .MuiTab-root': { color: 'rgba(255,255,255,0.4)', textTransform: 'none', fontSize: '0.85rem' }, '& .Mui-selected': { color: '#e91e63' }, '& .MuiTabs-indicator': { backgroundColor: '#e91e63' } }}>
                <Tab label="⏰ Timezone Inference" />
                <Tab label="🛡 OPSEC Scorecard" />
                <Tab label="💰 Pricing Patterns" />
              </Tabs>

              {tab === 0 && profile.timezone && (
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={7}>
                    <Paper sx={{ ...glassCard, p: 3 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>24-Hour Activity Heatmap (UTC)</Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 3, fontSize: '0.8rem' }}>
                        Posting frequency per UTC hour — {profile.timezone.totalPostsAnalyzed} posts analyzed
                      </Typography>
                      <ActivityHeatmap heatmap={profile.timezone.activityHeatmap || new Array(24).fill(0)} peakHour={profile.timezone.peakHour} />
                      <Box sx={{ mt: 3, p: 2, borderRadius: 2, background: 'rgba(233,30,99,0.08)', border: '1px solid rgba(233,30,99,0.2)' }}>
                        <Typography variant="subtitle2" sx={{ color: '#e91e63', fontWeight: 700, mb: 0.5 }}>Inferred Operator Timezone</Typography>
                        <Typography sx={{ color: 'white', fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700 }}>{profile.timezone.inferredTimezone}</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5, fontSize: '0.8rem' }}>UTC{profile.timezone.utcOffset >= 0 ? '+' : ''}{profile.timezone.utcOffset} · {profile.timezone.confidence}% confidence</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', mt: 1, fontSize: '0.78rem', lineHeight: 1.5 }}>{profile.timezone.interpretation}</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} lg={5}>
                    <Paper sx={{ ...glassCard, p: 3, mb: 2 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>Timezone Statistics</Typography>
                      {[
                        ['Peak Activity Hour', `${String(profile.timezone.peakHour).padStart(2, '0')}:00 UTC`, '#f44336'],
                        ['Inferred UTC Offset', `UTC${profile.timezone.utcOffset >= 0 ? '+' : ''}${profile.timezone.utcOffset}`, '#ff9800'],
                        ['Posts Analyzed', profile.timezone.totalPostsAnalyzed, '#2196f3'],
                        ['Inference Confidence', `${profile.timezone.confidence}%`, '#4caf50'],
                      ].map(([k, v, color]) => (
                        <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)' }}>{k}</Typography>
                          <Typography variant="body2" sx={{ color, fontWeight: 700, fontFamily: 'monospace' }}>{v}</Typography>
                        </Box>
                      ))}
                    </Paper>
                    <Paper sx={{ ...glassCard, p: 2.5 }}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>Investigative Notes</Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.6 }}>
                        Activity patterns consistent with a timezone in the <strong style={{ color: '#ff9800' }}>{profile.timezone.inferredTimezone}</strong> zone. Peak forum activity at {String(profile.timezone.peakHour).padStart(2, '0')}:00 UTC suggests operator's "working hours". This data point contributes to real-world entity attribution.
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {tab === 1 && profile.opsec && (
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={4}>
                    <Paper sx={{ ...glassCard, p: 3, textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 3 }}>OPSEC Hygiene Score</Typography>
                      <OpSecGauge score={profile.opsec.score} level={profile.opsec.level} color={profile.opsec.color} />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 2, fontSize: '0.8rem', lineHeight: 1.6 }}>{profile.opsec.interpretation}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} lg={8}>
                    <Paper sx={{ ...glassCard, p: 3 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>Vulnerability Findings</Typography>
                      {(profile.opsec.findings || []).length === 0 ? (
                        <Alert severity="success">No OPSEC vulnerabilities detected in available data.</Alert>
                      ) : (
                        (profile.opsec.findings || []).map((f, i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5, p: 1.5, borderRadius: 2, background: 'rgba(244,67,54,0.06)', border: '1px solid rgba(244,67,54,0.15)' }}>
                            <WarningIcon sx={{ color: '#f44336', fontSize: 18, mt: 0.2, flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem' }}>{f}</Typography>
                          </Box>
                        ))
                      )}
                      {(profile.opsec.recommendations || []).length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 1, fontSize: '0.72rem', textTransform: 'uppercase' }}>What Actor Should Fix (Intel for Investigation)</Typography>
                          {(profile.opsec.recommendations || []).map((r, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1, p: 1.5, borderRadius: 1.5, background: 'rgba(76,175,80,0.05)', border: '1px solid rgba(76,175,80,0.12)' }}>
                              <CheckIcon sx={{ color: '#4caf50', fontSize: 16, mt: 0.2, flexShrink: 0 }} />
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>{r}</Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {tab === 2 && profile.pricing && (
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={5}>
                    <Paper sx={{ ...glassCard, p: 3 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>Pricing Profile</Typography>
                      {[
                        ['Average Listing Price', `${profile.pricing.averagePrice} BTC`],
                        ['Price Range', `${profile.pricing.minPrice} – ${profile.pricing.maxPrice} BTC`],
                        ['Discount Frequency', `${profile.pricing.discountFrequency}%`],
                        ['Pricing Style', profile.pricing.pricingStyle],
                        ['Consistency Score', `${profile.pricing.consistencyScore}%`],
                      ].map(([k, v]) => (
                        <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)' }}>{k}</Typography>
                          <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 700 }}>{v}</Typography>
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                  <Grid item xs={12} lg={7}>
                    <Paper sx={{ ...glassCard, p: 3 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>Pricing Analysis Interpretation</Typography>
                      <Alert severity="info" sx={{ mb: 2, fontSize: '0.82rem' }}>
                        Consistent pricing patterns across aliases can be used to link rebranded personas. Actors often maintain the same psychological price anchors (e.g., always pricing below round numbers like "0.099 BTC").
                      </Alert>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', lineHeight: 1.7 }}>
                        Actor <strong style={{ color: 'white' }}>{selectedActor.handle}</strong> exhibits a <strong style={{ color: '#ff9800' }}>{profile.pricing.pricingStyle}</strong> pattern with {profile.pricing.discountFrequency}% discount frequency. Price consistency score of {profile.pricing.consistencyScore}% indicates {profile.pricing.consistencyScore > 70 ? 'stable, experienced vendor behavior' : 'variable/negotiating pricing strategy'}.
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </Box>
          ) : null}
        </Grid>
      </Grid>
    </Box>
  );
}

function generateSampleProfile(actor) {
  const seed = actor.handle.charCodeAt(0);
  const peakHour = (seed % 8) + 9;
  const heatmap = new Array(24).fill(0).map((_, h) => {
    const dist = Math.min(Math.abs(h - peakHour), Math.abs(h - peakHour + 24), Math.abs(h - peakHour - 24));
    return Math.max(0, Math.round((10 - dist * 1.5) + Math.random() * 3));
  });
  const utcOffset = seed % 5 + 1;
  const tzMap = { 1: 'Europe/Paris', 2: 'Europe/Helsinki', 3: 'Europe/Moscow', 4: 'Asia/Dubai', 5: 'Asia/Karachi' };
  return {
    actorId: actor.actorId, handle: actor.handle,
    timezone: { inferredTimezone: tzMap[utcOffset] || 'Europe/Moscow', utcOffset, confidence: 65 + (seed % 20), activityHeatmap: heatmap, peakHour, totalPostsAnalyzed: 40 + (seed % 40), interpretation: `Analysis of ${40 + (seed % 40)} posts suggests operator timezone ${tzMap[utcOffset]}.` },
    opsec: { score: 35 + (seed % 40), level: seed % 3 === 0 ? 'HIGH' : seed % 3 === 1 ? 'MEDIUM' : 'LOW', color: seed % 3 === 0 ? '#4caf50' : seed % 3 === 1 ? '#ff9800' : '#f44336', findings: ['Single BTC wallet reused across 47 transactions', 'Same handle active on 3 marketplaces simultaneously', 'Contact ID (Telegram) exposed in 12 posts'], recommendations: ['Use unique wallets per transaction', 'Rotate handles between marketplaces', 'Use ephemeral contact IDs'], interpretation: `Actor OPSEC rated ${seed % 3 === 0 ? 'HIGH' : 'MEDIUM'} with multiple attribution vulnerabilities.` },
    language: { primaryLanguage: seed % 3 === 0 ? 'Russian' : seed % 3 === 1 ? 'English' : 'German', languageCode: seed % 3 === 0 ? 'RU' : seed % 3 === 1 ? 'EN' : 'DE', confidence: 72 + (seed % 18), machineTranslatedFlag: seed % 4 === 0 },
    pricing: { averagePrice: Math.round((0.1 + seed * 0.003) * 100) / 100, minPrice: Math.round((0.05 + seed * 0.001) * 100) / 100, maxPrice: Math.round((0.3 + seed * 0.007) * 100) / 100, discountFrequency: 15 + (seed % 30), pricingStyle: seed % 3 === 0 ? 'Premium Seller' : seed % 3 === 1 ? 'Mid-market' : 'Volume Seller', consistencyScore: 60 + (seed % 35) },
  };
}
