import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  ListItemIcon,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

import notificationService from '../../services/notificationService';

/**
 * NotificationMenu Component
 * Live notification tray connected to the backend notification APIs.
 */
const NotificationMenu = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch unread count for the bell badge
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      const count = res?.data?.unreadCount ?? 0;
      setUnreadCount(Number(count));
    } catch {
      // Silent catch on background polling
    }
  }, []);

  // Fetch full notification list
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications(0, 15);
      const list = res?.data || [];
      setNotifications(list);
      const unread = list.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and polling every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (item) => {
    handleClose();
    if (!item.isRead) {
      try {
        await notificationService.markAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Continue
      }
    }
    if (item.link) {
      navigate(item.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Continue
    }
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'WARNING':
        return <WarningAmberOutlinedIcon fontSize="small" sx={{ color: 'warning.main' }} />;
      case 'SUCCESS':
        return <CheckCircleOutlineOutlinedIcon fontSize="small" sx={{ color: 'success.main' }} />;
      case 'ERROR':
        return <ErrorOutlineOutlinedIcon fontSize="small" sx={{ color: 'error.main' }} />;
      case 'PAYMENT':
        return <PaymentOutlinedIcon fontSize="small" sx={{ color: 'success.main' }} />;
      default:
        return <ReceiptLongOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />;
    }
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleOpen}
        aria-label="notifications"
        sx={{
          color: 'text.secondary',
          '&:hover': { bgcolor: 'background.default', color: 'primary.main' },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          variant={unreadCount > 0 ? 'standard' : 'dot'}
          invisible={unreadCount === 0}
        >
          <NotificationsNoneOutlinedIcon sx={{ fontSize: 22 }} />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 4,
          sx: {
            width: 360,
            maxHeight: 440,
            borderRadius: 2.5,
            border: 1,
            borderColor: 'divider',
            mt: 1,
            overflow: 'hidden',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllRead}
              sx={{ fontSize: '0.75rem', p: 0, minWidth: 'auto', textTransform: 'none' }}
            >
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />

        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
            <Typography variant="caption" color="text.disabled">
              All inventory and financial alerts will appear here.
            </Typography>
          </Box>
        ) : (
          notifications.map((item) => (
            <MenuItem
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              sx={{
                py: 1.25,
                px: 2,
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: !item.isRead
                  ? (isDark ? alpha(theme.palette.primary.main, 0.12) : 'rgba(30, 58, 138, 0.04)')
                  : 'transparent',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 'auto', mt: 0.35 }}>
                {renderIcon(item.type)}
              </ListItemIcon>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography
                    variant="caption"
                    fontWeight={!item.isRead ? 750 : 600}
                    color="text.primary"
                    noWrap
                    sx={{ maxWidth: 200 }}
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                    {item.timeAgo}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.3,
                    mt: 0.25,
                  }}
                >
                  {item.message}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationMenu;
