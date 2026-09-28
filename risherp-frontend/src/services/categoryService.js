import axiosInstance from '../api/axiosInstance';

/**
 * Category Service
 * REST API client for Category Master operations.
 */
export const categoryService = {
  /**
   * Fetch paginated list of categories with optional search and status filters.
   */
  getCategories: async ({
    page = 0,
    size = 10,
    search = '',
    status = '',
    sortBy = 'categoryName',
    sortDir = 'asc',
    allActive = false,
  } = {}) => {
    const params = { page, size, sortBy, sortDir };
    if (search && search.trim()) params.search = search.trim();
    if (status && status !== 'ALL') params.status = status;
    if (allActive) params.allActive = true;

    const response = await axiosInstance.get('/categories', { params });
    return response.data;
  },

  /**
   * Fetch all active categories for dropdown selectors.
   */
  getAllActiveCategories: async () => {
    const response = await axiosInstance.get('/categories', {
      params: { allActive: true },
    });
    return response.data;
  },

  /**
   * Fetch a single category by ID.
   */
  getCategoryById: async (id) => {
    const response = await axiosInstance.get(`/categories/${id}`);
    return response.data;
  },

  /**
   * Create a new category.
   */
  createCategory: async (categoryData) => {
    const response = await axiosInstance.post('/categories', categoryData);
    return response.data;
  },

  /**
   * Update an existing category.
   */
  updateCategory: async (id, categoryData) => {
    const response = await axiosInstance.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  /**
   * Toggle category status (ACTIVE / INACTIVE).
   */
  updateCategoryStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/categories/${id}/status`, { status });
    return response.data;
  },

  /**
   * Safely delete a category if not referenced by items.
   */
  deleteCategory: async (id) => {
    const response = await axiosInstance.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
