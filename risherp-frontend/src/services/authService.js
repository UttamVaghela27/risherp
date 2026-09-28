import axiosInstance from '../api/axiosInstance';

/**
 * Authentication Service
 * Communicates with backend /api/auth endpoints.
 */
export const authService = {
  /**
   * Register a new business and administrator account
   */
  register: async (registrationData) => {
    const response = await axiosInstance.post('/auth/register', registrationData);
    return response.data;
  },

  /**
   * Step 1: Verify the Business Security Code
   */
  verifySecurityCode: async (securityCode) => {
    const response = await axiosInstance.post('/auth/verify-login', { securityCode });
    return response.data;
  },

  /**
   * Step 2: Login with Email and Password
   */
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Rehydrate active user session
   */
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  /**
   * Log out from the backend session
   */
  logout: async () => {
    try {
      const response = await axiosInstance.post('/auth/logout');
      return response.data;
    } catch {
      // Even if network fails, logout should proceed locally
      return { success: true };
    }
  },
};

export default authService;
