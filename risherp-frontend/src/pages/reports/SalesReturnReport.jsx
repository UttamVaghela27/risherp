import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import CurrencyExchangeOutlinedIcon from '@mui/icons-material/CurrencyExchangeOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';

import reportService from '../../services/reportService';
import partyService from '../../services/partyService';
import ReportFilters from '../../components/reports/ReportFilters';
import ReportSummaryCards from '../../components/reports/ReportSummaryCards';
import ReportTable from '../../components/reports/ReportTable';
import ExportButtons from '../../components/reports/ExportButtons';

const SalesReturnReport = () => {
  const navigate = useNavigate();

  const [datePreset, setDatePreset] = useState('THIS_MONTH');
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [partyId, setPartyId] = useState('');
  const [status, setStatus] = useState('');

  const [parties, setParties] = useState([]);
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
    partyService.getParties({ type: 'CUSTOMER', size: 100 }).then((res) => {
      setParties(res.content || []);
    }).catch(console.error);
  }, []);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportService.getSalesReturnReport({
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
      console.error('Failed to load sales return report', err);
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
      const blob = await reportService.downloadSalesReturnReportPdf({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        partyId: partyId || undefined,
        status: status || undefined,
        search: search || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SalesReturnReport_${dateFrom || 'all'}_to_${dateTo || 'all'}.pdf`);
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
      csvContent += 'Return Number,Return Date,Original Invoice,Customer,Return Amount,Refund Amount,Adjustment Amount,Reason,Status,Created By\n';
      returns.forEach((r) => {
        csvContent += `"${r.returnNumber}","${r.returnDate}","${r.invoiceNumber}","${r.partyName}","${r.returnAmount}","${r.refundAmount}","${r.adjustmentAmount}","${r.reason || ''}","${r.status}","${r.createdBy}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'Sales_Return_Report.csv');
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
          title: 'Total Sales Returns',
          value: summary.totalReturns,
          icon: <AssignmentReturnOutlinedIcon />,
          color: 'primary',
        },
        {
          title: 'Total Return Value',
          value: fmt(summary.totalReturnAmount),
          icon: <AttachMoneyOutlinedIcon />,
          color: 'error',
        },
        {
          title: 'Total Refund Cash Out',
          value: fmt(summary.totalRefundAmount),
          icon: <CurrencyExchangeOutlinedIcon />,
          color: 'warning',
        },
        {
          title: 'Total Invoice Adjustments',
          value: fmt(summary.totalAdjustmentAmount),
          icon: <TuneOutlinedIcon />,
          color: 'info',
        },
      ]
    : [];

  const columns = [
    { id: 'returnNumber', label: 'Return #', bold: true, minWidth: 120 },
    { id: 'returnDate', label: 'Date', format: 'date', minWidth: 100 },
    { id: 'invoiceNumber', label: 'Invoice #', minWidth: 120 },
    { id: 'partyName', label: 'Customer Name', minWidth: 160 },
    { id: 'returnAmount', label: 'Return Amount', format: 'currency', align: 'right', bold: true, minWidth: 120 },
    { id: 'refundAmount', label: 'Refund', format: 'currency', align: 'right', minWidth: 110 },
    { id: 'adjustmentAmount', label: 'Adjustment', format: 'currency', align: 'right', minWidth: 110 },
    { id: 'reason', label: 'Reason', minWidth: 140 },
    { id: 'status', label: 'Status', format: 'status', align: 'center', minWidth: 100 },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 70,
      render: (row) => (
        <Tooltip title="View Sales Return Details">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/sales/returns/${row.id}`); }}>
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
            Sales Returns Report
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Credit notes and customer goods returned, cash refunds, invoice credit adjustments, and reason tracking.
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
        parties={parties}
        partyLabel="Customer"
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

      {/* KPI Cards */}
      <ReportSummaryCards cards={kpiCards} loading={loading} />

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
        onRowClick={(r) => navigate(`/sales/returns/${r.id}`)}
        emptyMessage="No sales returns found matching the selected filters."
      />
    </Box>
  );
};

export default SalesReturnReport;
