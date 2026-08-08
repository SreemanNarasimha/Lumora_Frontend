import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <circle cx="20" cy="20" r="16" stroke="rgba(255, 122, 31,0.3)" strokeWidth="3" />
            <circle cx="20" cy="20" r="16" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="20" style={{ animation: 'btn-spin 0.8s linear infinite', transformOrigin: 'center' }} />
          </svg>
          <p className="text-body-lg" style={{ color: 'var(--text-muted)' }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
