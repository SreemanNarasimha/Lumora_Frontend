import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { PageWrapper } from '../components/layout/PageWrapper';
import { BackButton } from '../components/ui/BackButton';
import { Button } from '../components/ui/Button';
import { MapPin, Plus, Trash2, CheckCircle2, Home } from 'lucide-react';

interface Address {
  addressId: number;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export const Addresses: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [label, setLabel] = useState('Home');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await api.get('/addresses');
      return res.data;
    }
  });

  const addAddress = useMutation({
    mutationFn: async () => {
      await api.post('/addresses', {
        label,
        line1,
        line2,
        city,
        state,
        postalCode,
        country: 'India',
        phone,
        isDefault
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setShowModal(false);
      resetForm();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to save address. Please try again.';
      alert(msg);
    }
  });

  const deleteAddress = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    }
  });

  const setDefault = useMutation({
    mutationFn: async (id: number) => {
      await api.put(`/addresses/${id}/default`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    }
  });

  const resetForm = () => {
    setLabel('Home');
    setLine1('');
    setLine2('');
    setCity('');
    setState('');
    setPostalCode('');
    setPhone('');
    setIsDefault(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAddress.mutate();
  };

  return (
    <PageWrapper>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 var(--space-outer) 4rem', width: '100%' }}>
        <BackButton label="Back to Profile" />
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '42px', color: 'var(--text-primary)' }}>Saved Addresses</h1>
            <p className="text-body" style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
              Manage your delivery addresses for seamless checkout
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <Plus size={16} strokeWidth={1.5} style={{ marginRight: '6px' }} />
            Add New
          </Button>
        </div>

        {isLoading ? (
          <div style={{ padding: 'var(--space-10)', textAlign: 'center', border: '1px solid var(--border-general)' }}>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Loading addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div style={{ padding: 'var(--space-10) var(--space-8)', textAlign: 'center', border: '1px dashed var(--border-general)' }}>
            <MapPin size={48} strokeWidth={1} color="var(--text-secondary)" style={{ marginBottom: 'var(--space-4)' }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>No saved addresses</h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
              Add a shipping address to speed up your checkout process.
            </p>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Add Address
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            {addresses.map(addr => (
              <div key={addr.addressId} style={{ padding: 'var(--space-6)', border: addr.isDefault ? '1px solid var(--text-primary)' : '1px solid var(--border-general)', background: addr.isDefault ? 'var(--color-surface-hover)' : 'transparent', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Home size={16} strokeWidth={1.5} color="var(--text-primary)" />
                    <span className="text-body" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{addr.label || 'Address'}</span>
                  </div>
                  {addr.isDefault && (
                    <span className="text-body-sm" style={{ border: '1px solid var(--text-primary)', color: 'var(--text-primary)', padding: '2px 8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Default
                    </span>
                  )}
                </div>

                <p className="text-body" style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: 'var(--space-2)' }}>{addr.line1}</p>
                {addr.line2 && <p className="text-body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>{addr.line2}</p>}
                <p className="text-body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>{addr.city}, {addr.state} - {addr.postalCode}</p>
                <p className="text-body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>{addr.country}</p>
                {addr.phone && <p className="text-body-sm" style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>Phone: {addr.phone}</p>}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-general)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                  {!addr.isDefault ? (
                    <button
                      onClick={() => setDefault.mutate(addr.addressId)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'color var(--duration-fast) ease' }}
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      <CheckCircle2 size={14} strokeWidth={1.5} /> Default Address
                    </span>
                  )}

                  <button
                    onClick={() => deleteAddress.mutate(addr.addressId)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '4px' }}
                    aria-label="Delete address"
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Adding New Address */}
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
            <div style={{ padding: 'var(--space-8)', maxWidth: '500px', width: '100%', background: 'var(--color-bg)', border: '1px solid var(--border-general)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', color: 'var(--text-primary)', marginBottom: 'var(--space-6)' }}>Add New Address</h2>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <label className="text-body-sm" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-2)' }}>Address Label</label>
                  <input
                    type="text"
                    placeholder="Home / Office / Other"
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border-general)', background: 'transparent', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <div>
                  <label className="text-body-sm" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-2)' }}>Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="House No., Building, Street"
                    value={line1}
                    onChange={e => setLine1(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border-general)', background: 'transparent', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <div>
                  <label className="text-body-sm" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-2)' }}>Apartment / Suite (Optional)</label>
                  <input
                    type="text"
                    placeholder="Apartment, suite, unit"
                    value={line2}
                    onChange={e => setLine2(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border-general)', background: 'transparent', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                  <div style={{ flex: 1 }}>
                    <label className="text-body-sm" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-2)' }}>City *</label>
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      style={{ width: '100%', padding: '12px', border: '1px solid var(--border-general)', background: 'transparent', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', fontFamily: 'var(--font-body)' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="text-body-sm" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-2)' }}>State *</label>
                    <input
                      type="text"
                      required
                      placeholder="State"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      style={{ width: '100%', padding: '12px', border: '1px solid var(--border-general)', background: 'transparent', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', fontFamily: 'var(--font-body)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                  <div style={{ flex: 1 }}>
                    <label className="text-body-sm" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-2)' }}>Postal Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="Pincode"
                      value={postalCode}
                      onChange={e => setPostalCode(e.target.value)}
                      style={{ width: '100%', padding: '12px', border: '1px solid var(--border-general)', background: 'transparent', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', fontFamily: 'var(--font-body)' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="text-body-sm" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-2)' }}>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      style={{ width: '100%', padding: '12px', border: '1px solid var(--border-general)', background: 'transparent', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', fontFamily: 'var(--font-body)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'var(--space-2)' }}>
                  <input
                    type="checkbox"
                    id="isDefaultCheck"
                    checked={isDefault}
                    onChange={e => setIsDefault(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', border: '1px solid var(--border-general)' }}
                  />
                  <label htmlFor="isDefaultCheck" className="text-body-sm" style={{ color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Set as default address
                  </label>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                  <Button type="submit" variant="primary" style={{ flex: 1 }}>
                    Save Address
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};
