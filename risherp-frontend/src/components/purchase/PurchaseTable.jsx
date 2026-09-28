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
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StatusChip from '../common/StatusChip';
import AppTable from '../common/AppTable';
import { formatCurrency } from '../../utils/saleCalculations';
import { useAuth } from '../../context/AuthContext';

/**

 * Server-paginated purchase invoices table with action menu.
 */
const PurchaseTable = ({
  purchases,
  loading,
  totalElements,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onPrint,
  onDownloadPdf,
  onCancelPurchase,
}) => {
  const theme = useTheme();
  const { user } = useAuth();

  const canCancel = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  // Action Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const handleOpenMenu = (event, purchase) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedPurchase(purchase);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedPurchase(null);
  };

  const handleMenuAction = (action) => {
    const purchase = selectedPurchase;
    handleCloseMenu();
    if (!purchase) return;

    if (action === 'view') onView(purchase);
    else if (action === 'print') onPrint(purchase);
    else if (action === 'pdf') onDownloadPdf(purchase);
    else if (action === 'cancel') onCancelPurchase(purchase);
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

  if (!purchases || purchases.length === 0) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 2, p: 6, textAlign: 'center' }}>
        <ShoppingCartOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No purchase invoices found
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Try adjusting your search query, supplier, or date filters
        </Typography>
      </Paper>
    );
  }

  const headContent = (
    <TableRow>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>PURCHASE NO.</TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>DATE</TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>SUPPLIER</TableCell>
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
        {purchases.map((purchase) => {
          const isCancelled = purchase.status === 'CANCELLED';

          return (
            <TableRow
              key={purchase.id}
              hover
              sx={{
                cursor: 'pointer',
                bgcolor: isCancelled ? 'action.hover' : 'inherit',
                opacity: isCancelled ? 0.75 : 1,
              }}
              onClick={() => onView(purchase)}
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
                  {purchase.purchaseNumber}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{purchase.purchaseDate || '—'}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 160 }}>
                  {purchase.partyName || '—'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {purchase.partyCode || purchase.partyMobile || ''}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  {purchase.purchaseType || 'CASH'}
                </Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'right' }}>
                <Typography variant="body2" fontWeight={700}>
                  {formatCurrency(purchase.grandTotal)}
                </Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'right' }}>
                <Typography variant="body2" color="success.main" fontWeight={600}>
                  {formatCurrency(purchase.paidAmount)}
                </Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'right' }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={parseFloat(purchase.balanceAmount) > 0 ? 'error.main' : 'text.disabled'}
                >
                  {formatCurrency(purchase.balanceAmount)}
                </Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <StatusChip status={purchase.paymentStatus || 'PENDING'} />
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <StatusChip status={purchase.status || 'COMPLETED'} />
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => onView(purchase)} color="primary">
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Print Voucher">
                    <IconButton size="small" onClick={() => onPrint(purchase)} color="default">
                      <PrintOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download PDF">
                    <IconButton size="small" onClick={() => onDownloadPdf(purchase)} color="secondary">
                      <PictureAsPdfOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="More Options">
                    <IconButton size="small" onClick={(e) => handleOpenMenu(e, purchase)}>
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
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('print')}>
          <ListItemIcon><PrintOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Print Voucher</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('pdf')}>
          <ListItemIcon><PictureAsPdfOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Download PDF</ListItemText>
        </MenuItem>
        {canCancel && (
          <MenuItem
            onClick={() => handleMenuAction('cancel')}
            disabled={selectedPurchase?.status === 'CANCELLED'}
            sx={{ color: selectedPurchase?.status === 'CANCELLED' ? 'text.disabled' : 'error.main' }}
          >
            <ListItemIcon sx={{ color: selectedPurchase?.status === 'CANCELLED' ? 'text.disabled' : 'error.main' }}>
              <CancelOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              {selectedPurchase?.status === 'CANCELLED' ? 'Already Cancelled' : 'Cancel Purchase'}
            </ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default PurchaseTable;
