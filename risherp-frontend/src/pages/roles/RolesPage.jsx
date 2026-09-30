import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Checkbox,
  FormControlLabel,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import DeselectIcon from '@mui/icons-material/Deselect';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import PermissionGuard from '../../components/security/PermissionGuard';
import roleService from '../../services/roleService';

const RolesPage = () => {
  const theme = useTheme();
  // Data states
  const [roles, setRoles] = useState([]);
  const [permissionGroups, setPermissionGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Filter states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    permissionIds: new Set(),
  });

  // Load permission catalog
  const loadPermissions = async () => {
    try {
      const res = await roleService.getAllPermissions();
      if (res?.success && Array.isArray(res.data)) {
        setPermissionGroups(res.data);
      }
    } catch (err) {
      console.error('Failed to load permissions catalog:', err);
    }
  };

  // Load roles
  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: rowsPerPage,
        search: search.trim() || undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
      };

      const res = await roleService.getRoles(params);
      if (res?.success && res.data) {
        setRoles(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, selectedStatus]);

  useEffect(() => {
    loadPermissions();
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // All permission IDs flattened
  const allPermissionIds = permissionGroups.flatMap((g) => (g.permissions || []).map((p) => p.id));

  // Handlers for Permission selection
  const handleTogglePermission = (id) => {
    const next = new Set(roleForm.permissionIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setRoleForm({ ...roleForm, permissionIds: next });
  };

  const handleToggleModule = (moduleGroup) => {
    const modPermIds = (moduleGroup.permissions || []).map((p) => p.id);
    const allSelected = modPermIds.every((id) => roleForm.permissionIds.has(id));

    const next = new Set(roleForm.permissionIds);
    if (allSelected) {
      modPermIds.forEach((id) => next.delete(id));
    } else {
      modPermIds.forEach((id) => next.add(id));
    }
    setRoleForm({ ...roleForm, permissionIds: next });
  };

  const handleSelectAll = () => {
    setRoleForm({ ...roleForm, permissionIds: new Set(allPermissionIds) });
  };

  const handleDeselectAll = () => {
    setRoleForm({ ...roleForm, permissionIds: new Set() });
  };

  // Open Create Dialog
  const handleOpenCreate = () => {
    setRoleForm({
      name: '',
      description: '',
      status: 'ACTIVE',
      permissionIds: new Set(),
    });
    setCreateOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = async (r) => {
    try {
      const res = await roleService.getRoleById(r.id);
      if (res?.success && res.data) {
        const fullRole = res.data;
        setSelectedRole(fullRole);
        const permIds = new Set((fullRole.permissions || []).map((p) => p.id));
        setRoleForm({
          name: fullRole.name || fullRole.roleName || '',
          description: fullRole.description || '',
          status: fullRole.status || 'ACTIVE',
          permissionIds: permIds,
        });
        setEditOpen(true);
      }
    } catch (err) {
      toast.error('Failed to load role details');
    }
  };

  // Open View Details Dialog
  const handleOpenView = async (r) => {
    try {
      const res = await roleService.getRoleById(r.id);
      if (res?.success && res.data) {
        setSelectedRole(res.data);
        setViewOpen(true);
      }
    } catch (err) {
      toast.error('Failed to load role details');
    }
  };

  const handleOpenStatusDialog = (r) => {
    setSelectedRole(r);
    setStatusDialogOpen(true);
  };

  // Submit Create Role
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await roleService.createRole({
        name: roleForm.name.trim().toUpperCase(),
        roleName: roleForm.name.trim().toUpperCase(),
        description: roleForm.description.trim() || null,
        permissionIds: Array.from(roleForm.permissionIds),
      });

      if (res?.success) {
        toast.success(`Role "${roleForm.name.toUpperCase()}" created successfully!`);
        setCreateOpen(false);
        loadRoles();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create role';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Role
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Update basic role info
      await roleService.updateRole(selectedRole.id, {
        name: roleForm.name.trim().toUpperCase(),
        roleName: roleForm.name.trim().toUpperCase(),
        description: roleForm.description.trim() || null,
        status: roleForm.status,
      });

      // 2. Update permissions
      await roleService.assignPermissions(selectedRole.id, Array.from(roleForm.permissionIds));

      toast.success('Role updated successfully!');
      setEditOpen(false);
      loadRoles();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update role';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Status
  const handleStatusToggle = async () => {
    if (!selectedRole) return;
    const newStatus = selectedRole.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    setSubmitting(true);
    try {
      const res = await roleService.updateRoleStatus(selectedRole.id, newStatus);
      if (res?.success) {
        toast.success(`Role marked as ${newStatus}`);
        setStatusDialogOpen(false);
        loadRoles();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update status';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // KPI counts
  const totalRoles = totalElements;
  const activeCount = roles.filter((r) => r.status === 'ACTIVE').length;
  const totalPermsCount = permissionGroups.reduce((acc, g) => acc + (g.permissions?.length || 0), 0);

  const isSystemRole = (name) => {
    const n = (name || '').toUpperCase();
    return n === 'ADMIN' || n === 'ROLE_ADMIN';
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <PageHeader
        title="Roles & Permissions"
        subtitle="Define security roles and assign fine-grained module permissions"
        actions={
          <PermissionGuard permission="ROLE_CREATE">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              sx={{
                borderRadius: 2,
                px: 2.5,
                py: 1,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(30, 58, 138, 0.25)',
              }}
            >
              Create Role
            </Button>
          </PermissionGuard>
        }
      />

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2.5, mb: 3 }}>

          <StatCard
            title="Total Configured Roles"
            value={totalRoles}
            icon={AdminPanelSettingsOutlinedIcon}
            color="primary"
          />


          <StatCard
            title="Active Roles"
            value={activeCount}
            icon={CheckCircleOutlineOutlinedIcon}
            color="success"
          />


          <StatCard
            title="System Permission Codes"
            value={totalPermsCount}
            icon={SecurityOutlinedIcon}
            color="info"
          />

      </Box>

      {/* Search & Filter */}
      <Card
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: '14px',
          border: 1, borderColor: 'divider',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
          '& .MuiOutlinedInput-root': { borderRadius: '10px' },
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search roles by name or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="ACTIVE">Active Only</MenuItem>
                <MenuItem value="INACTIVE">Inactive Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Roles Table */}
      <Card
        sx={{
          borderRadius: '16px',
          border: 1, borderColor: 'divider',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <Box sx={{ py: 8 }}>
            <LoadingSpinner message="Loading system roles..." />
          </Box>
        ) : roles.length === 0 ? (
          <EmptyState
            title="No Roles Found"
            description="Create custom roles to grant tailored access levels to your team."
            actionText="Create First Role"
            onAction={handleOpenCreate}
          />
        ) : (
          <>
            <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: theme.palette.text.secondary, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
                      ROLE NAME
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: theme.palette.text.secondary, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
                      DESCRIPTION
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: theme.palette.text.secondary, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
                      PERMISSIONS
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.8rem' }}>
                      ASSIGNED USERS
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.8rem' }}>
                      STATUS
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.8rem' }}>
                      ACTIONS
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map((r) => {
                    const roleName = r.name || r.roleName || 'ROLE';
                    const permsCount = r.permissionCount || (r.permissions ? r.permissions.length : 0);
                    const usersCount = r.userCount !== undefined ? r.userCount : (r.usersCount || 0);
                    const isActive = r.status === 'ACTIVE';
                    const isAdm = isSystemRole(roleName);

                    return (
                      <TableRow
                        key={r.id}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        {/* Role Name */}
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                bgcolor: isAdm ? alpha(theme.palette.secondary.main, 0.1) : alpha(theme.palette.primary.main, 0.1),
                                color: isAdm ? theme.palette.secondary.main : theme.palette.info.dark,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 20 }} />
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={750} color={theme.palette.text.primary}>
                                {roleName}
                              </Typography>
                              {isAdm && (
                                <Typography variant="caption" color="primary.main" fontWeight={700}>
                                  System Super Admin
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* Description */}
                        <TableCell>
                          <Typography variant="body2" color={theme.palette.text.secondary}>
                            {r.description || 'No description provided'}
                          </Typography>
                        </TableCell>

                        {/* Permissions Count */}
                        <TableCell>
                          <Chip
                            label={isAdm ? 'ALL (Superuser)' : `${permsCount} granted`}
                            size="small"
                            onClick={() => handleOpenView(r)}
                            sx={{
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              bgcolor: 'background.default',
                              color: theme.palette.text.secondary,
                              border: '1px solid #cbd5e1',
                              '&:hover': { bgcolor: theme.palette.divider },
                            }}
                          />
                        </TableCell>

                        {/* Users Count */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color={theme.palette.text.secondary}>
                            {usersCount} {usersCount === 1 ? 'user' : 'users'}
                          </Typography>
                        </TableCell>

                        {/* Status Switch */}
                        <TableCell>
                          <Tooltip title={isAdm ? "Admin role cannot be deactivated" : `Click to mark ${isActive ? 'Inactive' : 'Active'}`}>
                            <span>
                              <Chip
                                label={isActive ? 'Active' : 'Inactive'}
                                size="small"
                                onClick={isAdm ? undefined : () => handleOpenStatusDialog(r)}
                                sx={{
                                  cursor: isAdm ? 'not-allowed' : 'pointer',
                                  fontWeight: 700,
                                  fontSize: '0.72rem',
                                  bgcolor: isActive ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                                  color: isActive ? theme.palette.success.main : theme.palette.error.main,
                                  border: `1px solid ${isActive ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.error.main, 0.2)}`,
                                  '&:hover': !isAdm ? { opacity: 0.8 } : {},
                                }}
                              />
                            </span>
                          </Tooltip>
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="View Permissions Breakdown">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenView(r)}
                                sx={{
                                  color: theme.palette.text.secondary,
                                  '&:hover': { bgcolor: 'background.default', color: theme.palette.info.dark },
                                }}
                              >
                                <VisibilityOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <PermissionGuard permission="ROLE_UPDATE">
                              <Tooltip title="Edit Role & Permissions">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenEdit(r)}
                                  sx={{
                                    color: theme.palette.info.dark,
                                    '&:hover': { bgcolor: 'rgba(30, 58, 138, 0.08)' },
                                  }}
                                >
                                  <EditOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </PermissionGuard>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalElements}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{ borderTop: 1, borderColor: 'divider' }}
            />
          </>
        )}
      </Card>

      {/* CREATE ROLE MODAL */}
      <Dialog
        open={createOpen}
        onClose={() => !submitting && setCreateOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}
      >
        <form onSubmit={handleCreateSubmit}>
          <DialogTitle sx={{ pb: 1, fontWeight: 800 }}>Create New Role</DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Role Name *"
                  fullWidth
                  required
                  placeholder="e.g. BILLING_OPERATOR"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value.toUpperCase() })}
                  helperText="Use uppercase letters and underscores"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Description"
                  fullWidth
                  placeholder="Brief summary of duties and access"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                />
              </Grid>
            </Grid>

            {/* Permissions Matrix Header */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1.5, sm: 0 }, mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={750} color={theme.palette.text.primary}>
                  Assign Permissions
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Selected: {roleForm.permissionIds.size} of {allPermissionIds.length} permissions
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<SelectAllIcon />}
                  onClick={handleSelectAll}
                  sx={{ textTransform: 'none', borderRadius: 1.5 }}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  startIcon={<DeselectIcon />}
                  onClick={handleDeselectAll}
                  sx={{ textTransform: 'none', borderRadius: 1.5 }}
                >
                  Deselect All
                </Button>
              </Stack>
            </Box>

            {/* Permission Accordions by Module */}
            <Stack spacing={1.5}>
              {permissionGroups.map((group) => {
                const modPerms = group.permissions || [];
                const selectedInMod = modPerms.filter((p) => roleForm.permissionIds.has(p.id)).length;
                const isAllInMod = selectedInMod === modPerms.length && modPerms.length > 0;
                const isIndeterminate = selectedInMod > 0 && selectedInMod < modPerms.length;

                return (
                  <Accordion
                    key={group.module}
                    defaultExpanded
                    sx={{
                      border: 1, borderColor: 'divider',
                      borderRadius: '8px !important',
                      boxShadow: 'none',
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', mr: 2 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isAllInMod}
                              indeterminate={isIndeterminate}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleToggleModule(group);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="subtitle2" fontWeight={750} color={theme.palette.info.dark}>
                              {group.module}
                            </Typography>
                          }
                          sx={{ m: 0 }}
                        />
                        <Chip
                          label={`${selectedInMod} / ${modPerms.length}`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            bgcolor: selectedInMod > 0 ? alpha(theme.palette.info.main, 0.1) : theme.palette.background.default,
                            color: selectedInMod > 0 ? theme.palette.info.dark : theme.palette.text.secondary,
                          }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, pb: 2, px: 3 }}>
                      <Divider sx={{ mb: 1.5 }} />
                      <Grid container spacing={1.5}>
                        {modPerms.map((p) => (
                          <Grid item xs={12} sm={6} md={4} key={p.id}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={roleForm.permissionIds.has(p.id)}
                                  onChange={() => handleTogglePermission(p.id)}
                                  size="small"
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body2" fontWeight={600} color={theme.palette.text.secondary} sx={{ fontSize: '0.8125rem' }}>
                                    {p.permissionName || p.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                                    {p.permissionCode || p.code}
                                  </Typography>
                                </Box>
                              }
                              sx={{ m: 0, alignItems: 'flex-start' }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: { xs: 1, sm: 0 }, '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } } }}>
            <Button onClick={() => setCreateOpen(false)} disabled={submitting} sx={{ color: theme.palette.text.secondary }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ fontWeight: 700, borderRadius: 2, px: 3 }}
            >
              {submitting ? 'Creating...' : 'Create Role'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* EDIT ROLE MODAL */}
      <Dialog
        open={editOpen}
        onClose={() => !submitting && setEditOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}
      >
        <form onSubmit={handleEditSubmit}>
          <DialogTitle sx={{ pb: 1, fontWeight: 800 }}>
            Edit Role — {selectedRole?.name || selectedRole?.roleName}
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Role Name *"
                  fullWidth
                  required
                  disabled={isSystemRole(selectedRole?.name)}
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value.toUpperCase() })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Description"
                  fullWidth
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                />
              </Grid>
            </Grid>

            {/* Permissions Matrix Header */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1.5, sm: 0 }, mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={750} color={theme.palette.text.primary}>
                  Assigned Permissions
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Selected: {roleForm.permissionIds.size} of {allPermissionIds.length} permissions
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<SelectAllIcon />}
                  onClick={handleSelectAll}
                  sx={{ textTransform: 'none', borderRadius: 1.5 }}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  startIcon={<DeselectIcon />}
                  onClick={handleDeselectAll}
                  sx={{ textTransform: 'none', borderRadius: 1.5 }}
                >
                  Deselect All
                </Button>
              </Stack>
            </Box>

            {/* Permission Accordions by Module */}
            <Stack spacing={1.5}>
              {permissionGroups.map((group) => {
                const modPerms = group.permissions || [];
                const selectedInMod = modPerms.filter((p) => roleForm.permissionIds.has(p.id)).length;
                const isAllInMod = selectedInMod === modPerms.length && modPerms.length > 0;
                const isIndeterminate = selectedInMod > 0 && selectedInMod < modPerms.length;

                return (
                  <Accordion
                    key={group.module}
                    defaultExpanded
                    sx={{
                      border: 1, borderColor: 'divider',
                      borderRadius: '8px !important',
                      boxShadow: 'none',
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', mr: 2 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isAllInMod}
                              indeterminate={isIndeterminate}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleToggleModule(group);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="subtitle2" fontWeight={750} color={theme.palette.info.dark}>
                              {group.module}
                            </Typography>
                          }
                          sx={{ m: 0 }}
                        />
                        <Chip
                          label={`${selectedInMod} / ${modPerms.length}`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            bgcolor: selectedInMod > 0 ? alpha(theme.palette.info.main, 0.1) : theme.palette.background.default,
                            color: selectedInMod > 0 ? theme.palette.info.dark : theme.palette.text.secondary,
                          }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, pb: 2, px: 3 }}>
                      <Divider sx={{ mb: 1.5 }} />
                      <Grid container spacing={1.5}>
                        {modPerms.map((p) => (
                          <Grid item xs={12} sm={6} md={4} key={p.id}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={roleForm.permissionIds.has(p.id)}
                                  onChange={() => handleTogglePermission(p.id)}
                                  size="small"
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body2" fontWeight={600} color={theme.palette.text.secondary} sx={{ fontSize: '0.8125rem' }}>
                                    {p.permissionName || p.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                                    {p.permissionCode || p.code}
                                  </Typography>
                                </Box>
                              }
                              sx={{ m: 0, alignItems: 'flex-start' }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: { xs: 1, sm: 0 }, '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } } }}>
            <Button onClick={() => setEditOpen(false)} disabled={submitting} sx={{ color: theme.palette.text.secondary }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ fontWeight: 700, borderRadius: 2, px: 3 }}
            >
              {submitting ? 'Saving...' : 'Save Permissions'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* VIEW ROLE DETAILS MODAL */}
      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, maxHeight: '85vh' } }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 800 }}>
          Permissions for Role: {selectedRole?.name || selectedRole?.roleName}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color={theme.palette.text.secondary}>
              {selectedRole?.description || 'No description provided'}
            </Typography>
          </Box>

          <Stack spacing={2}>
            {permissionGroups.map((group) => {
              const rolePermCodes = new Set((selectedRole?.permissions || []).map((p) => p.permissionCode || p.code));
              const grantedInMod = (group.permissions || []).filter((p) =>
                rolePermCodes.has(p.permissionCode || p.code)
              );

              if (grantedInMod.length === 0) return null;

              return (
                <Paper key={group.module} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={800} color={theme.palette.info.dark} sx={{ mb: 1.5 }}>
                    {group.module} ({grantedInMod.length} granted)
                  </Typography>
                  <Grid container spacing={1}>
                    {grantedInMod.map((p) => (
                      <Grid item xs={12} sm={6} md={4} key={p.id}>
                        <Chip
                          label={p.permissionName || p.name}
                          size="small"
                          sx={{
                            width: '100%',
                            justifyContent: 'flex-start',
                            fontWeight: 600,
                            bgcolor: 'background.default',
                            color: theme.palette.text.primary,
                            fontSize: '0.75rem',
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } } }}>
          <Button onClick={() => setViewOpen(false)} variant="contained" sx={{ borderRadius: 2 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* TOGGLE STATUS CONFIRMATION DIALOG */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => !submitting && setStatusDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {selectedRole?.status === 'ACTIVE' ? 'Deactivate Role?' : 'Activate Role?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {selectedRole?.status === 'ACTIVE' ? 'deactivate' : 'activate'}{' '}
            <strong>{selectedRole?.name || selectedRole?.roleName}</strong>?
            {selectedRole?.status === 'ACTIVE'
              ? ' Users assigned to an inactive role will lose access.'
              : ' Users assigned to this role will regain access according to permissions.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: { xs: 1, sm: 0 }, '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } } }}>
          <Button onClick={() => setStatusDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleStatusToggle}
            variant="contained"
            color={selectedRole?.status === 'ACTIVE' ? 'error' : 'success'}
            disabled={submitting}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            {submitting ? 'Updating...' : selectedRole?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RolesPage;
