import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { ROUTES } from '../../lib/routes';
import type { User } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: User['type'] | User['type'][];
  redirectTo?: string;
}

/**
 * ProtectedRoute component that guards routes requiring authentication.
 *
 * BUGFIX: Prevents unauthenticated access to protected pages
 * - Redirects to login if user is not authenticated
 * - Optionally restricts access based on user role
 *
 * @param children - The component(s) to render if authorized
 * @param requiredRole - Optional role(s) required to access the route
 * @param redirectTo - Optional custom redirect path (defaults to LOGIN)
 */
export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = ROUTES.LOGIN
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  // Check authentication
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role authorization if required
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!allowedRoles.includes(user.type)) {
      // User is authenticated but doesn't have required role
      // Redirect to dashboard instead of login
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  // User is authenticated and authorized
  return <>{children}</>;
}
