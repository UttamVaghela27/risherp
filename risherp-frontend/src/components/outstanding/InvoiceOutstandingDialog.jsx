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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { useNavigate, useLocation } from 'react-router-dom';
import outstandingService from '../../services/outstandingService';
import { formatCurrency, formatDate } from '../../utils/formatters';

const getPaymentStatusChip = (status) => {
  switch (status) {
    case 'PAID':
      return { label: 'PAID', color: '#2e7d32', bg: '#e8f5e9' };
    case 'PARTIAL':
      return { label: 'PARTIAL', color: '#ed6c02', bg: '#fff3e0' };
    case 'PENDING':
    default:
      return { label: 'PENDING', color: '#d32f2f', bg: '#ffebee' };
  }
};

const InvoiceOutstandingDialog = ({ open, onClose, party, type = 'CUSTOMER' }) => {
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {type === 'CUSTOMER' ? 'Customer Invoices & Settlement' : 'Supplier Purchases & Settlement'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {party?.partyName} ({party?.partyCode || party?.mobile || ''})
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : invoices.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
            No invoice records found for this party.
          </Typography>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Invoice #</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Total (₹)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Paid (₹)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Balance (₹)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((inv) => {
                  const statusConfig = getPaymentStatusChip(inv.paymentStatus);
                  const isPending = (inv.balanceAmount || 0) > 0;
                  return (
                    <TableRow key={inv.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{inv.invoiceNumber}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(inv.invoiceDate)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(inv.grandTotal)}</TableCell>
                      <TableCell align="right" sx={{ color: '#2e7d32' }}>{formatCurrency(inv.paidAmount)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: isPending ? '#d32f2f' : 'text.primary' }}>
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
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="text"
                          endIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 14 }} />}
                          onClick={() => handleOpenDoc(inv.id)}
                          sx={{ textTransform: 'none', py: 0.2 }}
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

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Close
        </Button>
        <Button
          onClick={() => {
            onClose();
            navigate(type === 'CUSTOMER' ? `/ledger/customer/${party.partyId}` : `/ledger/supplier/${party.partyId}`, { state: { from: location.pathname } });
          }}
          variant="contained"
        >
          View Full Ledger
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceOutstandingDialog;
