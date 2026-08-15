import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import './AdminTable.css';

export const AdminCoupons: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minOrderAmount: 0,
    usageLimit: 0,
    active: true
  });

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: async () => {
      const { data } = await api.get('/admin/coupons');
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingCoupon) {
        return api.put(`/admin/coupons/${editingCoupon.id}`, payload);
      }
      return api.post('/admin/coupons', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      alert('Failed to save coupon: ' + (err.response?.data?.message || err.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/admin/coupons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
    }
  });

  const resetForm = () => {
    setEditingCoupon(null);
    setFormData({ 
      code: '', 
      discountType: 'PERCENTAGE', 
      discountValue: 0, 
      minOrderAmount: 0, 
      usageLimit: 0,
      active: true 
    });
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      discountType: coupon.discountType || 'PERCENTAGE',
      discountValue: coupon.discountValue || 0,
      minOrderAmount: coupon.minOrderAmount || 0,
      usageLimit: coupon.usageLimit || 0,
      active: coupon.active
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="text-h2">Coupons & Discounts</h1>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Create Coupon
        </Button>
      </div>

      <div className="admin-table-container">
        {isLoading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min. Order</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons?.map((coupon: any) => (
                <tr key={coupon.id}>
                  <td><strong>{coupon.code}</strong></td>
                  <td>{coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</td>
                  <td>₹{coupon.minOrderAmount || '0'}</td>
                  <td>{coupon.timesUsed} / {coupon.usageLimit || '∞'}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.85em', 
                      background: coupon.active ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.1)',
                      color: coupon.active ? '#00c853' : 'var(--text-muted)'
                    }}>
                      {coupon.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="icon-btn edit-btn" onClick={() => handleEdit(coupon)} title="Edit"><Edit2 size={16} /></button>
                      <button className="icon-btn delete-btn" onClick={() => handleDelete(coupon.id)} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons?.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-muted">No coupons found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
            <form onSubmit={handleSubmit} className="admin-modal-form">
              <Input label="Coupon Code" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required />
              
              <div className="page-section-split" style={{ gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9em', color: 'var(--text-muted)' }}>Discount Type</label>
                  <select 
                    value={formData.discountType} 
                    onChange={e => setFormData({...formData, discountType: e.target.value})}
                    style={{ width: '100%', padding: '12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--text-primary)', borderRadius: '4px' }}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
                <Input label="Discount Value" type="number" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: parseFloat(e.target.value)})} required />
              </div>

              <div className="page-section-split" style={{ gap: '16px' }}>
                <Input label="Min Order Amount (₹)" type="number" value={formData.minOrderAmount} onChange={e => setFormData({...formData, minOrderAmount: parseFloat(e.target.value)})} />
                <Input label="Usage Limit (0 = Unlimited)" type="number" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: parseInt(e.target.value)})} />
              </div>
              
              <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                <input 
                  type="checkbox" 
                  id="couponActive" 
                  checked={formData.active} 
                  onChange={e => setFormData({...formData, active: e.target.checked})} 
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="couponActive">Active Coupon</label>
              </div>
              
              <div className="admin-modal-actions">
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" loading={saveMutation.isPending}>{editingCoupon ? 'Update' : 'Save'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
