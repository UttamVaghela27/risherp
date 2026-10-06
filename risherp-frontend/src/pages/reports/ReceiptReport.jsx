import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

import reportService from '../../services/reportService';
import partyService from '../../services/partyService';
import PageHeader from '../../components/common/PageHeader';
import ReportFilters from '../../components/reports/ReportFilters';
import ReportSummaryCards from '../../components/reports/ReportSummaryCards';
import ReportTable from '../../components/reports/ReportTable';
import ExportButtons from '../../components/reports/ExportButtons';

const ReceiptReport = () => {
  const navigate = useNavigate();

  const [datePreset, setDatePreset] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [partyId, setPartyId] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [status, setStatus] = useState('');

  const [parties, setParties] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState('receiptDate');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    partyService.getParties({ type: 'CUSTOMER', size: 100 }).then((res) => {
      const list = res?.data?.content || res?.content || res?.data || (Array.isArray(res) ? res : []);
      setParties(list);
    }).catch(console.error);
  }, []);

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportService.getReceiptReport({
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
      setReceipts(res.data || []);
      setSummary(res.summary || null);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error('Failed to load receipts report', err);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, partyId, paymentMode, status, search, page, rowsPerPage, sortBy, sortDir]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

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
      const blob = await reportService.downloadReceiptReportPdf({
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
      link.setAttribute('download', `ReceiptReport_${dateFrom || 'all'}_to_${dateTo || 'all'}.pdf`);
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
      csvContent += 'Receipt Number,Date,Customer,Amount,Payment Mode,Reference / UTR,Allocated Amount,Unallocated Amount,Status\n';
      receipts.forEach((r) => {
        csvContent += `"${r.receiptNumber}","${r.receiptDate}","${r.partyName}","${r.amount}","${r.paymentMode}","${r.referenceNumber || ''}","${r.allocatedAmount}","${r.unallocatedAmount}","${r.status}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Receipt_Report_${dateFrom}_to_${dateTo}.csv`);
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
          title: 'Total Receipts',
          value: summary.totalReceipts,
          icon: <ReceiptLongOutlinedIcon />,
          color: 'primary',
        },
        {
          title: 'Total Collected',
          value: fmt(summary.totalAmount ?? summary.totalCollected),
          icon: <AttachMoneyOutlinedIcon />,
          color: 'success',
        },
        {
          title: 'Bank Collections',
          value: fmt(summary.bankAmount ?? summary.bankCollected),
          icon: <AccountBalanceOutlinedIcon />,
          color: 'info',
        },
        {
          title: 'UPI Collections',
          value: fmt(summary.upiAmount ?? summary.upiCollected),
          icon: <QrCodeScannerOutlinedIcon />,
          color: 'secondary',
        },
        {
          title: 'Cash Collections',
          value: fmt(summary.cashAmount ?? summary.cashCollected),
          icon: <PaymentsOutlinedIcon />,
          color: 'warning',
        },
        {
          title: 'Allocated Amount',
          value: fmt(summary.allocatedAmount),
          icon: <CheckCircleOutlineOutlinedIcon />,
          color: 'success',
        },
      ]
    : [];

  const columns = [
    { id: 'receiptNumber', label: 'Receipt #', bold: true, minWidth: 120 },
    { id: 'receiptDate', label: 'Date', format: 'date', minWidth: 100 },
    { id: 'partyName', label: 'Customer Name', minWidth: 160 },
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
        <Tooltip title="View Receipt Details">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/receipts/${row.id}`); }}>
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
        title="Customer Receipts Report"
        subtitle="Inflow payment collections, mode summaries (Cash, Bank, UPI, Cheque), and invoice allocation tracking."
        actions={
          <ExportButtons
            onPdf={handleExportPdf}
            onCsv={handleExportCsv}
            pdfLoading={pdfLoading}
            csvLoading={csvLoading}
          />
        }
      />

      {/* Stats Cards */}
      <ReportSummaryCards cards={kpiCards} loading={loading} />

      {/* FilterBar with Search and Relevant Filters */}
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
        parties={parties}
        partyLabel="Customer"
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

      {/* Table */}
      <ReportTable
        columns={columns}
        data={receipts}
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
        onRowClick={(r) => navigate(`/receipts/${r.id}`)}
        emptyMessage="No customer receipts found matching the selected filters."
      />
    </Box>
  );
};

export default ReceiptReport;
