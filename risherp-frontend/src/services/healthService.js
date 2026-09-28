import axiosInstance from '../api/axiosInstance';

/**
 * Health Service
 * 
 * Calls the backend health check API to verify connectivity.
 * 
 * Flow:
 * Dashboard Page → healthService.checkHealth()
 *   → axiosInstance.get('/health')
 *     → Backend HealthController.health()
 *       → Returns { success: true, data: { appName, version, status, timestamp } }
 */
const healthService = {
  checkHealth: async () => {
    const response = await axiosInstance.get('/health');
    return response.data;
  },
};

export default healthService;
