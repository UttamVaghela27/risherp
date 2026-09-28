import axiosInstance from '../api/axiosInstance';

/**
 * purchaseService.js
 * REST API client for Purchase Entry & Management.
 * All monetary calculations are verified by the authoritative backend.
 */
const purchaseService = {

  /**
   * Create a new purchase invoice.
   * @param {object} purchaseData - CreatePurchaseRequest payload
   */
  createPurchase: async (purchaseData) => {
    const response = await axiosInstance.post('/purchases', purchaseData);
    return response.data;
  },

  /**
   * Fetch paginated purchases list with filters.
   */
  getPurchases: async ({
    page = 0,
    size = 10,
    search = '',
    partyId = '',
    paymentStatus = '',
    status = '',
    fromDate = '',
    toDate = '',
    sortBy = 'purchaseDate',
    sortDir = 'desc',
  } = {}) => {
    const params = { page, size, sortBy, sortDir };
    if (search && search.trim()) params.search = search.trim();
    if (partyId && partyId !== 'ALL') params.partyId = partyId;
    if (paymentStatus && paymentStatus !== 'ALL') params.paymentStatus = paymentStatus;
    if (status && status !== 'ALL') params.status = status;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await axiosInstance.get('/purchases', { params });
    return response.data;
  },

  /**
   * Fetch purchase KPI summary metrics with optional filters.
   */
  getPurchaseSummary: async ({
    search = '',
    partyId = '',
    paymentStatus = '',
    status = '',
    fromDate = '',
    toDate = '',
  } = {}) => {
    const params = {};
    if (search && search.trim()) params.search = search.trim();
    if (partyId && partyId !== 'ALL') params.partyId = partyId;
    if (paymentStatus && paymentStatus !== 'ALL') params.paymentStatus = paymentStatus;
    if (status && status !== 'ALL') params.status = status;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await axiosInstance.get('/purchases/summary', { params });
    return response.data;
  },

  /**
   * Safely cancel a purchase invoice and reverse inventory stock.
   */
  cancelPurchase: async (id, reason = '') => {
    const params = reason ? { reason } : {};
    const response = await axiosInstance.put(`/purchases/${id}/cancel`, null, { params });
    return response.data;
  },

  /**
   * Get full purchase details by ID.
   */
  getPurchaseById: async (id) => {
    const response = await axiosInstance.get(`/purchases/${id}`);
    return response.data;
  },

  /**
   * Get purchase by purchase number (e.g. PUR-000001).
   */
  getPurchaseByNumber: async (purchaseNumber) => {
    const response = await axiosInstance.get(`/purchases/number/${encodeURIComponent(purchaseNumber)}`);
    return response.data;
  },

  /**
   * Get all purchases from a specific supplier (partyId).
   */
  getSupplierPurchases: async (partyId, { page = 0, size = 10 } = {}) => {
    const response = await axiosInstance.get(`/purchases/supplier/${partyId}`, {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Download authoritative purchase PDF voucher.
   */
  downloadPurchasePdf: async (id, purchaseNumber = 'purchase') => {
    const response = await axiosInstance.get(`/purchases/${id}/pdf`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${purchaseNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  },
};

export default purchaseService;
