import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * PermissionGuard component conditionally renders children based on user permissions.
 *
 * Props:
 * - permission: string (single required permission)
 * - anyOf: string[] (user must have at least one)
 * - allOf: string[] (user must have all)
 * - fallback: ReactNode (rendered if not authorized, default null)
 * - children: ReactNode
 */
export const PermissionGuard = ({
  permission,
  anyOf,
  allOf,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isAdmin } = useAuth();

  if (isAdmin()) {
    return <>{children}</>;
  }

  let authorized = true;

  if (permission && !hasPermission(permission)) {
    authorized = false;
  }

  if (anyOf && anyOf.length > 0 && !hasAnyPermission(...anyOf)) {
    authorized = false;
  }

  if (allOf && allOf.length > 0 && !hasAllPermissions(...allOf)) {
    authorized = false;
  }

  if (!authorized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;
