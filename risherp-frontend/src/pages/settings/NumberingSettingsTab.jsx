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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Avatar,
  Divider,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import NumbersIcon from '@mui/icons-material/Numbers';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import CloseIcon from '@mui/icons-material/Close';
import toast from 'react-hot-toast';
import settingsService from '../../services/settingsService';
import { useAuth } from '../../context/AuthContext';

const NumberingSettingsTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { hasPermission, isAdmin } = useAuth();
  const canUpdate = isAdmin() || hasPermission('SETTINGS_UPDATE') || hasPermission('NUMBERING_SETTINGS_UPDATE');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sequences, setSequences] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSeq, setSelectedSeq] = useState(null);

  const [editForm, setEditForm] = useState({
    documentType: '',
    documentTypeName: '',
    prefix: '',
    nextNumber: 1,
    numberLength: 6,
  });

  const fetchSequences = async () => {
    try {
      setLoading(true);
      const res = await settingsService.getNumberingSettings();
      if (res.success && res.data) {
        setSequences(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load numbering settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSequences();
  }, []);

  const handleOpenEdit = (seq) => {
    setSelectedSeq(seq);
    setEditForm({
      documentType: seq.documentType,
      documentTypeName: seq.documentTypeName || seq.documentType,
      prefix: seq.prefix || '',
      nextNumber: seq.nextNumber || 1,
      numberLength: seq.numberLength || 6,
    });
    setEditDialogOpen(true);
  };

  const handleCloseEdit = () => {
    setEditDialogOpen(false);
    setSelectedSeq(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === 'nextNumber' || name === 'numberLength' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editForm.prefix.trim()) {
      toast.error('Prefix is required');
      return;
    }
    if (editForm.nextNumber < 1) {
      toast.error('Next number must be at least 1');
      return;
    }
    if (editForm.numberLength < 1 || editForm.numberLength > 12) {
      toast.error('Number length must be between 1 and 12 digits');
      return;
    }

    try {
      setSaving(true);
      const res = await settingsService.updateNumberingSetting(editForm);
      if (res.success) {
        toast.success(`Updated numbering for ${editForm.documentTypeName}`);
        handleCloseEdit();
        fetchSequences();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update numbering configuration');
    } finally {
      setSaving(false);
    }
  };

  const formatPreview = (prefix, nextNum, length) => {
    const len = Math.max(1, Math.min(12, length || 6));
    const num = Math.max(1, nextNum || 1);
    const padded = String(num).padStart(len, '0');
    return `${prefix || ''}${padded}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ bgcolor: 'info.light', color: 'info.main', width: 44, height: 44 }}>
            <NumbersIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Document Numbering & Sequences
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure prefixes, sequence lengths, and starting numbers across all business document types.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Alert severity="info" icon={<SecurityIcon />} sx={{ mb: 3 }}>
          <strong>Concurrency Safety Guaranteed:</strong> Document numbers are allocated atomically with database
          row locking. Changing a prefix or next number will only affect <em>future</em> documents. Historical invoices
          and bills retain their exact original document numbers.
        </Alert>

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
          <Table size="medium" sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Document Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Prefix</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Next Number</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Padding Length</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Next Document Preview</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sequences.map((seq) => (
                <TableRow key={seq.documentType} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {seq.documentTypeName || seq.documentType}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {seq.documentType}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={seq.prefix} size="small" variant="outlined" sx={{ fontWeight: 700, fontFamily: 'monospace' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {seq.nextNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {seq.numberLength} digits
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={seq.examplePreview || formatPreview(seq.prefix, seq.nextNumber, seq.numberLength)}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 700, fontFamily: 'monospace' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditOutlinedIcon />}
                      disabled={!canUpdate}
                      onClick={() => handleOpenEdit(seq)}
                    >
                      Configure
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Edit Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={handleCloseEdit}
          maxWidth="xs"
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
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <NumbersIcon />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.25, fontSize: { xs: '1.05rem', sm: '1.15rem' } }}>
                  Configure {editForm.documentTypeName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                  Set document prefix and numbering sequences
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleCloseEdit}
              size="small"
              sx={{ color: 'text.secondary', '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.08) } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <TextField
                label="Document Prefix"
                name="prefix"
                value={editForm.prefix}
                onChange={handleEditChange}
                fullWidth
                placeholder="e.g. INV-, PUR-"
                helperText="E.g., INV-, PUR-, SR-, REC-"
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <TextField
                label="Next Sequence Number"
                name="nextNumber"
                type="number"
                value={editForm.nextNumber}
                onChange={handleEditChange}
                fullWidth
                inputProps={{ min: 1 }}
                helperText="Next sequential numeric identifier"
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <TextField
                label="Total Digits Length (Zero Padding)"
                name="numberLength"
                type="number"
                value={editForm.numberLength}
                onChange={handleEditChange}
                fullWidth
                inputProps={{ min: 1, max: 12 }}
                helperText="Between 1 and 12 digits (e.g. 6 digits = 000001)"
                InputProps={{ sx: { borderRadius: 2 } }}
              />

              <Box
                sx={{
                  p: 2.5,
                  bgcolor: isDark ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.04),
                  border: 1,
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: 2.5,
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                  Live Document Number Preview
                </Typography>
                <Typography variant="h5" fontWeight={800} color="primary.main" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                  {formatPreview(editForm.prefix, editForm.nextNumber, editForm.numberLength)}
                </Typography>
              </Box>
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
              onClick={handleCloseEdit}
              variant="outlined"
              color="inherit"
              sx={{ borderRadius: 2.5, px: 3, fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              variant="contained"
              disabled={saving}
              sx={{ fontWeight: 700, borderRadius: 2.5, px: 3.5, width: { xs: '100%', sm: 'auto' } }}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default NumberingSettingsTab;
