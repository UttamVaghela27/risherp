import axiosInstance from '../api/axiosInstance';

/**
 * salesService.js
 * REST API client for Sales & Billing module.
 * All monetary calculations are trusted from backend responses.
 */
const salesService = {

  /**
   * Create a new sale invoice.
   * @param {object} saleData - CreateSaleRequest payload
   */
  createSale: async (saleData) => {
    const response = await axiosInstance.post('/sales', saleData);
    return response.data;
  },

  /**
   * Fetch paginated sales history with filters.
   */
  getSales: async ({
    page = 0,
    size = 10,
    search = '',
    partyId = '',
    paymentStatus = '',
    status = '',
    fromDate = '',
    toDate = '',
    sortBy = 'saleDate',
    sortDir = 'desc',
  } = {}) => {
    const params = { page, size, sortBy, sortDir };
    if (search && search.trim()) params.search = search.trim();
    if (partyId && partyId !== 'ALL') params.partyId = partyId;
    if (paymentStatus && paymentStatus !== 'ALL') params.paymentStatus = paymentStatus;
    if (status && status !== 'ALL') params.status = status;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await axiosInstance.get('/sales', { params });
    return response.data;
  },

  /**
   * Fetch KPI summary with optional active filters.
   */
  getSaleSummary: async ({
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

    const response = await axiosInstance.get('/sales/summary', { params });
    return response.data;
  },

  /**
   * Get full sale details by ID.
   */
  getSaleById: async (id) => {
    const response = await axiosInstance.get(`/sales/${id}`);
    return response.data;
  },

  /**
   * Get sale by invoice number (e.g., INV-000001).
   */
  getSaleByInvoiceNumber: async (invoiceNumber) => {
    const response = await axiosInstance.get(`/sales/invoice/${encodeURIComponent(invoiceNumber)}`);
    return response.data;
  },

  /**
   * Get all sales for a specific customer (partyId).
   */
  getCustomerSales: async (partyId, { page = 0, size = 10 } = {}) => {
    const response = await axiosInstance.get(`/sales/customer/${partyId}`, {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Download authoritative invoice PDF.
   */
  downloadSalePdf: async (id, invoiceNumber = 'invoice') => {
    const response = await axiosInstance.get(`/sales/${id}/pdf`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  },

  /**
   * Cancel an existing sale and reverse inventory stock deductions.
   */
  cancelSale: async (id) => {
    const response = await axiosInstance.put(`/sales/${id}/cancel`);
    return response.data;
  },
};

export default salesService;
