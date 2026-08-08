import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    storeName: 'Lumora',
    supportEmail: 'support@lumora.com',
    currency: 'USD',
    taxRate: '8.5',
    freeShippingThreshold: '50'
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="text-h2">Store Settings</h1>
      </div>

      <div className="" style={{ maxWidth: '600px', padding: 'var(--space-8)', border: '1px solid var(--border-general)', backgroundColor: 'var(--color-bg)' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 500, borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>
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
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 500, borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>
              Financials
            </h3>
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div style={{ flex: 1 }}>
                <Input 
                  label="Currency" 
                  value={settings.currency} 
                  onChange={e => setSettings({...settings, currency: e.target.value})} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input 
                  label="Tax Rate (%)" 
                  type="number"
                  step="0.01"
                  value={settings.taxRate} 
                  onChange={e => setSettings({...settings, taxRate: e.target.value})} 
                />
              </div>
            </div>
            <Input 
              label="Free Shipping Threshold (₹)" 
              type="number"
              value={settings.freeShippingThreshold} 
              onChange={e => setSettings({...settings, freeShippingThreshold: e.target.value})} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
            <Button type="submit" loading={isSaving}>
              <Save size={18} style={{ marginRight: '8px' }} /> Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
