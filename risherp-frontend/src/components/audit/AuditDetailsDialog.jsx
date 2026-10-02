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
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

const AuditDetailsDialog = ({ open, onClose, log }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          border: 1,
          borderColor: 'divider',
          boxShadow: isDark
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
          px: { xs: 2.5, sm: 3 },
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              bgcolor: isDark
                ? alpha(theme.palette.primary.main, 0.2)
                : alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: isDark ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
            }}
          >
            <HistoryEduIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
              <Typography variant="h6" fontWeight={750} color="text.primary">
                Audit Record #{log.id}
              </Typography>
              <Chip
                label={log.action}
                color={getActionColor(log.action)}
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Recorded on {formatDate(log.createdAt)}
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: 'background.default' }}>
        <Grid container spacing={2}>
          {/* Metadata Grid Cards */}
          {[
            {
              label: 'User / Operator',
              val: log.username || log.userEmail || 'System / Anonymous',
              sub: log.userId ? `User ID: ${log.userId}` : null,
            },
            {
              label: 'ERP Module',
              val: log.module,
              sub: null,
            },
            {
              label: 'Document # / Ref',
              val: log.referenceNumber || log.recordId || '—',
              isMono: true,
            },
            {
              label: 'Entity Type & ID',
              val: log.entityType ? `${log.entityType} (${log.entityId || '—'})` : '—',
            },
            {
              label: 'IP Address',
              val: log.ipAddress || '—',
              isMono: true,
            },
            {
              label: 'User Agent',
              val: log.userAgent || '—',
              isSmall: true,
            },
          ].map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.75,
                  borderRadius: 2.5,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  height: '100%',
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  {item.label}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={650}
                  color="text.primary"
                  sx={{
                    fontFamily: item.isMono ? 'monospace' : 'inherit',
                    wordBreak: 'break-all',
                    fontSize: item.isSmall ? '0.75rem' : '0.875rem',
                    mt: 0.25,
                  }}
                >
                  {item.val}
                </Typography>
                {item.sub && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                    {item.sub}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Description & Activity Details
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 2.5,
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {log.description || 'No detailed description recorded.'}
              </Typography>
            </Paper>
          </Grid>

          {/* State Difference (Before / After) */}
          {(log.oldValue || log.newValue) && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, mt: 0.5 }}>
                <CompareArrowsIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" fontWeight={750} color="text.primary">
                  State Difference (Before & After)
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={650} display="block" gutterBottom>
                    Old Value (Previous State)
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fff1f2',
                      borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecdd3',
                      color: isDark ? '#fca5a5' : '#991b1b',
                      borderRadius: 2.5,
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
                  <Typography variant="caption" color="text.secondary" fontWeight={650} display="block" gutterBottom>
                    New Value (Updated State)
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4',
                      borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : '#bbf7d0',
                      color: isDark ? '#86efac' : '#166534',
                      borderRadius: 2.5,
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

      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 3 },
          py: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: isDark ? 'rgba(15, 23, 42, 0.3)' : '#f8fafc',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: 2.5,
            px: 3,
            py: 0.85,
            fontWeight: 700,
            textTransform: 'none',
          }}
        >
          Close Record
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuditDetailsDialog;
