import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  InputAdornment,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';

const Alerts = () => {
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const alerts = [
    { id: 1, title: 'DDoS Attack Detected', description: 'Multiple sources flooding ExitNode03', severity: 'critical', timestamp: '2 min ago', status: 'unread', source: '192.168.1.50' },
    { id: 2, title: 'Port Scanning Activity', description: 'Suspicious port scanning from external IP', severity: 'high', timestamp: '15 min ago', status: 'read', source: '10.0.0.23' },
    { id: 3, title: 'Node Offline', description: 'GuardNode12 has been offline for 30 minutes', severity: 'medium', timestamp: '1 hour ago', status: 'read', source: 'System' },
    { id: 4, title: 'Bandwidth Threshold Exceeded', description: 'ExitNode01 exceeded 90% bandwidth limit', severity: 'medium', timestamp: '2 hours ago', status: 'read', source: 'System' },
    { id: 5, title: 'Malicious Traffic Pattern', description: 'Unusual traffic pattern detected on RelayNode42', severity: 'high', timestamp: '3 hours ago', status: 'unread', source: 'AI Detector' },
    { id: 6, title: 'Certificate Expiry Warning', description: 'SSL certificate expires in 7 days', severity: 'low', timestamp: '5 hours ago', status: 'read', source: 'System' },
    { id: 7, title: 'Failed Login Attempts', description: '15 failed login attempts from suspicious IP', severity: 'high', timestamp: '6 hours ago', status: 'read', source: 'Auth System' },
    { id: 8, title: 'Database Connection Issue', description: 'High latency in database connections', severity: 'medium', timestamp: '1 day ago', status: 'read', source: 'Database' },
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <ErrorIcon />;
      case 'medium':
        return <WarningIcon />;
      case 'low':
        return <CheckCircleIcon />;
      default:
        return null;
    }
  };

  const handleMarkAsRead = (id) => {
    console.log(`Marking alert ${id} as read`);
  };

  const handleDeleteAlert = (id) => {
    console.log(`Deleting alert ${id}`);
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter !== 'all' && alert.severity !== filter) return false;
    if (search && !alert.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const unreadCount = alerts.filter(a => a.status === 'unread').length;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Alert Center
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} unread`}
              color="error"
              size="small"
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<ArchiveIcon />}>
            Archive All
          </Button>
          <Button variant="contained" color="warning" startIcon={<NotificationsIcon />}>
            Configure Alerts
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search alerts..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Chip
          label="All"
          color={filter === 'all' ? 'primary' : 'default'}
          onClick={() => setFilter('all')}
          clickable
        />
        <Chip
          label="Critical"
          color={filter === 'critical' ? 'error' : 'default'}
          onClick={() => setFilter('critical')}
          clickable
        />
        <Chip
          label="High"
          color={filter === 'high' ? 'error' : 'default'}
          variant={filter === 'high' ? 'filled' : 'outlined'}
          onClick={() => setFilter('high')}
          clickable
        />
        <Chip
          label="Medium"
          color={filter === 'medium' ? 'warning' : 'default'}
          onClick={() => setFilter('medium')}
          clickable
        />
        <Chip
          label="Low"
          color={filter === 'low' ? 'info' : 'default'}
          onClick={() => setFilter('low')}
          clickable
        />

        <Box sx={{ flexGrow: 1 }} />
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Auto-refresh"
        />
      </Paper>

      {/* Alerts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 50 }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Alert</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Severity</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Source</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Time</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAlerts.map((alert) => (
              <TableRow 
                key={alert.id} 
                hover 
                sx={{ 
                  bgcolor: alert.status === 'unread' ? 'action.hover' : 'inherit',
                  borderLeft: alert.severity === 'critical' ? '4px solid #f44336' : 'none'
                }}
              >
                <TableCell>
                  {alert.status === 'unread' ? (
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />
                  ) : null}
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography sx={{ fontWeight: alert.status === 'unread' ? 'bold' : 'normal' }}>
                      {alert.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {alert.description}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getSeverityIcon(alert.severity)}
                    label={alert.severity.toUpperCase()}
                    color={getSeverityColor(alert.severity)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{alert.source}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{alert.timestamp}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton size="small" color="primary">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Mark as Read">
                      <IconButton 
                        size="small" 
                        color="default"
                        onClick={() => handleMarkAsRead(alert.id)}
                      >
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="More Actions">
                      <IconButton size="small" onClick={handleClick}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Stats Summary */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Alert Statistics
        </Typography>
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box>
            <Typography variant="caption" color="textSecondary">Total Alerts</Typography>
            <Typography variant="h5">{alerts.length}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">Critical</Typography>
            <Typography variant="h5" color="error">
              {alerts.filter(a => a.severity === 'critical').length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">Unread</Typography>
            <Typography variant="h5" color="primary">
              {unreadCount}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">Avg Response</Typography>
            <Typography variant="h5">8.2 min</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
          Mark as Read
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
          Archive
        </MenuItem>
        <MenuItem onClick={handleClose} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Alerts;