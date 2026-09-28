import { useState } from 'react';
import {
  Box, TableCell, TableRow,
  Paper, Typography, IconButton, Tooltip, Skeleton,
  Menu, MenuItem, ListItemIcon, ListItemText, useTheme, alpha
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import StatusChip from '../common/StatusChip';
import AppTable from '../common/AppTable';
import { formatCurrency } from '../../utils/saleCalculations';
import { useAuth } from '../../context/AuthContext';
const SalesTable = ({
  sales,
  loading,
  totalElements,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onPrint,
  onDownloadPdf,
  onCancelSale,
}) => {
  const theme = useTheme();
  const { user } = useAuth();

  const canCancel = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  // Action Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);

  const handleOpenMenu = (event, sale) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedSale(sale);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedSale(null);
  };

  const handleMenuAction = (action) => {
    const sale = selectedSale;
    handleCloseMenu();
    if (!sale) return;

    if (action === 'view') onView(sale);
    else if (action === 'print') onPrint(sale);
    else if (action === 'pdf') onDownloadPdf(sale);
    else if (action === 'cancel') onCancelSale(sale);
  };

  if (loading) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        {[...Array(5)].map((_, i) => (
          <Box key={i} sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Skeleton width="100%" height={32} />
          </Box>
        ))}
      </Paper>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 2, p: 6, textAlign: 'center' }}>
        <ReceiptLongOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No sales invoices found
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Try adjusting your search criteria or date filters
        </Typography>
      </Paper>
    );
  }

  const headContent = (
    <TableRow>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>INVOICE NO.</TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>DATE</TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>CUSTOMER</TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>TYPE</TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'right' }}>GRAND TOTAL</TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'right' }}>PAID</TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'right' }}>BALANCE</TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center' }}>PAYMENT</TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center' }}>STATUS</TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center' }}>ACTIONS</TableCell>
    </TableRow>
  );

  return (
    <>
      <AppTable
        page={page}
        rowsPerPage={rowsPerPage}
        totalElements={totalElements}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        headContent={headContent}
      >
        {sales.map((sale) => {
          const isCancelled = sale.status === 'CANCELLED';

          return (
            <TableRow
              key={sale.id}
              hover
              sx={{
                cursor: 'pointer',
                bgcolor: isCancelled ? 'action.hover' : 'inherit',
                opacity: isCancelled ? 0.75 : 1,
              }}
              onClick={() => onView(sale)}
            >
              <TableCell>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    bgcolor: isCancelled ? 'action.hover' : alpha(theme.palette.primary.main, 0.1),
                    color: isCancelled ? 'text.secondary' : 'primary.main',
                    px: 1,
                    py: 0.4,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: isCancelled ? 'divider' : alpha(theme.palette.primary.main, 0.3),
                    display: 'inline-block',
                    textDecoration: isCancelled ? 'line-through' : 'none',
                  }}
                >
                  {sale.invoiceNumber}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{sale.saleDate}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 160 }}>
                  {sale.partyName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {sale.partyCode || sale.partyMobile || ''}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  {sale.saleType}
                </Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'right' }}>
                <Typography variant="body2" fontWeight={700}>
                  {formatCurrency(sale.grandTotal)}
                </Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'right' }}>
                <Typography variant="body2" color="success.main" fontWeight={600}>
                  {formatCurrency(sale.paidAmount)}
                </Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'right' }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={parseFloat(sale.balanceAmount) > 0 ? 'error.main' : 'text.disabled'}
                >
                  {formatCurrency(sale.balanceAmount)}
                </Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <StatusChip status={sale.paymentStatus} />
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <StatusChip status={sale.status || 'COMPLETED'} />
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title="View Invoice">
                    <IconButton size="small" onClick={() => onView(sale)} color="primary">
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Print Invoice">
                    <IconButton size="small" onClick={() => onPrint(sale)} color="default">
                      <PrintOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download PDF">
                    <IconButton size="small" onClick={() => onDownloadPdf(sale)} color="secondary">
                      <PictureAsPdfOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="More Options">
                    <IconButton size="small" onClick={(e) => handleOpenMenu(e, sale)}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          );
        })}
      </AppTable>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            minWidth: 175,
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
            border: '1px solid',
            borderColor: 'divider',
            py: 0.5,
          },
        }}
      >
        <MenuItem onClick={() => handleMenuAction('view')}>
          <ListItemIcon><VisibilityOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Invoice</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('print')}>
          <ListItemIcon><PrintOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Print Invoice</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('pdf')}>
          <ListItemIcon><PictureAsPdfOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Download PDF</ListItemText>
        </MenuItem>
        {canCancel && (
          <MenuItem
            onClick={() => handleMenuAction('cancel')}
            disabled={selectedSale?.status === 'CANCELLED'}
            sx={{ color: selectedSale?.status === 'CANCELLED' ? 'text.disabled' : 'error.main' }}
          >
            <ListItemIcon sx={{ color: selectedSale?.status === 'CANCELLED' ? 'text.disabled' : 'error.main' }}>
              <CancelOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              {selectedSale?.status === 'CANCELLED' ? 'Already Cancelled' : 'Cancel Sale'}
            </ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default SalesTable;
