import axiosInstance from '../api/axiosInstance';

export const outstandingService = {
  /**
   * Get customer outstanding page
   */
  getCustomerOutstanding: async (params = {}) => {
    const response = await axiosInstance.get('/outstanding/customers', { params });
    return response.data?.data;
  },

  /**
   * Get supplier outstanding page
   */
  getSupplierOutstanding: async (params = {}) => {
    const response = await axiosInstance.get('/outstanding/suppliers', { params });
    return response.data?.data;
  },

  /**
   * Get outstanding summary KPI metrics
   */
  getOutstandingSummary: async () => {
    const response = await axiosInstance.get('/outstanding/summary');
    return response.data?.data;
  },

  /**
   * Get invoice-level breakdown for a customer
   */
  getCustomerInvoices: async (partyId) => {
    const response = await axiosInstance.get(`/outstanding/customer/${partyId}/invoices`);
    return response.data?.data;
  },

  /**
   * Get invoice-level breakdown for a supplier
   */
  getSupplierInvoices: async (partyId) => {
    const response = await axiosInstance.get(`/outstanding/supplier/${partyId}/invoices`);
    return response.data?.data;
  },
};

export default outstandingService;
