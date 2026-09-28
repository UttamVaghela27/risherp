import { useState, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Breadcrumbs,
  Link,
  Chip,
  Tooltip,
  alpha
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import GlobalSearch from '../components/layout/GlobalSearch';
import NotificationMenu from '../components/layout/NotificationMenu';
import { routeLabelMap } from '../utils/navigation';
import { SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './Sidebar';

/**
 * TopNavbar Component
 * Professional ERP executive top navigation bar with glassmorphic styling,
 * breadcrumbs, quick search, notification tray, profile menu, and theme toggle.
 */
const Navbar = ({
  collapsed = false,
  onToggleCollapse,
  onMobileToggle,
}) => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useContext(ThemeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
    navigate('/login');
  };

  const currentPath = location.pathname;
  const currentLabel = routeLabelMap[currentPath] || 'Overview';

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const navbarWidth = isMobile
    ? '100%'
    : `calc(100% - ${collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH}px)`;

  const navbarLeft = isMobile
    ? 0
    : `${collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH}px`;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: navbarWidth,
        left: navbarLeft,
        bgcolor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.94)' : 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(10px)',
        color: 'text.primary',
        borderBottom: `1px solid ${theme.palette.divider}`,
        transition: theme.transitions.create(['width', 'left'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        zIndex: theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: '64px !important',
          px: { xs: 1.5, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, minWidth: 0 }}>
          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <IconButton
              size="small"
              onClick={isMobile ? onMobileToggle : onToggleCollapse}
              sx={{
                color: theme.palette.text.secondary,
                bgcolor: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                p: 0.8,
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                  color: 'primary.main',
                  transform: 'scale(1.03)',
                },
              }}
            >
              {isMobile ? (
                <MenuIcon fontSize="small" />
              ) : collapsed ? (
                <MenuIcon fontSize="small" />
              ) : (
                <MenuOpenIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" sx={{ color: theme.palette.text.disabled, mx: -0.2 }} />}
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            <Link
              component={RouterLink}
              to="/dashboard"
              underline="none"
              sx={{
                fontSize: '0.8125rem',
                fontWeight: currentPath === '/dashboard' ? 700 : 500,
                color: currentPath === '/dashboard' ? 'text.primary' : 'text.secondary',
                px: 1,
                py: 0.3,
                borderRadius: 1,
                transition: 'background-color 0.15s ease',
                '&:hover': { bgcolor: theme.palette.action.hover, color: 'text.primary' },
              }}
            >
              Dashboard
            </Link>

            {currentPath !== '/dashboard' && (
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'text.primary',
                  px: 0.5,
                }}
              >
                {currentLabel}
              </Typography>
            )}
          </Breadcrumbs>
        </Box>

        <Box sx={{ flex: { xs: 1, sm: 'none' }, display: 'flex', justifyContent: 'center' }}>
          <GlobalSearch />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.75 } }}>
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton onClick={toggleColorMode} color="inherit" size="small">
              {mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <NotificationMenu />

          {user?.businessName && (
            <Box
              sx={{
                display: { xs: 'none', lg: 'flex' },
                alignItems: 'center',
                gap: 0.8,
                bgcolor: theme.palette.action.hover,
                border: `1px solid ${theme.palette.divider}`,
                px: 1.5,
                py: 0.5,
                borderRadius: '9999px',
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: theme.palette.success.main,
                  boxShadow: `0 0 0 2px ${theme.palette.success.light}40`,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 650,
                  color: 'text.primary',
                  fontSize: '0.75rem',
                  letterSpacing: -0.1,
                }}
              >
                {user.businessName}
              </Typography>
            </Box>
          )}

          <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto', display: { xs: 'none', sm: 'block' }, borderColor: theme.palette.divider }} />

          <Box
            onClick={handleProfileMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              cursor: 'pointer',
              p: 0.5,
              pr: 1,
              borderRadius: 3,
              border: '1px solid transparent',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: theme.palette.action.hover,
                borderColor: theme.palette.divider,
              },
            }}
          >
            <Avatar
              sx={{
                width: 35,
                height: 35,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: theme.palette.background.paper,
                border: '1.5px solid #ffffff',
              }}
            >
              {userInitial}
            </Avatar>

            <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left', minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 140,
                  color: 'text.primary',
                }}
              >
                {user?.name || 'Administrator'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: 'primary.main',
                  display: 'block',
                  lineHeight: 1.1,
                  mt: 0.2,
                }}
              >
                {user?.role || 'ADMIN'}
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              elevation: 4,
              sx: {
                minWidth: 230,
                mt: 1.5,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
                p: 0.75,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                {user?.name || 'Administrator'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', wordBreak: 'break-all', mt: 0.25 }}>
                {user?.email || 'admin@risherp.com'}
              </Typography>
              <Chip
                label={user?.role || 'ADMIN'}
                size="small"
                sx={{
                  mt: 1,
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  bgcolor: theme.palette.mode === 'light' ? alpha(theme.palette.info.main, 0.1) : 'rgba(37, 99, 235, 0.2)',
                  color: theme.palette.mode === 'light' ? theme.palette.info.dark : '#93c5fd',
                  border: `1px solid ${theme.palette.mode === 'light' ? alpha(theme.palette.info.main, 0.2) : theme.palette.info.main}`,
                }}
              />
            </Box>
            <Divider sx={{ my: 0.75, borderColor: theme.palette.divider }} />

            <MenuItem
              onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}
              sx={{ borderRadius: 1.5, py: 1 }}
            >
              <ListItemIcon sx={{ color: 'text.secondary' }}><PersonOutlinedIcon fontSize="small" /></ListItemIcon>
              <Typography variant="body2" fontWeight={500}>My Profile</Typography>
            </MenuItem>

            <MenuItem
              onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}
              sx={{ borderRadius: 1.5, py: 1 }}
            >
              <ListItemIcon sx={{ color: 'text.secondary' }}><SettingsOutlinedIcon fontSize="small" /></ListItemIcon>
              <Typography variant="body2" fontWeight={500}>System Settings</Typography>
            </MenuItem>

            <Divider sx={{ my: 0.75, borderColor: theme.palette.divider }} />

            <MenuItem
              onClick={handleLogout}
              sx={{
                borderRadius: 1.5,
                py: 1,
                color: theme.palette.error.main,
                '&:hover': { bgcolor: theme.palette.mode === 'light' ? alpha(theme.palette.error.main, 0.1) : 'rgba(239, 68, 68, 0.1)' },
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.error.main }}><LogoutOutlinedIcon fontSize="small" /></ListItemIcon>
              <Typography variant="body2" fontWeight={650}>Sign Out</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
