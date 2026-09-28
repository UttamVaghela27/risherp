import axiosInstance from '../api/axiosInstance';

/**
 * reportService.js
 * Centralized REST API client for RISHERP Reports module.
 */
const reportService = {

  // =========================================================================
  // 1. SALES REPORTS
  // =========================================================================
  getSalesReport: async (params = {}) => {
    const response = await axiosInstance.get('/reports/sales', { params });
    return response.data;
  },

  getSalesSummary: async (params = {}) => {
    const response = await axiosInstance.get('/reports/sales/summary', { params });
    return response.data;
  },

  getItemWiseSales: async (params = {}) => {
    const response = await axiosInstance.get('/reports/sales/items', { params });
    return response.data;
  },

  getPartyWiseSales: async (params = {}) => {
    const response = await axiosInstance.get('/reports/sales/parties', { params });
    return response.data;
  },

  getDailySales: async (params = {}) => {
    const response = await axiosInstance.get('/reports/sales/daily', { params });
    return response.data;
  },

  downloadSalesReportPdf: async (params = {}) => {
    const response = await axiosInstance.get('/reports/sales/pdf', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // =========================================================================
  // 2. PURCHASE REPORTS
  // =========================================================================
  getPurchaseReport: async (params = {}) => {
    const response = await axiosInstance.get('/reports/purchases', { params });
    return response.data;
  },

  getPurchaseSummary: async (params = {}) => {
    const response = await axiosInstance.get('/reports/purchases/summary', { params });
    return response.data;
  },

  getItemWisePurchases: async (params = {}) => {
    const response = await axiosInstance.get('/reports/purchases/items', { params });
    return response.data;
  },

  getSupplierWisePurchases: async (params = {}) => {
    const response = await axiosInstance.get('/reports/purchases/suppliers', { params });
    return response.data;
  },

  downloadPurchaseReportPdf: async (params = {}) => {
    const response = await axiosInstance.get('/reports/purchases/pdf', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // =========================================================================
  // 3. STOCK REPORTS
  // =========================================================================
  getStockReport: async (params = {}) => {
    const response = await axiosInstance.get('/reports/stock', { params });
    return response.data;
  },

  getStockSummary: async () => {
    const response = await axiosInstance.get('/reports/stock/summary');
    return response.data;
  },

  getStockMovement: async (params = {}) => {
    const response = await axiosInstance.get('/reports/stock/movement', { params });
    return response.data;
  },

  getLowStockReport: async (params = {}) => {
    const response = await axiosInstance.get('/reports/stock/low-stock', { params });
    return response.data;
  },

  downloadStockReportPdf: async (params = {}) => {
    const response = await axiosInstance.get('/reports/stock/pdf', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // =========================================================================
  // 4. PROFIT REPORT
  // =========================================================================
  getProfitReport: async (params = {}) => {
    const response = await axiosInstance.get('/reports/profit', { params });
    return response.data;
  },

  getProfitSummary: async (params = {}) => {
    const response = await axiosInstance.get('/reports/profit/summary', { params });
    return response.data;
  },

  getItemWiseProfit: async (params = {}) => {
    const response = await axiosInstance.get('/reports/profit/items', { params });
    return response.data;
  },

  downloadProfitReportPdf: async (params = {}) => {
    const response = await axiosInstance.get('/reports/profit/pdf', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // =========================================================================
  // 5. OUTSTANDING REPORTS
  // =========================================================================
  getCustomerOutstandingReport: async (params = {}) => {
    const response = await axiosInstance.get('/reports/outstanding/customers', { params });
    return response.data;
  },

  downloadCustomerOutstandingPdf: async (params = {}) => {
    const response = await axiosInstance.get('/reports/outstanding/customers/pdf', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  getSupplierOutstandingReport: async (params = {}) => {
    const response = await axiosInstance.get('/reports/outstanding/suppliers', { params });
    return response.data;
  },

  downloadSupplierOutstandingPdf: async (params = {}) => {
    const response = await axiosInstance.get('/reports/outstanding/suppliers/pdf', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // =========================================================================
  // 6. RECEIPT REPORTS
  // =========================================================================
  getReceiptReport: async (params = {}) => {
    const response = await axiosInstance.get('/reports/receipts', { params });
    return response.data;
  },

  getReceiptSummary: async (params = {}) => {
    const response = await axiosInstance.get('/reports/receipts/summary', { params });
    return response.data;
  },

  downloadReceiptReportPdf: async (params = {}) => {
    const response = await axiosInstance.get('/reports/receipts/pdf', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // =========================================================================
  // 7. PAYMENT REPORTS
  // =========================================================================
  getPaymentReport: async (params = {}) => {
    const response = await axiosInstance.get('/reports/payments', { params });
    return response.data;
  },

  getPaymentSummary: async (params = {}) => {
    const response = await axiosInstance.get('/reports/payments/summary', { params });
    return response.data;
  },

  downloadPaymentReportPdf: async (params = {}) => {
    const response = await axiosInstance.get('/reports/payments/pdf', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // =========================================================================
  // 8. SALES RETURN REPORTS
  // =========================================================================
  getSalesReturnReport: async (params = {}) => {
    const response = await axiosInstance.get('/reports/sales-returns', { params });
    return response.data;
  },

  getSalesReturnSummary: async (params = {}) => {
    const response = await axiosInstance.get('/reports/sales-returns/summary', { params });
    return response.data;
  },

  downloadSalesReturnReportPdf: async (params = {}) => {
    const response = await axiosInstance.get('/reports/sales-returns/pdf', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // =========================================================================
  // 9. PURCHASE RETURN REPORTS
  // =========================================================================
  getPurchaseReturnReport: async (params = {}) => {
    const response = await axiosInstance.get('/reports/purchase-returns', { params });
    return response.data;
  },

  getPurchaseReturnSummary: async (params = {}) => {
    const response = await axiosInstance.get('/reports/purchase-returns/summary', { params });
    return response.data;
  },

  downloadPurchaseReturnReportPdf: async (params = {}) => {
    const response = await axiosInstance.get('/reports/purchase-returns/pdf', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default reportService;
