import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  LinearProgress,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  Timeline as TimelineIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  NotificationsActive as NotificationsIcon
} from '@mui/icons-material';

const Threats = () => {
  const threatStats = {
    total: 128,
    critical: 12,
    high: 34,
    medium: 52,
    low: 30,
    blocked: 94,
    active: 34,
    avgResponse: '2.3s'
  };

  const threatTypes = [
    { name: 'Port Scanning', count: 45, severity: 'high', trend: 'up' },
    { name: 'DDoS Attack', count: 28, severity: 'critical', trend: 'up' },
    { name: 'Malware C&C', count: 22, severity: 'high', trend: 'stable' },
    { name: 'Data Exfiltration', count: 15, severity: 'critical', trend: 'up' },
    { name: 'Protocol Abuse', count: 12, severity: 'medium', trend: 'down' },
    { name: 'Anomalous Traffic', count: 6, severity: 'low', trend: 'stable' },
  ];

  const recentThreats = [
    { id: 1, timestamp: '2024-12-14 15:45:22', type: 'DDoS Attack', source: '192.168.1.50', target: 'ExitNode03', severity: 'critical', status: 'blocked' },
    { id: 2, timestamp: '2024-12-14 15:42:18', type: 'Port Scanning', source: '10.0.0.23', target: 'GuardNode01', severity: 'high', status: 'investigating' },
    { id: 3, timestamp: '2024-12-14 15:40:55', type: 'Malware C&C', source: 'SuspiciousNode', target: 'RelayNode42', severity: 'high', status: 'blocked' },
    { id: 4, timestamp: '2024-12-14 15:38:12', type: 'Data Exfiltration', source: 'CompromisedExit', target: 'External Server', severity: 'critical', status: 'active' },
    { id: 5, timestamp: '2024-12-14 15:35:45', type: 'Protocol Abuse', source: 'MaliciousUser', target: 'BridgeAlpha', severity: 'medium', status: 'resolved' },
    { id: 6, timestamp: '2024-12-14 15:33:22', type: 'Anomalous Traffic', source: 'Unknown', target: 'MiddleRelay07', severity: 'low', status: 'monitoring' },
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'blocked': return 'success';
      case 'resolved': return 'success';
      case 'investigating': return 'warning';
      case 'monitoring': return 'info';
      case 'active': return 'error';
      default: return 'default';
    }
  };

  const handleBlockThreat = (id) => {
    console.log(`Blocking threat ${id}`);
  };

  const handleInvestigate = (id) => {
    console.log(`Investigating threat ${id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Threat Intelligence
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export Report
          </Button>
          <Button variant="contained" startIcon={<NotificationsIcon />} color="warning">
            Alert Settings
          </Button>
        </Box>
      </Box>

      {/* Critical Alert */}
      {threatStats.critical > 0 && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small">
              TAKE ACTION
            </Button>
          }
        >
          <AlertTitle>Critical Threat Detected</AlertTitle>
          {threatStats.critical} active critical threats require immediate attention
        </Alert>
      )}

      {/* Threat Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #f44336' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error">
                Total Threats
              </Typography>
              <Typography variant="h3">{threatStats.total}</Typography>
              <Typography variant="body2" color="textSecondary">
                Last 24 hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #ff9800' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="warning">
                Active Threats
              </Typography>
              <Typography variant="h3">{threatStats.active}</Typography>
              <LinearProgress 
                variant="determinate" 
                value={(threatStats.active / threatStats.total) * 100}
                color="warning"
                sx={{ mt: 1, height: 6 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #4caf50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="success">
                Blocked
              </Typography>
              <Typography variant="h3">{threatStats.blocked}</Typography>
              <Typography variant="body2" color="textSecondary">
                {((threatStats.blocked / threatStats.total) * 100).toFixed(1)}% success rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #2196f3' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="info">
                Avg Response
              </Typography>
              <Typography variant="h3">{threatStats.avgResponse}</Typography>
              <Typography variant="body2" color="textSecondary">
                Mean time to respond
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Threat Distribution */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Threat Type Distribution
            </Typography>
            {threatTypes.map((type) => (
              <Box key={type.name} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{type.name}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {type.count}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(type.count / threatStats.total) * 100}
                  color={getSeverityColor(type.severity)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Chip 
                    label={type.severity.toUpperCase()} 
                    size="small"
                    color={getSeverityColor(type.severity)}
                  />
                  <Typography variant="caption">
                    Trend: {type.trend}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Severity Breakdown
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'flex-end', gap: 2, mt: 3 }}>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Box 
                  sx={{ 
                    height: `${(threatStats.critical / threatStats.total) * 200}px`, 
                    bgcolor: 'error.main',
                    borderRadius: 1
                  }}
                />
                <Typography variant="h6" sx={{ mt: 1 }}>{threatStats.critical}</Typography>
                <Typography variant="caption">CRITICAL</Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Box 
                  sx={{ 
                    height: `${(threatStats.high / threatStats.total) * 200}px`, 
                    bgcolor: 'error.light',
                    borderRadius: 1
                  }}
                />
                <Typography variant="h6" sx={{ mt: 1 }}>{threatStats.high}</Typography>
                <Typography variant="caption">HIGH</Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Box 
                  sx={{ 
                    height: `${(threatStats.medium / threatStats.total) * 200}px`, 
                    bgcolor: 'warning.main',
                    borderRadius: 1
                  }}
                />
                <Typography variant="h6" sx={{ mt: 1 }}>{threatStats.medium}</Typography>
                <Typography variant="caption">MEDIUM</Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Box 
                  sx={{ 
                    height: `${(threatStats.low / threatStats.total) * 200}px`, 
                    bgcolor: 'info.main',
                    borderRadius: 1
                  }}
                />
                <Typography variant="h6" sx={{ mt: 1 }}>{threatStats.low}</Typography>
                <Typography variant="caption">LOW</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Threats Table */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        Recent Threats
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Timestamp</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Threat Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Source</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Target</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Severity</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentThreats.map((threat) => (
              <TableRow key={threat.id} hover>
                <TableCell>{threat.timestamp}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {threat.severity === 'critical' ? <ErrorIcon color="error" /> : <WarningIcon color="warning" />}
                    <Typography>{threat.type}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontFamily: 'monospace' }}>
                    {threat.source}
                  </Typography>
                </TableCell>
                <TableCell>{threat.target}</TableCell>
                <TableCell>
                  <Chip 
                    label={threat.severity.toUpperCase()}
                    color={getSeverityColor(threat.severity)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={threat.status.toUpperCase()}
                    color={getStatusColor(threat.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {threat.status !== 'blocked' && threat.status !== 'resolved' && (
                      <Tooltip title="Block Threat">
                        <IconButton 
                          size="small" 
                          onClick={() => handleBlockThreat(threat.id)}
                          color="error"
                        >
                          <BlockIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Investigate">
                      <IconButton 
                        size="small" 
                        onClick={() => handleInvestigate(threat.id)}
                        color="primary"
                      >
                        <TimelineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mitigation Actions */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recommended Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'error.light', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BlockIcon />
                  <Typography variant="subtitle1">Block Malicious IPs</Typography>
                </Box>
                <Typography variant="body2">
                  28 IP addresses flagged for immediate blocking
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.light' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SecurityIcon />
                  <Typography variant="subtitle1">Update Rules</Typography>
                </Box>
                <Typography variant="body2">
                  5 detection rules need updating
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.light' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TimelineIcon />
                  <Typography variant="subtitle1">Analyze Patterns</Typography>
                </Box>
                <Typography variant="body2">
                  Review 12 suspicious traffic patterns
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircleIcon />
                  <Typography variant="subtitle1">Verify Patches</Typography>
                </Box>
                <Typography variant="body2">
                  3 critical security patches available
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Threats;