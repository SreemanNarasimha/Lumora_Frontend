import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const AdminCategories: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: async () => {
      const { data } = await api.get('/admin/categories');
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (category: any) => {
      if (editingCategory) {
        return api.put(`/admin/categories/${editingCategory.categoryId}`, category);
      } else {
        return api.post('/admin/categories', category);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      setIsModalOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/admin/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
    }
  });

  const resetForm = () => {
    setEditingCategory(null);
    setCategoryName('');
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setCategoryName(category.categoryName);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ categoryName });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this category? (Make sure no products are using it)')) {
      deleteMutation.mutate(id);
    }
  };

  const categoriesList = Array.isArray(data) ? data : [];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="text-h2">Categories</h1>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add Category
        </Button>
      </div>

      <div className="admin-table-container ">
        {isLoading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categoriesList.map((category: any) => (
                <tr key={category.categoryId}>
                  <td>{category.categoryId}</td>
                  <td>{category.categoryName}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="icon-btn edit-btn" onClick={() => handleEdit(category)} title="Edit"><Edit2 size={16} /></button>
                      <button className="icon-btn delete-btn" onClick={() => handleDelete(category.categoryId)} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {categoriesList.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center p-6 text-muted">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal ">
            <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit} className="admin-modal-form">
              <Input 
                label="Category Name" 
                value={categoryName} 
                onChange={e => setCategoryName(e.target.value)} 
                required 
              />
              
              <div className="admin-modal-actions">
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" loading={saveMutation.isPending}>{editingCategory ? 'Update' : 'Save'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
