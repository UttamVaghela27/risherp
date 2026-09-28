import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Sidebar, { SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './Sidebar';
import Navbar from './Navbar';

/**
 * AppLayout (formerly MainLayout)
 * Master shell for all authenticated business ERP views.
 * Controls desktop sidebar collapse and mobile drawer toggles.
 */
const AppLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('risherp_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('risherp_sidebar_collapsed', String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const handleToggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };


  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Collapsible Left Navigation Sidebar */}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main ERP Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        {/* Top Navbar */}
        <Navbar
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
          onMobileToggle={handleToggleMobile}
        />

        {/* Spacer for fixed top navbar */}
        <Toolbar sx={{ minHeight: '64px !important' }} />

        {/* Dynamic Outlet Page Content */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 3.5 },
            width: '100%',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
