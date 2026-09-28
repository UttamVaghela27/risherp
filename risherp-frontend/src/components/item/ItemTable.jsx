import { useState } from 'react';
import {
  Card,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

import StatusChip from '../common/StatusChip';
import CurrencyDisplay from '../common/CurrencyDisplay';
import EmptyState from '../common/EmptyState';
import AppTable from '../common/AppTable';
import { TableSkeleton } from '../common/Loading';

/**
 * ItemTable Component
 * High-density enterprise data table for displaying items, pricing, stock levels, and status.
 */
const ItemTable = ({
  items = [],
  loading = false,
  totalElements = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  onAddItem,
}) => {
  const [actionAnchor, setActionAnchor] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleOpenActionMenu = (event, item) => {
    setActionAnchor(event.currentTarget);
    setSelectedItem(item);
  };

  const handleCloseActionMenu = () => {
    setActionAnchor(null);
    setSelectedItem(null);
  };

  const handleAction = (callback) => {
    const item = selectedItem;
    handleCloseActionMenu();
    if (callback && item) {
      callback(item);
    }
  };

  if (loading) {
    return (
      <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <TableSkeleton rows={rowsPerPage > 10 ? 10 : rowsPerPage} columns={10} />
      </Card>
    );
  }

  const headContent = (
    <TableRow>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', width: 110 }}>Item Code</TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', minWidth: 200 }}>Item Name</TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', minWidth: 130 }}>Barcode</TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', minWidth: 150 }}>Category / Brand</TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', width: 70 }}>Unit</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', minWidth: 110 }}>
        Pur. Rate
      </TableCell>
      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', minWidth: 110 }}>
        Sale Rate
      </TableCell>
      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', minWidth: 110 }}>
        Stock
      </TableCell>
      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', width: 120 }}>
        Stock Status
      </TableCell>
      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', width: 90 }}>
        Status
      </TableCell>
      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', width: 60 }}>
        Actions
      </TableCell>
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
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={11} sx={{ p: 0 }}>
              <EmptyState
                title="No items found"
                message="Get started by cataloging your first inventory item."
                buttonText="Add Item"
                onAction={onAddItem}
              />
            </TableCell>
          </TableRow>
        ) : (
          items.map((item) => {
            const isActive = item.status === 'ACTIVE';
            const currentStockVal = item.currentStock != null ? Number(item.currentStock) : 0;
            const minStockVal = item.minimumStock != null ? Number(item.minimumStock) : 0;

            return (
              <TableRow
                key={item.id}
                hover
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  opacity: isActive ? 1 : 0.75,
                  bgcolor: isActive ? 'inherit' : 'action.hover',
                }}
              >
                <TableCell>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      bgcolor: 'action.hover',
                      color: 'primary.main',
                      px: 0.8,
                      py: 0.3,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {item.itemCode}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                    }}
                    onClick={() => onView && onView(item)}
                  >
                    {item.itemName}
                  </Typography>
                </TableCell>

                <TableCell>
                  {item.barcode ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <QrCode2OutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" fontFamily="monospace" color="text.secondary">
                        {item.barcode}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.disabled">
                      —
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Stack spacing={0.2}>
                    <Typography variant="body2" color="text.primary">
                      {item.categoryName || 'Uncategorized'}
                    </Typography>
                    {item.companyName && (
                      <Typography variant="caption" color="text.secondary">
                        {item.companyName}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={item.unit}
                    sx={{ fontSize: '0.7rem', fontWeight: 600, height: 22 }}
                  />
                </TableCell>

                <TableCell align="right">
                  <CurrencyDisplay amount={item.purchaseRate} variant="body2" />
                </TableCell>

                <TableCell align="right">
                  <CurrencyDisplay amount={item.saleRate} variant="body2" fontWeight={600} />
                </TableCell>

                <TableCell align="right">
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={
                      currentStockVal <= 0
                        ? 'error.main'
                        : currentStockVal <= minStockVal
                        ? 'warning.dark'
                        : 'text.primary'
                    }
                  >
                    {item.currentStock} {item.unit}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Min: {item.minimumStock}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <StatusChip status={item.stockStatus} />
                </TableCell>

                <TableCell align="center">
                  <StatusChip status={item.status} />
                </TableCell>

                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenActionMenu(e, item)}
                    aria-label="Actions"
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </AppTable>

      {/* Action Popup Menu */}
      <Menu
        anchorEl={actionAnchor}
        open={Boolean(actionAnchor)}
        onClose={handleCloseActionMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            minWidth: 180,
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
            border: 1, borderColor: 'divider',
            py: 0.5,
          },
        }}
      >
        <MenuItem onClick={() => handleAction(onView)}>
          <ListItemIcon>
            <VisibilityOutlinedIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="View Details" />
        </MenuItem>

        <MenuItem onClick={() => handleAction(onEdit)}>
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" color="info" />
          </ListItemIcon>
          <ListItemText primary="Edit Item" />
        </MenuItem>

        <MenuItem onClick={() => handleAction(onToggleStatus)}>
          <ListItemIcon>
            {selectedItem?.status === 'ACTIVE' ? (
              <BlockOutlinedIcon fontSize="small" color="warning" />
            ) : (
              <CheckCircleOutlineOutlinedIcon fontSize="small" color="success" />
            )}
          </ListItemIcon>
          <ListItemText
            primary={selectedItem?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          />
        </MenuItem>

        <Tooltip title="Stock transaction history will be available in Phase 12 (Stock Management)" placement="left">
          <span>
            <MenuItem disabled>
              <ListItemIcon>
                <HistoryEduOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Stock History" secondary="Coming Soon" />
            </MenuItem>
          </span>
        </Tooltip>

        <MenuItem onClick={() => handleAction(onDelete)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteOutlinedIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default ItemTable;
