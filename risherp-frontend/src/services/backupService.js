import axiosInstance from '../api/axiosInstance';

const backupService = {
  getBackups: async (params = {}) => {
    const response = await axiosInstance.get('/backups', { params });
    return response.data;
  },

  createBackup: async () => {
    const response = await axiosInstance.post('/backups');
    return response.data;
  },

  getBackupById: async (id) => {
    const response = await axiosInstance.get(`/backups/${id}`);
    return response.data;
  },

  downloadBackup: async (id, fileName = 'backup.sql') => {
    const response = await axiosInstance.get(`/backups/${id}/download`, {
      responseType: 'blob',
    });

    // Create a download link and trigger download
    const blob = new Blob([response.data], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  restoreBackup: async (id) => {
    const response = await axiosInstance.post(`/backups/${id}/restore`);
    return response.data;
  },
};

export default backupService;
