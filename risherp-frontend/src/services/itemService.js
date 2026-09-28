import axiosInstance from '../api/axiosInstance';

/**
 * Item Service
 * REST API client for Item Master, Barcode lookup, and Inventory operations.
 */
export const itemService = {
  /**
   * Fetch paginated list of items with search, category, status, and stockStatus filters.
   */
  getItems: async ({
    page = 0,
    size = 10,
    search = '',
    categoryId = '',
    status = '',
    stockStatus = '',
    sortBy = 'createdAt',
    sortDir = 'desc',
  } = {}) => {
    const params = { page, size, sortBy, sortDir };
    if (search && search.trim()) params.search = search.trim();
    if (categoryId && categoryId !== 'ALL') params.categoryId = categoryId;
    if (status && status !== 'ALL') params.status = status;
    if (stockStatus && stockStatus !== 'ALL') params.stockStatus = stockStatus;

    const response = await axiosInstance.get('/items', { params });
    return response.data;
  },

  /**
   * Fetch aggregate inventory metrics (total, low stock, out of stock, valuation).
   */
  getItemSummary: async () => {
    const response = await axiosInstance.get('/items/summary');
    return response.data;
  },

  /**
   * Fetch centralized list of standard measurement units.
   */
  getUnits: async () => {
    const response = await axiosInstance.get('/items/units');
    return response.data;
  },

  /**
   * Fast lookup of item by barcode (used by barcode scanner / POS billing).
   */
  findItemByBarcode: async (barcode) => {
    const response = await axiosInstance.get(`/items/barcode/${encodeURIComponent(barcode)}`);
    return response.data;
  },

  /**
   * Fetch single item details by ID.
   */
  getItemById: async (id) => {
    const response = await axiosInstance.get(`/items/${id}`);
    return response.data;
  },

  /**
   * Create a new item (with optional opening stock).
   */
  createItem: async (itemData) => {
    const response = await axiosInstance.post('/items', itemData);
    return response.data;
  },

  /**
   * Update item details (currentStock is preserved and immutable).
   */
  updateItem: async (id, itemData) => {
    const response = await axiosInstance.put(`/items/${id}`, itemData);
    return response.data;
  },

  /**
   * Toggle item ACTIVE/INACTIVE status.
   */
  updateItemStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/items/${id}/status`, { status });
    return response.data;
  },

  /**
   * Delete an item record.
   */
  deleteItem: async (id) => {
    const response = await axiosInstance.delete(`/items/${id}`);
    return response.data;
  },
};

export default itemService;
