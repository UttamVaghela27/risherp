import axiosInstance from '../api/axiosInstance';

const auditService = {
  getAuditLogs: async (params = {}) => {
    const response = await axiosInstance.get('/audit-logs', { params });
    return response.data;
  },

  getAuditLogById: async (id) => {
    const response = await axiosInstance.get(`/audit-logs/${id}`);
    return response.data;
  },
};

export default auditService;
