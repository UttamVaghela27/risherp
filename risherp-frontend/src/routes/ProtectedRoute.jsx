import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * ProtectedRoute Component
 * Guards routes that require authentication, specific user roles, or specific permissions.
 */
export const ProtectedRoute = ({
  children,
  allowedRoles,
  requiredPermission,
  anyOfPermissions,
}) => {
  const { isAuthenticated, loading, user, hasPermission, hasAnyPermission, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Verifying session..." fullPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Super admin bypasses all role/permission restrictions
  if (isAdmin()) {
    return children;
  }

  // Check role restrictions
  const userRole = typeof user?.role === 'string' ? user.role : user?.role?.name;
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check any-of permissions
  if (anyOfPermissions && anyOfPermissions.length > 0 && !hasAnyPermission(...anyOfPermissions)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
