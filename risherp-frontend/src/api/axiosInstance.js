import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../utils/constants';

/**
 * Axios Instance — Central HTTP Client
 * 
 * This is the ONLY place where we configure Axios.
 * All API calls in the app use this instance.
 * 
 * Flow:
 * Component → Service → axiosInstance.get/post/put/delete → Backend API
 * 
 * Interceptors:
 * - Request: Attaches auth token (if available) to every request
 * - Response: Extracts data on success, shows toast on errors
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * REQUEST INTERCEPTOR
 * Runs BEFORE every request is sent to the backend.
 * Attaches the auth token from localStorage to the Authorization header.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * Runs AFTER every response is received from the backend.
 * - On success: returns the response as-is for the caller to use
 * - On error: shows a toast notification and handles specific status codes
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Successful response (2xx status codes)
    return response;
  },
  (error) => {
    // Error response (4xx, 5xx status codes)
    const { response } = error;

    if (response) {
      const { status, data } = response;

      switch (status) {
        case 400:
          // Bad Request — validation errors or invalid data
          if (data?.errors && data.errors.length > 0) {
            data.errors.forEach((err) => toast.error(err));
          } else {
            toast.error(data?.message || 'Invalid request');
          }
          break;

        case 401:
          // Unauthorized — session expired or invalid token
          toast.error(data?.message || 'Session expired. Please login again.');
          localStorage.removeItem('token');
          // Redirect to login (will be handled properly in Phase 3)
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
          break;

        case 403:
          // Forbidden — user doesn't have permission
          toast.error('You do not have permission to perform this action');
          break;

        case 404:
          // Not Found
          toast.error(data?.message || 'Resource not found');
          break;

        case 409:
          // Conflict — duplicate resource
          toast.error(data?.message || 'Resource already exists');
          break;

        case 500:
          // Server Error
          toast.error('Server error. Please try again later.');
          break;

        default:
          toast.error(data?.message || 'Something went wrong');
      }
    } else if (error.request) {
      // Request was made but no response received (network error)
      toast.error('Network error. Please check your internet connection.');
    } else {
      // Something else went wrong
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
