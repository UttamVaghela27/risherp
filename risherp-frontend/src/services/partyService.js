import axiosInstance from '../api/axiosInstance';

/**
 * Party Service
 * REST API client for Party Master operations (Parties, Customers, Suppliers).
 */
export const partyService = {
  /**
   * Fetch paginated list of parties with multi-field search and filters.
   */
  getParties: async ({
    page = 0,
    size = 10,
    search = '',
    type = '',
    status = '',
    sortBy = 'createdAt',
    sortDir = 'desc',
  } = {}) => {
    const params = { page, size, sortBy, sortDir };
    if (search && search.trim()) params.search = search.trim();
    if (type && type !== 'ALL') params.type = type;
    if (status && status !== 'ALL') params.status = status;

    const response = await axiosInstance.get('/parties', { params });
    return response.data;
  },

  /**
   * Fetch aggregated party counts and opening receivable/payable balances.
   */
  getPartySummary: async () => {
    const response = await axiosInstance.get('/parties/summary');
    return response.data;
  },

  /**
   * Fetch a single party record by ID.
   */
  getPartyById: async (id) => {
    const response = await axiosInstance.get(`/parties/${id}`);
    return response.data;
  },

  /**
   * Create a new party profile.
   */
  createParty: async (partyData) => {
    const response = await axiosInstance.post('/parties', partyData);
    return response.data;
  },

  /**
   * Update an existing party profile.
   */
  updateParty: async (id, partyData) => {
    const response = await axiosInstance.put(`/parties/${id}`, partyData);
    return response.data;
  },

  /**
   * Toggle party ACTIVE/INACTIVE status.
   */
  updatePartyStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/parties/${id}/status`, { status });
    return response.data;
  },

  /**
   * Safely delete a party (if without transactional history).
   */
  deleteParty: async (id) => {
    const response = await axiosInstance.delete(`/parties/${id}`);
    return response.data;
  },
};

export default partyService;
