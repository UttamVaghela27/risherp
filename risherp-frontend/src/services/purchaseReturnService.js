import axiosInstance from '../api/axiosInstance';

/**
 * purchaseReturnService.js
 * REST API client for Phase 13 Purchase Return module.
 */
export const purchaseReturnService = {

  /** Create a new purchase return. */
  createPurchaseReturn: async (data) => {
    const response = await axiosInstance.post('/purchase-returns', data);
    return response.data;
  },

  /** Paginated, filtered purchase return history. */
  getPurchaseReturns: async ({
    page = 0,
    size = 10,
    search = '',
    partyId = null,
    status = '',
    fromDate = null,
    toDate = null,
    sortBy = 'returnDate',
    sortDir = 'desc',
  } = {}) => {
    const params = { page, size, sortBy, sortDir };
    if (search && search.trim()) params.search = search.trim();
    if (partyId) params.partyId = partyId;
    if (status && status !== 'ALL') params.status = status;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    const response = await axiosInstance.get('/purchase-returns', { params });
    return response.data;
  },

  /** KPI summary for dashboard cards. */
  getPurchaseReturnSummary: async () => {
    const response = await axiosInstance.get('/purchase-returns/summary');
    return response.data;
  },

  /** Full return detail by ID. */
  getPurchaseReturnById: async (id) => {
    const response = await axiosInstance.get(`/purchase-returns/${id}`);
    return response.data;
  },

  /** Lookup by return number (PR-000001). */
  getPurchaseReturnByNumber: async (returnNumber) => {
    const response = await axiosInstance.get(`/purchase-returns/number/${encodeURIComponent(returnNumber)}`);
    return response.data;
  },

  /** All returns against a specific original purchase. */
  getPurchaseReturnsByPurchase: async (purchaseId) => {
    const response = await axiosInstance.get(`/purchase-returns/purchase/${purchaseId}`);
    return response.data;
  },

  /**
   * Get returnable item quantities for a purchase.
   * Returns items with alreadyReturnedQuantity and returnableQuantity pre-calculated.
   */
  getReturnableItems: async (purchaseId) => {
    const response = await axiosInstance.get(`/purchases/${purchaseId}/returnable-items`);
    return response.data;
  },

  /** Download PDF blob for a purchase return (Debit Note). */
  downloadPurchaseReturnPdf: async (id) => {
    const response = await axiosInstance.get(`/purchase-returns/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },

  /** Cancel a completed purchase return. */
  cancelPurchaseReturn: async (id) => {
    const response = await axiosInstance.put(`/purchase-returns/${id}/cancel`);
    return response.data;
  },
};

export default purchaseReturnService;
