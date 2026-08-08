import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Search } from 'lucide-react';
import { Input } from '../../components/ui/Input';
export const AdminOrders: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const { data } = await api.get('/admin/orders');
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      return api.put(`/admin/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    }
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ id, paymentStatus }: { id: number, paymentStatus: string }) => {
      return api.put(`/admin/orders/${id}/payment-status`, { paymentStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    }
  });

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter((o: any) => 
    o?.userEmail?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    o?.orderId?.toString()?.includes(searchTerm)
  ) : [];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="text-h2">Orders</h1>
      </div>

      <div className="admin-page-controls">
        <Input 
          placeholder="Search by ID or Email..." 
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
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders?.map((order: any) => (
                <tr key={order.orderId}>
                  <td>#{order.orderId}</td>
                  <td>{order.userEmail}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>₹{order.totalAmount?.toFixed(2) ?? '0.00'}</td>
                  <td>
                    <select 
                      className="input-field"
                      style={{ 
                        padding: '4px 8px', 
                        height: 'auto', 
                        minHeight: 'auto',
                        backgroundColor: order.paymentStatus === 'PAID' ? 'rgba(34, 197, 94, 0.2)' : (order.paymentStatus === 'FAILED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)'),
                        color: order.paymentStatus === 'PAID' ? 'rgb(34, 197, 94)' : (order.paymentStatus === 'FAILED' ? 'rgb(239, 68, 68)' : 'inherit')
                      }}
                      value={order.paymentStatus}
                      onChange={(e) => updatePaymentStatusMutation.mutate({ id: order.orderId, paymentStatus: e.target.value })}
                      disabled={updatePaymentStatusMutation.isPending}
                    >
                      <option value="PENDING" style={{color: 'black'}}>PENDING</option>
                      <option value="PAID" style={{color: 'black'}}>PAID</option>
                      <option value="FAILED" style={{color: 'black'}}>FAILED</option>
                      <option value="REFUND_PENDING" style={{color: 'black'}}>REFUND_PENDING</option>
                      <option value="REFUNDED" style={{color: 'black'}}>REFUNDED</option>
                    </select>
                  </td>
                  <td>
                    <select 
                      className="input-field"
                      style={{ padding: '4px 8px', height: 'auto', minHeight: 'auto' }}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <option value="CREATED" style={{color: 'black'}}>CREATED</option>
                      <option value="PROCESSING" style={{color: 'black'}}>PROCESSING</option>
                      <option value="SHIPPED" style={{color: 'black'}}>SHIPPED</option>
                      <option value="DELIVERED" style={{color: 'black'}}>DELIVERED</option>
                      <option value="CANCELLED" style={{color: 'black'}}>CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredOrders?.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-muted">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
