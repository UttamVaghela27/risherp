import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PartyFilters from '../../components/party/PartyFilters';
import PartyTable from '../../components/party/PartyTable';
import PartyDialog from '../../components/party/PartyDialog';
import partyService from '../../services/partyService';

/**
 * Suppliers Page
 * Filtered directory for Supplier/Vendor profiles, contact info, and payables.
 */
const Suppliers = () => {
  const navigate = useNavigate();

  // Data states
  const [parties, setParties] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Filter & pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');

  // Modal dialog states
  const [partyDialog, setPartyDialog] = useState({
    open: false,
    party: null,
    defaultPartyType: 'SUPPLIER',
  });

  const [statusDialog, setStatusDialog] = useState({
    open: false,
    party: null,
    loading: false,
  });

  const loadSummary = async () => {
    try {
      const res = await partyService.getPartySummary();
      if (res?.success) {
        setSummary(res.data);
      }
    } catch {
      // Handled by axios interceptor
    }
  };

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await partyService.getParties({
        page,
        size: rowsPerPage,
        search,
        type: 'SUPPLIER',
        status,
      });

      if (res?.success) {
        setParties(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch {
      // Handled by axios interceptor
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, status]);

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(0);
  };

  const handleStatusChange = (val) => {
    setStatus(val);
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('ALL');
    setPage(0);
  };

  const handleView = (party) => {
    navigate(`/parties/${party.id}`);
  };

  const handleOpenCreate = () => {
    setPartyDialog({
      open: true,
      party: null,
      defaultPartyType: 'SUPPLIER',
    });
  };

  const handleEdit = (party) => {
    setPartyDialog({
      open: true,
      party,
      defaultPartyType: 'SUPPLIER',
    });
  };

  const handleToggleStatusClick = (party) => {
    setStatusDialog({
      open: true,
      party,
      loading: false,
    });
  };

  const handleConfirmStatusChange = async () => {
    const party = statusDialog.party;
    if (!party) return;

    setStatusDialog((prev) => ({ ...prev, loading: true }));
    const newStatus = party.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      const res = await partyService.updatePartyStatus(party.id, newStatus);
      if (res?.success) {
        toast.success(`Supplier marked as ${newStatus}`);
        setStatusDialog({ open: false, party: null, loading: false });
        loadSuppliers();
        loadSummary();
      }
    } catch {
      setStatusDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <Box>
      {/* Top Header */}
      <PageHeader
        title="Suppliers"
        description="Manage supplier accounts, purchase agreements, and payables."
        action={{
          label: 'Add Supplier',
          icon: <AddIcon />,
          onClick: handleOpenCreate,
        }}
      />

      {/* Metric Cards Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Total Suppliers"
            value={summary?.totalSuppliers ?? 0}
            icon={<BusinessOutlinedIcon fontSize="small" />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Active Suppliers"
            value={summary?.totalSuppliers ?? 0}
            icon={<CheckCircleOutlineOutlinedIcon fontSize="small" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Supplier Payables"
            value={summary?.totalPayables ?? 0}
            icon={<TrendingDownOutlinedIcon fontSize="small" />}
            color="error"
            isCurrency
          />
        </Grid>
      </Grid>

      {/* Filter Toolbar (Type filter hidden because locked to Supplier) */}
      <PartyFilters
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        onReset={handleResetFilters}
        hideTypeFilter={true}
      />

      {/* Supplier Table */}
      <PartyTable
        parties={parties}
        loading={loading}
        totalElements={totalElements}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onView={handleView}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatusClick}
        emptyTitle="No suppliers found"
        emptyMessage="Register your first vendor to start recording purchase orders."
        onAddParty={handleOpenCreate}
      />

      {/* Supplier Create / Edit Dialog Modal */}
      <PartyDialog
        open={partyDialog.open}
        party={partyDialog.party}
        defaultPartyType="SUPPLIER"
        onClose={() => setPartyDialog({ open: false, party: null, defaultPartyType: 'SUPPLIER' })}
        onSuccess={() => {
          loadSuppliers();
          loadSummary();
        }}
      />

      {/* Status Confirmation Dialog */}
      <ConfirmDialog
        open={statusDialog.open}
        title={statusDialog.party?.status === 'ACTIVE' ? 'Deactivate Supplier?' : 'Activate Supplier?'}
        message={
          statusDialog.party?.status === 'ACTIVE'
            ? `Are you sure you want to deactivate "${statusDialog.party?.partyName}"? Deactivated suppliers will not appear in purchase orders.`
            : `Are you sure you want to reactivate "${statusDialog.party?.partyName}"?`
        }
        confirmText={statusDialog.party?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        severity={statusDialog.party?.status === 'ACTIVE' ? 'error' : 'primary'}
        loading={statusDialog.loading}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setStatusDialog({ open: false, party: null, loading: false })}
      />
    </Box>
  );
};

export default Suppliers;
