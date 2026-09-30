import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import toast from 'react-hot-toast';

import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PartyFilters from '../../components/party/PartyFilters';
import PartyTable from '../../components/party/PartyTable';
import PartyDialog from '../../components/party/PartyDialog';
import partyService from '../../services/partyService';

/**
 * Customers Page
 * Filtered directory for Customer accounts, outstanding balances, and credit limits.
 */
const Customers = () => {
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
    defaultPartyType: 'CUSTOMER',
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

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await partyService.getParties({
        page,
        size: rowsPerPage,
        search,
        type: 'CUSTOMER',
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
    loadCustomers();
  }, [loadCustomers]);

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
      defaultPartyType: 'CUSTOMER',
    });
  };

  const handleEdit = (party) => {
    setPartyDialog({
      open: true,
      party,
      defaultPartyType: 'CUSTOMER',
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
        toast.success(`Customer marked as ${newStatus}`);
        setStatusDialog({ open: false, party: null, loading: false });
        loadCustomers();
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
        title="Customers"
        description="Manage customer accounts, contact details, and receivables."
        action={{
          label: 'Add Customer',
          icon: <AddIcon />,
          onClick: handleOpenCreate,
        }}
      />

      {/* Metric Cards Row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 2.5,
          mb: 3,
        }}
      >
        <StatCard
          title="Total Customers"
          value={summary?.totalCustomers ?? 0}
          icon={<PersonOutlinedIcon />}
          color="primary"
        />
        <StatCard
          title="Active Customers"
          value={summary ? summary.totalCustomers - summary.inactiveParties : 0}
          icon={<CheckCircleOutlineOutlinedIcon />}
          color="success"
        />
        <StatCard
          title="Customer Receivables"
          value={summary?.totalReceivables ?? 0}
          icon={<TrendingUpOutlinedIcon />}
          color="info"
          isCurrency
        />
      </Box>

      {/* Filter Toolbar (Type filter hidden because locked to Customer) */}
      <PartyFilters
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        onReset={handleResetFilters}
        hideTypeFilter={true}
      />

      {/* Customer Table */}
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
        emptyTitle="No customers found"
        emptyMessage="Register your first customer to start creating sales orders."
        onAddParty={handleOpenCreate}
      />

      {/* Customer Create / Edit Dialog Modal */}
      <PartyDialog
        open={partyDialog.open}
        party={partyDialog.party}
        defaultPartyType="CUSTOMER"
        onClose={() => setPartyDialog({ open: false, party: null, defaultPartyType: 'CUSTOMER' })}
        onSuccess={() => {
          loadCustomers();
          loadSummary();
        }}
      />

      {/* Status Confirmation Dialog */}
      <ConfirmDialog
        open={statusDialog.open}
        title={statusDialog.party?.status === 'ACTIVE' ? 'Deactivate Customer?' : 'Activate Customer?'}
        message={
          statusDialog.party?.status === 'ACTIVE'
            ? `Are you sure you want to deactivate "${statusDialog.party?.partyName}"? Deactivated customers will not appear in sales invoicing.`
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

export default Customers;
