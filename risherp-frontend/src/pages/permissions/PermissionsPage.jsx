import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Stack,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';

import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import roleService from '../../services/roleService';

const PermissionsPage = () => {
  const theme = useTheme();
  const [permissionGroups, setPermissionGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await roleService.getAllPermissions();
        if (res?.success && Array.isArray(res.data)) {
          setPermissionGroups(res.data);
        }
      } catch (err) {
        console.error('Failed to load permissions:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalPerms = permissionGroups.reduce((acc, g) => acc + (g.permissions?.length || 0), 0);
  const totalModules = permissionGroups.length;

  const filteredGroups = permissionGroups
    .map((g) => {
      const q = search.trim().toLowerCase();
      if (!q) return g;
      const matchMod = g.module.toLowerCase().includes(q);
      const filteredPerms = (g.permissions || []).filter(
        (p) =>
          matchMod ||
          (p.permissionName || p.name || '').toLowerCase().includes(q) ||
          (p.permissionCode || p.code || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      );
      return { ...g, permissions: filteredPerms };
    })
    .filter((g) => g.permissions.length > 0);

  return (
    <Box>
      <PageHeader
        title="Permission Catalog"
        subtitle="System-wide access rights and security authorizations matrix"
      />

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2.5, mb: 3 }}>
        <StatCard
          title="Total System Permissions"
          value={totalPerms}
          icon={SecurityOutlinedIcon}
          color="primary"
        />
        <StatCard
          title="Functional Modules"
          value={totalModules}
          icon={LayersOutlinedIcon}
          color="info"
        />
      </Box>

      {/* Search */}
      <Card
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          border: 1, borderColor: 'divider',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Filter permissions by name, code, or functional module..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: 'background.default', borderRadius: 2 }}
        />
      </Card>

      {/* Catalog Display */}
      {loading ? (
        <Box sx={{ py: 8 }}>
          <LoadingSpinner message="Loading permission directory..." />
        </Box>
      ) : (
        <Stack spacing={3}>
          {filteredGroups.map((group) => (
            <Card
              key={group.module}
              sx={{
                borderRadius: 3,
                border: 1, borderColor: 'divider',
                boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: 'background.default',
                  borderBottom: 1, borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="subtitle1" fontWeight={800} color={theme.palette.info.dark}>
                  {group.module}
                </Typography>
                <Chip
                  label={`${group.permissions.length} permissions`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(30, 58, 138, 0.08)',
                    color: theme.palette.info.dark,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                />
              </Box>

              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Grid container spacing={2}>
                  {group.permissions.map((p) => (
                    <Grid xs={12} sm={6} md={4} key={p.id || p.permissionCode}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          bgcolor: 'background.paper',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            borderColor: '#93c5fd',
                            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.06)',
                          },
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2" fontWeight={750} color={theme.palette.text.primary} sx={{ mb: 0.5 }}>
                            {p.permissionName || p.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            {p.description || 'Enables operations in this module'}
                          </Typography>
                        </Box>
                        <Chip
                          label={p.permissionCode || p.code}
                          size="small"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            bgcolor: 'background.default',
                            color: theme.palette.text.secondary,
                            alignSelf: 'flex-start',
                          }}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default PermissionsPage;
