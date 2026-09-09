import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Slider,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const Settings = () => {
  const [settings, setSettings] = React.useState({
    autoRefresh: true,
    notifications: true,
    emailAlerts: true,
    threatDetection: true,
    dataRetention: 30,
    logLevel: 'info',
    maxConnections: 1000,
    encryptionLevel: 'high'
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // In real app, this would save to backend
  };

  const handleReset = () => {
    setSettings({
      autoRefresh: true,
      notifications: true,
      emailAlerts: true,
      threatDetection: true,
      dataRetention: 30,
      logLevel: 'info',
      maxConnections: 1000,
      encryptionLevel: 'high'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        System Settings
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Changes to settings will take effect immediately. Some settings may require a service restart.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SettingsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">General Settings</Typography>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoRefresh}
                  onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                />
              }
              label="Auto Refresh Dashboard"
              sx={{ mb: 2, display: 'block' }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Log Level</InputLabel>
              <Select
                value={settings.logLevel}
                label="Log Level"
                onChange={(e) => handleSettingChange('logLevel', e.target.value)}
              >
                <MenuItem value="debug">Debug</MenuItem>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>Data Retention (Days)</Typography>
              <Slider
                value={settings.dataRetention}
                onChange={(e, value) => handleSettingChange('dataRetention', value)}
                min={1}
                max={365}
                valueLabelDisplay="auto"
              />
              <Typography variant="caption">
                Current: {settings.dataRetention} days
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>Max Concurrent Connections</Typography>
              <TextField
                type="number"
                value={settings.maxConnections}
                onChange={(e) => handleSettingChange('maxConnections', e.target.value)}
                fullWidth
                inputProps={{ min: 100, max: 10000 }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Security Settings</Typography>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.threatDetection}
                  onChange={(e) => handleSettingChange('threatDetection', e.target.checked)}
                />
              }
              label="Real-time Threat Detection"
              sx={{ mb: 2, display: 'block' }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Encryption Level</InputLabel>
              <Select
                value={settings.encryptionLevel}
                label="Encryption Level"
                onChange={(e) => handleSettingChange('encryptionLevel', e.target.value)}
              >
                <MenuItem value="low">Low (Fastest)</MenuItem>
                <MenuItem value="medium">Medium (Balanced)</MenuItem>
                <MenuItem value="high">High (Most Secure)</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>Session Timeout (minutes)</Typography>
              <TextField
                type="number"
                defaultValue={30}
                fullWidth
                inputProps={{ min: 5, max: 240 }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>Two-Factor Authentication</Typography>
              <Button variant="outlined" size="small">
                Configure 2FA
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Notification Settings</Typography>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                />
              }
              label="Enable Notifications"
              sx={{ mb: 2, display: 'block' }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailAlerts}
                  onChange={(e) => handleSettingChange('emailAlerts', e.target.checked)}
                />
              }
              label="Email Alerts"
              sx={{ mb: 2, display: 'block' }}
            />

            <TextField
              label="Email Address for Alerts"
              type="email"
              fullWidth
              defaultValue="admin@example.com"
              sx={{ mb: 2 }}
            />

            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              Alert Thresholds:
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemText primary="Critical Threats" secondary="Immediate notification" />
                <Switch defaultChecked />
              </ListItem>
              <ListItem>
                <ListItemText primary="High Threats" secondary="Notify within 5 minutes" />
                <Switch defaultChecked />
              </ListItem>
              <ListItem>
                <ListItemText primary="Medium Threats" secondary="Daily summary" />
                <Switch />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Network Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NetworkIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Network Settings</Typography>
            </Box>
            
            <TextField
              label="API Endpoint"
              defaultValue="https://api.tor-monitor.com"
              fullWidth
              sx={{ mb: 2 }}
            />

            <TextField
              label="WebSocket URL"
              defaultValue="wss://ws.tor-monitor.com"
              fullWidth
              sx={{ mb: 2 }}
            />

            <TextField
              label="Proxy Server"
              placeholder="Optional"
              fullWidth
              sx={{ mb: 2 }}
            />

            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>Connection Timeout (seconds)</Typography>
              <TextField
                type="number"
                defaultValue={30}
                fullWidth
                inputProps={{ min: 5, max: 120 }}
              />
            </Box>

            <Button variant="outlined" startIcon={<NetworkIcon />} fullWidth>
              Test Connection
            </Button>
          </Paper>
        </Grid>

        {/* Data Management */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StorageIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Data Management</Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Export Data
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Export all monitoring data in CSV format
                    </Typography>
                    <Button variant="outlined" fullWidth>
                      Export Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Clear Logs
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Delete all system logs older than 30 days
                    </Typography>
                    <Button variant="outlined" color="warning" fullWidth startIcon={<DeleteIcon />}>
                      Clear Logs
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Backup Configuration
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Backup all settings and configurations
                    </Typography>
                    <Button variant="outlined" color="success" fullWidth>
                      Create Backup
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<RestoreIcon />}
          onClick={handleReset}
        >
          Reset to Defaults
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;