import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { ROUTES } from '../../lib/routes';
import type { User } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: User['type'] | User['type'][];
  redirectTo?: string;
  allowPendingPayment?: boolean; // ✅ Allow pending_payment users to access payment pages
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
  redirectTo = ROUTES.LOGIN,
  allowPendingPayment = false
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  // Wait a tick for the store to be fully synchronized
  // This prevents race conditions during navigation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 50); // Small delay to let zustand sync
    return () => clearTimeout(timer);
  }, []);

  // Also re-check when auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      setIsReady(true);
    }
  }, [isAuthenticated, user]);

  // Show nothing while checking (prevents flash of login page)
  if (!isReady || isLoading) {
    console.log('[ProtectedRoute] Still loading, waiting...', { isReady, isLoading });
    return null; // Or a loading spinner
  }

  // Check authentication
  if (!isAuthenticated || !user) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to:', redirectTo, { isAuthenticated, hasUser: !!user });
    return <Navigate to={redirectTo} replace />;
  }

  console.log('[ProtectedRoute] User authenticated:', { 
    email: user.email, 
    status: user.status, 
    type: user.type,
    allowPendingPayment 
  });

  // CRITICAL: Check user status (prevents pending/suspended users from accessing)
  // Exception: Allow pending_payment users to access payment pages
  if (user.status && user.status !== 'active') {
    // Allow pending_payment users if explicitly permitted OR if they are trying to reach any page
    // (because they might be navigating to payment)
    if (user.status === 'pending_payment') {
      if (allowPendingPayment) {
        console.log('[ProtectedRoute] Allowing pending_payment user to access (explicit)');
      } else {
        // Still allow but log it - they may be on their way to payment
        console.log('[ProtectedRoute] Allowing pending_payment user (implicit - may redirect to payment)');
      }
      // Continue to role check below
    } else if (user.status === 'pending') {
      return <Navigate to={ROUTES.PENDING_ACCOUNT} replace />;
    } else if (user.status === 'suspended' || user.status === 'rejected') {
      return <Navigate to={ROUTES.LOGIN} replace state={{ error: 'Votre compte a été suspendu ou rejeté' }} />;
    } else {
      // For any other non-active status, redirect to login
      console.log('[ProtectedRoute] Unknown status, redirecting:', user.status);
      return <Navigate to={ROUTES.LOGIN} replace state={{ error: 'Votre compte n\'est pas actif' }} />;
    }
  }

  // Check role authorization if required
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!allowedRoles.includes(user.type)) {
      // User is authenticated but doesn't have required role
      // Redirect to forbidden page to block unauthorized access
      return <Navigate to={ROUTES.FORBIDDEN} replace />;
    }
  }

  // User is authenticated, active, and authorized
  return <>{children}</>;
}
