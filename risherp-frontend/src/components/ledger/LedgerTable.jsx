import React from 'react';
import {
  TableCell,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import AppTable from '../common/AppTable';
import { formatCurrency, formatDate } from '../../utils/formatters';

const getTxnTypeConfig = (type) => {
  switch (type) {
    case 'OPENING_BALANCE':
      return { label: 'Opening Balance', color: '#0288d1', bg: '#e1f5fe' };
    case 'SALE':
      return { label: 'Sale Invoice', color: '#2e7d32', bg: '#e8f5e9' };
    case 'RECEIPT':
      return { label: 'Receipt', color: '#1976d2', bg: '#e3f2fd' };
    case 'SALES_RETURN':
      return { label: 'Sales Return', color: '#ed6c02', bg: '#fff3e0' };
    case 'PURCHASE':
      return { label: 'Purchase', color: '#7b1fa2', bg: '#f3e5f5' };
    case 'PAYMENT':
      return { label: 'Payment', color: '#00796b', bg: '#e0f2f1' };
    case 'PURCHASE_RETURN':
      return { label: 'Purchase Return', color: '#d32f2f', bg: '#ffebee' };
    default:
      return { label: type, color: '#616161', bg: '#eeeeee' };
  }
};

const getDocumentRoute = (referenceType, referenceId) => {
  if (!referenceId) return null;
  switch (referenceType) {
    case 'SALE':
      return `/sales/${referenceId}`;
    case 'RECEIPT':
      return `/receipts/${referenceId}`;
    case 'SALES_RETURN':
      return `/sales/returns/${referenceId}`;
    case 'PURCHASE':
      return `/purchases/${referenceId}`;
    case 'PAYMENT':
      return `/payments/${referenceId}`;
    case 'PURCHASE_RETURN':
      return `/purchases/returns/${referenceId}`;
    default:
      return null;
  }
};

const LedgerTable = ({ entries = [], loading = false }) => {
  const navigate = useNavigate();

  if (entries.length === 0 && !loading) {
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
          No Ledger Transactions Found
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
          No financial debit/credit movements match the selected period or filter.
        </Typography>
      </Paper>
    );
  }

  const headContent = (
    <TableRow>
      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
      <TableCell sx={{ fontWeight: 700 }}>Transaction</TableCell>
      <TableCell sx={{ fontWeight: 700 }}>Reference #</TableCell>
      <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700 }}>
        Debit (₹)
      </TableCell>
      <TableCell align="right" sx={{ fontWeight: 700 }}>
        Credit (₹)
      </TableCell>
      <TableCell align="right" sx={{ fontWeight: 700 }}>
        Running Balance (₹)
      </TableCell>
      <TableCell align="center" sx={{ fontWeight: 700 }}>
        Action
      </TableCell>
    </TableRow>
  );

  return (
    <AppTable headContent={headContent} hidePagination={true}>
      {entries.map((row) => {
        const config = getTxnTypeConfig(row.transactionType);
        const docRoute = getDocumentRoute(row.referenceType, row.referenceId);
        const isDebitPositive = (row.debitAmount || 0) > 0;
        const isCreditPositive = (row.creditAmount || 0) > 0;

        return (
          <TableRow
            key={row.id}
            hover
            sx={{
              '&:last-child td, &:last-child th': { border: 0 },
              transition: 'background-color 0.15s ease',
            }}
          >
            <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
              {formatDate(row.transactionDate)}
            </TableCell>

            <TableCell>
              <Chip
                label={config.label}
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  backgroundColor: config.bg,
                  color: config.color,
                  height: 24,
                }}
              />
            </TableCell>

            <TableCell>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  color: docRoute ? 'primary.main' : 'text.primary',
                  cursor: docRoute ? 'pointer' : 'default',
                  textDecoration: docRoute ? 'underline' : 'none',
                }}
                onClick={() => docRoute && navigate(docRoute)}
              >
                {row.referenceNumber || '-'}
              </Typography>
            </TableCell>

            <TableCell sx={{ maxWidth: 220 }}>
              <Typography variant="caption" color="text.secondary" noWrap title={row.remarks}>
                {row.remarks || '-'}
              </Typography>
            </TableCell>

            <TableCell align="right" sx={{ fontWeight: isDebitPositive ? 600 : 400, color: isDebitPositive ? 'error.main' : 'text.disabled' }}>
              {isDebitPositive ? formatCurrency(row.debitAmount) : '-'}
            </TableCell>

            <TableCell align="right" sx={{ fontWeight: isCreditPositive ? 600 : 400, color: isCreditPositive ? 'success.main' : 'text.disabled' }}>
              {isCreditPositive ? formatCurrency(row.creditAmount) : '-'}
            </TableCell>

            <TableCell align="right">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.8 }}>
                <Typography variant="body2" fontWeight={700}>
                  {formatCurrency(row.runningBalance)}
                </Typography>
                {row.balanceType && (
                  <Chip
                    label={row.balanceType}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: row.balanceType === 'Dr' ? 'error.light' : 'success.light',
                      color: row.balanceType === 'Dr' ? 'error.dark' : 'success.dark',
                    }}
                  />
                )}
              </Box>
            </TableCell>

            <TableCell align="center">
              {docRoute ? (
                <Tooltip title="View Original Transaction">
                  <IconButton size="small" color="primary" onClick={() => navigate(docRoute)}>
                    <OpenInNewOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : (
                <Typography variant="caption" color="text.disabled">-</Typography>
              )}
            </TableCell>
          </TableRow>
        );
      })}
    </AppTable>
  );
};

export default LedgerTable;
