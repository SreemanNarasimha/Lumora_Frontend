import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const AdminUsers: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'USER',
    password: ''
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (user: any) => {
      if (editingUser) {
        return api.put(`/admin/users/${editingUser.userId}`, user);
      } else {
        return api.post('/admin/users', user);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setIsModalOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    }
  });

  const resetForm = () => {
    setEditingUser(null);
    setFormData({ fullName: '', email: '', role: 'USER', password: '' });
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter((u: any) => 
    u?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    u?.fullName?.toLowerCase()?.includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="text-h2">Customers & Staff</h1>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add User
        </Button>
      </div>

      <div className="admin-page-controls">
        <Input 
          placeholder="Search by name or email..." 
          leftIcon={<Search size={18} />} 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
      </div>

      <div className="admin-table-container ">
        {isLoading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers?.map((user: any) => (
                <tr key={user.userId}>
                  <td>{user.userId}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem',
                      backgroundColor: user.role === 'SUPER_ADMIN' ? 'rgba(255, 122, 31,0.2)' : 'rgba(255,255,255,0.1)',
                      color: user.role === 'SUPER_ADMIN' ? 'rgb(167,139,250)' : 'inherit'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="icon-btn edit-btn" onClick={() => handleEdit(user)} title="Edit"><Edit2 size={16} /></button>
                      <button className="icon-btn delete-btn" onClick={() => handleDelete(user.userId)} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers?.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-muted">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal ">
            <h2>{editingUser ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={handleSubmit} className="admin-modal-form">
              <Input label="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
              <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              
              <div className="input-group">
                <label className="input-label">Role</label>
                <select 
                  className="input-field" 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="USER">USER</option>
                  <option value="SUPPORT_STAFF">SUPPORT_STAFF</option>
                  <option value="ORDER_MANAGER">ORDER_MANAGER</option>
                  <option value="PRODUCT_MANAGER">PRODUCT_MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              <Input 
                label={editingUser ? "New Password (leave blank to keep current)" : "Password"} 
                type="password" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                required={!editingUser}
              />
              
              <div className="admin-modal-actions">
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" loading={saveMutation.isPending}>{editingUser ? 'Update' : 'Save'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
