import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminLogin } from '../pages/admin/AdminLogin';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'SUPPORT_STAFF'];

export const AdminRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, loading, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const isAnyAdmin = user ? ADMIN_ROLES.includes(user.role) : false;

  // If a regular (non-admin) user lands on /admin, silently log them out
  // so they can enter admin credentials cleanly.
  useEffect(() => {
    if (!loading && user && !isAnyAdmin) {
      setLoggingOut(true);
      logout().finally(() => setLoggingOut(false));
    }
  }, [loading, user, isAnyAdmin]);

  const showSpinner = loading || loggingOut;

  if (showSpinner) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <circle cx="20" cy="20" r="16" stroke="rgba(26,26,26,0.15)" strokeWidth="3" />
            <circle cx="20" cy="20" r="16" stroke="var(--text-primary)" strokeWidth="3" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="20" style={{ animation: 'btn-spin 0.8s linear infinite', transformOrigin: 'center' }} />
          </svg>
          <p className="text-body-lg" style={{ color: 'var(--text-muted)' }}>Loading Admin...</p>
        </div>
      </div>
    );
  }

  // Not logged in → show admin login
  if (!user) {
    return <AdminLogin />;
  }

  // Logged in as admin — check sub-role permissions
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <AdminLogin />;
    }
  }

  return <>{children}</>;
};
