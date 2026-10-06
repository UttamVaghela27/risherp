import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import CurrencyExchangeOutlinedIcon from '@mui/icons-material/CurrencyExchangeOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';

import reportService from '../../services/reportService';
import partyService from '../../services/partyService';
import PageHeader from '../../components/common/PageHeader';
import ReportFilters from '../../components/reports/ReportFilters';
import ReportSummaryCards from '../../components/reports/ReportSummaryCards';
import ReportTable from '../../components/reports/ReportTable';
import ExportButtons from '../../components/reports/ExportButtons';

const PurchaseReturnReport = () => {
  const navigate = useNavigate();

  const [datePreset, setDatePreset] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [partyId, setPartyId] = useState('');
  const [status, setStatus] = useState('');

  const [suppliers, setSuppliers] = useState([]);
  const [returns, setReturns] = useState([]);
  const [summary, setSummary] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState('returnDate');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    partyService.getParties({ type: 'SUPPLIER', size: 100 }).then((res) => {
      const list = res?.data?.content || res?.content || res?.data || (Array.isArray(res) ? res : []);
      setSuppliers(list);
    }).catch(console.error);
  }, []);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportService.getPurchaseReturnReport({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        partyId: partyId || undefined,
        status: status || undefined,
        search: search || undefined,
        page,
        size: rowsPerPage,
        sort: `${sortBy},${sortDir}`,
      });
      setReturns(res.data || []);
      setSummary(res.summary || null);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error('Failed to load purchase return report', err);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, partyId, status, search, page, rowsPerPage, sortBy, sortDir]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

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
    setStatus('');
    setPage(0);
  };

  const handleExportPdf = async () => {
    setPdfLoading(true);
    try {
      const blob = await reportService.downloadPurchaseReturnReportPdf({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        partyId: partyId || undefined,
        status: status || undefined,
        search: search || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PurchaseReturnReport_${dateFrom || 'all'}_to_${dateTo || 'all'}.pdf`);
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
      csvContent += 'Return Number,Date,Supplier,Total Amount,Refund Recovered,Debit Adjusted,Status\n';
      returns.forEach((r) => {
        csvContent += `"${r.returnNumber}","${r.returnDate}","${r.partyName}","${r.totalAmount}","${r.refundAmount}","${r.adjustedAmount}","${r.status}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Purchase_Return_Report_${dateFrom}_to_${dateTo}.csv`);
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
          title: 'Total Returns',
          value: summary.totalReturns,
          icon: <UndoOutlinedIcon />,
          color: 'primary',
        },
        {
          title: 'Total Returned Value',
          value: fmt(summary.totalReturnAmount ?? summary.totalAmount),
          icon: <AttachMoneyOutlinedIcon />,
          color: 'error',
        },
        {
          title: 'Cash Recovered',
          value: fmt(summary.totalRefundAmount ?? summary.refundAmount),
          icon: <CurrencyExchangeOutlinedIcon />,
          color: 'success',
        },
        {
          title: 'Debit Adjusted',
          value: fmt(summary.totalAdjustmentAmount ?? summary.adjustedAmount),
          icon: <TuneOutlinedIcon />,
          color: 'info',
        },
      ]
    : [];

  const columns = [
    { id: 'returnNumber', label: 'Return #', bold: true, minWidth: 120 },
    { id: 'returnDate', label: 'Date', format: 'date', minWidth: 100 },
    { id: 'partyName', label: 'Supplier Name', minWidth: 160 },
    { id: 'totalAmount', label: 'Return Value', format: 'currency', align: 'right', bold: true, minWidth: 120 },
    { id: 'refundAmount', label: 'Refund Recovered', format: 'currency', align: 'right', minWidth: 120 },
    { id: 'adjustedAmount', label: 'Debit Adjusted', format: 'currency', align: 'right', minWidth: 120 },
    { id: 'status', label: 'Status', format: 'status', align: 'center', minWidth: 100 },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 70,
      render: (row) => (
        <Tooltip title="View Purchase Return Details">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/purchases/returns/${row.id}`); }}>
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
        title="Purchase Returns Report"
        subtitle="Debit notes and goods returned to vendors, cash refund recoveries, and bill debit adjustments."
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
        parties={suppliers}
        partyLabel="Supplier"
        showParty={true}
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
        data={returns}
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
        onRowClick={(r) => navigate(`/purchases/returns/${r.id}`)}
        emptyMessage="No purchase returns found matching the selected filters."
      />
    </Box>
  );
};

export default PurchaseReturnReport;
