import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { useNavigate, useLocation } from 'react-router-dom';
import outstandingService from '../../services/outstandingService';
import { formatCurrency, formatDate } from '../../utils/formatters';

const getPaymentStatusChip = (status, isDark) => {
  switch (status) {
    case 'PAID':
      return {
        label: 'PAID',
        color: isDark ? '#4ade80' : '#166534',
        bg: isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7',
        border: isDark ? 'rgba(34, 197, 94, 0.3)' : '#bbf7d0',
      };
    case 'PARTIAL':
      return {
        label: 'PARTIAL',
        color: isDark ? '#fb923c' : '#c2410c',
        bg: isDark ? 'rgba(249, 115, 22, 0.15)' : '#ffedd5',
        border: isDark ? 'rgba(249, 115, 22, 0.3)' : '#fed7aa',
      };
    case 'PENDING':
    default:
      return {
        label: 'PENDING',
        color: isDark ? '#f87171' : '#991b1b',
        bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
        border: isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca',
      };
  }
};

const InvoiceOutstandingDialog = ({ open, onClose, party, type = 'CUSTOMER' }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (open && party?.partyId) {
      loadInvoices();
    }
  }, [open, party]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data =
        type === 'CUSTOMER'
          ? await outstandingService.getCustomerInvoices(party.partyId)
          : await outstandingService.getSupplierInvoices(party.partyId);
      setInvoices(data || []);
    } catch (err) {
      console.error('Failed to load invoice breakdown:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDoc = (id) => {
    onClose();
    if (type === 'CUSTOMER') {
      navigate(`/sales/${id}`);
    } else {
      navigate(`/purchases/${id}`);
    }
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
          justifyContent: 'space-between',
          alignItems: 'center',
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
            <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={750} color="text.primary">
              {type === 'CUSTOMER' ? 'Customer Invoices & Breakdown' : 'Supplier Purchases & Breakdown'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {party?.partyName} {party?.partyCode ? `(${party.partyCode})` : ''} • {party?.mobile || 'No Contact Phone'}
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

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.default' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : invoices.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No outstanding invoice records found for this party account.
            </Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
              overflow: 'hidden',
              bgcolor: 'background.paper',
            }}
          >
            <Table size="small">
              <TableHead sx={{ bgcolor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Document #</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Grand Total (₹)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Paid (₹)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Balance (₹)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((inv) => {
                  const statusConfig = getPaymentStatusChip(inv.paymentStatus, isDark);
                  const isPending = (inv.balanceAmount || 0) > 0;
                  return (
                    <TableRow key={inv.id} hover>
                      <TableCell sx={{ fontWeight: 650, fontFamily: 'monospace' }}>{inv.invoiceNumber}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.825rem' }}>{formatDate(inv.invoiceDate)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 650 }}>{formatCurrency(inv.grandTotal)}</TableCell>
                      <TableCell align="right" sx={{ color: isDark ? '#4ade80' : '#166534', fontWeight: 600 }}>
                        {formatCurrency(inv.paidAmount)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 750,
                          color: isPending ? (isDark ? '#f87171' : '#dc2626') : 'text.primary',
                        }}
                      >
                        {formatCurrency(inv.balanceAmount)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={statusConfig.label}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            height: 22,
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.color,
                            border: `1px solid ${statusConfig.border}`,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="text"
                          endIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 13 }} />}
                          onClick={() => handleOpenDoc(inv.id)}
                          sx={{ textTransform: 'none', py: 0.2, fontWeight: 600 }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 3 },
          py: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: isDark ? 'rgba(15, 23, 42, 0.3)' : '#f8fafc',
          gap: 1.25,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          '& > button': { width: { xs: '100%', sm: 'auto' } },
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{
            borderRadius: 2.5,
            px: 2.5,
            py: 0.85,
            borderColor: 'divider',
            color: 'text.secondary',
            fontWeight: 650,
            textTransform: 'none',
          }}
        >
          Close
        </Button>
        <Button
          onClick={() => {
            onClose();
            navigate(
              type === 'CUSTOMER' ? `/ledger/customer/${party.partyId}` : `/ledger/supplier/${party.partyId}`,
              { state: { from: location.pathname } }
            );
          }}
          variant="contained"
          sx={{
            borderRadius: 2.5,
            px: 3,
            py: 0.85,
            fontWeight: 700,
            textTransform: 'none',
          }}
        >
          View Full Ledger
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceOutstandingDialog;
