import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Container,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import NumbersIcon from '@mui/icons-material/Numbers';
import TuneIcon from '@mui/icons-material/Tune';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import BackupIcon from '@mui/icons-material/Backup';
import ShieldIcon from '@mui/icons-material/Shield';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import BusinessSettingsTab from './BusinessSettingsTab';
import InvoiceSettingsTab from './InvoiceSettingsTab';
import NumberingSettingsTab from './NumberingSettingsTab';
import ApplicationSettingsTab from './ApplicationSettingsTab';
import UserPreferencesTab from './UserPreferencesTab';
import BackupSettingsTab from './BackupSettingsTab';
import SecuritySettingsTab from './SecuritySettingsTab';

const SettingsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, isAdmin } = useAuth();

  // Define tab specifications and permission gates
  const allTabs = [
    {
      id: 'business',
      label: 'Business Profile',
      icon: <BusinessIcon fontSize="small" />,
      path: '/settings/business',
      permission: 'BUSINESS_SETTINGS_VIEW',
      fallbackPermission: 'SETTINGS_VIEW',
      component: <BusinessSettingsTab />,
    },
    {
      id: 'invoice',
      label: 'Invoice Settings',
      icon: <ReceiptLongIcon fontSize="small" />,
      path: '/settings/invoice',
      permission: 'INVOICE_SETTINGS_VIEW',
      fallbackPermission: 'SETTINGS_VIEW',
      component: <InvoiceSettingsTab />,
    },
    {
      id: 'numbering',
      label: 'Numbering',
      icon: <NumbersIcon fontSize="small" />,
      path: '/settings/numbering',
      permission: 'NUMBERING_SETTINGS_VIEW',
      fallbackPermission: 'SETTINGS_VIEW',
      component: <NumberingSettingsTab />,
    },
    {
      id: 'application',
      label: 'Application',
      icon: <TuneIcon fontSize="small" />,
      path: '/settings/application',
      permission: 'SETTINGS_VIEW',
      component: <ApplicationSettingsTab />,
    },
    {
      id: 'preferences',
      label: 'User Preferences',
      icon: <PersonOutlinedIcon fontSize="small" />,
      path: '/settings/preferences',
      component: <UserPreferencesTab />,
    },
    {
      id: 'backup',
      label: 'Backup & Restore',
      icon: <BackupIcon fontSize="small" />,
      path: '/settings/backup',
      permission: 'BACKUP_VIEW',
      component: <BackupSettingsTab />,
    },
    {
      id: 'security',
      label: 'Security',
      icon: <ShieldIcon fontSize="small" />,
      path: '/settings/security',
      permission: 'SETTINGS_VIEW',
      component: <SecuritySettingsTab />,
    },
  ];

  // Filter tabs based on user permissions
  const accessibleTabs = allTabs.filter((tab) => {
    if (!tab.permission) return true;
    if (isAdmin()) return true;
    return hasPermission(tab.permission) || (tab.fallbackPermission && hasPermission(tab.fallbackPermission));
  });

  // Determine active tab from URL path
  const currentPath = location.pathname;
  let activeTabIdx = accessibleTabs.findIndex((t) => currentPath === t.path);
  if (activeTabIdx === -1) {
    activeTabIdx = 0;
  }

  const handleTabChange = (event, newIdx) => {
    const targetTab = accessibleTabs[newIdx];
    if (targetTab) {
      navigate(targetTab.path);
    }
  };

  // If navigating directly to /settings, redirect to first accessible tab
  useEffect(() => {
    if (location.pathname === '/settings' && accessibleTabs.length > 0) {
      navigate(accessibleTabs[0].path, { replace: true });
    }
  }, [location.pathname, accessibleTabs, navigate]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} color="text.primary">
          Settings & Administration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage business credentials, invoice numbering, system backups, and application behavior.
        </Typography>
      </Box>

      {/* Navigation Tabs */}
      <Paper variant="outlined" sx={{ mb: 3, borderRadius: '16px', border: 1, borderColor: 'divider', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', bgcolor: 'background.paper', overflow: 'hidden' }}>
        <Tabs
          value={activeTabIdx >= 0 ? activeTabIdx : 0}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            px: { xs: 1, sm: 2 },
            minHeight: 52,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            '& .MuiTab-root': {
              minHeight: 52,
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'none',
              gap: 1,
            },
          }}
        >
          {accessibleTabs.map((tab) => (
            <Tab
              key={tab.id}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Active Tab Content */}
      <Box>
        {accessibleTabs[activeTabIdx]?.component}
      </Box>
    </Box>
  );
};

export default SettingsPage;
