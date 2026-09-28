import axiosInstance from '../api/axiosInstance';

/**
 * paymentTxnService.js
 * REST API client for Phase 14 Supplier Payments module.
 */
export const paymentTxnService = {

  /** Create a new supplier payment with optional purchase allocations. */
  createPayment: async (data) => {
    const response = await axiosInstance.post('/payments', data);
    return response.data;
  },

  /** Paginated, filtered payment history. */
  getPayments: async ({
    page = 0,
    size = 10,
    search = '',
    partyId = null,
    status = '',
    paymentMode = null,
    fromDate = null,
    toDate = null,
    sortBy = 'paymentDate',
    sortDir = 'desc',
  } = {}) => {
    const params = { page, size, sortBy, sortDir };
    if (search && search.trim()) params.search = search.trim();
    if (partyId) params.partyId = partyId;
    if (status && status !== 'ALL') params.status = status;
    if (paymentMode && paymentMode !== 'ALL') params.paymentMode = paymentMode;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    const response = await axiosInstance.get('/payments', { params });
    return response.data;
  },

  /** KPI summary for dashboard cards. */
  getPaymentSummary: async () => {
    const response = await axiosInstance.get('/payments/summary');
    return response.data;
  },

  /** Full payment detail by ID. */
  getPaymentById: async (id) => {
    const response = await axiosInstance.get(`/payments/${id}`);
    return response.data;
  },

  /** Lookup by payment number (PAY-000001). */
  getPaymentByNumber: async (paymentNumber) => {
    const response = await axiosInstance.get(`/payments/number/${encodeURIComponent(paymentNumber)}`);
    return response.data;
  },

  /** Outstanding purchases for a supplier available to be settled. */
  getOutstandingPurchases: async (partyId) => {
    const response = await axiosInstance.get(`/purchases/supplier/${partyId}/outstanding`);
    return response.data;
  },

  /** Download PDF blob for a payment voucher. */
  downloadPaymentPdf: async (id) => {
    const response = await axiosInstance.get(`/payments/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },

  /** Cancel a completed payment and restore purchase balances. */
  cancelPayment: async (id) => {
    const response = await axiosInstance.put(`/payments/${id}/cancel`);
    return response.data;
  },
};

export default paymentTxnService;
