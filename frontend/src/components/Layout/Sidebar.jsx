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
  Chip
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
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
  Person as PersonIcon,
  Shield as AegisIcon,
  FolderSpecial as CaseIcon,
  AccountTree as EvidenceIcon,
  Hub as GraphIcon,
  CurrencyBitcoin as BlockchainIcon,
  Spellcheck as StylometryIcon,
  Radar as ScannerIcon,
  Psychology as BehavioralIcon,
  Timeline as TimelineIcon,
  Description as ReportIcon,
  BugReport as CrawlerIcon,
  Map as MapIcon,
  GridOn as MatrixIcon,
  Sensors as SensorIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ open, drawerWidth }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    navigate('/login', { replace: true });
  };

  // Sections
  const menuSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Home Overview', icon: <HomeIcon />, path: '/' },
      ]
    },
    {
      title: 'INVESTIGATION & ATTRIBUTION',
      items: [
        { text: 'Project A.E.G.I.S.', icon: <AegisIcon sx={{ color: '#f44336' }} />, path: '/aegis', chip: 'AI CORE', chipColor: '#f44336' },
        { text: 'Case Management', icon: <CaseIcon sx={{ color: '#2196f3' }} />, path: '/cases' },
        { text: 'Evidence Chain', icon: <EvidenceIcon sx={{ color: '#4caf50' }} />, path: '/evidence', chip: 'SHA-256', chipColor: '#4caf50' },
        { text: 'Actor Identity Graph', icon: <GraphIcon sx={{ color: '#9c27b0' }} />, path: '/actor-graph' },
        { text: 'Blockchain Tracer', icon: <BlockchainIcon sx={{ color: '#ff9800' }} />, path: '/blockchain' },
        { text: 'Stylometry Engine', icon: <StylometryIcon sx={{ color: '#00bcd4' }} />, path: '/stylometry', chip: 'NLP', chipColor: '#00bcd4' },
        { text: 'Hidden Service Scanner', icon: <ScannerIcon sx={{ color: '#ff5722' }} />, path: '/scanner' },
        { text: 'Behavioral Profiler', icon: <BehavioralIcon sx={{ color: '#e91e63' }} />, path: '/behavioral' },
        { text: 'Timeline Query', icon: <TimelineIcon sx={{ color: '#8bc34a' }} />, path: '/timeline' },
        { text: 'Intelligence Reports', icon: <ReportIcon sx={{ color: '#ffc107' }} />, path: '/intel-report' },
        { text: 'Autonomous Crawler', icon: <CrawlerIcon sx={{ color: '#9e9e9e' }} />, path: '/crawler' },
      ]
    },
    {
      title: 'NETWORK & TELEMETRY',
      items: [
        { text: 'Tor Metrics', icon: <SpeedIcon />, path: '/TorMetricsPage' },
        { text: 'Tor Nodes', icon: <DeviceHubIcon />, path: '/nodes' },
        { text: 'Network Map', icon: <MapIcon />, path: '/NetworkMap' },
        { text: 'ATWC Engine', icon: <CodeIcon />, path: '/Atwcpage' },
        { text: 'Traffic Analyzer', icon: <AnalyticsIcon />, path: '/TrafficAnalyzer' },
        { text: 'Traffic Stream', icon: <TrafficIcon />, path: '/traffic' },
        { text: 'Real-Time Monitor', icon: <SensorIcon />, path: '/realtime' },
        { text: 'Threat Hunting', icon: <SecurityIcon />, path: '/threats' },
        { text: 'Correlation Engine', icon: <LinkIcon />, path: '/correlationPage' },
        { text: 'Correlation Matrix', icon: <MatrixIcon />, path: '/correlation-matrix' },
        { text: 'Encryption Ops', icon: <LockIcon />, path: '/EncryptionPage' },
        { text: 'Data Collection', icon: <CloudDownloadIcon />, path: '/DataCollectionPage' },
        { text: 'Analytics', icon: <InsightsIcon />, path: '/analytics' },
        { text: 'Alerts', icon: <NotificationsIcon />, path: '/alerts', badge: 3 },
      ]
    }
  ];

  const bottomMenuItems = [
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Logout', icon: <LogoutIcon sx={{ color: '#f44336' }} />, path: '/login' },
  ];

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : 64,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 64,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: 'width 0.25s ease',
          backgroundColor: '#0a1929',
          color: 'white',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Brand / Logo Section */}
      <Box sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: open ? 'flex-start' : 'center',
        gap: 1.5,
        height: 64,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <Box sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          background: 'linear-gradient(135deg, #f44336, #1565c0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(244,67,54,0.3)',
          flexShrink: 0
        }}>
          <AegisIcon sx={{ color: 'white', fontSize: 22 }} />
        </Box>
        {open && (
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: 0.5 }}>
              TOR-AEGIS
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.62rem', letterSpacing: 0.8, textTransform: 'uppercase' }}>
              NTRO PS-26151
            </Typography>
          </Box>
        )}
      </Box>

      {/* Main Scrollable Navigation Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1 }}>
        {menuSections.map((section, sIdx) => (
          <Box key={section.title} sx={{ mb: 1.5 }}>
            {open && (
              <Typography
                variant="caption"
                sx={{
                  px: 2.5,
                  py: 0.8,
                  display: 'block',
                  color: 'rgba(255,255,255,0.35)',
                  fontWeight: 800,
                  fontSize: '0.62rem',
                  letterSpacing: '1px'
                }}
              >
                {section.title}
              </Typography>
            )}
            <List dense disablePadding>
              {section.items.map((item) => {
                const isSelected = location.pathname === item.path;
                return (
                  <ListItem
                    key={item.text}
                    button
                    selected={isSelected}
                    onClick={() => navigate(item.path)}
                    sx={{
                      minHeight: 40,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2,
                      py: 0.6,
                      my: 0.2,
                      mx: open ? 1 : 0.5,
                      borderRadius: 1.5,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(33, 150, 243, 0.16)',
                        borderLeft: open ? '3px solid #2196f3' : 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.24)',
                        },
                        '& .MuiListItemIcon-root': {
                          color: '#64b5f6',
                        },
                        '& .MuiListItemText-primary': {
                          color: '#90caf9',
                          fontWeight: 700,
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 1.8 : 'auto',
                        justifyContent: 'center',
                        color: isSelected ? '#64b5f6' : 'rgba(255,255,255,0.7)',
                        '& .MuiSvgIcon-root': { fontSize: 20 }
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
                          fontSize: '0.82rem',
                          noWrap: true,
                        }}
                      />
                    )}
                    {open && item.chip && (
                      <Chip
                        label={item.chip}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          backgroundColor: `${item.chipColor || '#2196f3'}20`,
                          color: item.chipColor || '#2196f3',
                          border: `1px solid ${item.chipColor || '#2196f3'}40`,
                        }}
                      />
                    )}
                  </ListItem>
                );
              })}
            </List>
            {sIdx < menuSections.length - 1 && (
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', my: 1, mx: 1.5 }} />
            )}
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

      {/* Bottom User Area */}
      <List dense sx={{ py: 0.5 }}>
        {bottomMenuItems.map((item) => (
          <ListItem
            key={item.text}
            button
            onClick={item.text === 'Logout' ? handleLogout : () => navigate(item.path)}
            sx={{
              minHeight: 40,
              justifyContent: open ? 'initial' : 'center',
              px: 2,
              py: 0.6,
              mx: open ? 1 : 0.5,
              borderRadius: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 1.8 : 'auto',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.7)',
                '& .MuiSvgIcon-root': { fontSize: 20 }
              }}
            >
              {item.icon}
            </ListItemIcon>
            {open && (
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.82rem',
                  color: item.text === 'Logout' ? '#f44336' : 'white'
                }}
              />
            )}
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;