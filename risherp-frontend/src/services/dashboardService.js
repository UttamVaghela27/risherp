import axiosInstance from '../api/axiosInstance';

/**
 * Dashboard API Service
 * Fetches real-time summary cards, sales/purchase charts, transactions,
 * low stock alerts, and customer/supplier balances.
 */
export const dashboardService = {
  getSummary: async (fromDate, toDate) => {
    const params = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    const response = await axiosInstance.get('/dashboard/summary', { params });
    return response.data;
  },

  getSalesOverview: async (fromDate, toDate) => {
    const params = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    const response = await axiosInstance.get('/dashboard/sales-overview', { params });
    return response.data;
  },

  getPurchaseOverview: async (fromDate, toDate) => {
    const params = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    const response = await axiosInstance.get('/dashboard/purchase-overview', { params });
    return response.data;
  },

  getRecentTransactions: async (limit = 10) => {
    const response = await axiosInstance.get('/dashboard/recent-transactions', {
      params: { limit },
    });
    return response.data;
  },

  getLowStock: async () => {
    const response = await axiosInstance.get('/dashboard/low-stock');
    return response.data;
  },

  getCustomerOutstanding: async (limit = 5) => {
    const response = await axiosInstance.get('/dashboard/customer-outstanding', {
      params: { limit },
    });
    return response.data;
  },

  getSupplierOutstanding: async (limit = 5) => {
    const response = await axiosInstance.get('/dashboard/supplier-outstanding', {
      params: { limit },
    });
    return response.data;
  },

  getAdminOverview: async () => {
    const response = await axiosInstance.get('/dashboard/admin-overview');
    return response.data;
  },
};

export default dashboardService;
