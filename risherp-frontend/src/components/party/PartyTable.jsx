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
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

import AppTable from '../common/AppTable';
import StatusChip from '../common/StatusChip';
import CurrencyDisplay from '../common/CurrencyDisplay';
import EmptyState from '../common/EmptyState';
import { TableSkeleton } from '../common/Loading';

/**
 * PartyTable Component
 * High-density enterprise data table for listing parties, customers, and suppliers.
 */
const PartyTable = ({
  parties = [],
  loading = false,
  totalElements = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onEdit,
  onToggleStatus,
  emptyTitle = 'No parties found',
  emptyMessage = 'Get started by registering your first party profile.',
  onAddParty,
}) => {
  const [actionAnchor, setActionAnchor] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);

  const handleOpenActionMenu = (event, party) => {
    setActionAnchor(event.currentTarget);
    setSelectedParty(party);
  };

  const handleCloseActionMenu = () => {
    setActionAnchor(null);
    setSelectedParty(null);
  };

  const handleAction = (actionCallback) => {
    const party = selectedParty;
    handleCloseActionMenu();
    if (actionCallback && party) {
      actionCallback(party);
    }
  };

  if (loading) {
    return (
      <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <TableSkeleton rows={rowsPerPage > 10 ? 10 : rowsPerPage} columns={9} />
      </Card>
    );
  }

  const headContent = (
    <TableRow>
      <TableCell sx={{ fontWeight: 700, width: 110 }}>Code</TableCell>
      <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Party Name</TableCell>
      <TableCell sx={{ fontWeight: 700, width: 110 }}>Type</TableCell>
      <TableCell sx={{ fontWeight: 700, minWidth: 130 }}>Mobile</TableCell>
      <TableCell sx={{ fontWeight: 700, minWidth: 130 }}>City</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700, minWidth: 150 }}>Opening Balance</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700, minWidth: 130 }}>Credit Limit</TableCell>
      <TableCell align="center" sx={{ fontWeight: 700, width: 100 }}>Status</TableCell>
      <TableCell align="center" sx={{ fontWeight: 700, width: 70 }}>Actions</TableCell>
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
        {parties.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
              <EmptyState
                title={emptyTitle}
                message={emptyMessage}
                actionLabel={onAddParty ? 'Add New Party' : undefined}
                onAction={onAddParty}
              />
            </TableCell>
          </TableRow>
        ) : (
          parties.map((party) => {
            const isReceivable = party.openingBalanceType === 'RECEIVABLE';
            const isPayable = party.openingBalanceType === 'PAYABLE';
            const isActive = party.status === 'ACTIVE';

            return (
              <TableRow
                hover
                key={party.id}
                sx={{
                  cursor: 'pointer',
                  opacity: isActive ? 1 : 0.75,
                }}
                onClick={() => onView && onView(party)}
              >
                {/* Party Code */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      bgcolor: 'action.hover',
                      color: 'primary.main',
                      px: 1,
                      py: 0.4,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'inline-block',
                    }}
                  >
                    {party.partyCode}
                  </Typography>
                </TableCell>

                {/* Party Name & Contact Person */}
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={700} color="text.primary">
                      {party.partyName}
                    </Typography>
                    {party.contactPerson && (
                      <Typography variant="caption" color="text.secondary">
                        Attn: {party.contactPerson}
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                {/* Party Type Chip */}
                <TableCell>
                  <Chip
                    size="small"
                    label={party.partyType}
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      bgcolor:
                        party.partyType === 'CUSTOMER'
                          ? 'rgba(30, 58, 138, 0.08)'
                          : party.partyType === 'SUPPLIER'
                          ? 'rgba(15, 118, 110, 0.08)'
                          : 'rgba(100, 116, 139, 0.1)',
                      color:
                        party.partyType === 'CUSTOMER'
                          ? 'primary.main'
                          : party.partyType === 'SUPPLIER'
                          ? 'secondary.main'
                          : 'text.secondary',
                    }}
                  />
                </TableCell>

                {/* Mobile */}
                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CallOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.primary">
                      {party.mobile}
                    </Typography>
                  </Stack>
                </TableCell>

                {/* City */}
                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <LocationOnOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {party.city ? `${party.city}${party.state ? `, ${party.state}` : ''}` : '-'}
                    </Typography>
                  </Stack>
                </TableCell>

                {/* Opening Balance */}
                <TableCell align="right">
                  <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <CurrencyDisplay
                      amount={party.openingBalance}
                      variant="body2"
                      fontWeight={700}
                      color={
                        isReceivable
                          ? 'success.main'
                          : isPayable
                          ? 'error.main'
                          : 'text.primary'
                      }
                    />
                    {party.openingBalance > 0 && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: isReceivable ? 'success.main' : 'error.main',
                          textTransform: 'uppercase',
                          letterSpacing: 0.3,
                        }}
                      >
                        {isReceivable ? 'Receivable (Dr)' : 'Payable (Cr)'}
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                {/* Credit Limit */}
                <TableCell align="right">
                  <CurrencyDisplay
                    amount={party.creditLimit}
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                  />
                </TableCell>

                {/* Status Chip */}
                <TableCell align="center">
                  <StatusChip status={party.status} />
                </TableCell>

                {/* Actions Menu */}
                <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenActionMenu(e, party)}
                    sx={{ color: 'text.secondary' }}
                    aria-label="Party actions"
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </AppTable>

      {/* Action Dropdown Menu */}
      <Menu
        anchorEl={actionAnchor}
        open={Boolean(actionAnchor)}
        onClose={handleCloseActionMenu}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 160,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
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
            <EditOutlinedIcon fontSize="small" color="inherit" />
          </ListItemIcon>
          <ListItemText primary="Edit Party" />
        </MenuItem>

        {selectedParty && (
          <MenuItem
            onClick={() => handleAction(onToggleStatus)}
            sx={{
              color: selectedParty.status === 'ACTIVE' ? 'error.main' : 'success.main',
            }}
          >
            <ListItemIcon>
              {selectedParty.status === 'ACTIVE' ? (
                <BlockOutlinedIcon fontSize="small" color="error" />
              ) : (
                <CheckCircleOutlineOutlinedIcon fontSize="small" color="success" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={selectedParty.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            />
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default PartyTable;
