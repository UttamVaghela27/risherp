import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  useTheme,
  alpha,
} from '@mui/material';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import reportService from '../../services/reportService';
import categoryService from '../../services/categoryService';
import PageHeader from '../../components/common/PageHeader';
import ReportFilters from '../../components/reports/ReportFilters';
import ReportSummaryCards from '../../components/reports/ReportSummaryCards';
import ReportTable from '../../components/reports/ReportTable';
import ExportButtons from '../../components/reports/ExportButtons';

const ProfitReport = () => {
  const theme = useTheme();
  const [datePreset, setDatePreset] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');

  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  useEffect(() => {
    categoryService.getAllActiveCategories().then((res) => {
      const catList = res?.data || res?.content || (Array.isArray(res) ? res : []);
      setCategories(catList);
    }).catch(console.error);
  }, []);

  const fetchProfitData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, itemsRes] = await Promise.all([
        reportService.getProfitSummary({
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          categoryId: categoryId || undefined,
        }),
        reportService.getItemWiseProfit({
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          categoryId: categoryId || undefined,
          search: search || undefined,
        }),
      ]);
      setSummary(sumRes);
      setItems(itemsRes || []);
    } catch (err) {
      console.error('Failed to load profit report', err);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, categoryId, search]);

  useEffect(() => {
    fetchProfitData();
  }, [fetchProfitData]);

  const handlePresetChange = (preset, from, to) => {
    setDatePreset(preset);
    setDateFrom(from);
    setDateTo(to);
  };

  const handleResetFilters = () => {
    setDatePreset('ALL');
    setDateFrom('');
    setDateTo('');
    setCategoryId('');
    setSearch('');
  };

  const handleExportPdf = async () => {
    setPdfLoading(true);
    try {
      const blob = await reportService.downloadProfitReportPdf({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        categoryId: categoryId || undefined,
        search: search || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ProfitReport_${dateFrom || 'all'}_to_${dateTo || 'all'}.pdf`);
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
      csvContent += 'Item Code,Item Name,Category,Quantity Sold,Gross Sales,Discount,Net Sales,COGS (Cost),Gross Profit,Margin %\n';
      items.forEach((r) => {
        csvContent += `"${r.itemCode}","${r.itemName}","${r.categoryName}","${r.quantitySold}","${r.grossSales}","${r.discount}","${r.netSales}","${r.totalCost}","${r.grossProfit}","${r.marginPercentage}%"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Profit_Report_${dateFrom}_to_${dateTo}.csv`);
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

  const grossRevenue = summary?.grossSales ?? summary?.totalRevenue ?? summary?.netSales ?? 0;
  const cogs = summary?.costOfGoodsSold ?? summary?.totalCost ?? 0;
  const grossProfit = summary?.grossProfit ?? (Number(grossRevenue) - Number(cogs));
  const marginPct = summary?.grossMarginPercentage ?? summary?.overallMarginPercentage ?? 0;
  const totalInvoices = summary?.totalInvoices ?? summary?.invoiceCount ?? 0;

  const kpiCards = summary
    ? [
        {
          title: 'Gross Sales',
          value: fmt(grossRevenue),
          icon: <AttachMoneyOutlinedIcon />,
          color: 'primary',
        },
        {
          title: 'COGS (Total Cost)',
          value: fmt(cogs),
          icon: <ShoppingBagOutlinedIcon />,
          color: 'warning',
        },
        {
          title: 'Gross Profit',
          value: fmt(grossProfit),
          icon: <TrendingUpOutlinedIcon />,
          color: grossProfit >= 0 ? 'success' : 'error',
        },
        {
          title: 'Gross Margin %',
          value: `${marginPct != null ? parseFloat(marginPct).toFixed(2) : '0.00'}%`,
          icon: <PercentOutlinedIcon />,
          color: marginPct >= 0 ? 'success' : 'error',
        },
        {
          title: 'Total Invoices',
          value: totalInvoices,
          icon: <AccountBalanceWalletOutlinedIcon />,
          color: 'info',
        },
      ]
    : [];

  const columns = [
    { id: 'itemCode', label: 'Item Code', bold: true, minWidth: 110 },
    { id: 'itemName', label: 'Item Name', minWidth: 180 },
    { id: 'categoryName', label: 'Category', minWidth: 120 },
    { id: 'quantitySold', label: 'Qty Sold', format: 'qty', align: 'right', minWidth: 100 },
    { id: 'grossSales', label: 'Gross Sales', format: 'currency', align: 'right', minWidth: 110 },
    { id: 'discount', label: 'Discount', format: 'currency', align: 'right', minWidth: 90 },
    { id: 'netSales', label: 'Net Sales', format: 'currency', align: 'right', bold: true, minWidth: 110 },
    { id: 'totalCost', label: 'COGS (Cost)', format: 'currency', align: 'right', minWidth: 110 },
    { id: 'grossProfit', label: 'Gross Profit', format: 'currency', align: 'right', bold: true, minWidth: 120 },
    {
      id: 'marginPercentage',
      label: 'Margin %',
      align: 'right',
      minWidth: 100,
      render: (r) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: r.marginPercentage >= 0 ? 'success.main' : 'error.main',
          }}
        >
          {r.marginPercentage ?? '0.00'}%
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Standard Header with Export Actions */}
      <PageHeader
        title="Profit & Margin Report"
        subtitle="Gross profit, cost of goods sold, and profitability margin analysis across sales transactions."
        actions={
          <ExportButtons
            onPdf={handleExportPdf}
            onCsv={handleExportCsv}
            pdfLoading={pdfLoading}
            csvLoading={csvLoading}
          />
        }
      />

      {/* Methodology Alert Note */}
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon />}
        sx={{
          mb: 3,
          borderRadius: 2,
          border: '1px solid #bfdbfe',
          bgcolor: alpha(theme.palette.info.main, 0.1),
        }}
      >
        <AlertTitle sx={{ fontWeight: 700, fontSize: '0.88rem' }}>Calculation Methodology</AlertTitle>
        Gross Profit is calculated as <strong>Net Sales - Cost of Goods Sold (COGS)</strong>. Item cost basis is derived from historical purchase prices at line item level. Operating expenses and overhead costs are excluded as there is no expense module in scope.
      </Alert>

      {/* Stats Cards */}
      <ReportSummaryCards cards={kpiCards} loading={loading} />

      {/* FilterBar with Search and Relevant Filters */}
      <ReportFilters
        datePreset={datePreset}
        onPresetChange={handlePresetChange}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        categories={categories}
        showCategory={true}
        search={search}
        onSearchChange={setSearch}
        onReset={handleResetFilters}
      />

      {/* Table */}
      <ReportTable
        columns={columns}
        data={items}
        loading={loading}
        totalElements={items.length}
        emptyMessage="No sales recorded in the selected period to compute gross profit."
      />
    </Box>
  );
};

export default ProfitReport;
