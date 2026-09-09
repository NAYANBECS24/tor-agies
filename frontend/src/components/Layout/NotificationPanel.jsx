import React from 'react';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Button,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { formatRelativeTime } from '../../utils/helpers';

const NotificationPanel = ({ anchorEl, open, onClose }) => {
  const { realtimeAlerts } = useSelector((state) => state.alerts);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <ErrorIcon color="error" />;
      case 'medium':
        return <WarningIcon color="warning" />;
      case 'low':
        return <InfoIcon color="info" />;
      default:
        return <CheckCircleIcon color="success" />;
    }
  };

  const handleViewAll = () => {
    onClose();
    window.location.href = '/alerts';
  };

  return (
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Box sx={{ width: 360, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Notifications</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {realtimeAlerts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {realtimeAlerts.map((alert, index) => (
              <React.Fragment key={alert.id || index}>
                <ListItem alignItems="flex-start" sx={{ py: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'transparent' }}>
                      {getSeverityIcon(alert.severity)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" noWrap>
                        {alert.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {alert.description}
                        </Typography>
                        <Typography
                          component="div"
                          variant="caption"
                          color="text.secondary"
                        >
                          {formatRelativeTime(alert.triggeredAt)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < realtimeAlerts.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
        
        {realtimeAlerts.length > 0 && (
          <>
            <Divider sx={{ mt: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
              <Button size="small" onClick={handleViewAll}>
                View All Alerts
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Popover>
  );
};

export default NotificationPanel;