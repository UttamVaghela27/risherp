/**
 * saleCalculations.js
 * Pure utility functions for sales billing calculations.
 * Used by frontend for live UI updates. Backend always recalculates independently.
 *
 * Calculation rules:
 *   lineSubtotal = quantity × rate
 *   discountAmount = (type=PERCENTAGE) ? lineSubtotal × value/100 : value
 *   lineTotal = lineSubtotal - discountAmount
 *
 *   subtotal = Σ lineTotal (sum of all line totals after line discounts)
 *   itemDiscount = Σ discountAmount (total line discounts)
 *   overallDiscountAmount = (type=PERCENTAGE) ? subtotal × value/100 : value
 *   grandTotal = subtotal - overallDiscountAmount
 *   balance = grandTotal - paidAmount
 */

/**
 * Calculate totals for one cart line item.
 * @param {object} item - { quantity, rate, discountType, discountValue }
 * @returns {object} { lineSubtotal, discountAmount, lineTotal }
 */
export function calculateLineTotal(item) {
  const qty = parseFloat(item.quantity) || 0;
  const rate = parseFloat(item.rate) || 0;
  const discountValue = parseFloat(item.discountValue) || 0;
  const discountType = item.discountType || 'AMOUNT';

  const lineSubtotal = roundTo2(qty * rate);

  let discountAmount = 0;
  if (discountType === 'PERCENTAGE') {
    const pct = Math.min(discountValue, 100);
    discountAmount = roundTo2(lineSubtotal * pct / 100);
  } else {
    discountAmount = roundTo2(Math.min(discountValue, lineSubtotal));
  }

  const lineTotal = roundTo2(lineSubtotal - discountAmount);

  return { lineSubtotal, discountAmount, lineTotal };
}

/**
 * Calculate invoice-level totals from the cart.
 * @param {Array} items - cart items (each with lineSubtotal, discountAmount, lineTotal already calculated)
 * @param {number} overallDiscount - invoice-level discount value
 * @param {string} overallDiscountType - 'AMOUNT' | 'PERCENTAGE'
 * @returns {object} { subtotal, itemDiscount, overallDiscountAmount, totalDiscount, grandTotal }
 */
export function calculateSaleTotals(items, overallDiscount = 0, overallDiscountType = 'AMOUNT') {
  const subtotal = roundTo2(items.reduce((sum, i) => sum + (parseFloat(i.lineTotal) || 0), 0));
  const itemDiscount = roundTo2(items.reduce((sum, i) => sum + (parseFloat(i.discountAmount) || 0), 0));

  const overallDiscountValue = parseFloat(overallDiscount) || 0;
  let overallDiscountAmount = 0;

  if (overallDiscountType === 'PERCENTAGE') {
    const pct = Math.min(overallDiscountValue, 100);
    overallDiscountAmount = roundTo2(subtotal * pct / 100);
  } else {
    overallDiscountAmount = roundTo2(Math.min(overallDiscountValue, subtotal));
  }

  const grandTotal = roundTo2(subtotal - overallDiscountAmount);
  const totalDiscount = roundTo2(itemDiscount + overallDiscountAmount);

  return { subtotal, itemDiscount, overallDiscountAmount, totalDiscount, grandTotal };
}

/**
 * Determine payment status based on amounts.
 * @param {number} paidAmount
 * @param {number} grandTotal
 * @returns {'PAID' | 'PARTIAL' | 'PENDING'}
 */
export function determinePaymentStatus(paidAmount, grandTotal) {
  const paid = parseFloat(paidAmount) || 0;
  const total = parseFloat(grandTotal) || 0;
  if (total <= 0) return 'PAID';
  if (paid >= total) return 'PAID';
  if (paid > 0) return 'PARTIAL';
  return 'PENDING';
}

/**
 * Format a monetary value as Indian Rupee string.
 * @param {number} amount
 * @returns {string} e.g. "₹1,25,000.00"
 */
export function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Round to 2 decimal places using HALF_UP rounding. */
function roundTo2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
