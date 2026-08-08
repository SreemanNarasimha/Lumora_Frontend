import React from 'react';
import { AlertTriangle, LayoutDashboard } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';

export const AdminPanel: React.FC = () => (
  <PageWrapper>
    <div style={{ padding: 'var(--space-9) var(--space-outer)', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="text-display-2" style={{ marginBottom: 'var(--space-5)' }}>Admin Panel</h1>

      <div className="pending-backend-banner" role="status">
        <AlertTriangle size={18} />
        ⚠️ Pending Backend — Admin Panel requires new role-based access control, endpoints, and tables.
      </div>

      <div
        className="glass-card"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-5)', padding: 'var(--space-10)', textAlign: 'center' }}
      >
        <LayoutDashboard size={72} color="var(--text-muted)" strokeWidth={1} />
        <h2 className="text-h1">Admin Panel</h2>
        <p className="text-body-lg" style={{ color: 'var(--text-muted)', maxWidth: '440px' }}>
          Product management, order oversight, user administration, and analytics will appear here
          once the admin backend layer is implemented.
        </p>
      </div>
    </div>
  </PageWrapper>
);
