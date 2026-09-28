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
  Chip,
  Box,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';

import StatusChip from '../common/StatusChip';
import DateDisplay from '../common/DateDisplay';
import EmptyState from '../common/EmptyState';
import AppTable from '../common/AppTable';
import { TableSkeleton } from '../common/Loading';

/**
 * CategoryTable Component
 * High-density data table for managing product categories.
 */
const CategoryTable = ({
  categories = [],
  loading = false,
  totalElements = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onToggleStatus,
  onDelete,
  onAddCategory,
}) => {
  const [actionAnchor, setActionAnchor] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleOpenActionMenu = (event, category) => {
    setActionAnchor(event.currentTarget);
    setSelectedCategory(category);
  };

  const handleCloseActionMenu = () => {
    setActionAnchor(null);
    setSelectedCategory(null);
  };

  const handleAction = (callback) => {
    const category = selectedCategory;
    handleCloseActionMenu();
    if (callback && category) {
      callback(category);
    }
  };

  if (loading) {
    return (
      <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <TableSkeleton rows={rowsPerPage > 10 ? 10 : rowsPerPage} columns={6} />
      </Card>
    );
  }

  const headContent = (
    <TableRow>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', minWidth: 180 }}>Category Name</TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', minWidth: 220 }}>Description</TableCell>
      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', width: 130 }}>
        Items Assigned
      </TableCell>
      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', width: 110 }}>
        Status
      </TableCell>
      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', width: 140 }}>Created Date</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', width: 70 }}>
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
        {categories.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} sx={{ p: 0 }}>
              <EmptyState
                title="No categories found"
                message="Organize your products by creating your first category."
                buttonText="Add Category"
                onAction={onAddCategory}
              />
            </TableCell>
          </TableRow>
        ) : (
          categories.map((cat) => {
            const isActive = cat.status === 'ACTIVE';
            return (
              <TableRow
                key={cat.id}
                hover
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  opacity: isActive ? 1 : 0.75,
                  bgcolor: isActive ? 'inherit' : 'action.hover',
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryOutlinedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                    <Typography variant="body2" fontWeight={600} color="text.primary">
                      {cat.categoryName}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                    {cat.description || '—'}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Chip
                    size="small"
                    label={`${cat.itemCount || 0} item${(cat.itemCount || 0) === 1 ? '' : 's'}`}
                    variant="outlined"
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      bgcolor: (cat.itemCount || 0) > 0 ? 'primary.light' : 'transparent',
                      color: (cat.itemCount || 0) > 0 ? 'primary.dark' : 'text.primary',
                    }}
                  />
                </TableCell>

                <TableCell align="center">
                  <StatusChip status={cat.status} />
                </TableCell>

                <TableCell>
                  <DateDisplay value={cat.createdAt} format="DATE" />
                </TableCell>

                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenActionMenu(e, cat)}
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
            minWidth: 165,
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
            border: 1, borderColor: 'divider',
            py: 0.5,
          },
        }}
      >
        <MenuItem onClick={() => handleAction(onEdit)}>
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Edit Category" />
        </MenuItem>

        <MenuItem onClick={() => handleAction(onToggleStatus)}>
          <ListItemIcon>
            {selectedCategory?.status === 'ACTIVE' ? (
              <BlockOutlinedIcon fontSize="small" color="warning" />
            ) : (
              <CheckCircleOutlineOutlinedIcon fontSize="small" color="success" />
            )}
          </ListItemIcon>
          <ListItemText
            primary={selectedCategory?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          />
        </MenuItem>

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

export default CategoryTable;
