import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Plus, Edit2, Trash2, Search, Upload, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import './AdminTable.css';

export const AdminProducts: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    brandId: '',
    skinTypeId: '',
    skinTypeId: '',
    stock: '',
    sku: '',
    barcode: '',
    images: ''
  });

  const { data, isLoading } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      const { data } = await api.get('/products?size=100'); // simple fetch all
      return data.content || [];
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: async () => {
      const { data } = await api.get('/admin/categories');
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (product: any) => {
      if (editingProduct) {
        return api.put(`/admin/products/${editingProduct.productId}`, product);
      } else {
        return api.post('/admin/products', product);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      setIsModalOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/admin/products/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: (response) => {
      alert(response.data);
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    },
    onError: (error: any) => {
      alert('Upload failed: ' + (error.response?.data || error.message));
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadMutation.mutate(e.target.files[0]);
    }
    e.target.value = ''; // Reset input
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', categoryId: '', brandId: '', skinTypeId: '', stock: '', sku: '', barcode: '', images: '' });
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId || '',
      brandId: product.brandId || '',
      skinTypeId: product.skinTypeId || '',
      stock: product.stock !== undefined ? product.stock.toString() : '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      images: product.images?.join(', ') || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      brandId: formData.brandId ? parseInt(formData.brandId) : null,
      skinTypeId: formData.skinTypeId ? parseInt(formData.skinTypeId) : null,
      stock: formData.stock ? parseInt(formData.stock) : 0,
      images: formData.images.split(',').map(s => s.trim()).filter(s => s)
    };
    saveMutation.mutate(payload);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredData = Array.isArray(data) ? data.filter((p: any) => p?.name?.toLowerCase()?.includes(searchTerm.toLowerCase())) : [];

  const handleExportCSV = () => {
    if (!data || data.length === 0) return alert('No data to export.');
    const BOM = '\uFEFF';
    let csv = BOM + 'Product ID,Name,Price,Stock,SKU,Barcode,Category,Brand\n';
    data.forEach((p: any) => {
      // Escape commas in name
      const name = p.name ? `"${p.name.replace(/"/g, '""')}"` : '';
      csv += `${p.productId},${name},${p.price},${p.stock},${p.sku || ''},${p.barcode || ''},${p.categoryName || ''},${p.brandName || ''}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Products_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="text-h2">Products</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" onClick={() => document.getElementById('csvUpload')?.click()} disabled={uploadMutation.isPending}>
            <Upload size={18} style={{ marginRight: '8px' }}/> {uploadMutation.isPending ? 'Uploading...' : 'Bulk CSV'}
          </Button>
          <input 
            type="file" 
            id="csvUpload" 
            accept=".csv" 
            style={{ display: 'none' }} 
            onChange={handleFileUpload} 
          />
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus size={18} /> Add Product
          </Button>
        </div>
      </div>

      <div className="admin-page-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Input 
          placeholder="Search products..." 
          leftIcon={<Search size={18} />} 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button onClick={handleExportCSV} variant="secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Download size={18} /> Export CSV
          </Button>
          <div style={{ position: 'relative' }}>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
            />
            <Button variant="secondary" style={{ pointerEvents: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Upload size={18} /> Upload CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="admin-table-container ">
        {isLoading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData?.map((product: any) => (
                <tr key={product.productId}>
                  <td>
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="admin-table-img" />
                    ) : (
                      <div className="admin-table-img-placeholder" />
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>{product.sku || '-'}</td>
                  <td>{product.categoryName || '-'}</td>
                  <td>₹{product.price?.toFixed(2) ?? '0.00'}</td>
                  <td>
                    <span style={{ color: product.stock < 3 ? 'var(--color-danger)' : 'inherit', fontWeight: product.stock < 3 ? 'bold' : 'normal' }}>
                      {product.stock ?? 0}
                    </span>
                  </td>
                  <td>{product.rating}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="icon-btn edit-btn" onClick={() => handleEdit(product)} title="Edit"><Edit2 size={16} /></button>
                      <button className="icon-btn delete-btn" onClick={() => handleDelete(product.productId)} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData?.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center p-6 text-muted">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal ">
            <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} className="admin-modal-form">
              <Input label="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <Input label="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              <Input label="Price (₹)" type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
              <Input label="Stock" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <Input label="SKU" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                <Input label="Barcode" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} />
              </div>
              
              <div className="input-group">
                <label className="input-label">Category</label>
                <select 
                  className="input-field" 
                  value={formData.categoryId} 
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {Array.isArray(categories) && categories.map((c: any) => (
                    <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                  ))}
                </select>
              </div>

              <Input label="Image URLs (comma separated)" value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})} />
              
              <div className="admin-modal-actions">
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" loading={saveMutation.isPending}>{editingProduct ? 'Update' : 'Save'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
