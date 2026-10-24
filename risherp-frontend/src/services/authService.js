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

  // ── Email Verification ─────────────────────────────────────────────────

  /**
   * Send email verification OTP (called after registration or for resend)
   */
  sendVerificationOtp: async (email) => {
    const response = await axiosInstance.post('/auth/send-verification-otp', { email });
    return response.data;
  },

  /**
   * Verify the email OTP entered by the user
   */
  verifyEmailOtp: async (email, otp) => {
    const response = await axiosInstance.post('/auth/verify-email-otp', { email, otp });
    return response.data;
  },

  /**
   * Resend email verification OTP
   */
  resendVerificationOtp: async (email) => {
    const response = await axiosInstance.post('/auth/resend-verification-otp', { email });
    return response.data;
  },

  // ── Forgot / Reset Password ────────────────────────────────────────────

  /**
   * Request a password reset OTP for the given email
   */
  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Verify the password-reset OTP and receive a single-use reset token
   */
  verifyResetOtp: async (email, otp) => {
    const response = await axiosInstance.post('/auth/verify-reset-otp', { email, otp });
    return response.data;
  },

  /**
   * Submit the new password along with the reset token
   */
  resetPassword: async (email, resetToken, newPassword, confirmPassword) => {
    const response = await axiosInstance.post('/auth/reset-password', {
      email,
      resetToken,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },
};

export default authService;
