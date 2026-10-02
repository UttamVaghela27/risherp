import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Avatar,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import BackupIcon from '@mui/icons-material/Backup';
import DownloadIcon from '@mui/icons-material/Download';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import CloseIcon from '@mui/icons-material/Close';
import toast from 'react-hot-toast';
import backupService from '../../services/backupService';
import { useAuth } from '../../context/AuthContext';

const BackupSettingsTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { hasPermission, isAdmin } = useAuth();
  const canCreate = isAdmin() || hasPermission('BACKUP_CREATE');
  const canRestore = isAdmin() || hasPermission('BACKUP_RESTORE');

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [backups, setBackups] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

  // Restore Modal State
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [restoring, setRestoring] = useState(false);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const res = await backupService.getBackups({ page: 0, size: 50 });
      if (res.success && res.data) {
        setBackups(res.data.content || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load backup history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      const res = await backupService.createBackup();
      if (res.success) {
        toast.success('Database backup created successfully!');
        fetchBackups();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Database backup failed');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (backup) => {
    try {
      setDownloadingId(backup.id);
      await backupService.downloadBackup(backup.id, backup.fileName);
      toast.success('Backup downloaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download backup file');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenRestore = (backup) => {
    setSelectedBackup(backup);
    setConfirmInput('');
    setRestoreModalOpen(true);
  };

  const handleCloseRestore = () => {
    setRestoreModalOpen(false);
    setSelectedBackup(null);
    setConfirmInput('');
  };

  const handleExecuteRestore = async () => {
    if (confirmInput.trim().toUpperCase() !== 'RESTORE') {
      toast.error('Please type RESTORE to confirm this action');
      return;
    }

    try {
      setRestoring(true);
      const res = await backupService.restoreBackup(selectedBackup.id);
      if (res.success) {
        toast.success('Database restored successfully! A safety backup was created before restore.');
        handleCloseRestore();
        fetchBackups();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to restore backup');
    } finally {
      setRestoring(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Chip icon={<CheckCircleOutlineIcon />} label="Completed" color="success" size="small" variant="outlined" />;
      case 'RESTORED':
        return <Chip icon={<CheckCircleOutlineIcon />} label="Restored" color="primary" size="small" />;
      case 'IN_PROGRESS':
        return <Chip label="In Progress" color="info" size="small" variant="outlined" />;
      case 'FAILED':
        return <Chip icon={<ErrorOutlineIcon />} label="Failed" color="error" size="small" variant="outlined" />;
      default:
        return <Chip label={status || 'Unknown'} size="small" />;
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'error.light', color: 'error.main', width: 44, height: 44 }}>
              <BackupIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Database Backup & Restore
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create and manage full enterprise SQL database snapshots with automated safety safeguards.
              </Typography>
            </Box>
          </Box>

          {canCreate && (
            <Button
              variant="contained"
              color="primary"
              startIcon={creating ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
              disabled={creating}
              onClick={handleCreateBackup}
              sx={{ px: 2.5, py: 1, fontWeight: 700 }}
            >
              {creating ? 'Dumping Database...' : 'Create Backup'}
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 3 }}>
          <strong>Enterprise Safeguards Active:</strong> All backup dumps represent the real physical MySQL database state.
          Before restoring any snapshot, a <strong>safety backup</strong> is automatically created to prevent irreversible data loss.
        </Alert>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={36} />
          </Box>
        ) : backups.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', bgcolor: 'background.default', borderRadius: 2 }}>
            <BackupIcon sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 1.5 }} />
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              No Database Backups Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Generate your first physical SQL database snapshot to preserve enterprise data.
            </Typography>
            {canCreate && (
              <Button variant="contained" onClick={handleCreateBackup} disabled={creating}>
                Create Initial Backup
              </Button>
            )}
          </Paper>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
            <Table size="medium" sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>File Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>File Size</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created By</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {backups.map((b) => (
                  <TableRow key={b.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                        {b.fileName}
                      </Typography>
                      {b.errorMessage && (
                        <Typography variant="caption" color="error" display="block">
                          {b.errorMessage}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={b.backupType === 'PRE_RESTORE_SAFETY' ? 'Safety Pre-Restore' : 'Manual Dump'}
                        size="small"
                        color={b.backupType === 'PRE_RESTORE_SAFETY' ? 'warning' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{b.fileSizeFormatted || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{b.createdByName || 'System'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(b.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(b.status)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="Download SQL Dump">
                          <span>
                            <IconButton
                              size="small"
                              color="primary"
                              disabled={b.status !== 'COMPLETED' && b.status !== 'RESTORED'}
                              onClick={() => handleDownload(b)}
                            >
                              {downloadingId === b.id ? <CircularProgress size={18} /> : <DownloadIcon fontSize="small" />}
                            </IconButton>
                          </span>
                        </Tooltip>

                        {canRestore && (
                          <Tooltip title="Restore this Backup">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={b.status !== 'COMPLETED' && b.status !== 'RESTORED'}
                                onClick={() => handleOpenRestore(b)}
                              >
                                <RestoreIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* RESTORE CONFIRMATION DIALOG */}
        <Dialog
          open={restoreModalOpen}
          onClose={handleCloseRestore}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: isDark ? '0 24px 48px -12px rgba(0,0,0,0.8)' : '0 24px 48px -12px rgba(15,23,42,0.18)',
              border: 1,
              borderColor: 'divider',
              overflow: 'hidden',
            },
          }}
        >
          <DialogTitle
            sx={{
              p: { xs: 2.5, sm: 3 },
              pb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  bgcolor: alpha(theme.palette.error.main, 0.12),
                  color: theme.palette.error.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <WarningAmberIcon />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.25, fontSize: { xs: '1.05rem', sm: '1.15rem' } }}>
                  Restore Database Snapshot
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                  Critical operational confirmation required
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleCloseRestore}
              size="small"
              sx={{ color: 'text.secondary', '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.08) } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2.5,
                border: 1,
                borderColor: alpha(theme.palette.error.main, 0.3),
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>
                DANGER: Database Overwrite
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                Restoring this backup will replace current ERP database tables with data from this snapshot. Active transactions since this snapshot will be overwritten.
              </Typography>
            </Alert>

            {selectedBackup && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  bgcolor: isDark ? alpha(theme.palette.background.default, 0.6) : alpha(theme.palette.text.primary, 0.02),
                  mb: 3,
                  borderRadius: 2.5,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.75 }}>
                  Target Backup Dump
                </Typography>
                <Typography variant="subtitle1" fontWeight={750} sx={{ fontFamily: 'monospace', mb: 1, wordBreak: 'break-all', color: 'text.primary' }}>
                  {selectedBackup.fileName}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
                  <Chip
                    label={`Size: ${selectedBackup.fileSizeFormatted}`}
                    size="small"
                    sx={{ borderRadius: '6px', fontWeight: 600, fontSize: '0.72rem' }}
                  />
                  <Chip
                    label={`Created: ${formatDate(selectedBackup.createdAt)}`}
                    size="small"
                    sx={{ borderRadius: '6px', fontWeight: 600, fontSize: '0.72rem' }}
                  />
                </Box>
              </Paper>
            )}

            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                Type <strong style={{ color: theme.palette.error.main }}>RESTORE</strong> below to enable confirmation:
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="RESTORE"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                autoFocus
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              p: { xs: 2, sm: 2.5 },
              px: { xs: 2.5, sm: 3.5 },
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.3)' : '#f8fafc',
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1.5,
              flexDirection: { xs: 'column-reverse', sm: 'row' },
            }}
          >
            <Button
              onClick={handleCloseRestore}
              variant="outlined"
              color="inherit"
              disabled={restoring}
              sx={{ borderRadius: 2.5, px: 3, fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecuteRestore}
              variant="contained"
              color="error"
              disabled={confirmInput.trim().toUpperCase() !== 'RESTORE' || restoring}
              startIcon={restoring ? <CircularProgress size={16} color="inherit" /> : <RestoreIcon />}
              sx={{ fontWeight: 700, borderRadius: 2.5, px: 3.5, width: { xs: '100%', sm: 'auto' } }}
            >
              {restoring ? 'Restoring Database...' : 'Confirm & Restore'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default BackupSettingsTab;
