import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

const AuditDetailsDialog = ({ open, onClose, log }) => {
  if (!log) return null;

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      });
    } catch {
      return isoStr;
    }
  };

  const getActionColor = (action) => {
    if (!action) return 'default';
    if (action.includes('CREATE') || action.includes('SUCCESS')) return 'success';
    if (action.includes('CANCEL') || action.includes('FAILED') || action.includes('DELETE')) return 'error';
    if (action.includes('UPDATE') || action.includes('RESTORE')) return 'primary';
    return 'default';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <HistoryEduIcon color="primary" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Audit Log Record #{log.id}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Logged on {formatDate(log.createdAt)}
          </Typography>
        </Box>
        <Chip label={log.action} color={getActionColor(log.action)} size="small" sx={{ fontWeight: 700 }} />
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2.5}>
          {/* Metadata Grid */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              User
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {log.username || log.userEmail || 'System / Anonymous'}
            </Typography>
            {log.userId && (
              <Typography variant="caption" color="text.disabled">
                User ID: {log.userId}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              Module
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {log.module}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              Reference / Document #
            </Typography>
            <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
              {log.referenceNumber || log.recordId || '—'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              Entity Type & ID
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {log.entityType ? `${log.entityType} (${log.entityId || '—'})` : '—'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              IP Address
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {log.ipAddress || '—'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              User Agent
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
              {log.userAgent || '—'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Description & Activity Details
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1.5 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {log.description || 'No description provided.'}
              </Typography>
            </Paper>
          </Grid>

          {/* Old vs New Value comparison if available */}
          {(log.oldValue || log.newValue) && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CompareArrowsIcon fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight={700}>
                  State Difference (Before / After)
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Old Value (Previous State)
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      bgcolor: '#fff1f2',
                      borderColor: '#fecdd3',
                      borderRadius: 1.5,
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      maxHeight: 180,
                      overflowY: 'auto',
                    }}
                  >
                    {log.oldValue || '—'}
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    New Value (Updated State)
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      bgcolor: '#f0fdf4',
                      borderColor: '#bbf7d0',
                      borderRadius: 1.5,
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      maxHeight: 180,
                      overflowY: 'auto',
                    }}
                  >
                    {log.newValue || '—'}
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuditDetailsDialog;
