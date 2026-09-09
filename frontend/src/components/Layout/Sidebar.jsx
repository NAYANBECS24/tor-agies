import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Badge,
} from '@mui/material';
import {
  Home as HomeIcon,
  Link as LinkIcon,
  Lock as LockIcon,
  Code as CodeIcon,
  Analytics as AnalyticsIcon,
  CloudDownload as CloudDownloadIcon,
  Speed as SpeedIcon,
  DeviceHub as DeviceHubIcon,
  Traffic as TrafficIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Insights as InsightsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  VpnKey as VpnKeyIcon,
  Person as PersonIcon, // Added for Profile
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ open, drawerWidth }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Comprehensive Menu List
  const menuItems = [
    { text: 'Home Page', icon: <HomeIcon />, path: '/' },
    { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
    { text: 'Correlation Page', icon: <LinkIcon />, path: '/correlation' },
    { text: 'Encryption Page', icon: <LockIcon />, path: '/encryption' },
    { text: 'ATWC ENGINE', icon: <CodeIcon />, path: '/ATWC ENGINE' },
    { text: 'Traffic Analyzer', icon: <AnalyticsIcon />, path: '/TrafficAnalyzer' },
    { text: 'Data Collection', icon: <CloudDownloadIcon />, path: '/data-collection' },
    { text: 'Tor Metrics', icon: <SpeedIcon />, path: '/tor-metrics' },
    { text: 'Nodes', icon: <DeviceHubIcon />, path: '/nodes' },
    { text: 'Traffic', icon: <TrafficIcon />, path: '/traffic' },
    { text: 'Threats', icon: <SecurityIcon />, path: '/threats' },
    { text: 'Analytics', icon: <InsightsIcon />, path: '/analytics' },
    { text: 'Alerts', icon: <NotificationsIcon />, path: '/alerts', badge: 3 },
  ];

  const bottomMenuItems = [
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Logout', icon: <LogoutIcon />, path: '/login' },
  ];

  const handleLogout = () => {
    console.log('Logging out...');
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : 60,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 60,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: 'width 0.3s ease',
          backgroundColor: '#0a1929', // Dark Theme Background
          color: 'white',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        },
      }}
    >
      {/* Logo Section */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: open ? 'flex-start' : 'center',
        gap: 1,
        height: 64
      }}>
        <VpnKeyIcon color="primary" />
        {open && (
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            OTR Dashboard
          </Typography>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

      {/* Main Menu List */}
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            button
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(33, 150, 243, 0.16)',
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.24)',
                },
                // Highlight text and icon color when selected
                '& .MuiListItemIcon-root': {
                  color: '#90caf9',
                },
                '& .MuiListItemText-primary': {
                  color: '#90caf9',
                  fontWeight: 'bold',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : 'auto',
                justifyContent: 'center',
                color: 'inherit' // Inherits white (from Drawer) or override from selected
              }}
            >
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            {open && (
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                }}
              />
            )}
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

      {/* Bottom Menu List */}
      <List sx={{ mt: 'auto' }}>
        {bottomMenuItems.map((item) => (
          <ListItem
            key={item.text}
            button
            onClick={item.text === 'Logout' ? handleLogout : () => navigate(item.path)}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : 'auto',
                justifyContent: 'center',
                color: 'inherit'
              }}
            >
              {item.icon}
            </ListItemIcon>
            {open && <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem' }} />}
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;