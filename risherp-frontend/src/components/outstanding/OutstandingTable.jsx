import React from 'react';
import {
  TableCell,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AppTable from '../common/AppTable';
import { formatCurrency } from '../../utils/formatters';

const OutstandingTable = ({
  records = [],
  type = 'CUSTOMER',
  loading = false,
  onViewInvoices,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isCustomer = type === 'CUSTOMER';

  if (records.length === 0 && !loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" color="text.secondary" fontWeight={600}>
          No {isCustomer ? 'Customer' : 'Supplier'} Records Found
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
          No records match the search or filter criteria.
        </Typography>
      </Paper>
    );
  }

  const headContent = (
    <TableRow>
      <TableCell sx={{ fontWeight: 700 }}>{isCustomer ? 'Customer' : 'Supplier'}</TableCell>
      <TableCell sx={{ fontWeight: 700 }}>Contact / City</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700 }}>Opening (₹)</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700 }}>{isCustomer ? 'Total Sales (₹)' : 'Total Purchases (₹)'}</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700 }}>{isCustomer ? 'Received (₹)' : 'Paid (₹)'}</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700 }}>Returns (₹)</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700 }}>Net Outstanding (₹)</TableCell>
      <TableCell align="center" sx={{ fontWeight: 700 }}>Pending Docs</TableCell>
      <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
    </TableRow>
  );

  return (
    <AppTable headContent={headContent} hidePagination={true}>
      {records.map((row) => {
        const hasBalance = (row.outstanding || 0) > 0;
        const pendingCount = isCustomer ? row.pendingInvoicesCount : row.pendingPurchasesCount;

        return (
          <TableRow
            key={row.partyId}
            hover
            sx={{
              '&:last-child td, &:last-child th': { border: 0 },
              transition: 'background-color 0.15s ease',
            }}
          >
            <TableCell>
              <Typography variant="body2" fontWeight={700}>
                {row.partyName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.partyCode || `ID: ${row.partyId}`}
              </Typography>
            </TableCell>

            <TableCell>
              <Typography variant="body2">{row.mobile || '-'}</Typography>
              <Typography variant="caption" color="text.secondary">
                {row.city || '-'}
              </Typography>
            </TableCell>

            <TableCell align="right" sx={{ color: 'text.secondary' }}>
              {formatCurrency(row.openingBalance || 0)}
              {row.openingBalanceType && row.openingBalanceType !== 'NONE' && (
                <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem' }}>
                  ({row.openingBalanceType})
                </Typography>
              )}
            </TableCell>

            <TableCell align="right" sx={{ fontWeight: 600 }}>
              {formatCurrency(isCustomer ? row.totalSales : row.totalPurchases)}
            </TableCell>

            <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>
              {formatCurrency(isCustomer ? row.totalReceipts : row.totalPayments)}
            </TableCell>

            <TableCell align="right" sx={{ color: 'warning.main' }}>
              {formatCurrency(isCustomer ? row.totalSalesReturns : row.totalPurchaseReturns)}
            </TableCell>

            <TableCell align="right">
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ color: hasBalance ? 'error.main' : 'success.main' }}
              >
                {formatCurrency(row.outstanding)}
              </Typography>
            </TableCell>

            <TableCell align="center">
              <Chip
                label={pendingCount > 0 ? `${pendingCount} Unsettled` : 'Clear'}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: pendingCount > 0 ? 'warning.light' : 'success.light',
                  color: pendingCount > 0 ? 'warning.dark' : 'success.dark',
                }}
              />
            </TableCell>

            <TableCell align="center">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Tooltip title="View Invoice Breakdown">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 14 }} />}
                    onClick={() => onViewInvoices(row)}
                    sx={{ textTransform: 'none', px: 1.2, py: 0.3, fontSize: '0.75rem' }}
                  >
                    Invoices
                  </Button>
                </Tooltip>
                <Tooltip title="View Complete Ledger">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() =>
                      navigate(
                        isCustomer
                          ? `/ledger/customer/${row.partyId}`
                          : `/ledger/supplier/${row.partyId}`,
                        { state: { from: location.pathname } }
                      )
                    }
                  >
                    <AccountBalanceWalletOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>
          </TableRow>
        );
      })}
    </AppTable>
  );
};

export default OutstandingTable;
