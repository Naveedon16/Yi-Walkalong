import React from 'react';
import { Navigate } from 'react-router-dom';
import { AdminAuthService } from '../services/AdminAuthService';

interface VolunteerRouteProps {
  children: React.ReactNode;
}

export function VolunteerRoute({ children }: VolunteerRouteProps) {
  const session = AdminAuthService.getSession();
  
  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (session.role !== 'VOLUNTEER') {
    // If Admin attempts to access volunteer route, redirect them to admin panel
    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'COORDINATOR'];
    if (adminRoles.includes(session.role)) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
