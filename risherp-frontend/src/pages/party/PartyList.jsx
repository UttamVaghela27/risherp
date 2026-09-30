import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
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
 * PartyList Page
 * Master party directory supporting multi-criteria search, filters, pagination,
 * and quick summary cards for receivables and payables.
 */
const PartyList = () => {
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
  const [type, setType] = useState('ALL');
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

  // Load summary metrics
  const loadSummary = async () => {
    try {
      const res = await partyService.getPartySummary();
      if (res?.success) {
        setSummary(res.data);
      }
    } catch {
      // Summary errors handled by interceptor
    }
  };

  // Load paginated parties
  const loadParties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await partyService.getParties({
        page,
        size: rowsPerPage,
        search,
        type,
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
  }, [page, rowsPerPage, search, type, status]);

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    loadParties();
  }, [loadParties]);

  // Actions
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

  const handleTypeChange = (val) => {
    setType(val);
    setPage(0);
  };

  const handleStatusChange = (val) => {
    setStatus(val);
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearch('');
    setType('ALL');
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
      defaultPartyType: type !== 'ALL' ? type : 'CUSTOMER',
    });
  };

  const handleEdit = (party) => {
    setPartyDialog({
      open: true,
      party,
      defaultPartyType: party.partyType || 'CUSTOMER',
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
        toast.success(`Party marked as ${newStatus}`);
        setStatusDialog({ open: false, party: null, loading: false });
        loadParties();
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
        title="Parties"
        description="Manage customers, suppliers, and trading partners."
        action={{
          label: 'Add Party',
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
            lg: 'repeat(5, 1fr)',
          },
          gap: 2.5,
          mb: 3,
        }}
      >
        <StatCard
          title="Total Parties"
          value={summary?.totalParties ?? 0}
          icon={<PeopleAltOutlinedIcon />}
          color="primary"
        />
        <StatCard
          title="Customers"
          value={summary?.totalCustomers ?? 0}
          icon={<PersonOutlinedIcon />}
          color="primary"
        />
        <StatCard
          title="Suppliers"
          value={summary?.totalSuppliers ?? 0}
          icon={<BusinessOutlinedIcon />}
          color="secondary"
        />
        <StatCard
          title="Opening Receivables"
          value={summary?.totalReceivables ?? 0}
          icon={<TrendingUpOutlinedIcon />}
          color="success"
          isCurrency
        />
        <StatCard
          title="Opening Payables"
          value={summary?.totalPayables ?? 0}
          icon={<TrendingDownOutlinedIcon />}
          color="error"
          isCurrency
        />
      </Box>

      {/* Filter Toolbar */}
      <PartyFilters
        search={search}
        onSearchChange={handleSearchChange}
        type={type}
        onTypeChange={handleTypeChange}
        status={status}
        onStatusChange={handleStatusChange}
        onReset={handleResetFilters}
      />

      {/* Parties Table */}
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
        emptyTitle="No parties found"
        emptyMessage="Try adjusting your search criteria or register a new business party."
        onAddParty={handleOpenCreate}
      />

      {/* Party Create / Edit Dialog Modal */}
      <PartyDialog
        open={partyDialog.open}
        party={partyDialog.party}
        defaultPartyType={partyDialog.defaultPartyType}
        onClose={() => setPartyDialog({ open: false, party: null, defaultPartyType: 'CUSTOMER' })}
        onSuccess={() => {
          loadParties();
          loadSummary();
        }}
      />

      {/* Status Confirmation Dialog */}
      <ConfirmDialog
        open={statusDialog.open}
        title={statusDialog.party?.status === 'ACTIVE' ? 'Deactivate Party?' : 'Activate Party?'}
        message={
          statusDialog.party?.status === 'ACTIVE'
            ? `Are you sure you want to deactivate "${statusDialog.party?.partyName}" (${statusDialog.party?.partyCode})? It will no longer appear in active party selections.`
            : `Are you sure you want to reactivate "${statusDialog.party?.partyName}" (${statusDialog.party?.partyCode})?`
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

export default PartyList;
