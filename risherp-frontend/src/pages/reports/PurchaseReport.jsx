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
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
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

const PurchaseReport = () => {
  const navigate = useNavigate();

  // Tabs: 0 = Invoices, 1 = Item-wise, 2 = Supplier-wise
  const [activeTab, setActiveTab] = useState(0);

  // Filters State
  const [datePreset, setDatePreset] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [status, setStatus] = useState('');

  // Dropdown options
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);

  // Data & Loading States
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  // Invoices Tab State
  const [purchases, setPurchases] = useState([]);
  const [summary, setSummary] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState('purchaseDate');
  const [sortDir, setSortDir] = useState('desc');

  // Breakdown Tabs Data
  const [itemWiseData, setItemWiseData] = useState([]);
  const [supplierWiseData, setSupplierWiseData] = useState([]);

  // Load suppliers & categories on mount
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [suppliersRes, categoriesRes] = await Promise.all([
          partyService.getParties({ type: 'SUPPLIER', size: 100 }),
          categoryService.getAllActiveCategories(),
        ]);
        const supplierList = suppliersRes?.data?.content || suppliersRes?.content || suppliersRes?.data || (Array.isArray(suppliersRes) ? suppliersRes : []);
        const catList = categoriesRes?.data || categoriesRes?.content || (Array.isArray(categoriesRes) ? categoriesRes : []);
        setSuppliers(supplierList);
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
        const res = await reportService.getPurchaseReport({
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          supplierId: supplierId || undefined,
          categoryId: categoryId || undefined,
          paymentStatus: paymentStatus || undefined,
          status: status || undefined,
          search: search || undefined,
          page,
          size: rowsPerPage,
          sort: `${sortBy},${sortDir}`,
        });
        setPurchases(res.data || []);
        setSummary(res.summary || null);
        setTotalElements(res.totalElements || 0);
      } else if (activeTab === 1) {
        const items = await reportService.getItemWisePurchases({
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          categoryId: categoryId || undefined,
          search: search || undefined,
        });
        setItemWiseData(items || []);
      } else if (activeTab === 2) {
        const sWise = await reportService.getSupplierWisePurchases({
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          search: search || undefined,
        });
        setSupplierWiseData(sWise || []);
      }
    } catch (err) {
      console.error('Failed to load purchase report', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, dateFrom, dateTo, supplierId, categoryId, paymentStatus, status, search, page, rowsPerPage, sortBy, sortDir]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

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
    setSupplierId('');
    setCategoryId('');
    setPaymentStatus('');
    setStatus('');
    setPage(0);
  };

  const handleExportPdf = async () => {
    setPdfLoading(true);
    try {
      const blob = await reportService.downloadPurchaseReportPdf({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        supplierId: supplierId || undefined,
        categoryId: categoryId || undefined,
        paymentStatus: paymentStatus || undefined,
        status: status || undefined,
        search: search || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PurchaseReport_${dateFrom || 'all'}_to_${dateTo || 'all'}.pdf`);
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
        csvContent += 'Purchase Number,Date,Supplier,Subtotal,Discount,Grand Total,Paid,Balance,Payment Status,Status\n';
        purchases.forEach((r) => {
          csvContent += `"${r.purchaseNumber}","${r.purchaseDate}","${r.partyName}","${r.subtotal}","${r.discountAmount}","${r.grandTotal}","${r.paidAmount}","${r.balanceAmount}","${r.paymentStatus}","${r.status}"\n`;
        });
      } else if (activeTab === 1) {
        csvContent += 'Item Code,Item Name,Category,Quantity Purchased,Gross Purchases,Discount,Net Purchases,Average Rate\n';
        itemWiseData.forEach((r) => {
          csvContent += `"${r.itemCode}","${r.itemName}","${r.categoryName}","${r.quantityPurchased}","${r.grossPurchases}","${r.discount}","${r.netPurchases}","${r.averageRate}"\n`;
        });
      } else if (activeTab === 2) {
        csvContent += 'Supplier,Phone,Invoices,Gross Purchases,Discount,Net Purchases,Paid,Outstanding\n';
        supplierWiseData.forEach((r) => {
          csvContent += `"${r.partyName}","${r.phone || ''}","${r.purchaseCount}","${r.grossPurchases}","${r.discount}","${r.netPurchases}","${r.paidAmount}","${r.outstandingAmount}"\n`;
        });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Purchase_Report_${activeTab}.csv`);
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
          title: 'Total Invoices',
          value: summary.totalPurchases,
          icon: <ShoppingBagOutlinedIcon />,
          color: 'primary',
        },
        {
          title: 'Total Purchases',
          value: fmt(summary.totalAmount),
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
          value: fmt(summary.totalPayable ?? summary.totalOutstanding),
          icon: <HourglassEmptyOutlinedIcon />,
          color: 'error',
        },
        {
          title: 'Avg Purchase',
          value: fmt(summary.averagePurchaseValue),
          icon: <TrendingUpOutlinedIcon />,
          color: 'secondary',
        },
      ]
    : [];

  const purchaseColumns = [
    { id: 'purchaseNumber', label: 'Purchase #', bold: true, minWidth: 120 },
    { id: 'purchaseDate', label: 'Date', format: 'date', minWidth: 100 },
    { id: 'partyName', label: 'Supplier', minWidth: 150 },
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
        <Tooltip title="View Purchase Details">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/purchases/${row.id}`); }}>
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
    { id: 'quantityPurchased', label: 'Qty Purchased', format: 'qty', align: 'right', minWidth: 110 },
    { id: 'grossPurchases', label: 'Gross Purchase', format: 'currency', align: 'right', minWidth: 120 },
    { id: 'discount', label: 'Discount', format: 'currency', align: 'right', minWidth: 100 },
    { id: 'netPurchases', label: 'Net Purchase', format: 'currency', align: 'right', bold: true, minWidth: 120 },
    { id: 'averageRate', label: 'Avg Rate', format: 'currency', align: 'right', minWidth: 100 },
  ];

  const supplierColumns = [
    { id: 'partyName', label: 'Supplier Name', bold: true, minWidth: 160 },
    { id: 'phone', label: 'Phone', minWidth: 120 },
    { id: 'purchaseCount', label: 'Invoices', align: 'center', minWidth: 90 },
    { id: 'grossPurchases', label: 'Gross Purchase', format: 'currency', align: 'right', minWidth: 120 },
    { id: 'discount', label: 'Discount', format: 'currency', align: 'right', minWidth: 100 },
    { id: 'netPurchases', label: 'Net Purchase', format: 'currency', align: 'right', bold: true, minWidth: 120 },
    { id: 'paidAmount', label: 'Paid', format: 'currency', align: 'right', minWidth: 110 },
    { id: 'outstandingAmount', label: 'Outstanding', format: 'currency', align: 'right', minWidth: 110 },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Standard Header with Export Actions */}
      <PageHeader
        title="Purchase Report"
        subtitle="Procurement expenditure analysis, supplier accounts, and item-wise purchase breakdowns."
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
          <Tab label="Purchase Invoices" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Item-wise Purchases" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Supplier-wise Purchases" sx={{ fontWeight: 700, textTransform: 'none' }} />
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
        partyId={supplierId}
        onPartyChange={(v) => { setSupplierId(v); setPage(0); }}
        parties={suppliers}
        partyLabel="Supplier"
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

      {/* Tables */}
      {activeTab === 0 && (
        <ReportTable
          columns={purchaseColumns}
          data={purchases}
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
          onRowClick={(r) => navigate(`/purchases/${r.id}`)}
          emptyMessage="No purchase records found for the selected period."
        />
      )}

      {activeTab === 1 && (
        <ReportTable
          columns={itemColumns}
          data={itemWiseData}
          loading={loading}
          totalElements={itemWiseData.length}
          emptyMessage="No item purchase transactions found for the selected period."
        />
      )}

      {activeTab === 2 && (
        <ReportTable
          columns={supplierColumns}
          data={supplierWiseData}
          loading={loading}
          totalElements={supplierWiseData.length}
          emptyMessage="No supplier purchase transactions aggregated for the selected period."
        />
      )}
    </Box>
  );
};

export default PurchaseReport;
