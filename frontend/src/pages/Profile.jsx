import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Switch,
  Card,
  CardContent
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  VpnKey as VpnKeyIcon,
  History as HistoryIcon,
  Devices as DevicesIcon
} from '@mui/icons-material';

const Profile = () => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [profile, setProfile] = React.useState({
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Administrator',
    department: 'Network Security',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    lastLogin: '2024-12-14 14:30:22',
    joined: '2024-01-15',
    notifications: true,
    twoFactor: false,
    darkMode: false
  });

  const activityLogs = [
    { id: 1, action: 'Logged in', timestamp: '2024-12-14 14:30:22', ip: '192.168.1.100' },
    { id: 2, action: 'Viewed Traffic Dashboard', timestamp: '2024-12-14 14:35:45', ip: '192.168.1.100' },
    { id: 3, action: 'Updated Threat Rules', timestamp: '2024-12-14 10:15:33', ip: '192.168.1.100' },
    { id: 4, action: 'Exported Report', timestamp: '2024-12-13 16:22:18', ip: '192.168.1.100' },
    { id: 5, action: 'Changed Settings', timestamp: '2024-12-12 09:45:12', ip: '192.168.1.100' },
  ];

  const handleSave = () => {
    console.log('Saving profile:', profile);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        User Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column - Profile Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            {/* Profile Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: 40,
                  bgcolor: 'primary.main',
                  mx: 'auto',
                  mb: 2
                }}
              >
                AU
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {profile.name}
              </Typography>
              <Chip 
                label={profile.role}
                color="primary"
                size="small"
                sx={{ mt: 1 }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Member since {profile.joined}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Quick Stats */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom color="textSecondary">
                Account Statistics
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6">142</Typography>
                      <Typography variant="caption">Days Active</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6">24</Typography>
                      <Typography variant="caption">Alerts Today</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            {/* Settings */}
            <Typography variant="subtitle2" gutterBottom color="textSecondary">
              Preferences
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText primary="Email Notifications" />
                <Switch
                  checked={profile.notifications}
                  onChange={(e) => handleChange('notifications', e.target.checked)}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText primary="Two-Factor Auth" />
                <Switch
                  checked={profile.twoFactor}
                  onChange={(e) => handleChange('twoFactor', e.target.checked)}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <DevicesIcon />
                </ListItemIcon>
                <ListItemText primary="Dark Mode" />
                <Switch
                  checked={profile.darkMode}
                  onChange={(e) => handleChange('darkMode', e.target.checked)}
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<VpnKeyIcon />}
                fullWidth
                size="small"
              >
                Change Password
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                fullWidth
                size="small"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Personal Information
              </Typography>
              {isEditing ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    size="small"
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => setIsEditing(false)}
                    size="small"
                  >
                    Cancel
                  </Button>
                </Box>
              ) : null}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: (
                      <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: (
                      <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={profile.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: (
                      <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={profile.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: (
                      <LocationIcon sx={{ mr: 1, color: 'action.active' }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Login"
                  value={profile.lastLogin}
                  disabled
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Activity Log */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Recent Activity
            </Typography>
            <List>
              {activityLogs.map((log) => (
                <ListItem
                  key={log.id}
                  divider
                  sx={{ py: 1.5 }}
                >
                  <ListItemIcon>
                    <HistoryIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={log.action}
                    secondary={`${log.timestamp} • IP: ${log.ip}`}
                  />
                </ListItem>
              ))}
            </List>
            <Button
              fullWidth
              variant="text"
              sx={{ mt: 1 }}
            >
              View All Activity
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;