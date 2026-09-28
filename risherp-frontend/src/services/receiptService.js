import axiosInstance from '../api/axiosInstance';

/**
 * receiptService.js
 * REST API client for Phase 14 Customer Receipts module.
 */
export const receiptService = {

  /** Create a new customer receipt with optional invoice allocations. */
  createReceipt: async (data) => {
    const response = await axiosInstance.post('/receipts', data);
    return response.data;
  },

  /** Paginated, filtered receipt history. */
  getReceipts: async ({
    page = 0,
    size = 10,
    search = '',
    partyId = null,
    status = '',
    paymentMode = null,
    fromDate = null,
    toDate = null,
    sortBy = 'receiptDate',
    sortDir = 'desc',
  } = {}) => {
    const params = { page, size, sortBy, sortDir };
    if (search && search.trim()) params.search = search.trim();
    if (partyId) params.partyId = partyId;
    if (status && status !== 'ALL') params.status = status;
    if (paymentMode && paymentMode !== 'ALL') params.paymentMode = paymentMode;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    const response = await axiosInstance.get('/receipts', { params });
    return response.data;
  },

  /** KPI summary for dashboard cards. */
  getReceiptSummary: async () => {
    const response = await axiosInstance.get('/receipts/summary');
    return response.data;
  },

  /** Full receipt detail by ID. */
  getReceiptById: async (id) => {
    const response = await axiosInstance.get(`/receipts/${id}`);
    return response.data;
  },

  /** Lookup by receipt number (REC-000001). */
  getReceiptByNumber: async (receiptNumber) => {
    const response = await axiosInstance.get(`/receipts/number/${encodeURIComponent(receiptNumber)}`);
    return response.data;
  },

  /** Outstanding invoices for a customer available to be settled. */
  getOutstandingSales: async (partyId) => {
    const response = await axiosInstance.get(`/sales/customer/${partyId}/outstanding`);
    return response.data;
  },

  /** Download PDF blob for a receipt. */
  downloadReceiptPdf: async (id) => {
    const response = await axiosInstance.get(`/receipts/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },

  /** Cancel a completed receipt and restore invoice balances. */
  cancelReceipt: async (id) => {
    const response = await axiosInstance.put(`/receipts/${id}/cancel`);
    return response.data;
  },
};

export default receiptService;
