import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  TextField,
  InputAdornment,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Header = ({ handleDrawerOpen, drawerWidth }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State for menus
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = React.useState(null);

  // Menu Handlers
  const handleProfileMenu = (event) => setAnchorEl(event.currentTarget);
  const handleNotificationsMenu = (event) => setNotificationsAnchor(event.currentTarget);
  const handleClose = () => {
    setAnchorEl(null);
    setNotificationsAnchor(null);
  };

  const handleLogout = () => {
    handleClose();
    console.log('Logging out...');
    navigate('/login');
  };

  const handleNavigate = (path) => {
    handleClose();
    navigate(path);
  };

  // Mock Notifications
  const notifications = [
    { id: 1, message: 'New threat detected on ExitNode03', type: 'critical' },
    { id: 2, message: 'System update available', type: 'info' },
    { id: 3, message: 'Bandwidth threshold exceeded', type: 'warning' },
    { id: 4, message: '3 new nodes registered', type: 'success' }
  ];

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        backgroundColor: '#0a1929', // Matching the dark theme sidebar
        color: 'white',
        boxShadow: 2,
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar>
        {/* Toggle Sidebar Button (Mobile) */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerOpen}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Title */}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
          Tor Sentinel Dashboard
        </Typography>

        {/* Global Search Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1, px: 1, mr: 2 }}>
          <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
          <TextField
            variant="standard"
            placeholder="Search nodes, IPs, or alerts..."
            InputProps={{ 
              disableUnderline: true,
              sx: { color: 'white', width: { xs: 100, md: 250 } } 
            }}
          />
        </Box>

        {/* --- Right Side Actions --- */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationsMenu}>
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Settings Shortcut */}
          <Tooltip title="Settings">
            <IconButton color="inherit" onClick={() => navigate('/settings')}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          {/* Profile Avatar */}
          <Tooltip title="Account settings">
            <IconButton onClick={handleProfileMenu} sx={{ ml: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* --- Profile Menu Dropdown --- */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => handleNavigate('/profile')}>
            <Avatar /> Profile
          </MenuItem>
          <MenuItem onClick={() => handleNavigate('/account')}>
            <Avatar /> My Account
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleNavigate('/settings')}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <MenuItem onClick={() => handleNavigate('/help')}>
            <ListItemIcon>
              <HelpIcon fontSize="small" />
            </ListItemIcon>
            Help & Support
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>

        {/* --- Notifications Menu Dropdown --- */}
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleClose}
          PaperProps={{
            sx: { width: 320, maxHeight: 400 }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
            <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
          </Box>
          {notifications.map((notification) => (
            <MenuItem key={notification.id} onClick={handleClose} sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: notification.type === 'critical' ? 'bold' : 'normal' }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">Just now</Typography>
              </Box>
            </MenuItem>
          ))}
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Typography 
              variant="button" 
              color="primary" 
              sx={{ cursor: 'pointer', fontSize: '0.8rem' }}
              onClick={() => handleNavigate('/alerts')}
            >
              View All Alerts
            </Typography>
          </Box>
        </Menu>

      </Toolbar>
    </AppBar>
  );
};

export default Header;