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
} from '@mui/material';
import NumbersIcon from '@mui/icons-material/Numbers';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import toast from 'react-hot-toast';
import settingsService from '../../services/settingsService';
import { useAuth } from '../../context/AuthContext';

const NumberingSettingsTab = () => {
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

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="medium">
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
        <Dialog open={editDialogOpen} onClose={handleCloseEdit} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>
            Configure {editForm.documentTypeName}
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <TextField
                label="Document Prefix"
                name="prefix"
                value={editForm.prefix}
                onChange={handleEditChange}
                fullWidth
                size="small"
                helperText="E.g., INV-, PUR-, SR-, REC-"
              />

              <TextField
                label="Next Sequence Number"
                name="nextNumber"
                type="number"
                value={editForm.nextNumber}
                onChange={handleEditChange}
                fullWidth
                size="small"
                inputProps={{ min: 1 }}
                helperText="Next sequential numeric identifier"
              />

              <TextField
                label="Total Digits Length (Zero Padding)"
                name="numberLength"
                type="number"
                value={editForm.numberLength}
                onChange={handleEditChange}
                fullWidth
                size="small"
                inputProps={{ min: 1, max: 12 }}
                helperText="Between 1 and 12 digits (e.g. 6 digits = 000001)"
              />

              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1.5, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Resulting Next Document Number:
                </Typography>
                <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ fontFamily: 'monospace' }}>
                  {formatPreview(editForm.prefix, editForm.nextNumber, editForm.numberLength)}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseEdit} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default NumberingSettingsTab;
