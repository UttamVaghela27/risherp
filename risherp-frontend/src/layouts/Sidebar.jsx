import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
  Tooltip,
  useMediaQuery,

  Chip,
  alpha,
  useTheme
} from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { useAuth } from '../context/AuthContext';
import { navigationSections } from '../utils/navigation';

export const SIDEBAR_EXPANDED_WIDTH = 256;
export const SIDEBAR_COLLAPSED_WIDTH = 76;

/**
 * Sidebar Navigation
 * Executive ERP desktop sidebar with smooth animations, active indicators,
 * collapsed tooltip mode, and clean section hierarchies.
 */
const Sidebar = ({
  collapsed = false,
  mobileOpen = false,
  onMobileClose,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { hasPermission, isAdmin } = useAuth();
  const isDark = theme.palette.mode === 'dark';

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const isActive = (path) => {
    const current = location.pathname;

    if (path === '/dashboard') {
      return current === '/dashboard' || current === '/';
    }

    if (current === path) {
      return true;
    }

    if (path === '/sales') {
      return (
        current === '/sales' ||
        current === '/sales/history' ||
        (current.startsWith('/sales/') &&
          !current.startsWith('/sales/returns') &&
          !current.startsWith('/sales/history'))
      );
    }
    if (path === '/sales/history') {
      return current === '/sales/history';
    }
    if (path === '/sales/returns') {
      return (
        current === '/sales/returns' ||
        current.startsWith('/sales/returns/') ||
        current === '/sales/return'
      );
    }
    if (path === '/sales/new') {
      return current === '/sales/new';
    }

    if (path === '/purchases') {
      return (
        current === '/purchases' ||
        current === '/purchases/history' ||
        (current.startsWith('/purchases/') &&
          !current.startsWith('/purchases/returns') &&
          !current.startsWith('/purchases/history')) ||
        (current.startsWith('/purchase/') && current !== '/purchase/new')
      );
    }
    if (path === '/purchases/history') {
      return current === '/purchases/history';
    }
    if (path === '/purchases/returns') {
      return (
        current === '/purchases/returns' ||
        current.startsWith('/purchases/returns/') ||
        current === '/purchases/return'
      );
    }
    if (path === '/purchases/new') {
      return current === '/purchases/new' || current === '/purchase/new';
    }

    return current === path || current.startsWith(path + '/');
  };

  const currentWidth = isMobile
    ? SIDEBAR_EXPANDED_WIDTH
    : collapsed
      ? SIDEBAR_COLLAPSED_WIDTH
      : SIDEBAR_EXPANDED_WIDTH;

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.paper,
        overflowX: 'hidden',
      }}
    >
      {/* Brand Header */}
      <Toolbar
        sx={{
          px: collapsed && !isMobile ? 1.5 : 2.5,
          minHeight: '64px !important',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
          gap: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: theme.palette.background.paper,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.1rem',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
            flexShrink: 0,
          }}
        >
          <BusinessCenterIcon sx={{ fontSize: 20 }} />
        </Box>

        {(!collapsed || isMobile) && (
          <Box sx={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                color="text.primary"
                sx={{ lineHeight: 1.1, letterSpacing: -0.3 }}
              >
                RISHERP
              </Typography>
              <Chip
                label="PRO"
                size="small"
                sx={{
                  height: 16,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: isDark ? 'rgba(37, 99, 235, 0.2)' : alpha(theme.palette.info.main, 0.1),
                  color: isDark ? '#93c5fd' : theme.palette.info.main,
                  border: `1px solid ${isDark ? theme.palette.info.main : alpha(theme.palette.info.main, 0.2)}`,
                  px: 0.2,
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
              Enterprise ERP System
            </Typography>
          </Box>
        )}
      </Toolbar>

      {/* Navigation List */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: 2,
          px: collapsed && !isMobile ? 1 : 1.75,
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: theme.palette.divider, borderRadius: '4px' },
        }}
      >
        {navigationSections
          .map((sec) => {
            const visibleItems = sec.items.filter((item) => {
              if (isAdmin()) return true;
              if (!item.permission) return true;
              return hasPermission(item.permission);
            });
            return { ...sec, visibleItems };
          })
          .filter((sec) => sec.visibleItems.length > 0)
          .map((sec, secIdx, arr) => (
            <Box key={sec.id || secIdx} sx={{ mb: 1.75 }}>
              {/* Section Heading (visible only when expanded) */}
              {sec.section && (!collapsed || isMobile) && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    px: 1.5,
                    py: 0.6,
                    fontSize: '0.66rem',
                    fontWeight: 750,
                    letterSpacing: 1,
                    color: theme.palette.text.secondary,
                    textTransform: 'uppercase',
                  }}
                >
                  {sec.section}
                </Typography>
              )}

              {/* Section Items */}
              <List disablePadding>
                {sec.visibleItems.map((item) => {
                  const active = isActive(item.path);
                  const IconComponent = item.icon;

                  const buttonContent = (
                    <ListItem disablePadding sx={{ mb: 0.45 }}>
                      <ListItemButton
                        onClick={() => handleNavigate(item.path)}
                        sx={{
                          borderRadius: 2,
                          py: 0.85,
                          px: collapsed && !isMobile ? 1.25 : 1.5,
                          justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                          bgcolor: active ? (isDark ? 'rgba(37, 99, 235, 0.15)' : alpha(theme.palette.info.main, 0.1)) : 'transparent',
                          color: active ? (isDark ? '#60a5fa' : theme.palette.info.dark) : theme.palette.text.primary,
                          border: active ? `1px solid ${isDark ? 'rgba(37, 99, 235, 0.3)' : alpha(theme.palette.info.main, 0.1)}` : '1px solid transparent',
                          transition: 'all 0.15s ease',
                          position: 'relative',
                          '&:hover': {
                            bgcolor: active ? (isDark ? 'rgba(37, 99, 235, 0.25)' : '#e0f2fe') : theme.palette.action.hover,
                            color: active ? (isDark ? '#93c5fd' : theme.palette.info.dark) : theme.palette.text.primary,
                            borderColor: active ? (isDark ? 'rgba(37, 99, 235, 0.5)' : alpha(theme.palette.info.main, 0.2)) : theme.palette.divider,
                            transform: collapsed ? 'none' : 'translateX(2px)',
                          },
                          // Left glowing active indicator
                          '&::before': active
                            ? {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: '20%',
                              height: '60%',
                              width: 3.5,
                              borderRadius: '0 4px 4px 0',
                              bgcolor: theme.palette.info.main,
                              boxShadow: '0 0 6px rgba(37, 99, 235, 0.5)',
                            }
                            : {},
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: collapsed && !isMobile ? 'auto' : 32,
                            color: active ? (isDark ? '#60a5fa' : theme.palette.info.main) : theme.palette.text.secondary,
                            justifyContent: 'center',
                            transition: 'color 0.15s ease',
                          }}
                        >
                          <IconComponent sx={{ fontSize: 20 }} />
                        </ListItemIcon>

                        {(!collapsed || isMobile) && (
                          <ListItemText
                            primary={item.label}
                            slotProps={{
                              primary: {
                                fontSize: '0.8125rem',
                                fontWeight: active ? 700 : 500,
                                sx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
                                color: active ? (isDark ? '#60a5fa' : theme.palette.info.dark) : theme.palette.text.primary,
                              }
                            }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  );

                  // When collapsed on desktop, wrap in MUI Tooltip
                  if (collapsed && !isMobile) {
                    return (
                      <Tooltip key={item.path} title={item.label} placement="right" arrow>
                        {buttonContent}
                      </Tooltip>
                    );
                  }

                  return <Box key={item.path}>{buttonContent}</Box>;
                })}
              </List>

              {secIdx < arr.length - 1 && sec.section && (
                <Divider sx={{ my: 1, borderColor: theme.palette.divider }} />
              )}
            </Box>
          ))}
      </Box>

      {/* Footer info */}
      {(!collapsed || isMobile) && (
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center', bgcolor: theme.palette.background.default }}>
          <Typography variant="caption" sx={{ fontSize: '0.68rem', fontWeight: 600, color: theme.palette.text.secondary }}>
            RISHERP v1.0 • Enterprise Edition
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer (Temporary) */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: SIDEBAR_EXPANDED_WIDTH,
              boxSizing: 'border-box',
              borderRight: `1px solid ${theme.palette.divider}`,
              boxShadow: isDark ? '4px 0 24px rgba(0, 0, 0, 0.4)' : '4px 0 24px rgba(0, 0, 0, 0.08)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        /* Desktop Drawer (Permanent with dynamic width & transitions) */
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: currentWidth,
            flexShrink: 0,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            '& .MuiDrawer-paper': {
              width: currentWidth,
              boxSizing: 'border-box',
              borderRight: `1px solid ${theme.palette.divider}`,
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
