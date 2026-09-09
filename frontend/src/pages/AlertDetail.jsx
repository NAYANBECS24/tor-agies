import React from 'react';
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
  Alert,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Warning as WarningIcon,
  Timeline as TimelineIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const AlertDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const alertData = {
    id: 1,
    title: 'DDoS Attack Detected',
    description: 'Multiple sources flooding ExitNode03 with malformed packets',
    severity: 'critical',
    timestamp: '2024-12-14 15:45:22',
    source: '192.168.1.50',
    target: 'ExitNode03',
    status: 'investigating',
    protocol: 'UDP',
    packets: '2.4M',
    duration: '45 seconds',
    affectedNodes: ['ExitNode03', 'GuardNode01', 'RelayNode42'],
    mitigation: 'Traffic blocked, source IPs blacklisted'
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/alerts')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Alert Details
        </Typography>
        <Chip 
          label={`ID: ${id}`}
          size="small"
          variant="outlined"
        />
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Alert Info */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {alertData.title}
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  {alertData.description}
                </Typography>
              </Box>
              <Chip
                icon={<WarningIcon />}
                label={alertData.severity.toUpperCase()}
                color={getSeverityColor(alertData.severity)}
                size="large"
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Alert Details */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Alert Details
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Source IP
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {alertData.source}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Target Node
                    </Typography>
                    <Typography variant="body1">
                      {alertData.target}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Protocol
                    </Typography>
                    <Typography variant="body1">
                      {alertData.protocol}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Duration
                    </Typography>
                    <Typography variant="body1">
                      {alertData.duration}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Affected Nodes */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
              Affected Nodes
            </Typography>
            <List dense>
              {alertData.affectedNodes.map((node, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <LocationIcon />
                  </ListItemIcon>
                  <ListItemText primary={node} />
                </ListItem>
              ))}
            </List>

            {/* Mitigation Actions */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
              Mitigation Actions
            </Typography>
            <Alert severity="success" sx={{ mb: 2 }}>
              {alertData.mitigation}
            </Alert>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button variant="contained" startIcon={<BlockIcon />} color="error">
                Block Source
              </Button>
              <Button variant="outlined" startIcon={<TimelineIcon />}>
                Analyze Pattern
              </Button>
              <Button variant="outlined" startIcon={<CheckCircleIcon />}>
                Mark as Resolved
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Timeline & Actions */}
        <Grid item xs={12} md={4}>
          {/* Timeline */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Timeline
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <TimeIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Alert Triggered"
                  secondary={alertData.timestamp}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Detection Confirmed"
                  secondary="15:45:25 (+3s)"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Mitigation Applied"
                  secondary="15:45:40 (+18s)"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Investigation Started"
                  secondary="15:46:00 (+38s)"
                />
              </ListItem>
            </List>
          </Paper>

          {/* Related Alerts */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Related Alerts
            </Typography>
            <List dense>
              {[
                { id: 101, title: 'Port Scan Detected', severity: 'high' },
                { id: 102, title: 'Bandwidth Spike', severity: 'medium' },
                { id: 103, title: 'Unusual Traffic Pattern', severity: 'high' },
              ].map((related) => (
                <ListItem 
                  key={related.id} 
                  button
                  onClick={() => navigate(`/alerts/${related.id}`)}
                  sx={{ mb: 1, borderRadius: 1 }}
                >
                  <ListItemText 
                    primary={related.title}
                    secondary={`ID: ${related.id}`}
                  />
                  <Chip 
                    label={related.severity}
                    size="small"
                    color={getSeverityColor(related.severity)}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AlertDetail;