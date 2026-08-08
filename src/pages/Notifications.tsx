import React from 'react';
import { Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const Notifications: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/notifications');
      return response.data as Notification[];
    }
  });

  const markAsRead = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  return (
    <PageWrapper>
      <div style={{ padding: 'var(--space-9) var(--space-outer)', maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="text-display-2" style={{ marginBottom: 'var(--space-5)' }}>Notifications</h1>

        {isLoading ? (
          <p>Loading...</p>
        ) : notifications.length === 0 ? (
          <div
            className="glass-card"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-5)', padding: 'var(--space-10)', textAlign: 'center' }}
            role="status"
          >
            <Bell size={72} color="var(--text-muted)" strokeWidth={1} />
            <h2 className="text-h1">No Notifications Yet</h2>
            <p className="text-body-lg" style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
              Order updates, offers, and security alerts will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className="glass-card" 
                style={{ 
                  padding: '1.5rem', 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '1rem',
                  borderLeft: notif.isRead ? 'none' : '4px solid var(--primary-accent)'
                }}
              >
                <div style={{ marginTop: '0.25rem' }}>
                  {notif.message.toLowerCase().includes('fail') ? (
                    <AlertCircle color="var(--error)" />
                  ) : (
                    <CheckCircle2 color="var(--success)" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p className="text-body-lg" style={{ marginBottom: '0.5rem', color: notif.isRead ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {notif.message}
                  </p>
                  <p className="text-body-sm" style={{ color: 'var(--text-muted)' }}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notif.isRead && (
                  <button 
                    onClick={() => markAsRead.mutate(notif.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--primary-accent)', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};
