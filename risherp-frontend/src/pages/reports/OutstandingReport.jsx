import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';

import reportService from '../../services/reportService';
import outstandingService from '../../services/outstandingService';
import PageHeader from '../../components/common/PageHeader';
import ReportFilters from '../../components/reports/ReportFilters';
import ReportSummaryCards from '../../components/reports/ReportSummaryCards';
import ReportTable from '../../components/reports/ReportTable';
import ExportButtons from '../../components/reports/ExportButtons';

const OutstandingReport = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isSupplierInit = location.pathname.includes('/suppliers');
  const [activeTab, setActiveTab] = useState(isSupplierInit ? 1 : 0);

  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [customerTotal, setCustomerTotal] = useState(0);

  const [suppliers, setSuppliers] = useState([]);
  const [supplierTotal, setSupplierTotal] = useState(0);

  const [summary, setSummary] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Fetch Summary on mount
  useEffect(() => {
    outstandingService.getOutstandingSummary().then(setSummary).catch(console.error);
  }, []);

  const fetchOutstandingData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 0) {
        const res = await reportService.getCustomerOutstandingReport({
          search: search || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          page,
          size: rowsPerPage,
        });
        setCustomers(res.content || []);
        setCustomerTotal(res.totalElements || 0);
      } else {
        const res = await reportService.getSupplierOutstandingReport({
          search: search || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          page,
          size: rowsPerPage,
        });
        setSuppliers(res.content || []);
        setSupplierTotal(res.totalElements || 0);
      }
    } catch (err) {
      console.error('Failed to load outstanding report', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, dateFrom, dateTo, page, rowsPerPage]);

  useEffect(() => {
    fetchOutstandingData();
  }, [fetchOutstandingData]);

  const handleTabChange = (_, val) => {
    setActiveTab(val);
    setPage(0);
    navigate(val === 0 ? '/reports/outstanding/customers' : '/reports/outstanding/suppliers', { replace: true });
  };

  const handleResetFilters = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  const handleExportPdf = async () => {
    setPdfLoading(true);
    try {
      const type = activeTab === 0 ? 'CUSTOMER' : 'SUPPLIER';
      const blob = await reportService.downloadOutstandingReportPdf({
        type,
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `OutstandingReport_${type}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export PDF', err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleExportCsv = () => {
    setCsvLoading(true);
    try {
      let csvContent = 'data:text/csv;charset=utf-8,';
      if (activeTab === 0) {
        csvContent += 'Customer Name,Phone,Opening Balance,Total Sales (+),Total Receipts (-),Total Returns (-),Net Outstanding\n';
        customers.forEach((r) => {
          csvContent += `"${r.partyName}","${r.phone || ''}","${r.openingBalance}","${r.totalSales}","${r.totalReceipts}","${r.totalSalesReturns}","${r.netOutstanding}"\n`;
        });
      } else {
        csvContent += 'Supplier Name,Phone,Opening Balance,Total Purchases (+),Total Payments (-),Total Returns (-),Net Outstanding\n';
        suppliers.forEach((r) => {
          csvContent += `"${r.partyName}","${r.phone || ''}","${r.openingBalance}","${r.totalPurchases}","${r.totalPayments}","${r.totalPurchaseReturns}","${r.netOutstanding}"\n`;
        });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Outstanding_Report_${activeTab === 0 ? 'Customers' : 'Suppliers'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export CSV', err);
    } finally {
      setCsvLoading(false);
    }
  };

  const fmt = (val) => {
    if (val == null) return '₹ 0.00';
    return `₹ ${parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const kpiCards = summary
    ? [
        {
          title: 'Customer Receivables',
          value: fmt(summary.totalCustomerReceivables),
          icon: <RequestQuoteOutlinedIcon />,
          color: 'warning',
        },
        {
          title: 'Supplier Payables',
          value: fmt(summary.totalSupplierPayables),
          icon: <AccountBalanceWalletOutlinedIcon />,
          color: 'error',
        },
        {
          title: 'Net Position',
          value: fmt(summary.netPosition),
          icon: <TrendingUpOutlinedIcon />,
          color: summary.netPosition >= 0 ? 'success' : 'error',
          subtitle: summary.netPosition >= 0 ? 'Net Asset / Surplus' : 'Net Liability / Deficit',
        },
      ]
    : [];

  const customerColumns = [
    { id: 'partyName', label: 'Customer Name', bold: true, minWidth: 160 },
    { id: 'phone', label: 'Phone', minWidth: 120 },
    { id: 'openingBalance', label: 'Opening Bal', format: 'currency', align: 'right', minWidth: 110 },
    { id: 'totalSales', label: 'Total Sales (+)', format: 'currency', align: 'right', minWidth: 120 },
    { id: 'totalReceipts', label: 'Receipts (-)', format: 'currency', align: 'right', minWidth: 110 },
    { id: 'totalSalesReturns', label: 'Returns (-)', format: 'currency', align: 'right', minWidth: 110 },
    { id: 'netOutstanding', label: 'Net Outstanding', format: 'currency', align: 'right', bold: true, minWidth: 130 },
    {
      id: 'actions',
      label: 'Statement',
      minWidth: 90,
      align: 'center',
      render: (row) => (
        <Tooltip title="View Customer Ledger Statement">
          <IconButton size="small" onClick={() => navigate(`/ledger/customer/${row.partyId}`)}>
            <VisibilityOutlinedIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const supplierColumns = [
    { id: 'partyName', label: 'Supplier Name', bold: true, minWidth: 160 },
    { id: 'phone', label: 'Phone', minWidth: 120 },
    { id: 'openingBalance', label: 'Opening Bal', format: 'currency', align: 'right', minWidth: 110 },
    { id: 'totalPurchases', label: 'Total Purchases (+)', format: 'currency', align: 'right', minWidth: 130 },
    { id: 'totalPayments', label: 'Payments (-)', format: 'currency', align: 'right', minWidth: 110 },
    { id: 'totalPurchaseReturns', label: 'Returns (-)', format: 'currency', align: 'right', minWidth: 110 },
    { id: 'netOutstanding', label: 'Net Outstanding', format: 'currency', align: 'right', bold: true, minWidth: 130 },
    {
      id: 'actions',
      label: 'Statement',
      minWidth: 90,
      align: 'center',
      render: (row) => (
        <Tooltip title="View Supplier Ledger Statement">
          <IconButton size="small" onClick={() => navigate(`/ledger/supplier/${row.partyId}`)}>
            <VisibilityOutlinedIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Standard Header with Export Actions */}
      <PageHeader
        title="Outstanding Balances Report"
        subtitle="Live receivables and payables reconciliations derived from opening balances, sales, purchases, returns, and payment ledgers."
        actions={
          <ExportButtons
            onPdf={handleExportPdf}
            onCsv={handleExportCsv}
            pdfLoading={pdfLoading}
            csvLoading={csvLoading}
          />
        }
      />

      {/* Tabs */}
      <Paper sx={{ mb: 2.5, borderBottom: 1, borderColor: 'divider' }} elevation={0}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Customer Receivables" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Supplier Payables" sx={{ fontWeight: 700, textTransform: 'none' }} />
        </Tabs>
      </Paper>

      {/* Stats Cards */}
      <ReportSummaryCards cards={kpiCards} loading={loading} />

      {/* FilterBar with Search and Relevant Filters */}
      <ReportFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={(v) => { setDateFrom(v); setPage(0); }}
        onDateToChange={(v) => { setDateTo(v); setPage(0); }}
        onReset={handleResetFilters}
      />

      {/* Table */}
      {activeTab === 0 ? (
        <ReportTable
          columns={customerColumns}
          data={customers}
          loading={loading}
          totalElements={customerTotal}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(p) => setPage(p)}
          onRowsPerPageChange={(s) => { setRowsPerPage(s); setPage(0); }}
          emptyMessage="No customer accounts with outstanding balances found."
        />
      ) : (
        <ReportTable
          columns={supplierColumns}
          data={suppliers}
          loading={loading}
          totalElements={supplierTotal}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(p) => setPage(p)}
          onRowsPerPageChange={(s) => { setRowsPerPage(s); setPage(0); }}
          emptyMessage="No supplier accounts with outstanding balances found."
        />
      )}
    </Box>
  );
};

export default OutstandingReport;
