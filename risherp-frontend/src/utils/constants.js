/**
 * Application-wide constants for the frontend.
 * Mirrors important values from the backend.
 */

export const APP_NAME = import.meta.env.VITE_APP_NAME || "RISHERP";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Sidebar drawer width
export const DRAWER_WIDTH = 260;

// Party types
export const PARTY_TYPES = {
  CUSTOMER: "CUSTOMER",
  SUPPLIER: "SUPPLIER",
  BOTH: "BOTH",
};

// Payment modes
export const PAYMENT_MODES = {
  CASH: "CASH",
  CREDIT: "CREDIT",
  BANK: "BANK_TRANSFER",
  UPI: "UPI",
  CHEQUE: "CHEQUE",
};

// Sale types
export const SALE_TYPES = {
  CASH: "CASH",
  CREDIT: "CREDIT",
  PARTIAL: "PARTIAL",
};

// Payment statuses
export const PAYMENT_STATUSES = {
  PAID: "PAID",
  PARTIAL: "PARTIAL",
  PENDING: "PENDING",
};

// Sale statuses
export const SALE_STATUSES = {
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

// Discount types
export const DISCOUNT_TYPES = {
  AMOUNT: "AMOUNT",
  PERCENTAGE: "PERCENTAGE",
};

// Status values
export const STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 10,
  SIZE_OPTIONS: [5, 10, 25, 50],
};

// Stock status
export const STOCK_STATUS = {
  ALL: "ALL",
  IN_STOCK: "IN_STOCK",
  LOW_STOCK: "LOW_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
};

// Centralized default units
export const DEFAULT_UNITS = [
  "PCS",
  "KG",
  "GRAM",
  "LITRE",
  "ML",
  "BOX",
  "PACK",
  "METER",
  "FEET",
  "DOZEN",
  "SET",
  "ROLL",
  "CAN",
];
