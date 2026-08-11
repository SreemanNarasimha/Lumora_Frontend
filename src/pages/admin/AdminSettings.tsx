import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Save, Settings2, ShieldAlert } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const AdminSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'settings' | 'audit'>('settings');

  // Settings State
  const [settings, setSettings] = useState<{ [key: string]: string }>({
    storeName: 'Lumora',
    supportEmail: 'support@lumora.com',
    currency: 'INR',
    maintenanceMode: 'false'
  });

  const { data: dbSettings, isLoading: loadingSettings } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: async () => {
      const { data } = await api.get('/admin/settings');
      return data;
    }
  });

  const { data: auditLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: async () => {
      const { data } = await api.get('/admin/settings/audit-logs');
      return data;
    }
  });

  useEffect(() => {
    if (dbSettings && dbSettings.length > 0) {
      const newSettings: any = { ...settings };
      dbSettings.forEach((s: any) => {
        newSettings[s.key] = s.value;
      });
      setSettings(newSettings);
    }
  }, [dbSettings]);

  const saveMutation = useMutation({
    mutationFn: async (payload: { key: string, value: string, description?: string }) => {
      return api.post('/admin/settings', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
    }
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const key of Object.keys(settings)) {
      await saveMutation.mutateAsync({ key, value: settings[key] });
    }
    alert('Settings saved successfully!');
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="text-h2">System Settings</h1>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <Button 
          variant={activeTab === 'settings' ? 'primary' : 'secondary'} 
          onClick={() => setActiveTab('settings')}
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <Settings2 size={18} /> Global Config
        </Button>
        <Button 
          variant={activeTab === 'audit' ? 'primary' : 'secondary'} 
          onClick={() => setActiveTab('audit')}
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <ShieldAlert size={18} /> Audit Logs
        </Button>
      </div>

      {activeTab === 'settings' && (
        <div style={{ maxWidth: '600px', padding: 'var(--space-8)', border: '1px solid var(--border-general)', backgroundColor: 'var(--color-bg)', borderRadius: '8px' }}>
          {loadingSettings ? <p>Loading...</p> : (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 500, borderBottom: '1px solid var(--border-general)', paddingBottom: 'var(--space-2)' }}>
                  General Information
                </h3>
                <Input 
                  label="Store Name" 
                  value={settings.storeName} 
                  onChange={e => setSettings({...settings, storeName: e.target.value})} 
                />
                <Input 
                  label="Support Email" 
                  type="email"
                  value={settings.supportEmail} 
                  onChange={e => setSettings({...settings, supportEmail: e.target.value})} 
                />
                <Input 
                  label="Default Currency (e.g., INR, USD)" 
                  value={settings.currency} 
                  onChange={e => setSettings({...settings, currency: e.target.value})} 
                />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="maintenance" 
                    checked={settings.maintenanceMode === 'true'} 
                    onChange={e => setSettings({...settings, maintenanceMode: e.target.checked ? 'true' : 'false'})}
                  />
                  <label htmlFor="maintenance" style={{ color: 'var(--color-danger)', fontWeight: 600 }}>Enable Maintenance Mode</label>
                </div>
              </div>

              <Button type="submit" loading={saveMutation.isPending} style={{ alignSelf: 'flex-start', marginTop: '1rem', display: 'flex', gap: '8px' }}>
                <Save size={18} /> Save Settings
              </Button>
            </form>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="admin-table-container">
          {loadingLogs ? <p className="p-6">Loading logs...</p> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Admin User</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {(auditLogs || []).map((log: any) => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>{log.userEmail}</td>
                    <td>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '0.85em' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{log.details}</td>
                  </tr>
                ))}
                {(!auditLogs || auditLogs.length === 0) && (
                  <tr>
                    <td colSpan={4} className="text-center p-6">No audit logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
