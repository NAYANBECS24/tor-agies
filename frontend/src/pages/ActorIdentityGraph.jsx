import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, Button,
  TextField, Divider, List, ListItem, ListItemIcon, ListItemText,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  Add as AddIcon,
  Hub as GraphIcon, Download as DownloadIcon,
  Refresh as RefreshIcon, ZoomIn, ZoomOut, CenterFocusStrong as CenterIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const API_BASE = '/api/darkweb';

const glassCard = {
  background: 'rgba(19, 47, 76, 0.7)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(33, 150, 243, 0.2)',
  borderRadius: 3,
};

const NODE_CONFIG = {
  ACTOR:        { color: '#2196f3', bg: '#2196f322', radius: 24, icon: '👤' },
  PGP_KEY:      { color: '#9c27b0', bg: '#9c27b022', radius: 18, icon: '🔑' },
  CRYPTO_WALLET:{ color: '#ff9800', bg: '#ff980022', radius: 18, icon: '💰' },
  MARKETPLACE:  { color: '#4caf50', bg: '#4caf5022', radius: 16, icon: '🏪' },
  COMM_CHANNEL: { color: '#00bcd4', bg: '#00bcd422', radius: 14, icon: '💬' },
};

const RELATION_COLOR = {
  OPERATES_ON:   '#4caf50',
  SIGNS_WITH:    '#9c27b0',
  RECEIVES_FUNDS:'#ff9800',
  CONTACT_VIA:   '#00bcd4',
};

// ─── Force-Directed Graph (vanilla SVG) ────────────────────────────────────────
function ForceGraph({ nodes, links, selectedNode, onSelectNode }) {
  const svgRef = useRef(null);
  const [positions, setPositions] = useState({});
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(null);
  const animFrameRef = useRef(null);
  const posRef = useRef({});
  const velRef = useRef({});

  useEffect(() => {
    if (nodes.length === 0) return;
    const W = 800, H = 500;
    const init = {};
    const vel = {};
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      const r = 180;
      init[n.id] = { x: W / 2 + r * Math.cos(angle), y: H / 2 + r * Math.sin(angle) };
      vel[n.id] = { x: 0, y: 0 };
    });
    posRef.current = init;
    velRef.current = vel;
    setPositions({ ...init });

    let tick = 0;
    const simulate = () => {
      if (tick++ > 200) return;
      const pos = posRef.current;
      const v = velRef.current;
      const REPEL = 3000, ATTRACT = 0.008, DAMP = 0.85, CENTER = 0.001;

      nodes.forEach(n => {
        let fx = 0, fy = 0;
        // Repulsion
        nodes.forEach(m => {
          if (m.id === n.id) return;
          const dx = pos[n.id].x - pos[m.id].x;
          const dy = pos[n.id].y - pos[m.id].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = REPEL / (dist * dist);
          fx += (dx / dist) * force;
          fy += (dy / dist) * force;
        });
        // Attraction
        links.forEach(l => {
          const other = l.source === n.id ? l.target : l.target === n.id ? l.source : null;
          if (!other || !pos[other]) return;
          const dx = pos[other].x - pos[n.id].x;
          const dy = pos[other].y - pos[n.id].y;
          fx += dx * ATTRACT;
          fy += dy * ATTRACT;
        });
        // Center pull
        fx += (W / 2 - pos[n.id].x) * CENTER;
        fy += (H / 2 - pos[n.id].y) * CENTER;

        v[n.id].x = (v[n.id].x + fx) * DAMP;
        v[n.id].y = (v[n.id].y + fy) * DAMP;
        pos[n.id].x = Math.max(30, Math.min(W - 30, pos[n.id].x + v[n.id].x));
        pos[n.id].y = Math.max(30, Math.min(H - 30, pos[n.id].y + v[n.id].y));
      });

      setPositions({ ...pos });
      animFrameRef.current = requestAnimationFrame(simulate);
    };
    animFrameRef.current = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animFrameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, links.length]);

  const handleMouseDown = (nodeId, e) => {
    e.stopPropagation();
    setDragging(nodeId);
    onSelectNode(nodeId);
    cancelAnimationFrame(animFrameRef.current);
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    posRef.current[dragging] = { x, y };
    setPositions(p => ({ ...p, [dragging]: { x, y } }));
  }, [dragging, pan, zoom]);

  const handleMouseUp = () => setDragging(null);

  return (
    <Box sx={{ position: 'relative', height: 500, background: 'rgba(10,25,41,0.8)', borderRadius: 2, border: '1px solid rgba(33,150,243,0.2)', overflow: 'hidden' }}>
      <svg ref={svgRef} width="100%" height="100%" style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 z" fill="rgba(255,255,255,0.3)" />
          </marker>
        </defs>
        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {/* Links */}
          {links.map((l, i) => {
            const src = positions[l.source], tgt = positions[l.target];
            if (!src || !tgt) return null;
            const color = RELATION_COLOR[l.relation] || '#ffffff44';
            return (
              <g key={i}>
                <line x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y} stroke={color} strokeWidth={1.5} strokeOpacity={0.6} markerEnd="url(#arrow)" />
              </g>
            );
          })}
          {/* Nodes */}
          {nodes.map(n => {
            const pos = positions[n.id];
            if (!pos) return null;
            const cfg = NODE_CONFIG[n.type] || NODE_CONFIG.ACTOR;
            const isSelected = selectedNode === n.id;
            return (
              <g key={n.id} onMouseDown={e => handleMouseDown(n.id, e)} style={{ cursor: 'pointer' }}>
                {isSelected && <circle cx={pos.x} cy={pos.y} r={cfg.radius + 8} fill="none" stroke={cfg.color} strokeWidth={2} strokeDasharray="4 2" opacity={0.8}>
                  <animateTransform attributeName="transform" type="rotate" from={`0 ${pos.x} ${pos.y}`} to={`360 ${pos.x} ${pos.y}`} dur="4s" repeatCount="indefinite" />
                </circle>}
                <circle cx={pos.x} cy={pos.y} r={cfg.radius} fill={cfg.bg} stroke={cfg.color} strokeWidth={isSelected ? 2.5 : 1.5} />
                <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={cfg.radius * 0.8} style={{ userSelect: 'none', pointerEvents: 'none' }}>{cfg.icon}</text>
                <text x={pos.x} y={pos.y + cfg.radius + 12} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.8)" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  {(n.label || n.id).substring(0, 18)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Controls */}
      <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Tooltip title="Zoom In"><IconButton size="small" onClick={() => setZoom(z => Math.min(z + 0.2, 3))} sx={{ background: 'rgba(19,47,76,0.9)', color: 'white', '&:hover': { background: 'rgba(33,150,243,0.3)' } }}><ZoomIn fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Zoom Out"><IconButton size="small" onClick={() => setZoom(z => Math.max(z - 0.2, 0.3))} sx={{ background: 'rgba(19,47,76,0.9)', color: 'white', '&:hover': { background: 'rgba(33,150,243,0.3)' } }}><ZoomOut fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Reset View"><IconButton size="small" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} sx={{ background: 'rgba(19,47,76,0.9)', color: 'white', '&:hover': { background: 'rgba(33,150,243,0.3)' } }}><CenterIcon fontSize="small" /></IconButton></Tooltip>
      </Box>

      {/* Legend */}
      <Box sx={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {Object.entries(NODE_CONFIG).map(([type, cfg]) => (
          <Chip key={type} label={`${cfg.icon} ${type.replace('_', ' ')}`} size="small"
            sx={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44`, fontSize: '0.62rem', height: 20 }} />
        ))}
      </Box>
    </Box>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ActorIdentityGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [crossAliases, setCrossAliases] = useState([]);
  const [actors, setActors] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newActor, setNewActor] = useState({ primaryHandle: '', category: 'Unknown', pgpFingerprint: '', walletAddress: '', walletCurrency: 'BTC', marketplace: '', contactPlatform: 'Telegram', contactHandle: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [graphRes, aliasRes, actorsRes] = await Promise.all([
        fetch(`${API_BASE}/actors/graph`).then(r => r.json()),
        fetch(`${API_BASE}/actors/cross-aliases`).then(r => r.json()),
        fetch(`${API_BASE}/actors`).then(r => r.json()),
      ]);
      if (graphRes.success) setGraphData(graphRes.data);
      if (aliasRes.success) setCrossAliases(aliasRes.data);
      if (actorsRes.success) setActors(actorsRes.data);
    } catch {
      // Use seeded sample data
      setGraphData(getSampleGraph());
      setCrossAliases(getSampleAliases());
      setActors(getSampleActors());
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddActor = async () => {
    const profile = {
      primaryHandle: newActor.primaryHandle,
      category: newActor.category,
      pgpFingerprint: newActor.pgpFingerprint || undefined,
      cryptoWallets: newActor.walletAddress ? [{ address: newActor.walletAddress, currency: newActor.walletCurrency }] : [],
      marketplaces: newActor.marketplace ? [{ name: newActor.marketplace }] : [],
      contactIds: newActor.contactHandle ? [{ platform: newActor.contactPlatform, handle: newActor.contactHandle }] : [],
      attributionConfidence: 70,
      source: 'Manual Entry',
      active: true,
    };
    try {
      const res = await fetch(`${API_BASE}/actors`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
      const data = await res.json();
      if (data.success) { setAddOpen(false); loadData(); }
    } catch {
      // Offline fallback — just reload with mock
      setAddOpen(false);
    }
  };

  const selectedNodeData = graphData.nodes?.find(n => n.id === selectedNode);
  const selectedActor = selectedNodeData?.type === 'ACTOR' ? actors.find(a => a.actorId === selectedNode || a.primaryHandle === selectedNodeData.label) : null;

  const exportGraph = () => {
    const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `actor_graph_${Date.now()}.json`; a.click();
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #2196f3, #0d47a1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, boxShadow: '0 4px 20px rgba(33,150,243,0.4)' }}>
            <GraphIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', lineHeight: 1 }}>Actor Identity Graph</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>Cross-marketplace entity resolution · PGP linkage · Crypto wallet clustering · Trust path mapping</Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Chip label="NTRO CAPABILITY 2" sx={{ background: 'rgba(33,150,243,0.15)', color: '#2196f3', fontWeight: 700, fontSize: '0.7rem' }} />
            <Button variant="outlined" startIcon={<AddIcon />} size="small" onClick={() => setAddOpen(true)} sx={{ borderColor: '#2196f3', color: '#2196f3' }}>Add Actor</Button>
            <Tooltip title="Export Graph JSON"><IconButton size="small" onClick={exportGraph} sx={{ color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' }}><DownloadIcon /></IconButton></Tooltip>
            <Tooltip title="Refresh"><IconButton size="small" onClick={loadData} sx={{ color: '#2196f3', border: '1px solid rgba(33,150,243,0.3)' }}><RefreshIcon /></IconButton></Tooltip>
          </Box>
        </Box>
        <Divider sx={{ borderColor: 'rgba(33,150,243,0.2)', mt: 2 }} />
      </Box>

      {/* KPI Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Threat Actors', value: actors.length, color: '#2196f3', icon: '👤' },
          { label: 'Graph Nodes', value: graphData.nodes?.length || 0, color: '#9c27b0', icon: '⬡' },
          { label: 'Link Edges', value: graphData.links?.length || 0, color: '#ff9800', icon: '↔' },
          { label: 'Cross-Alias Links', value: crossAliases.length, color: '#f44336', icon: '⚠' },
        ].map((k, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Paper sx={{ ...glassCard, p: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>{k.icon}</Typography>
              <Typography variant="h5" sx={{ color: k.color, fontWeight: 800 }}>{k.value}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{k.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Graph Canvas */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ ...glassCard, p: 2.5, mb: 3 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>Entity Relationship Graph</Typography>
            {loading ? (
              <Box sx={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: '#2196f3' }} />
              </Box>
            ) : (
              <ForceGraph nodes={graphData.nodes || []} links={graphData.links || []} selectedNode={selectedNode} onSelectNode={setSelectedNode} />
            )}
          </Paper>

          {/* Cross-Alias Detection Table */}
          <Paper sx={{ ...glassCard, p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WarningIcon sx={{ color: '#ff9800', mr: 1 }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>Cross-Marketplace Alias Detection</Typography>
              <Chip label={`${crossAliases.length} Links`} size="small" sx={{ ml: 'auto', background: crossAliases.length > 0 ? 'rgba(255,152,0,0.2)' : 'rgba(76,175,80,0.2)', color: crossAliases.length > 0 ? '#ff9800' : '#4caf50' }} />
            </Box>
            {crossAliases.length === 0 ? (
              <Alert severity="info">No cross-marketplace aliases detected yet. Add more actors with shared PGP keys or wallets.</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.75rem' }}>Pivot Type</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.75rem' }}>Shared Identifier</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.75rem' }}>Linked Actors</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.75rem' }}>Confidence</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.75rem' }}>Strength</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {crossAliases.map((cl, i) => {
                      const conf = Math.round(cl.confidence * 100);
                      const color = conf >= 95 ? '#f44336' : conf >= 85 ? '#ff9800' : '#ffd54f';
                      return (
                        <TableRow key={i} sx={{ '&:hover': { background: 'rgba(255,255,255,0.03)' } }}>
                          <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            <Chip label={cl.pivotType} size="small" sx={{ background: cl.pivotType === 'PGP' ? 'rgba(156,39,176,0.2)' : 'rgba(255,152,0,0.2)', color: cl.pivotType === 'PGP' ? '#9c27b0' : '#ff9800', fontSize: '0.65rem' }} />
                          </TableCell>
                          <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'monospace', color: 'rgba(255,255,255,0.8)', fontSize: '0.72rem' }}>
                            {cl.pivotIdentifier.substring(0, 28)}...
                          </TableCell>
                          <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            {cl.linkedActors.map(a => (
                              <Chip key={a.actorId} label={a.handle} size="small" sx={{ mr: 0.5, background: 'rgba(33,150,243,0.15)', color: '#2196f3', fontSize: '0.65rem' }} />
                            ))}
                          </TableCell>
                          <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)', color, fontWeight: 700, fontSize: '0.8rem' }}>{conf}%</TableCell>
                          <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            <Chip label={cl.attributionStrength} size="small" sx={{ background: `${color}22`, color, fontSize: '0.62rem', fontWeight: 700 }} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Right Panel */}
        <Grid item xs={12} lg={4}>
          {/* Selected Node Detail */}
          {selectedNodeData ? (
            <Paper sx={{ ...glassCard, p: 2.5, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontSize: '1.5rem', mr: 1 }}>{NODE_CONFIG[selectedNodeData.type]?.icon}</Typography>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2 }}>{selectedNodeData.label || selectedNodeData.id}</Typography>
                  <Chip label={selectedNodeData.type?.replace('_', ' ')} size="small" sx={{ mt: 0.5, background: `${NODE_CONFIG[selectedNodeData.type]?.color}22`, color: NODE_CONFIG[selectedNodeData.type]?.color, fontSize: '0.62rem' }} />
                </Box>
              </Box>
              {selectedActor && (
                <List dense>
                  {[
                    ['Category', selectedActor.category],
                    ['Attribution', `${selectedActor.attributionConfidence}%`],
                    ['Origin IP', selectedActor.originIpAttribution || 'Pending'],
                    ['Wallets', (selectedActor.cryptoWallets || []).length],
                    ['Markets', (selectedActor.marketplaces || []).length],
                    ['Tags', (selectedActor.tags || []).join(', ') || 'None'],
                  ].map(([k, v]) => (
                    <ListItem key={k} disablePadding sx={{ py: 0.3 }}>
                      <ListItemText primary={<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{k}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{v}</Typography>
                      </Box>} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          ) : (
            <Paper sx={{ ...glassCard, p: 2.5, mb: 3, textAlign: 'center' }}>
              <GraphIcon sx={{ fontSize: 48, color: 'rgba(33,150,243,0.3)', mb: 1 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>Click a node in the graph to view details</Typography>
            </Paper>
          )}

          {/* Actors List */}
          <Paper sx={{ ...glassCard, p: 2.5 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>Tracked Actors</Typography>
            <List dense>
              {actors.map(a => (
                <ListItem key={a.actorId || a.primaryHandle} disablePadding sx={{ mb: 1, p: 1.5, borderRadius: 2, background: 'rgba(255,255,255,0.03)', cursor: 'pointer', '&:hover': { background: 'rgba(33,150,243,0.08)' }, border: '1px solid rgba(255,255,255,0.05)' }}
                  onClick={() => setSelectedNode(a.actorId)}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(33,150,243,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>👤</Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>{a.primaryHandle}</Typography>}
                    secondary={<Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>{a.category} · {a.attributionConfidence}% confidence</Typography>}
                  />
                  <Chip label={a.active ? 'ACTIVE' : 'INACTIVE'} size="small" sx={{ background: a.active ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.08)', color: a.active ? '#4caf50' : 'rgba(255,255,255,0.4)', fontSize: '0.6rem' }} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Actor Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: 'linear-gradient(135deg, #0a1929, #132f4c)', border: '1px solid rgba(33,150,243,0.3)' } }}>
        <DialogTitle sx={{ color: 'white', fontWeight: 700 }}>Add Threat Actor Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={8}><TextField fullWidth label="Primary Handle *" value={newActor.primaryHandle} onChange={e => setNewActor(p => ({ ...p, primaryHandle: e.target.value }))} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} InputProps={{ sx: { color: 'white', '& fieldset': { borderColor: 'rgba(33,150,243,0.3)' } } }} /></Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Category</InputLabel>
                <Select value={newActor.category} onChange={e => setNewActor(p => ({ ...p, category: e.target.value }))} label="Category" sx={{ color: 'white', '& fieldset': { borderColor: 'rgba(33,150,243,0.3)' } }}>
                  {['Ransomware', 'Weapons', 'Drugs', 'Stolen Data', 'Money Laundering', 'Terror Financing', 'Hacking Services', 'Fraud', 'Unknown'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><TextField fullWidth label="PGP Fingerprint" value={newActor.pgpFingerprint} onChange={e => setNewActor(p => ({ ...p, pgpFingerprint: e.target.value }))} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} InputProps={{ sx: { color: 'white', fontFamily: 'monospace', '& fieldset': { borderColor: 'rgba(33,150,243,0.3)' } } }} /></Grid>
            <Grid item xs={8}><TextField fullWidth label="Crypto Wallet Address" value={newActor.walletAddress} onChange={e => setNewActor(p => ({ ...p, walletAddress: e.target.value }))} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} InputProps={{ sx: { color: 'white', fontFamily: 'monospace', '& fieldset': { borderColor: 'rgba(33,150,243,0.3)' } } }} /></Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Currency</InputLabel>
                <Select value={newActor.walletCurrency} onChange={e => setNewActor(p => ({ ...p, walletCurrency: e.target.value }))} label="Currency" sx={{ color: 'white', '& fieldset': { borderColor: 'rgba(33,150,243,0.3)' } }}>
                  {['BTC', 'XMR', 'ETH', 'LTC'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><TextField fullWidth label="Marketplace / Forum" value={newActor.marketplace} onChange={e => setNewActor(p => ({ ...p, marketplace: e.target.value }))} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} InputProps={{ sx: { color: 'white', '& fieldset': { borderColor: 'rgba(33,150,243,0.3)' } } }} /></Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Platform</InputLabel>
                <Select value={newActor.contactPlatform} onChange={e => setNewActor(p => ({ ...p, contactPlatform: e.target.value }))} label="Platform" sx={{ color: 'white', '& fieldset': { borderColor: 'rgba(33,150,243,0.3)' } }}>
                  {['Jabber', 'Telegram', 'Tox', 'Session', 'Wire', 'IRC'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={8}><TextField fullWidth label="Contact Handle" value={newActor.contactHandle} onChange={e => setNewActor(p => ({ ...p, contactHandle: e.target.value }))} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} InputProps={{ sx: { color: 'white', '& fieldset': { borderColor: 'rgba(33,150,243,0.3)' } } }} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddActor} disabled={!newActor.primaryHandle} sx={{ background: 'linear-gradient(135deg, #2196f3, #0d47a1)' }}>Add to Graph</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Sample data for offline fallback
function getSampleGraph() {
  return {
    nodes: [
      { id: 'ACTOR-AA01', type: 'ACTOR', label: 'DarkPhantom_v2', category: 'Ransomware', confidence: 94 },
      { id: 'ACTOR-BB02', type: 'ACTOR', label: 'SilkReborn_Admin', category: 'Drugs', confidence: 88 },
      { id: 'ACTOR-CC03', type: 'ACTOR', label: 'GhostNet_Broker', category: 'Hacking Services', confidence: 71 },
      { id: 'PGP:E8B21A34', type: 'PGP_KEY', label: 'E8B21A34... (Shared)' },
      { id: 'WALLET:1A1zP1', type: 'CRYPTO_WALLET', label: 'BTC: 1A1zP1...', currency: 'BTC' },
      { id: 'MKT:BreachForums', type: 'MARKETPLACE', label: 'BreachForums' },
      { id: 'MKT:HydraReborn', type: 'MARKETPLACE', label: 'Hydra Reborn' },
    ],
    links: [
      { source: 'ACTOR-AA01', target: 'PGP:E8B21A34', relation: 'SIGNS_WITH' },
      { source: 'ACTOR-BB02', target: 'PGP:E8B21A34', relation: 'SIGNS_WITH' },
      { source: 'ACTOR-AA01', target: 'WALLET:1A1zP1', relation: 'RECEIVES_FUNDS' },
      { source: 'ACTOR-CC03', target: 'WALLET:1A1zP1', relation: 'RECEIVES_FUNDS' },
      { source: 'ACTOR-AA01', target: 'MKT:BreachForums', relation: 'OPERATES_ON' },
      { source: 'ACTOR-BB02', target: 'MKT:HydraReborn', relation: 'OPERATES_ON' },
    ]
  };
}
function getSampleAliases() {
  return [
    { pivotId: 'PGP:E8B21A34', pivotType: 'PGP', pivotIdentifier: 'E8B21A3499F0C3D7B2A19E4F5C8D7E6A1B3F4E5C', linkedActors: [{ actorId: 'ACTOR-AA01', handle: 'DarkPhantom_v2' }, { actorId: 'ACTOR-BB02', handle: 'SilkReborn_Admin' }], confidence: 0.99, attributionStrength: 'DEFINITIVE' },
    { pivotId: 'WALLET:1A1zP1', pivotType: 'WALLET', pivotIdentifier: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divfna', linkedActors: [{ actorId: 'ACTOR-AA01', handle: 'DarkPhantom_v2' }, { actorId: 'ACTOR-CC03', handle: 'GhostNet_Broker' }], confidence: 0.92, attributionStrength: 'STRONG' },
  ];
}
function getSampleActors() {
  return [
    { actorId: 'ACTOR-AA01', primaryHandle: 'DarkPhantom_v2', category: 'Ransomware', attributionConfidence: 94, active: true, cryptoWallets: [{}], marketplaces: [{}], pgpFingerprint: 'E8B21A34', originIpAttribution: '185.220.101.47', tags: ['LockBit', 'active'] },
    { actorId: 'ACTOR-BB02', primaryHandle: 'SilkReborn_Admin', category: 'Drugs', attributionConfidence: 88, active: true, cryptoWallets: [{}], marketplaces: [{}, {}], pgpFingerprint: 'E8B21A34', tags: ['admin'] },
    { actorId: 'ACTOR-CC03', primaryHandle: 'GhostNet_Broker', category: 'Hacking Services', attributionConfidence: 71, active: true, cryptoWallets: [{}], marketplaces: [{}], tags: ['broker'] },
  ];
}
