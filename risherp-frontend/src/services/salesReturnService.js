import axiosInstance from '../api/axiosInstance';

/**
 * salesReturnService.js
 * REST API client for Phase 12 Sales Return module.
 */
export const salesReturnService = {

  /** Create a new sales return. */
  createSalesReturn: async (data) => {
    const response = await axiosInstance.post('/sales-returns', data);
    return response.data;
  },

  /** Paginated, filtered sales return history. */
  getSalesReturns: async ({
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
    const response = await axiosInstance.get('/sales-returns', { params });
    return response.data;
  },

  /** KPI summary for dashboard cards. */
  getSalesReturnSummary: async () => {
    const response = await axiosInstance.get('/sales-returns/summary');
    return response.data;
  },

  /** Full return detail by ID. */
  getSalesReturnById: async (id) => {
    const response = await axiosInstance.get(`/sales-returns/${id}`);
    return response.data;
  },

  /** Lookup by return number (SR-000001). */
  getSalesReturnByNumber: async (returnNumber) => {
    const response = await axiosInstance.get(`/sales-returns/number/${encodeURIComponent(returnNumber)}`);
    return response.data;
  },

  /** All returns against a specific original sale. */
  getSalesReturnsBySale: async (saleId) => {
    const response = await axiosInstance.get(`/sales-returns/sale/${saleId}`);
    return response.data;
  },

  /**
   * Get returnable item quantities for a sale.
   * Returns items with alreadyReturnedQuantity and returnableQuantity pre-calculated.
   */
  getReturnableItems: async (saleId) => {
    const response = await axiosInstance.get(`/sales/${saleId}/returnable-items`);
    return response.data;
  },

  /** Download PDF blob for a sales return. */
  downloadSalesReturnPdf: async (id) => {
    const response = await axiosInstance.get(`/sales-returns/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },

  /** Cancel a completed sales return. */
  cancelSalesReturn: async (id) => {
    const response = await axiosInstance.put(`/sales-returns/${id}/cancel`);
    return response.data;
  },
};

export default salesReturnService;
