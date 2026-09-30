import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';

import reportService from '../../services/reportService';
import partyService from '../../services/partyService';
import categoryService from '../../services/categoryService';
import PageHeader from '../../components/common/PageHeader';
import ReportFilters from '../../components/reports/ReportFilters';
import ReportSummaryCards from '../../components/reports/ReportSummaryCards';
import ReportTable from '../../components/reports/ReportTable';
import ExportButtons from '../../components/reports/ExportButtons';

const SalesReport = () => {
  const navigate = useNavigate();

  // Tabs: 0 = Invoices, 1 = Item-wise, 2 = Customer-wise, 3 = Daily Summary
  const [activeTab, setActiveTab] = useState(0);

  // Filters State
  const [datePreset, setDatePreset] = useState('THIS_MONTH');
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [partyId, setPartyId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [status, setStatus] = useState('');

  // Dropdown options
  const [parties, setParties] = useState([]);
  const [categories, setCategories] = useState([]);

  // Data & Loading States
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  // Invoices Tab State
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState('saleDate');
  const [sortDir, setSortDir] = useState('desc');

  // Breakdown Tabs Data
  const [itemWiseData, setItemWiseData] = useState([]);
  const [partyWiseData, setPartyWiseData] = useState([]);
  const [dailyData, setDailyData] = useState([]);

  // Load parties & categories on mount
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [partiesRes, categoriesRes] = await Promise.all([
          partyService.getParties({ type: 'CUSTOMER', size: 100 }),
          categoryService.getAllActiveCategories(),
        ]);
        const partyList = partiesRes?.data?.content || partiesRes?.content || partiesRes?.data || (Array.isArray(partiesRes) ? partiesRes : []);
        const catList = categoriesRes?.data || categoriesRes?.content || (Array.isArray(categoriesRes) ? categoriesRes : []);
        setParties(partyList);
        setCategories(catList);
      } catch (err) {
        console.error('Failed to load filter dropdowns', err);
      }
    };
    loadDropdowns();
  }, []);

  // Fetch Report Data
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 0) {
        const res = await reportService.getSalesReport({
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          partyId: partyId || undefined,
          categoryId: categoryId || undefined,
          paymentStatus: paymentStatus || undefined,
          status: status || undefined,
          search: search || undefined,
          page,
          size: rowsPerPage,
          sort: `${sortBy},${sortDir}`,
        });
        setInvoices(res.data || []);
        setSummary(res.summary || null);
        setTotalElements(res.totalElements || 0);
      } else if (activeTab === 1) {
        const items = await reportService.getItemWiseSales({
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          categoryId: categoryId || undefined,
          search: search || undefined,
        });
        setItemWiseData(items || []);
      } else if (activeTab === 2) {
        const pWise = await reportService.getPartyWiseSales({
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          search: search || undefined,
        });
        setPartyWiseData(pWise || []);
      } else if (activeTab === 3) {
        const daily = await reportService.getDailySales({
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        });
        setDailyData(daily || []);
      }
    } catch (err) {
      console.error('Failed to load sales report', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, dateFrom, dateTo, partyId, categoryId, paymentStatus, status, search, page, rowsPerPage, sortBy, sortDir]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Handle Quick Date Preset Change
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
    setCategoryId('');
    setPaymentStatus('');
    setStatus('');
    setPage(0);
  };

  // PDF Export
  const handleExportPdf = async () => {
    setPdfLoading(true);
    try {
      const blob = await reportService.downloadSalesReportPdf({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        partyId: partyId || undefined,
        categoryId: categoryId || undefined,
        paymentStatus: paymentStatus || undefined,
        status: status || undefined,
        search: search || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SalesReport_${dateFrom || 'all'}_to_${dateTo || 'all'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export PDF', err);
    } finally {
      setPdfLoading(false);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    setCsvLoading(true);
    try {
      let csvContent = 'data:text/csv;charset=utf-8,';
      if (activeTab === 0) {
        csvContent += 'Invoice Number,Date,Customer,Sale Type,Subtotal,Discount,Grand Total,Paid,Balance,Payment Status,Status\n';
        invoices.forEach((r) => {
          csvContent += `"${r.invoiceNumber}","${r.saleDate}","${r.partyName}","${r.saleType}","${r.subtotal}","${r.discountAmount}","${r.grandTotal}","${r.paidAmount}","${r.balanceAmount}","${r.paymentStatus}","${r.status}"\n`;
        });
      } else if (activeTab === 1) {
        csvContent += 'Item Code,Item Name,Category,Quantity Sold,Gross Sales,Discount,Net Sales,Average Rate\n';
        itemWiseData.forEach((r) => {
          csvContent += `"${r.itemCode}","${r.itemName}","${r.categoryName}","${r.quantitySold}","${r.grossSales}","${r.discount}","${r.netSales}","${r.averageRate}"\n`;
        });
      } else if (activeTab === 2) {
        csvContent += 'Customer,Phone,Invoices,Gross Sales,Discount,Net Sales,Paid,Outstanding\n';
        partyWiseData.forEach((r) => {
          csvContent += `"${r.partyName}","${r.phone || ''}","${r.invoiceCount}","${r.grossSales}","${r.discount}","${r.netSales}","${r.paidAmount}","${r.outstandingAmount}"\n`;
        });
      } else if (activeTab === 3) {
        csvContent += 'Date,Invoices,Total Sales,Total Discount,Total Paid,Outstanding\n';
        dailyData.forEach((r) => {
          csvContent += `"${r.date}","${r.invoiceCount}","${r.totalSales}","${r.totalDiscount}","${r.totalPaid}","${r.outstanding}"\n`;
        });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Sales_Report_${activeTab}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export CSV', err);
    } finally {
      setCsvLoading(false);
    }
  };

  // Format currency
  const fmt = (val) => {
    if (val == null) return '₹ 0.00';
    return `₹ ${parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // KPI Cards
  const kpiCards = summary
    ? [
        {
          title: 'Total Invoices',
          value: summary.totalInvoices,
          icon: <ReceiptOutlinedIcon />,
          color: 'primary',
        },
        {
          title: 'Total Sales',
          value: fmt(summary.totalSales),
          icon: <AttachMoneyOutlinedIcon />,
          color: 'success',
        },
        {
          title: 'Total Discount',
          value: fmt(summary.totalDiscount),
          icon: <PercentOutlinedIcon />,
          color: 'warning',
        },
        {
          title: 'Total Paid',
          value: fmt(summary.totalPaid),
          icon: <AccountBalanceWalletOutlinedIcon />,
          color: 'info',
        },
        {
          title: 'Total Outstanding',
          value: fmt(summary.totalOutstanding),
          icon: <HourglassEmptyOutlinedIcon />,
          color: 'error',
        },
        {
          title: 'Avg Invoice',
          value: fmt(summary.averageInvoiceValue),
          icon: <TrendingUpOutlinedIcon />,
          color: 'secondary',
        },
      ]
    : [];

  // Table Columns Definition
  const invoiceColumns = [
    { id: 'invoiceNumber', label: 'Invoice #', bold: true, minWidth: 120 },
    { id: 'saleDate', label: 'Date', format: 'date', minWidth: 100 },
    { id: 'partyName', label: 'Customer', minWidth: 150 },
    { id: 'saleType', label: 'Type', minWidth: 90 },
    { id: 'subtotal', label: 'Subtotal', format: 'currency', align: 'right', minWidth: 100 },
    { id: 'discountAmount', label: 'Discount', format: 'currency', align: 'right', minWidth: 90 },
    { id: 'grandTotal', label: 'Grand Total', format: 'currency', align: 'right', bold: true, minWidth: 110 },
    { id: 'paidAmount', label: 'Paid', format: 'currency', align: 'right', minWidth: 100 },
    { id: 'balanceAmount', label: 'Balance', format: 'currency', align: 'right', minWidth: 100 },
    { id: 'paymentStatus', label: 'Payment', format: 'status', minWidth: 90 },
    { id: 'status', label: 'Status', format: 'status', minWidth: 90 },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 70,
      render: (row) => (
        <Tooltip title="View Invoice Details">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/sales/${row.id}`); }}>
            <VisibilityOutlinedIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const itemColumns = [
    { id: 'itemCode', label: 'Item Code', bold: true, minWidth: 110 },
    { id: 'itemName', label: 'Item Name', minWidth: 180 },
    { id: 'categoryName', label: 'Category', minWidth: 120 },
    { id: 'quantitySold', label: 'Qty Sold', format: 'qty', align: 'right', minWidth: 100 },
    { id: 'grossSales', label: 'Gross Sales', format: 'currency', align: 'right', minWidth: 120 },
    { id: 'discount', label: 'Discount', format: 'currency', align: 'right', minWidth: 100 },
    { id: 'netSales', label: 'Net Sales', format: 'currency', align: 'right', bold: true, minWidth: 120 },
    { id: 'averageRate', label: 'Avg Rate', format: 'currency', align: 'right', minWidth: 100 },
  ];

  const partyColumns = [
    { id: 'partyName', label: 'Customer Name', bold: true, minWidth: 160 },
    { id: 'phone', label: 'Phone', minWidth: 120 },
    { id: 'invoiceCount', label: 'Invoices', align: 'center', minWidth: 90 },
    { id: 'grossSales', label: 'Gross Sales', format: 'currency', align: 'right', minWidth: 120 },
    { id: 'discount', label: 'Discount', format: 'currency', align: 'right', minWidth: 100 },
    { id: 'netSales', label: 'Net Sales', format: 'currency', align: 'right', bold: true, minWidth: 120 },
    { id: 'paidAmount', label: 'Paid', format: 'currency', align: 'right', minWidth: 110 },
    { id: 'outstandingAmount', label: 'Outstanding', format: 'currency', align: 'right', minWidth: 110 },
  ];

  const dailyColumns = [
    { id: 'date', label: 'Date', format: 'date', bold: true, minWidth: 120 },
    { id: 'invoiceCount', label: 'Invoices', align: 'center', minWidth: 100 },
    { id: 'totalSales', label: 'Total Sales', format: 'currency', align: 'right', bold: true, minWidth: 130 },
    { id: 'totalDiscount', label: 'Discount', format: 'currency', align: 'right', minWidth: 110 },
    { id: 'totalPaid', label: 'Total Paid', format: 'currency', align: 'right', minWidth: 120 },
    { id: 'outstanding', label: 'Outstanding', format: 'currency', align: 'right', minWidth: 120 },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Standard Header with Export Actions */}
      <PageHeader
        title="Sales Report"
        subtitle="Comprehensive sales performance, customer breakdowns, and daily invoice summaries."
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
          onChange={(_, v) => { setActiveTab(v); setPage(0); }}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Sales Invoices" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Item-wise Sales" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Customer-wise Sales" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Daily Summary" sx={{ fontWeight: 700, textTransform: 'none' }} />
        </Tabs>
      </Paper>

      {/* Stats Cards */}
      {activeTab === 0 && <ReportSummaryCards cards={kpiCards} loading={loading} />}

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
        showParty={activeTab === 0}
        categoryId={categoryId}
        onCategoryChange={(v) => { setCategoryId(v); setPage(0); }}
        categories={categories}
        showCategory={activeTab === 0 || activeTab === 1}
        paymentStatus={paymentStatus}
        onPaymentStatusChange={(v) => { setPaymentStatus(v); setPage(0); }}
        showPaymentStatus={activeTab === 0}
        status={status}
        onStatusChange={(v) => { setStatus(v); setPage(0); }}
        statusOptions={[
          { value: 'COMPLETED', label: 'COMPLETED' },
          { value: 'CANCELLED', label: 'CANCELLED' },
        ]}
        showStatus={activeTab === 0}
        onReset={handleResetFilters}
      />

      {/* Report Table View */}
      {activeTab === 0 && (
        <ReportTable
          columns={invoiceColumns}
          data={invoices}
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
          onRowClick={(r) => navigate(`/sales/${r.id}`)}
          emptyMessage="No sales invoices found for the selected period."
        />
      )}

      {activeTab === 1 && (
        <ReportTable
          columns={itemColumns}
          data={itemWiseData}
          loading={loading}
          totalElements={itemWiseData.length}
          emptyMessage="No item sales recorded for the selected period."
        />
      )}

      {activeTab === 2 && (
        <ReportTable
          columns={partyColumns}
          data={partyWiseData}
          loading={loading}
          totalElements={partyWiseData.length}
          emptyMessage="No customer sales aggregated for the selected period."
        />
      )}

      {activeTab === 3 && (
        <ReportTable
          columns={dailyColumns}
          data={dailyData}
          loading={loading}
          totalElements={dailyData.length}
          emptyMessage="No daily sales data available for the selected period."
        />
      )}
    </Box>
  );
};

export default SalesReport;
