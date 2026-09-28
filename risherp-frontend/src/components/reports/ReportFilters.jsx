import React from 'react';
import ReportFilterDrawer from '../common/ReportFilterDrawer';

/**
 * ReportFilters — Reusable filter bar for all ERP reports.
 * Standardized across all reports with uniform 580px drawer, tokens,
 * quick date presets, custom date range, and contextual entity dropdowns.
 */
const ReportFilters = ({
  datePreset = 'ALL',
  onPresetChange,
  dateFrom = '',
  dateTo = '',
  onDateFromChange,
  onDateToChange,
  search = '',
  onSearchChange,
  searchPlaceholder = 'Search in reports...',
  partyId = '',
  onPartyChange,
  parties = [],
  partyLabel = 'Party',
  showParty = false,
  itemId = '',
  onItemChange,
  items = [],
  showItem = false,
  categoryId = '',
  onCategoryChange,
  categories = [],
  showCategory = false,
  paymentStatus = '',
  onPaymentStatusChange,
  showPaymentStatus = false,
  status = '',
  onStatusChange,
  statusOptions = [],
  showStatus = false,
  statusLabel = 'Status',
  paymentMode = '',
  onPaymentModeChange,
  showPaymentMode = false,
  onReset,
  resultCount,
  totalCount,
  itemName = 'Records',
  children,
}) => {
  return (
    <ReportFilterDrawer
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder={searchPlaceholder}
      resultCount={resultCount}
      totalCount={totalCount}
      itemName={itemName}
      showDateFilter={Boolean(onPresetChange || (onDateFromChange && onDateToChange))}
      datePreset={datePreset}
      onPresetChange={onPresetChange}
      dateFrom={dateFrom}
      dateTo={dateTo}
      onDateFromChange={onDateFromChange}
      onDateToChange={onDateToChange}
      showParty={showParty}
      partyLabel={partyLabel}
      partyId={partyId}
      onPartyChange={onPartyChange}
      parties={parties}
      showCategory={showCategory}
      categoryId={categoryId}
      onCategoryChange={onCategoryChange}
      categories={categories}
      showItem={showItem}
      itemId={itemId}
      onItemChange={onItemChange}
      items={items}
      showPaymentStatus={showPaymentStatus}
      paymentStatus={paymentStatus}
      onPaymentStatusChange={onPaymentStatusChange}
      showStatus={showStatus}
      status={status}
      onStatusChange={onStatusChange}
      statusOptions={statusOptions}
      statusLabel={statusLabel}
      showPaymentMode={showPaymentMode}
      paymentMode={paymentMode}
      onPaymentModeChange={onPaymentModeChange}
      onReset={onReset}
    >
      {children}
    </ReportFilterDrawer>
  );
};

export default ReportFilters;
