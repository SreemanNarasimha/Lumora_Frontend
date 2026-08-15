import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import './AdminTable.css';

export const AdminBanners: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    sortOrder: 0,
    active: true
  });

  const { data: banners, isLoading } = useQuery({
    queryKey: ['adminBanners'],
    queryFn: async () => {
      const { data } = await api.get('/admin/banners');
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingBanner) {
        return api.put(`/admin/banners/${editingBanner.id}`, payload);
      }
      return api.post('/admin/banners', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setIsModalOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/admin/banners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    }
  });

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({ title: '', subtitle: '', imageUrl: '', linkUrl: '', sortOrder: 0, active: true });
  };

  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl || '',
      linkUrl: banner.linkUrl || '',
      sortOrder: banner.sortOrder || 0,
      active: banner.active
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="text-h2">Homepage Banners</h1>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add Banner
        </Button>
      </div>

      <div className="admin-table-container">
        {isLoading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Link</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners?.map((banner: any) => (
                <tr key={banner.id}>
                  <td>
                    {banner.imageUrl ? (
                      <img src={banner.imageUrl} alt={banner.title} className="admin-table-img" style={{ width: '100px', height: '50px', objectFit: 'cover' }} />
                    ) : (
                      <div className="admin-table-img-placeholder"><ImageIcon /></div>
                    )}
                  </td>
                  <td>{banner.title || '-'}</td>
                  <td>{banner.linkUrl || '-'}</td>
                  <td>{banner.sortOrder}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.85em', 
                      background: banner.active ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.1)',
                      color: banner.active ? '#00c853' : 'var(--text-muted)'
                    }}>
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="icon-btn edit-btn" onClick={() => handleEdit(banner)} title="Edit"><Edit2 size={16} /></button>
                      <button className="icon-btn delete-btn" onClick={() => handleDelete(banner.id)} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {banners?.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-muted">No banners found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>{editingBanner ? 'Edit Banner' : 'Add Banner'}</h2>
            <form onSubmit={handleSubmit} className="admin-modal-form">
              <Input label="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              <Input label="Subtitle" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
              <Input label="Image URL" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} required />
              <Input label="Link URL" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} />
              
              <div className="page-section-split" style={{ gap: 'var(--space-4)' }}>
                <Input label="Sort Order" type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value)})} />
                
                <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '28px' }}>
                  <input 
                    type="checkbox" 
                    id="bannerActive" 
                    checked={formData.active} 
                    onChange={e => setFormData({...formData, active: e.target.checked})} 
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="bannerActive">Active Banner</label>
                </div>
              </div>
              
              <div className="admin-modal-actions">
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" loading={saveMutation.isPending}>{editingBanner ? 'Update' : 'Save'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
