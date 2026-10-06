import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

import reportService from '../../services/reportService';
import categoryService from '../../services/categoryService';
import PageHeader from '../../components/common/PageHeader';
import ReportFilters from '../../components/reports/ReportFilters';
import ReportSummaryCards from '../../components/reports/ReportSummaryCards';
import ReportTable from '../../components/reports/ReportTable';
import ExportButtons from '../../components/reports/ExportButtons';

const StockReport = () => {
  // Tabs: 0 = Valuation & On-Hand, 1 = Movement Ledger, 2 = Low Stock
  const [activeTab, setActiveTab] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Dropdown options
  const [categories, setCategories] = useState([]);

  // Data & Loading States
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  // On-Hand State
  const [stockItems, setStockItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState('itemName');
  const [sortDir, setSortDir] = useState('asc');

  // Movement & Low Stock Data
  const [movements, setMovements] = useState([]);
  const [movementTotal, setMovementTotal] = useState(0);
  const [lowStockData, setLowStockData] = useState([]);

  useEffect(() => {
    categoryService.getAllActiveCategories().then((res) => {
      const catList = res?.data || res?.content || (Array.isArray(res) ? res : []);
      setCategories(catList);
    }).catch(console.error);
  }, []);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 0) {
        const res = await reportService.getStockReport({
          categoryId: categoryId || undefined,
          stockStatus: stockStatus || undefined,
          search: search || undefined,
          page,
          size: rowsPerPage,
          sort: `${sortBy},${sortDir}`,
        });
        setStockItems(res.data || []);
        setSummary(res.summary || null);
        setTotalElements(res.totalElements || 0);
      } else if (activeTab === 1) {
        const res = await reportService.getStockMovement({
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          search: search || undefined,
          page,
          size: rowsPerPage,
        });
        setMovements(res.content || []);
        setMovementTotal(res.totalElements || 0);
      } else if (activeTab === 2) {
        const low = await reportService.getLowStockReport({
          categoryId: categoryId || undefined,
          search: search || undefined,
        });
        setLowStockData(low || []);
      }
    } catch (err) {
      console.error('Failed to load stock report', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, categoryId, stockStatus, search, dateFrom, dateTo, page, rowsPerPage, sortBy, sortDir]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleResetFilters = () => {
    setSearch('');
    setCategoryId('');
    setStockStatus('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  const handleExportPdf = async () => {
    setPdfLoading(true);
    try {
      const blob = await reportService.downloadStockReportPdf({
        categoryId: categoryId || undefined,
        stockStatus: stockStatus || undefined,
        search: search || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `StockReport_${new Date().toISOString().split('T')[0]}.pdf`);
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
        csvContent += 'Item Code,Item Name,Category,Unit,Current Stock,Min Stock,Purchase Rate,Sale Rate,Stock Value,Status\n';
        stockItems.forEach((r) => {
          csvContent += `"${r.itemCode}","${r.itemName}","${r.categoryName}","${r.unit}","${r.currentStock}","${r.minimumStock}","${r.purchaseRate}","${r.saleRate}","${r.stockValue}","${r.stockStatus}"\n`;
        });
      } else if (activeTab === 1) {
        csvContent += 'Date,Item Code,Item Name,Type,Reference Type,Reference Number,Quantity,Before,After,Stock Value\n';
        movements.forEach((r) => {
          csvContent += `"${r.transactionDate}","${r.itemCode}","${r.itemName}","${r.transactionType}","${r.referenceType}","${r.referenceNumber}","${r.quantity}","${r.stockBefore}","${r.stockAfter}","${r.stockValue}"\n`;
        });
      } else if (activeTab === 2) {
        csvContent += 'Item Code,Item Name,Category,Unit,Current Stock,Min Stock,Shortage,Status\n';
        lowStockData.forEach((r) => {
          csvContent += `"${r.itemCode}","${r.itemName}","${r.categoryName}","${r.unit}","${r.currentStock}","${r.minimumStock}","${r.shortageQuantity}","${r.stockStatus}"\n`;
        });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Stock_Report_${activeTab}.csv`);
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

  const totalStockVal = summary?.totalStockValue ?? summary?.totalValuation ?? 0;
  const inStockCount = summary?.inStockItems ?? Math.max(0, (summary?.totalItems || 0) - (summary?.lowStockItems || 0) - (summary?.outOfStockItems || 0));

  const kpiCards = summary
    ? [
        {
          title: 'Total Items',
          value: summary.totalItems ?? 0,
          icon: <LayersOutlinedIcon />,
          color: 'primary',
        },
        {
          title: 'Total Valuation',
          value: fmt(totalStockVal),
          icon: <AccountBalanceWalletOutlinedIcon />,
          color: 'success',
        },
        {
          title: 'Total Stock Qty',
          value: summary.totalStockQuantity != null ? parseFloat(summary.totalStockQuantity).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : inStockCount,
          icon: <Inventory2OutlinedIcon />,
          color: 'info',
        },
        {
          title: 'Low Stock Items',
          value: summary.lowStockItems ?? 0,
          icon: <WarningAmberOutlinedIcon />,
          color: 'warning',
        },
        {
          title: 'Out of Stock Items',
          value: summary.outOfStockItems ?? 0,
          icon: <ErrorOutlineOutlinedIcon />,
          color: 'error',
        },
      ]
    : [];

  const stockColumns = [
    { id: 'itemCode', label: 'Item Code', bold: true, minWidth: 110 },
    { id: 'itemName', label: 'Item Name', minWidth: 180 },
    { id: 'categoryName', label: 'Category', minWidth: 120 },
    { id: 'unit', label: 'Unit', minWidth: 80 },
    { id: 'currentStock', label: 'Current Qty', format: 'qty', align: 'right', bold: true, minWidth: 110 },
    { id: 'minimumStock', label: 'Min Level', format: 'qty', align: 'right', minWidth: 100 },
    { id: 'purchaseRate', label: 'Cost Price', format: 'currency', align: 'right', minWidth: 110 },
    { id: 'saleRate', label: 'Sale Price', format: 'currency', align: 'right', minWidth: 110 },
    { id: 'stockValue', label: 'Stock Value', format: 'currency', align: 'right', bold: true, minWidth: 120 },
    { id: 'stockStatus', label: 'Status', format: 'status', minWidth: 110 },
  ];

  const movementColumns = [
    { id: 'transactionDate', label: 'Date', format: 'date', bold: true, minWidth: 120 },
    { id: 'itemCode', label: 'Item Code', minWidth: 110 },
    { id: 'itemName', label: 'Item Name', minWidth: 180 },
    { id: 'transactionType', label: 'Type', format: 'status', minWidth: 100 },
    { id: 'referenceType', label: 'Ref Type', minWidth: 110 },
    { id: 'referenceNumber', label: 'Ref Number', minWidth: 120 },
    { id: 'quantity', label: 'Qty', format: 'qty', align: 'right', bold: true, minWidth: 90 },
    { id: 'stockBefore', label: 'Before', format: 'qty', align: 'right', minWidth: 90 },
    { id: 'stockAfter', label: 'After', format: 'qty', align: 'right', minWidth: 90 },
    { id: 'stockValue', label: 'Total Value', format: 'currency', align: 'right', minWidth: 110 },
  ];

  const lowStockColumns = [
    { id: 'itemCode', label: 'Item Code', bold: true, minWidth: 110 },
    { id: 'itemName', label: 'Item Name', minWidth: 180 },
    { id: 'categoryName', label: 'Category', minWidth: 120 },
    { id: 'unit', label: 'Unit', minWidth: 80 },
    { id: 'currentStock', label: 'Current Qty', format: 'qty', align: 'right', bold: true, minWidth: 110 },
    { id: 'minimumStock', label: 'Min Required', format: 'qty', align: 'right', minWidth: 110 },
    { id: 'shortageQuantity', label: 'Deficit Qty', format: 'qty', align: 'right', bold: true, minWidth: 110 },
    { id: 'stockStatus', label: 'Alert Status', format: 'status', minWidth: 120 },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Standard Header with Export Actions */}
      <PageHeader
        title="Stock Valuation & Movement Report"
        subtitle="Real-time stock valuation, unit costs, inventory movement ledger, and low-stock alerts."
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
          <Tab label="Stock Valuation" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Stock Movement Ledger" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Low Stock Alerts" sx={{ fontWeight: 700, textTransform: 'none' }} />
        </Tabs>
      </Paper>

      {/* Stats Cards */}
      {activeTab === 0 && <ReportSummaryCards cards={kpiCards} loading={loading} />}

      {/* FilterBar with Search and Relevant Filters */}
      <ReportFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        categoryId={categoryId}
        onCategoryChange={(v) => { setCategoryId(v); setPage(0); }}
        categories={categories}
        showCategory={activeTab === 0 || activeTab === 2}
        status={stockStatus}
        onStatusChange={(v) => { setStockStatus(v); setPage(0); }}
        statusOptions={[
          { value: 'IN_STOCK', label: 'IN STOCK' },
          { value: 'LOW_STOCK', label: 'LOW STOCK' },
          { value: 'OUT_OF_STOCK', label: 'OUT OF STOCK' },
        ]}
        showStatus={activeTab === 0}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={(v) => { setDateFrom(v); setPage(0); }}
        onDateToChange={(v) => { setDateTo(v); setPage(0); }}
        onReset={handleResetFilters}
      />

      {/* Tables */}
      {activeTab === 0 && (
        <ReportTable
          columns={stockColumns}
          data={stockItems}
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
          emptyMessage="No inventory items found matching the selected filters."
        />
      )}

      {activeTab === 1 && (
        <ReportTable
          columns={movementColumns}
          data={movements}
          loading={loading}
          totalElements={movementTotal}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(p) => setPage(p)}
          onRowsPerPageChange={(s) => { setRowsPerPage(s); setPage(0); }}
          emptyMessage="No stock transactions recorded in the ledger for this period."
        />
      )}

      {activeTab === 2 && (
        <ReportTable
          columns={lowStockColumns}
          data={lowStockData}
          loading={loading}
          totalElements={lowStockData.length}
          emptyMessage="Great news! No items are currently below minimum stock threshold."
        />
      )}
    </Box>
  );
};

export default StockReport;
