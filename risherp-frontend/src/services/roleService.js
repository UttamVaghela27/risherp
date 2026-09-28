import axiosInstance from '../api/axiosInstance';

const roleService = {
  /**
   * Get all roles with search, status filter, and pagination
   */
  getRoles: async (params = {}) => {
    const response = await axiosInstance.get('/roles', { params });
    return response.data;
  },

  /**
   * Get single role by ID with permissions
   */
  getRoleById: async (id) => {
    const response = await axiosInstance.get(`/roles/${id}`);
    return response.data;
  },

  /**
   * Create a new role
   */
  createRole: async (roleData) => {
    const response = await axiosInstance.post('/roles', roleData);
    return response.data;
  },

  /**
   * Update role name and description
   */
  updateRole: async (id, roleData) => {
    const response = await axiosInstance.put(`/roles/${id}`, roleData);
    return response.data;
  },

  /**
   * Update role active/inactive status
   */
  updateRoleStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/roles/${id}/status`, { status });
    return response.data;
  },

  /**
   * Assign permissions to role
   */
  assignPermissions: async (id, permissionIds) => {
    const response = await axiosInstance.put(`/roles/${id}/permissions`, { permissionIds });
    return response.data;
  },

  /**
   * Get all grouped permissions catalog
   */
  getAllPermissions: async () => {
    const response = await axiosInstance.get('/permissions');
    return response.data;
  },
};

export default roleService;
