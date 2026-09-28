import axiosInstance from '../api/axiosInstance';

export const ledgerService = {
  /**
   * Get customer ledger with running balance
   */
  getCustomerLedger: async (partyId, params = {}) => {
    const response = await axiosInstance.get(`/ledger/customer/${partyId}`, { params });
    return response.data?.data;
  },

  /**
   * Get supplier ledger with running balance
   */
  getSupplierLedger: async (partyId, params = {}) => {
    const response = await axiosInstance.get(`/ledger/supplier/${partyId}`, { params });
    return response.data?.data;
  },

  /**
   * Get generic party ledger
   */
  getPartyLedger: async (partyId, params = {}) => {
    const response = await axiosInstance.get(`/ledger/party/${partyId}`, { params });
    return response.data?.data;
  },

  /**
   * Get party ledger summary KPIs
   */
  getPartyLedgerSummary: async (partyId) => {
    const response = await axiosInstance.get(`/ledger/party/${partyId}/summary`);
    return response.data?.data;
  },

  /**
   * Synchronize legacy records into ledger
   */
  syncLedger: async () => {
    const response = await axiosInstance.post('/ledger/sync');
    return response.data;
  },
};

export default ledgerService;
