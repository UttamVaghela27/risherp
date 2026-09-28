import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import MoneyOffOutlinedIcon from '@mui/icons-material/MoneyOffOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

import reportService from '../../services/reportService';
import partyService from '../../services/partyService';
import ReportFilters from '../../components/reports/ReportFilters';
import ReportSummaryCards from '../../components/reports/ReportSummaryCards';
import ReportTable from '../../components/reports/ReportTable';
import ExportButtons from '../../components/reports/ExportButtons';

const PaymentReport = () => {
  const navigate = useNavigate();

  const [datePreset, setDatePreset] = useState('THIS_MONTH');
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [partyId, setPartyId] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [status, setStatus] = useState('');

  const [suppliers, setSuppliers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState('paymentDate');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    partyService.getParties({ type: 'SUPPLIER', size: 100 }).then((res) => {
      setSuppliers(res.content || []);
    }).catch(console.error);
  }, []);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportService.getPaymentReport({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        partyId: partyId || undefined,
        paymentMode: paymentMode || undefined,
        status: status || undefined,
        search: search || undefined,
        page,
        size: rowsPerPage,
        sort: `${sortBy},${sortDir}`,
      });
      setPayments(res.data || []);
      setSummary(res.summary || null);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error('Failed to load payments report', err);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, partyId, paymentMode, status, search, page, rowsPerPage, sortBy, sortDir]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handlePresetChange = (preset, from, to) => {
    setDatePreset(preset);
    setDateFrom(from);
    setDateTo(to);
    setPage(0);
  };

  const handleResetFilters = () => {
    setDatePreset('ALL');
    setDateFrom('');
    setDateTo('');
    setSearch('');
    setPartyId('');
    setPaymentMode('');
    setStatus('');
    setPage(0);
  };

  const handleExportPdf = async () => {
    setPdfLoading(true);
    try {
      const blob = await reportService.downloadPaymentReportPdf({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        partyId: partyId || undefined,
        paymentMode: paymentMode || undefined,
        status: status || undefined,
        search: search || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PaymentReport_${dateFrom || 'all'}_to_${dateTo || 'all'}.pdf`);
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
      csvContent += 'Payment Number,Date,Supplier,Amount,Payment Mode,Reference Number,Allocated Amount,Unallocated Amount,Status,Created By\n';
      payments.forEach((r) => {
        csvContent += `"${r.paymentNumber}","${r.paymentDate}","${r.partyName}","${r.amount}","${r.paymentMode}","${r.referenceNumber || ''}","${r.allocatedAmount}","${r.unallocatedAmount}","${r.status}","${r.createdBy}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'Payment_Report.csv');
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
          title: 'Total Payments',
          value: summary.totalPayments,
          icon: <PaymentsOutlinedIcon />,
          color: 'primary',
        },
        {
          title: 'Total Disbursed',
          value: fmt(summary.totalAmount),
          icon: <MoneyOffOutlinedIcon />,
          color: 'error',
        },
        {
          title: 'Cash Outflows',
          value: fmt(summary.cashAmount),
          icon: <AttachMoneyOutlinedIcon />,
          color: 'info',
        },
        {
          title: 'Bank Transfers',
          value: fmt(summary.bankAmount),
          icon: <AccountBalanceOutlinedIcon />,
          color: 'secondary',
        },
        {
          title: 'UPI Payments',
          value: fmt(summary.upiAmount),
          icon: <QrCodeScannerOutlinedIcon />,
          color: 'warning',
        },
        {
          title: 'Allocated to Purchases',
          value: fmt(summary.allocatedAmount),
          icon: <CheckCircleOutlineOutlinedIcon />,
          color: 'success',
        },
      ]
    : [];

  const columns = [
    { id: 'paymentNumber', label: 'Payment #', bold: true, minWidth: 120 },
    { id: 'paymentDate', label: 'Date', format: 'date', minWidth: 100 },
    { id: 'partyName', label: 'Supplier Name', minWidth: 160 },
    { id: 'amount', label: 'Amount', format: 'currency', align: 'right', bold: true, minWidth: 120 },
    { id: 'paymentMode', label: 'Mode', minWidth: 110 },
    { id: 'referenceNumber', label: 'Reference / UTR', minWidth: 130 },
    { id: 'allocatedAmount', label: 'Allocated', format: 'currency', align: 'right', minWidth: 110 },
    { id: 'unallocatedAmount', label: 'Unallocated', format: 'currency', align: 'right', minWidth: 110 },
    { id: 'status', label: 'Status', format: 'status', align: 'center', minWidth: 100 },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 70,
      render: (row) => (
        <Tooltip title="View Payment Details">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/payments/${row.id}`); }}>
            <VisibilityOutlinedIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="text.primary">
            Supplier Payments Report
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Outflow supplier disbursements, payment mode breakdown, and invoice allocation auditing.
          </Typography>
        </Box>
        <ExportButtons
          onPdf={handleExportPdf}
          onCsv={handleExportCsv}
          pdfLoading={pdfLoading}
          csvLoading={csvLoading}
        />
      </Box>

      {/* Filters */}
      <ReportFilters
        datePreset={datePreset}
        onPresetChange={handlePresetChange}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={(v) => { setDateFrom(v); setPage(0); }}
        onDateToChange={(v) => { setDateTo(v); setPage(0); }}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        partyId={partyId}
        onPartyChange={(v) => { setPartyId(v); setPage(0); }}
        parties={suppliers}
        partyLabel="Supplier"
        showParty={true}
        paymentMode={paymentMode}
        onPaymentModeChange={(v) => { setPaymentMode(v); setPage(0); }}
        showPaymentMode={true}
        status={status}
        onStatusChange={(v) => { setStatus(v); setPage(0); }}
        statusOptions={[
          { value: 'COMPLETED', label: 'COMPLETED' },
          { value: 'CANCELLED', label: 'CANCELLED' },
        ]}
        showStatus={true}
        onReset={handleResetFilters}
      />

      {/* KPI Cards */}
      <ReportSummaryCards cards={kpiCards} loading={loading} />

      {/* Table */}
      <ReportTable
        columns={columns}
        data={payments}
        loading={loading}
        totalElements={totalElements}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(p) => setPage(p)}
        onRowsPerPageChange={(s) => { setRowsPerPage(s); setPage(0); }}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={(col) => {
          if (sortBy === col) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
          } else {
            setSortBy(col);
            setSortDir('asc');
          }
        }}
        onRowClick={(r) => navigate(`/payments/${r.id}`)}
        emptyMessage="No supplier payments found matching the selected filters."
      />
    </Box>
  );
};

export default PaymentReport;
