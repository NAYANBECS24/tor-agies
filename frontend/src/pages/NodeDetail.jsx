import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tab,
  Tabs,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
  Public as PublicIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const NodeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = React.useState(0);

  const nodeData = {
    id: id || '123456',
    name: 'GuardNode01',
    fingerprint: '0x1234567890ABCDEF1234567890ABCDEF12345678',
    ipAddress: '192.168.1.100',
    country: 'United States',
    countryCode: 'US',
    status: 'online',
    type: 'Guard Node',
    bandwidth: {
      average: '50 MB/s',
      burst: '100 MB/s',
      observed: '45 MB/s'
    },
    flags: ['Fast', 'Stable', 'Guard', 'Valid', 'Running'],
    version: 'Tor 0.4.7.13',
    contact: 'admin@example.com',
    firstSeen: '2024-01-15',
    lastSeen: '2024-12-14 15:30:00',
    uptime: '95.7%',
    reliabilityScore: 92,
    threatScore: 15,
    geoLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      city: 'San Francisco',
      region: 'California'
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/nodes')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Node Details: {nodeData.name}
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />}>
            Refresh
          </Button>
          <Button variant="contained" color="primary">
            Monitor
          </Button>
        </Box>
      </Box>

      {/* Alert if suspicious */}
      {nodeData.threatScore > 50 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          This node has high threat score ({nodeData.threatScore}%). Consider investigating further.
        </Alert>
      )}

      {/* Basic Info Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PublicIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">Location</Typography>
              </Box>
              <Typography variant="h5">{nodeData.country}</Typography>
              <Typography variant="body2" color="text.secondary">
                {nodeData.geoLocation.city}, {nodeData.geoLocation.region}
              </Typography>
              <Typography variant="caption">
                IP: {nodeData.ipAddress}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SpeedIcon sx={{ mr: 2, color: 'success.main' }} />
                <Typography variant="h6">Performance</Typography>
              </Box>
              <Typography variant="h5">{nodeData.bandwidth.average}</Typography>
              <Typography variant="body2" color="text.secondary">
                Average Bandwidth
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" display="block">Uptime: {nodeData.uptime}</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={parseFloat(nodeData.uptime)} 
                  sx={{ mt: 0.5 }}
                  color="success"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 2, color: 'info.main' }} />
                <Typography variant="h6">Security</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h5" color="success.main">
                    {nodeData.reliabilityScore}%
                  </Typography>
                  <Typography variant="caption">Reliability</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h5" color={nodeData.threatScore > 50 ? 'error' : 'success'}>
                    {nodeData.threatScore}%
                  </Typography>
                  <Typography variant="caption">Threat Score</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab icon={<SettingsIcon />} label="Details" />
          <Tab icon={<TimelineIcon />} label="Performance" />
          <Tab icon={<SecurityIcon />} label="Security" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Node Information</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Fingerprint" secondary={nodeData.fingerprint} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Type" secondary={nodeData.type} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Version" secondary={nodeData.version} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Contact" secondary={nodeData.contact} />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Status & Flags</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip label={nodeData.status} color="success" />
                  {nodeData.flags.map((flag, index) => (
                    <Chip key={index} label={flag} variant="outlined" />
                  ))}
                </Box>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Timeline</Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary="First Seen" secondary={nodeData.firstSeen} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="info" />
                    </ListItemIcon>
                    <ListItemText primary="Last Seen" secondary={nodeData.lastSeen} />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Bandwidth Metrics</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {nodeData.bandwidth.average}
                    </Typography>
                    <Typography variant="body2">Average</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="secondary">
                      {nodeData.bandwidth.burst}
                    </Typography>
                    <Typography variant="body2">Burst</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="info">
                      {nodeData.bandwidth.observed}
                    </Typography>
                    <Typography variant="body2">Observed</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Security Analysis</Typography>
              <Alert severity={nodeData.threatScore > 50 ? 'warning' : 'success'} sx={{ mb: 2 }}>
                {nodeData.threatScore > 50 
                  ? 'This node shows elevated threat indicators'
                  : 'This node appears to be operating normally'}
              </Alert>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Strengths</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="High Uptime" secondary="Reliable operation" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Valid Flags" secondary="Properly configured" />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Recommendations</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText primary="Monitor traffic" secondary="Regular checks recommended" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText primary="Update version" secondary="Consider upgrading Tor" />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" color="warning">
            Mark Suspicious
          </Button>
          <Button variant="outlined" color="error">
            Block Node
          </Button>
          <Button variant="contained" color="primary">
            Download Report
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NodeDetail;