import React from 'react';
import { Navigate } from 'react-router-dom';
import { AdminAuthService } from '../services/AdminAuthService';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const session = AdminAuthService.getSession();
  
  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }
  
  const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'COORDINATOR'];
  if (!allowedRoles.includes(session.role)) {
    // If authenticated but wrong role, redirect them to their appropriate dashboard or block them
    if (session.role === 'VOLUNTEER') {
      return <Navigate to="/volunteer" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
