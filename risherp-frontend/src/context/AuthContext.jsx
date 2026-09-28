import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [verifiedBusiness, setVerifiedBusiness] = useState(() => {
    try {
      const saved = localStorage.getItem('risherp_verified_business');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Rehydrate session on app boot
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Step 1: Verify the Security Code
   */
  const verifySecurityCode = async (securityCode) => {
    try {
      const response = await authService.verifySecurityCode(securityCode);
      if (response.success && response.data) {
        setVerifiedBusiness(response.data);
        localStorage.setItem('risherp_verified_business', JSON.stringify(response.data));
        toast.success(`Verified: ${response.data.businessName}`);
        return response.data;
      }
      throw new Error(response.message || 'Security code verification failed');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Verification failed';
      toast.error(msg);
      throw error;
    }
  };

  /**
   * Reset the verified business (switch business)
   */
  const resetVerifiedBusiness = () => {
    setVerifiedBusiness(null);
    localStorage.removeItem('risherp_verified_business');
  };

  /**
   * Step 2: Login with credentials
   */
  const login = async (email, password, businessId) => {
    try {
      const payload = {
        email: email.trim().toLowerCase(),
        password,
        businessId: businessId || verifiedBusiness?.businessId,
      };

      const response = await authService.login(payload);
      if (response.success && response.data) {
        const { token: jwtToken, user: userData } = response.data;

        localStorage.setItem('token', jwtToken);
        setToken(jwtToken);
        setUser(userData);
        setIsAuthenticated(true);

        toast.success(`Welcome back, ${userData.name}!`);
        return userData;
      }
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Login failed';
      toast.error(msg);
      throw error;
    }
  };

  /**
   * Register business and owner
   */
  const register = async (registrationData) => {
    try {
      const response = await authService.register(registrationData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(msg);
      throw error;
    }
  };

  /**
   * Log out from application
   */
  const logout = useCallback(async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  }, [token]);

  /**
   * Check if the authenticated user has a specific permission code
   */
  const hasPermission = useCallback(
    (permissionCode) => {
      if (!user) return false;
      const roleName = (typeof user.role === 'string' ? user.role : user.role?.name || '').toUpperCase();
      if (roleName === 'ADMIN') return true; // Super admin has all permissions
      const perms = Array.isArray(user.permissions) ? user.permissions : [];
      if (perms.includes(permissionCode)) return true;

      // Handle common aliases for robustness
      const aliasMap = {
        SALE_VIEW: 'SALES_VIEW',
        SALES_VIEW: 'SALE_VIEW',
        SALE_CREATE: 'SALES_CREATE',
        SALES_CREATE: 'SALE_CREATE',
        SETTING_VIEW: 'SETTINGS_VIEW',
        SETTINGS_VIEW: 'SETTING_VIEW',
        AUDIT_VIEW: 'AUDIT_LOG_VIEW',
        AUDIT_LOG_VIEW: 'AUDIT_VIEW',
      };
      const alias = aliasMap[permissionCode];
      return alias ? perms.includes(alias) : false;
    },
    [user]
  );

  /**
   * Check if the authenticated user has any of the listed permission codes
   */
  const hasAnyPermission = useCallback(
    (...permissionCodes) => {
      if (!user) return false;
      const roleName = (typeof user.role === 'string' ? user.role : user.role?.name || '').toUpperCase();
      if (roleName === 'ADMIN') return true;
      return permissionCodes.some((code) => hasPermission(code));
    },
    [user, hasPermission]
  );

  /**
   * Check if the authenticated user has all of the listed permission codes
   */
  const hasAllPermissions = useCallback(
    (...permissionCodes) => {
      if (!user) return false;
      const roleName = (typeof user.role === 'string' ? user.role : user.role?.name || '').toUpperCase();
      if (roleName === 'ADMIN') return true;
      return permissionCodes.every((code) => hasPermission(code));
    },
    [user, hasPermission]
  );

  const isAdmin = useCallback(() => {
    if (!user) return false;
    const roleName = (typeof user.role === 'string' ? user.role : user.role?.name || '').toUpperCase();
    return roleName === 'ADMIN';
  }, [user]);

  const value = {
    user,
    token,
    verifiedBusiness,
    isAuthenticated,
    loading,
    verifySecurityCode,
    resetVerifiedBusiness,
    login,
    register,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    permissions: Array.isArray(user?.permissions) ? user.permissions : [],
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
