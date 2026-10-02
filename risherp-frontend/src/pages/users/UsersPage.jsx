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

  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Switch,
  FormControlLabel,
  Avatar,
  Stack,
  Alert,
  alpha,
  useTheme,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import CloseIcon from '@mui/icons-material/Close';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import PermissionGuard from '../../components/security/PermissionGuard';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import roleService from '../../services/roleService';

const UsersPage = () => {
  const theme = useTheme();
  const { user: currentUser } = useAuth();

  // Data states
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Filter states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    mobile: '',
    password: '',
    roleId: '',
    status: 'ACTIVE',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Load roles for dropdowns
  const loadRoles = async () => {
    try {
      const res = await roleService.getRoles({ size: 100, status: 'ACTIVE' });
      if (res?.success && res.data?.content) {
        setRoles(res.data.content);
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  };

  // Load users
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: rowsPerPage,
        search: search.trim() || undefined,
        roleId: selectedRole !== 'ALL' ? selectedRole : undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
      };

      const res = await userService.getUsers(params);
      if (res?.success && res.data) {
        setUsers(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, selectedRole, selectedStatus]);

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handlers
  const handleOpenCreate = () => {
    setFormData({
      fullName: '',
      username: '',
      email: '',
      mobile: '',
      password: '',
      roleId: roles.length > 0 ? roles[0].id : '',
      status: 'ACTIVE',
    });
    setCreateOpen(true);
  };

  const handleOpenEdit = (u) => {
    setSelectedUser(u);
    setFormData({
      fullName: u.fullName || u.name || '',
      username: u.username || '',
      email: u.email || '',
      mobile: u.mobile || '',
      roleId: u.role?.id || (roles.find(r => r.name === (u.role?.name || u.role))?.id) || '',
      status: u.status || 'ACTIVE',
    });
    setEditOpen(true);
  };

  const handleOpenPassword = (u) => {
    setSelectedUser(u);
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setPasswordOpen(true);
  };

  const handleOpenStatusDialog = (u) => {
    setSelectedUser(u);
    setStatusDialogOpen(true);
  };

  // Submit Create User
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim() || !formData.roleId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await userService.createUser({
        fullName: formData.fullName.trim(),
        username: formData.username.trim() || null,
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim() || null,
        password: formData.password,
        roleId: Number(formData.roleId),
      });

      if (res?.success) {
        toast.success(`User "${formData.fullName}" created successfully!`);
        setCreateOpen(false);
        loadUsers();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create user';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit User
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.roleId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await userService.updateUser(selectedUser.id, {
        fullName: formData.fullName.trim(),
        username: formData.username.trim() || null,
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim() || null,
        roleId: Number(formData.roleId),
        status: formData.status,
      });

      if (res?.success) {
        toast.success(`User updated successfully!`);
        setEditOpen(false);
        loadUsers();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update user';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const res = await userService.changePassword(selectedUser.id, {
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      if (res?.success) {
        toast.success(`Password updated for ${selectedUser.fullName || selectedUser.email}`);
        setPasswordOpen(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to change password';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle User Status
  const handleStatusToggle = async () => {
    if (!selectedUser) return;
    const newStatus = selectedUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    setSubmitting(true);
    try {
      const res = await userService.updateUserStatus(selectedUser.id, newStatus);
      if (res?.success) {
        toast.success(`User marked as ${newStatus}`);
        setStatusDialogOpen(false);
        loadUsers();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update status';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Summary counts
  const totalUsers = totalElements;
  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const inactiveCount = users.filter((u) => u.status === 'INACTIVE').length;

  const getRoleColor = (roleName) => {
    const r = (roleName || '').toUpperCase();
    if (r.includes('ADMIN')) return { bg: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main, border: alpha(theme.palette.secondary.main, 0.2) };
    if (r.includes('MANAGER')) return { bg: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, border: alpha(theme.palette.primary.main, 0.2) };
    if (r.includes('SALES')) return { bg: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, border: alpha(theme.palette.success.main, 0.2) };
    if (r.includes('PURCHASE')) return { bg: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, border: alpha(theme.palette.warning.main, 0.2) };
    return { bg: alpha(theme.palette.text.secondary, 0.1), color: theme.palette.text.secondary, border: alpha(theme.palette.text.secondary, 0.2) };
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <PageHeader
        title="User Management"
        subtitle="Manage operators, staff credentials, roles, and system access"
        actions={
          <PermissionGuard permission="USER_CREATE">
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
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
              Add User
            </Button>
          </PermissionGuard>
        }
      />

      {/* KPI Cards */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 2.5,
        mb: 3,
      }}>
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={PeopleAltOutlinedIcon}
          color="primary"
        />
        <StatCard
          title="Active Users"
          value={activeCount}
          icon={CheckCircleOutlineOutlinedIcon}
          color="success"
        />
        <StatCard
          title="Inactive Users"
          value={inactiveCount}
          icon={BlockOutlinedIcon}
          color="error"
        />
        <StatCard
          title="Configured Roles"
          value={roles.length}
          icon={AdminPanelSettingsOutlinedIcon}
          color="info"
        />
      </Box>

      {/* Filters & Search */}
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
          <Grid xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by full name, email, or username..."
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

          <Grid xs={12} sm={6} md={3.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedRole}
                label="Role"
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Roles</MenuItem>
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} md={3.5}>
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

      {/* Users Table */}
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
            <LoadingSpinner message="Loading user accounts..." />
          </Box>
        ) : users.length === 0 ? (
          <EmptyState
            title="No Users Found"
            description="Try adjusting your filters or click 'Add User' to invite a team member."
            actionText="Add First User"
            onAction={handleOpenCreate}
          />
        ) : (
          <>
            <TableContainer component={Paper} elevation={0}>
              <Table size="small" sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'text.secondary', bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
                      USER / DETAILS
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'text.secondary', bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
                      CONTACT
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'text.secondary', bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
                      ASSIGNED ROLE
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'text.secondary', bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
                      STATUS
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'text.secondary', bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
                      CREATED
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'text.secondary', bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
                      ACTIONS
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => {
                    const roleName = u.role?.name || (typeof u.role === 'string' ? u.role : 'N/A');
                    const roleStyle = getRoleColor(roleName);
                    const isActive = u.status === 'ACTIVE';
                    const isSelf = currentUser?.email === u.email || currentUser?.id === u.id;

                    return (
                      <TableRow
                        key={u.id}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        {/* User Details */}
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                              sx={{
                                width: 38,
                                height: 38,
                                bgcolor: roleStyle.bg,
                                color: roleStyle.color,
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                border: `1px solid ${roleStyle.border}`,
                              }}
                            >
                              {(u.fullName || u.name || 'U').charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={750} color="text.primary">
                                {u.fullName || u.name}
                                {isSelf && (
                                  <Chip
                                    label="You"
                                    size="small"
                                    sx={{
                                      ml: 1,
                                      height: 18,
                                      fontSize: '0.65rem',
                                      fontWeight: 800,
                                      bgcolor: alpha(theme.palette.info.main, 0.1),
                                      color: theme.palette.info.main,
                                    }}
                                  />
                                )}
                              </Typography>
                              {u.username && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  @{u.username}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* Contact */}
                        <TableCell>
                          <Typography variant="body2" color="text.primary" fontWeight={500}>
                            {u.email}
                          </Typography>
                          {u.mobile && (
                            <Typography variant="caption" color="text.secondary">
                              {u.mobile}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Role */}
                        <TableCell>
                          <Chip
                            label={roleName}
                            size="small"
                            sx={{
                              bgcolor: roleStyle.bg,
                              color: roleStyle.color,
                              border: `1px solid ${roleStyle.border}`,
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              borderRadius: 1.5,
                            }}
                          />
                        </TableCell>

                        {/* Status Switch */}
                        <TableCell>
                          <Tooltip title={isSelf ? "You cannot deactivate your own account" : `Click to mark ${isActive ? 'Inactive' : 'Active'}`}>
                            <span>
                              <Chip
                                label={isActive ? 'Active' : 'Inactive'}
                                size="small"
                                onClick={isSelf ? undefined : () => handleOpenStatusDialog(u)}
                                sx={{
                                  cursor: isSelf ? 'not-allowed' : 'pointer',
                                  fontWeight: 700,
                                  fontSize: '0.72rem',
                                  bgcolor: isActive ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                                  color: isActive ? theme.palette.success.main : theme.palette.error.main,
                                  border: `1px solid ${isActive ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.error.main, 0.2)}`,
                                  '&:hover': !isSelf ? { opacity: 0.8 } : {},
                                }}
                              />
                            </span>
                          </Tooltip>
                        </TableCell>

                        {/* Created Date */}
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                          </Typography>
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <PermissionGuard permission="USER_UPDATE">
                              <Tooltip title="Edit User">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenEdit(u)}
                                  sx={{
                                    color: theme.palette.text.secondary,
                                    '&:hover': { bgcolor: 'background.default', color: theme.palette.info.dark },
                                  }}
                                >
                                  <EditOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </PermissionGuard>

                            <PermissionGuard anyOf={['USER_UPDATE', 'USER_CREATE']}>
                              <Tooltip title="Reset Password">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenPassword(u)}
                                  sx={{
                                    color: theme.palette.warning.main,
                                    '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.1) },
                                  }}
                                >
                                  <KeyOutlinedIcon fontSize="small" />
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

      {/* CREATE USER MODAL */}
      <Dialog
        open={createOpen}
        onClose={() => !submitting && setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: 1,
            borderColor: 'divider',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.08)'
              : '0 25px 50px -12px rgba(15, 23, 42, 0.16), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
          },
        }}
      >
        <form onSubmit={handleCreateSubmit}>
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: { xs: 2.5, sm: 3 },
              py: 2,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PersonAddIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={750} color="text.primary" sx={{ lineHeight: 1.2 }}>
                  Create New User
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Add a new staff member and assign their system role
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setCreateOpen(false)}
              disabled={submitting}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name *"
                  fullWidth
                  size="small"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Username"
                  fullWidth
                  size="small"
                  placeholder="e.g. john_doe"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  helperText="Optional login identifier"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Address *"
                  type="email"
                  fullWidth
                  size="small"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Mobile Number"
                  fullWidth
                  size="small"
                  placeholder="e.g. 9876543210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Initial Password *"
                  type="password"
                  fullWidth
                  size="small"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  helperText="Min. 6 characters"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Role *</InputLabel>
                  <Select
                    value={formData.roleId}
                    label="Role *"
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                    sx={{ borderRadius: 2 }}
                  >
                    {roles.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions
            sx={{
              px: { xs: 2.5, sm: 3 },
              py: 2,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.3)' : '#f8fafc',
              gap: 1.25,
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              '& > button': { width: { xs: '100%', sm: 'auto' } },
            }}
          >
            <Button
              onClick={() => setCreateOpen(false)}
              disabled={submitting}
              variant="outlined"
              color="inherit"
              sx={{ borderRadius: 2.5, px: 2.5, py: 0.85, textTransform: 'none', fontWeight: 650 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ fontWeight: 700, borderRadius: 2.5, px: 3, py: 0.85, textTransform: 'none' }}
            >
              {submitting ? 'Creating...' : 'Create User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* EDIT USER MODAL */}
      <Dialog
        open={editOpen}
        onClose={() => !submitting && setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: 1,
            borderColor: 'divider',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.08)'
              : '0 25px 50px -12px rgba(15, 23, 42, 0.16), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
          },
        }}
      >
        <form onSubmit={handleEditSubmit}>
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: { xs: 2.5, sm: 3 },
              py: 2,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.info.main, 0.2)
                    : alpha(theme.palette.info.main, 0.1),
                  color: 'info.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EditOutlinedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={750} color="text.primary" sx={{ lineHeight: 1.2 }}>
                  Edit User Details
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Update account profile, assigned role, or account status
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setEditOpen(false)}
              disabled={submitting}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name *"
                  fullWidth
                  size="small"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Username"
                  fullWidth
                  size="small"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Address *"
                  type="email"
                  fullWidth
                  size="small"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Mobile Number"
                  fullWidth
                  size="small"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Role *</InputLabel>
                  <Select
                    value={formData.roleId}
                    label="Role *"
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                    sx={{ borderRadius: 2 }}
                  >
                    {roles.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions
            sx={{
              px: { xs: 2.5, sm: 3 },
              py: 2,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.3)' : '#f8fafc',
              gap: 1.25,
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              '& > button': { width: { xs: '100%', sm: 'auto' } },
            }}
          >
            <Button
              onClick={() => setEditOpen(false)}
              disabled={submitting}
              variant="outlined"
              color="inherit"
              sx={{ borderRadius: 2.5, px: 2.5, py: 0.85, textTransform: 'none', fontWeight: 650 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ fontWeight: 700, borderRadius: 2.5, px: 3, py: 0.85, textTransform: 'none' }}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* CHANGE PASSWORD MODAL */}
      <Dialog
        open={passwordOpen}
        onClose={() => !submitting && setPasswordOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: 1,
            borderColor: 'divider',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.08)'
              : '0 25px 50px -12px rgba(15, 23, 42, 0.16), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
          },
        }}
      >
        <form onSubmit={handlePasswordSubmit}>
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 3,
              pt: 2.5,
              pb: 2,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.warning.main, 0.2)
                    : alpha(theme.palette.warning.main, 0.1),
                  color: 'warning.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LockResetOutlinedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={750} color="text.primary" sx={{ lineHeight: 1.2 }}>
                  Reset Password
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 220 }} noWrap>
                  {selectedUser?.fullName || selectedUser?.email}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setPasswordOpen(false)}
              disabled={submitting}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.5 }}>
              Set a secure new password for <strong>{selectedUser?.fullName || selectedUser?.email}</strong>.
            </Typography>
            <Stack spacing={2.5}>
              <TextField
                label="New Password *"
                type="password"
                fullWidth
                size="small"
                required
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                helperText="Minimum 6 characters"
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                label="Confirm Password *"
                type="password"
                fullWidth
                size="small"
                required
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Stack>
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              py: 2,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.3)' : '#f8fafc',
              gap: 1.25,
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              '& > button': { width: { xs: '100%', sm: 'auto' } },
            }}
          >
            <Button
              onClick={() => setPasswordOpen(false)}
              disabled={submitting}
              variant="outlined"
              color="inherit"
              sx={{ borderRadius: 2.5, px: 2.5, py: 0.85, textTransform: 'none', fontWeight: 650 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="warning"
              disabled={submitting}
              sx={{ fontWeight: 700, borderRadius: 2.5, px: 3, py: 0.85, textTransform: 'none' }}
            >
              {submitting ? 'Resetting...' : 'Update Password'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* TOGGLE STATUS CONFIRMATION DIALOG */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => !submitting && setStatusDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: 1,
            borderColor: 'divider',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.08)'
              : '0 25px 50px -12px rgba(15, 23, 42, 0.16), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            pt: 2.5,
            pb: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                bgcolor: selectedUser?.status === 'ACTIVE'
                  ? theme.palette.mode === 'dark'
                    ? alpha(theme.palette.error.main, 0.2)
                    : alpha(theme.palette.error.main, 0.1)
                  : theme.palette.mode === 'dark'
                  ? alpha(theme.palette.success.main, 0.2)
                  : alpha(theme.palette.success.main, 0.1),
                color: selectedUser?.status === 'ACTIVE' ? 'error.main' : 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedUser?.status === 'ACTIVE' ? (
                <BlockOutlinedIcon sx={{ fontSize: 22 }} />
              ) : (
                <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 22 }} />
              )}
            </Box>
            <Typography variant="h6" fontWeight={750} color="text.primary">
              {selectedUser?.status === 'ACTIVE' ? 'Deactivate User?' : 'Activate User?'}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setStatusDialogOpen(false)}
            disabled={submitting}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 1, pb: 2 }}>
          <DialogContentText sx={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'text.secondary' }}>
            Are you sure you want to {selectedUser?.status === 'ACTIVE' ? 'deactivate' : 'activate'}{' '}
            <strong style={{ color: theme.palette.text.primary }}>{selectedUser?.fullName || selectedUser?.email}</strong>?
            {selectedUser?.status === 'ACTIVE'
              ? ' Deactivated users cannot log in to the ERP application.'
              : ' Activated users will immediately be allowed to log in.'}
          </DialogContentText>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.3)' : '#f8fafc',
            gap: 1.25,
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            '& > button': { width: { xs: '100%', sm: 'auto' } },
          }}
        >
          <Button
            onClick={() => setStatusDialogOpen(false)}
            disabled={submitting}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2.5, px: 2.5, py: 0.85, textTransform: 'none', fontWeight: 650 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStatusToggle}
            variant="contained"
            color={selectedUser?.status === 'ACTIVE' ? 'error' : 'success'}
            disabled={submitting}
            sx={{ fontWeight: 700, borderRadius: 2.5, px: 3, py: 0.85, textTransform: 'none' }}
          >
            {submitting ? 'Updating...' : selectedUser?.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
