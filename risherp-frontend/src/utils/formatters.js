/**
 * Formatting utilities for RISHERP
 * Formats currency in standard Indian numbering (₹ 1,25,450.00),
 * numbers with commas, and standardized business dates.
 */

/**
 * Formats numbers into Indian Rupee format: ₹ 1,25,450.00
 */
export const formatCurrency = (amount, decimals = 2, showSymbol = true) => {
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numeric);

  return showSymbol ? `₹ ${formatted}` : formatted;
};

/**
 * Formats integers and decimal quantities
 */
export const formatNumber = (num, decimals = 0) => {
  const numeric = typeof num === 'number' ? num : parseFloat(num) || 0;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numeric);
};

/**
 * Formats quantity respecting decimal places if any
 */
export const formatQuantity = (qty) => {
  const numeric = typeof qty === 'number' ? qty : parseFloat(qty) || 0;
  return numeric % 1 === 0 ? formatNumber(numeric, 0) : formatNumber(numeric, 2);
};

/**
 * Formats date into readable ERP string: "11 Sep 2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Formats date and time: "11 Sep 2026, 10:30 AM"
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export default {
  formatCurrency,
  formatNumber,
  formatQuantity,
  formatDate,
  formatDateTime,
};
