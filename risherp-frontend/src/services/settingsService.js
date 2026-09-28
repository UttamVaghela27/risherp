import axiosInstance from '../api/axiosInstance';

const settingsService = {
  // Business Profile
  getBusinessProfile: async () => {
    const response = await axiosInstance.get('/settings/business');
    return response.data;
  },

  updateBusinessProfile: async (data) => {
    const response = await axiosInstance.put('/settings/business', data);
    return response.data;
  },

  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/settings/business/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  removeLogo: async () => {
    const response = await axiosInstance.delete('/settings/business/logo');
    return response.data;
  },

  // Invoice Settings
  getInvoiceSettings: async () => {
    const response = await axiosInstance.get('/settings/invoice');
    return response.data;
  },

  updateInvoiceSettings: async (data) => {
    const response = await axiosInstance.put('/settings/invoice', data);
    return response.data;
  },

  // Numbering Settings
  getNumberingSettings: async () => {
    const response = await axiosInstance.get('/settings/numbering');
    return response.data;
  },

  updateNumberingSetting: async (data) => {
    const response = await axiosInstance.put('/settings/numbering', data);
    return response.data;
  },

  // Application Settings
  getApplicationSettings: async () => {
    const response = await axiosInstance.get('/settings/application');
    return response.data;
  },

  updateApplicationSettings: async (data) => {
    const response = await axiosInstance.put('/settings/application', data);
    return response.data;
  },

  // User Preferences
  getUserPreferences: async () => {
    const response = await axiosInstance.get('/settings/preferences');
    return response.data;
  },

  updateUserPreferences: async (data) => {
    const response = await axiosInstance.put('/settings/preferences', data);
    return response.data;
  },

  // Security Settings
  getSecuritySettings: async () => {
    const response = await axiosInstance.get('/settings/security');
    return response.data;
  },
};

export default settingsService;
