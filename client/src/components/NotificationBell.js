import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  Circle as CircleIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNotifications } from '../context/NotificationContext';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id || notification.timestamp);
    }
    handleClose();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_notice':
        return '📢';
      case 'profile_update':
        return '👤';
      case 'new_event':
        return '📅';
      default:
        return '🔔';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          <Box>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllAsRead} sx={{ mr: 1 }}>
                Mark all read
              </Button>
            )}
            <Button size="small" onClick={clearNotifications}>
              Clear all
            </Button>
          </Box>
        </Box>
        
        <Divider />
        
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.slice(0, 10).map((notification, index) => (
            <MenuItem
              key={notification.id || notification.timestamp || index}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                backgroundColor: notification.read ? 'transparent' : 'action.hover',
                '&:hover': {
                  backgroundColor: 'action.selected'
                }
              }}
            >
              <ListItemIcon>
                <Typography variant="h6">
                  {getNotificationIcon(notification.type)}
                </Typography>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: notification.read ? 'normal' : 'bold'
                    }}
                  >
                    {notification.title}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(notification.timestamp)}
                    </Typography>
                  </Box>
                }
              />
              {!notification.read && (
                <CircleIcon color="primary" sx={{ fontSize: 12 }} />
              )}
            </MenuItem>
          ))
        )}
        
        {notifications.length > 10 && (
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Showing 10 of {notifications.length} notifications
            </Typography>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell; 