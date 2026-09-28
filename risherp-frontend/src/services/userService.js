import axiosInstance from '../api/axiosInstance';

const userService = {
  /**
   * Get all users with search, role filter, status filter, and pagination
   */
  getUsers: async (params = {}) => {
    const response = await axiosInstance.get('/users', { params });
    return response.data;
  },

  /**
   * Get single user by ID
   */
  getUserById: async (id) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Create a new user
   */
  createUser: async (userData) => {
    const response = await axiosInstance.post('/users', userData);
    return response.data;
  },

  /**
   * Update user details
   */
  updateUser: async (id, userData) => {
    const response = await axiosInstance.put(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Update user active/inactive status
   */
  updateUserStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/users/${id}/status`, { status });
    return response.data;
  },

  /**
   * Assign role to user
   */
  assignRole: async (id, roleId) => {
    const response = await axiosInstance.put(`/users/${id}/roles`, { roleId });
    return response.data;
  },

  /**
   * Change user password
   */
  changePassword: async (id, passwordData) => {
    const response = await axiosInstance.put(`/users/${id}/password`, passwordData);
    return response.data;
  },
};

export default userService;
