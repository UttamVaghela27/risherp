import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ledgerService from '../../services/ledgerService';
import LedgerSummaryCards from '../../components/ledger/LedgerSummaryCards';
import LedgerFilters from '../../components/ledger/LedgerFilters';
import LedgerTable from '../../components/ledger/LedgerTable';

const PartyLedgerView = () => {
  const { partyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isSupplierPath = location.pathname.includes('/ledger/supplier');
  const isCustomerPath = location.pathname.includes('/ledger/customer');

  // Navigate back to where user came from, or fall back to ledger hub
  const backTo = location.state?.from || '/ledger';
  const handleBack = () => navigate(backTo);

  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [txnType, setTxnType] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState('ALL');

  const fetchLedger = useCallback(async () => {
    if (!partyId) return;
    setLoading(true);
    try {
      const params = {
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        txnType: txnType || undefined,
        search: search || undefined,
        size: 500,
      };

      let res;
      if (isSupplierPath) {
        res = await ledgerService.getSupplierLedger(partyId, params);
      } else if (isCustomerPath) {
        res = await ledgerService.getCustomerLedger(partyId, params);
      } else {
        res = await ledgerService.getPartyLedger(partyId, params);
      }

      setLedgerData(res);
    } catch (err) {
      console.error('Failed to load ledger data:', err);
    } finally {
      setLoading(false);
    }
  }, [partyId, dateFrom, dateTo, txnType, search, isSupplierPath, isCustomerPath]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const handleQuickDateFilter = (period) => {
    setActiveQuickFilter(period);
    const now = new Date();
    const formatDateStr = (d) => d.toISOString().split('T')[0];

    if (period === 'ALL') {
      setDateFrom('');
      setDateTo('');
    } else if (period === 'TODAY') {
      const todayStr = formatDateStr(now);
      setDateFrom(todayStr);
      setDateTo(todayStr);
    } else if (period === 'THIS_WEEK') {
      const first = new Date(now.setDate(now.getDate() - now.getDay()));
      const last = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      setDateFrom(formatDateStr(first));
      setDateTo(formatDateStr(last));
    } else if (period === 'THIS_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setDateFrom(formatDateStr(firstDay));
      setDateTo(formatDateStr(lastDay));
    } else if (period === 'THIS_YEAR') {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      const lastDay = new Date(now.getFullYear(), 11, 31);
      setDateFrom(formatDateStr(firstDay));
      setDateTo(formatDateStr(lastDay));
    }
  };

  const handleReset = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setTxnType('');
    setActiveQuickFilter('ALL');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link
          underline="hover"
          color="inherit"
                    onClick={() => handleBack()}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 18 }} />
          Ledger Hub
        </Link>
        <Typography color="text.primary" fontWeight={600}>
          {ledgerData?.partyName || 'Party Statement'}
        </Typography>
      </Breadcrumbs>

      {/* Header Info Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton           onClick={() => handleBack()} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h5" fontWeight={700}>
                {ledgerData?.partyName || 'Party Statement of Account'}
              </Typography>
              {ledgerData?.partyType && (
                <Chip
                  label={ledgerData.partyType}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Code: <strong>{ledgerData?.partyCode || '-'}</strong> | Mobile: <strong>{ledgerData?.mobile || '-'}</strong>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<PrintOutlinedIcon />}
            onClick={handlePrint}
            sx={{ borderRadius: 2 }}
          >
            Print Statement
          </Button>
        </Box>
      </Paper>

      {/* KPI Cards */}
      <LedgerSummaryCards
        summary={ledgerData}
        partyType={ledgerData?.partyType || (isSupplierPath ? 'SUPPLIER' : 'CUSTOMER')}
      />

      {/* Filters */}
      <LedgerFilters
        search={search}
        onSearchChange={setSearch}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        txnType={txnType}
        onTxnTypeChange={setTxnType}
        onReset={handleReset}
        onQuickDateFilter={handleQuickDateFilter}
        activeQuickFilter={activeQuickFilter}
      />

      {/* Ledger Statement Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <LedgerTable entries={ledgerData?.entries || []} loading={loading} />
      )}
    </Box>
  );
};

export default PartyLedgerView;
