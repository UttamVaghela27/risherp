import axiosInstance from '../api/axiosInstance';

/**
 * Stock Service
 * REST API client for Phase 11 Stock Management and Stock Ledger endpoints.
 */
export const stockService = {
  /**
   * Fetch paginated stock transaction ledger with optional filters.
   *
   * @param {Object} params
   * @param {number|null} params.itemId        - optional, filter to one item
   * @param {string|null} params.fromDate      - optional, YYYY-MM-DD
   * @param {string|null} params.toDate        - optional, YYYY-MM-DD
   * @param {string|null} params.referenceType - optional, e.g. SALE / PURCHASE
   * @param {number}      params.page          - 0-based page index
   * @param {number}      params.size          - page size (max 100)
   */
  getStockLedger: async ({
    itemId = null,
    fromDate = null,
    toDate = null,
    referenceType = null,
    page = 0,
    size = 20,
  } = {}) => {
    const params = { page, size };
    if (itemId) params.itemId = itemId;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    if (referenceType && referenceType !== 'ALL') params.referenceType = referenceType;

    const response = await axiosInstance.get('/stock/ledger', { params });
    return response.data;
  },

  /**
   * Fetch stock transaction history for a specific item.
   *
   * @param {number} itemId
   * @param {Object} params
   * @param {string|null} params.fromDate - optional, YYYY-MM-DD
   * @param {string|null} params.toDate   - optional, YYYY-MM-DD
   * @param {number}      params.page
   * @param {number}      params.size
   */
  getItemStockLedger: async (itemId, { fromDate = null, toDate = null, page = 0, size = 20 } = {}) => {
    const params = { page, size };
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await axiosInstance.get(`/stock/ledger/item/${itemId}`, { params });
    return response.data;
  },
};

export default stockService;
