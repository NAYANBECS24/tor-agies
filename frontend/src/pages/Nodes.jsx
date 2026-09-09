import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Storage as StorageIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Public as PublicIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  OfflineBolt as OfflineBoltIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

const Nodes = () => {
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  const nodeStats = {
    total: 7482,
    active: 6985,
    guard: 2450,
    middle: 3200,
    exit: 1335,
    bridge: 497,
    bandwidth: '156 TB',
    avgUptime: '96.4%'
  };

  const nodeList = [
    { id: 1, name: 'GuardNode01', type: 'Guard', status: 'active', uptime: '99.8%', bandwidth: '2.4 Gbps', country: 'US', flags: ['Fast', 'Stable', 'HSDir'], connections: 1245 },
    { id: 2, name: 'ExitNode03', type: 'Exit', status: 'active', uptime: '97.2%', bandwidth: '1.8 Gbps', country: 'DE', flags: ['Fast', 'Exit'], connections: 892 },
    { id: 3, name: 'RelayNode42', type: 'Relay', status: 'warning', uptime: '85.4%', bandwidth: '890 Mbps', country: 'JP', flags: ['Running'], connections: 456 },
    { id: 4, name: 'BridgeAlpha', type: 'Bridge', status: 'active', uptime: '92.1%', bandwidth: '120 Mbps', country: 'CA', flags: ['Bridge'], connections: 78 },
    { id: 5, name: 'MiddleRelay07', type: 'Relay', status: 'active', uptime: '98.9%', bandwidth: '1.2 Gbps', country: 'UK', flags: ['Fast', 'Stable'], connections: 678 },
    { id: 6, name: 'GuardNode12', type: 'Guard', status: 'inactive', uptime: '0%', bandwidth: '0 Mbps', country: 'FR', flags: [], connections: 0 },
    { id: 7, name: 'ExitNode09', type: 'Exit', status: 'critical', uptime: '45.2%', bandwidth: '340 Mbps', country: 'NL', flags: ['Exit', 'BadExit'], connections: 234 },
    { id: 8, name: 'RelayNode88', type: 'Relay', status: 'active', uptime: '99.1%', bandwidth: '3.1 Gbps', country: 'US', flags: ['Fast', 'Stable', 'HSDir'], connections: 1567 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Guard': return 'primary';
      case 'Exit': return 'error';
      case 'Relay': return 'secondary';
      case 'Bridge': return 'info';
      default: return 'default';
    }
  };

  const handleRefresh = () => {
    console.log('Refreshing node data...');
  };

  const handleNodeSettings = (nodeId) => {
    console.log(`Opening settings for node ${nodeId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Tor Network Nodes
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                color="primary"
              />
            }
            label="Auto Refresh"
          />
          <Tooltip title="Refresh Nodes">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<SettingsIcon />}>
            Configure
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Nodes</Typography>
              </Box>
              <Typography variant="h4">{nodeStats.total.toLocaleString()}</Typography>
              <LinearProgress 
                variant="determinate" 
                value={(nodeStats.active / nodeStats.total) * 100} 
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
                color="success"
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {nodeStats.active} active ({((nodeStats.active / nodeStats.total) * 100).toFixed(1)}%)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Guard Nodes</Typography>
              </Box>
              <Typography variant="h4">{nodeStats.guard.toLocaleString()}</Typography>
              <Typography variant="body2" color="textSecondary">
                Entry points to network
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SpeedIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Bandwidth</Typography>
              </Box>
              <Typography variant="h4">{nodeStats.bandwidth}</Typography>
              <Typography variant="body2" color="textSecondary">
                Total network capacity
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PublicIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Avg Uptime</Typography>
              </Box>
              <Typography variant="h4">{nodeStats.avgUptime}</Typography>
              <Typography variant="body2" color="textSecondary">
                Network reliability
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Node Distribution */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Node Type Distribution
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" color="primary">{nodeStats.guard}</Typography>
              <Typography variant="body2">Guard Nodes</Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" color="secondary">{nodeStats.middle}</Typography>
              <Typography variant="body2">Middle Relays</Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" color="error">{nodeStats.exit}</Typography>
              <Typography variant="body2">Exit Nodes</Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" color="info">{nodeStats.bridge}</Typography>
              <Typography variant="body2">Bridges</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Search and Controls */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search nodes..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Chip label="Active Only" color="success" variant="outlined" />
        <Chip label="High Bandwidth" color="primary" variant="outlined" />
        <Box sx={{ flexGrow: 1 }} />
        <IconButton>
          <FilterIcon />
        </IconButton>
      </Paper>

      {/* Nodes Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Node Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Uptime</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Bandwidth</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Country</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Connections</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Flags</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nodeList.map((node) => (
              <TableRow key={node.id} hover>
                <TableCell>
                  <Typography sx={{ fontWeight: 'medium', fontFamily: 'monospace' }}>
                    {node.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={node.type} 
                    color={getTypeColor(node.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    icon={node.status === 'active' ? <CheckCircleIcon /> : <WarningIcon />}
                    label={node.status.toUpperCase()}
                    color={getStatusColor(node.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{node.uptime}</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={parseFloat(node.uptime)} 
                      sx={{ width: 60, height: 6, borderRadius: 3 }}
                      color={parseFloat(node.uptime) > 90 ? 'success' : parseFloat(node.uptime) > 70 ? 'warning' : 'error'}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <OfflineBoltIcon fontSize="small" color="warning" />
                    <Typography>{node.bandwidth}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon fontSize="small" />
                    <Typography>{node.country}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 'medium' }}>
                    {node.connections.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {node.flags.map((flag, index) => (
                      <Chip 
                        key={index}
                        label={flag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip title="Configure Node">
                    <IconButton 
                      size="small" 
                      onClick={() => handleNodeSettings(node.id)}
                      color="primary"
                    >
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Legend */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Node Type Legend
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label="Guard" color="primary" size="small" />
            <Typography variant="caption">Entry point to Tor network</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label="Relay" color="secondary" size="small" />
            <Typography variant="caption">Middle relay node</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label="Exit" color="error" size="small" />
            <Typography variant="caption">Exit node to clearnet</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label="Bridge" color="info" size="small" />
            <Typography variant="caption">Bridge for censorship circumvention</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Nodes;