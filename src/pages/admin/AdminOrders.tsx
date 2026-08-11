import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Search, Edit2, Download } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const AdminOrders: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // Shipping state
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  
  // Refund state
  const [refundReason, setRefundReason] = useState('');

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

  const updateShippingMutation = useMutation({
    mutationFn: async ({ id, tracking, courier }: { id: number, tracking: string, courier: string }) => {
      return api.put(`/admin/orders/${id}/shipping`, { trackingNumber: tracking, courierName: courier, status: 'SHIPPED' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      setIsModalOpen(false);
    }
  });

  const processRefundMutation = useMutation({
    mutationFn: async ({ id, action, reason }: { id: number, action: string, reason: string }) => {
      return api.post(`/admin/orders/${id}/refund`, { action, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      setIsModalOpen(false);
    }
  });

  const openOrderModal = (order: any) => {
    setSelectedOrder(order);
    setTrackingNumber(order.trackingNumber || '');
    setCourierName(order.courierName || '');
    setRefundReason(order.refundReason || '');
    setIsModalOpen(true);
  };

  const handlePrintInvoice = (order: any) => {
    // We will open a new window and write the invoice HTML to it, then call print()
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice #${order.orderId}</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #111; }
              .header { text-align: center; margin-bottom: 40px; }
              .header h1 { margin: 0; font-size: 28px; }
              .details { margin-bottom: 30px; display: flex; justify-content: space-between; }
              .details p { margin: 5px 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
              th { background: #f9f9f9; font-weight: 600; }
              .total { text-align: right; margin-top: 20px; font-size: 20px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>LUMORA</h1>
              <p>Invoice / Receipt</p>
            </div>
            <div class="details">
              <div>
                <p><strong>Order ID:</strong> #${order.orderId}</p>
                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p><strong>Customer:</strong> ${order.userEmail}</p>
                <p><strong>Status:</strong> ${order.status}</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Order items total (See portal for full itemized list)</td>
                  <td>₹${order.totalAmount?.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <div class="total">
              Grand Total: ₹${order.totalAmount?.toFixed(2)}
            </div>
            <p style="text-align:center; margin-top:50px; color:#666; font-size:12px;">Thank you for your business!</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter((o: any) => 
    o?.userEmail?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    o?.orderId?.toString()?.includes(searchTerm)
  ) : [];

  const handleExportCSV = () => {
    if (!orders || orders.length === 0) return alert('No data to export.');
    const BOM = '\uFEFF';
    let csv = BOM + 'Order ID,Customer Email,Date,Total,Payment Status,Order Status,Courier,Tracking Number,Refund Status\n';
    orders.forEach((o: any) => {
      csv += `${o.orderId},${o.userEmail},${new Date(o.createdAt).toLocaleDateString()},${o.totalAmount},${o.paymentStatus},${o.status},${o.courierName || ''},${o.trackingNumber || ''},${o.refundStatus}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Orders_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="text-h2">Orders</h1>
      </div>

      <div className="admin-page-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Input 
          placeholder="Search by ID or Email..." 
          leftIcon={<Search size={18} />} 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
        <Button onClick={handleExportCSV} variant="secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Download size={18} /> Export CSV
        </Button>
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
                <th>Actions</th>
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
                  <td>
                    <div className="admin-table-actions">
                      <button className="icon-btn edit-btn" onClick={() => openOrderModal(order)} title="Manage Order"><Edit2 size={16} /></button>
                      <button className="icon-btn" style={{color: 'var(--text-muted)'}} onClick={() => handlePrintInvoice(order)} title="Download Invoice"><Download size={16} /></button>
                    </div>
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

      {isModalOpen && selectedOrder && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '600px' }}>
            <h2>Manage Order #{selectedOrder.orderId}</h2>
            <div style={{ marginTop: '20px' }}>
              
              {/* Shipping Section */}
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 className="text-h3" style={{ marginBottom: '16px' }}>Shipping & Tracking</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Input label="Courier Name" value={courierName} onChange={e => setCourierName(e.target.value)} />
                  <Input label="Tracking Number" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
                </div>
                <Button 
                  style={{ marginTop: '16px' }} 
                  onClick={() => updateShippingMutation.mutate({ id: selectedOrder.orderId, tracking: trackingNumber, courier: courierName })}
                  loading={updateShippingMutation.isPending}
                >
                  Save & Mark as Shipped
                </Button>
              </div>

              {/* Refund Section */}
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <h3 className="text-h3" style={{ marginBottom: '8px' }}>Refund Workflow</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85em', marginBottom: '16px' }}>
                  Current Status: <strong style={{ color: selectedOrder.refundStatus !== 'NONE' ? '#ef4444' : 'inherit'}}>{selectedOrder.refundStatus}</strong>
                </p>
                <Input label="Refund Reason" value={refundReason} onChange={e => setRefundReason(e.target.value)} />
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <Button 
                    variant="primary" 
                    style={{ background: '#ef4444', borderColor: '#ef4444' }}
                    onClick={() => {
                      if (window.confirm("Approve refund? This will restock items and mark payment as refunded.")) {
                        processRefundMutation.mutate({ id: selectedOrder.orderId, action: 'APPROVE', reason: refundReason });
                      }
                    }}
                    disabled={processRefundMutation.isPending || selectedOrder.refundStatus === 'REFUNDED'}
                  >
                    Approve Refund (Restock)
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => processRefundMutation.mutate({ id: selectedOrder.orderId, action: 'REJECT', reason: refundReason })}
                    disabled={processRefundMutation.isPending || selectedOrder.refundStatus === 'REFUNDED'}
                  >
                    Reject Request
                  </Button>
                </div>
              </div>

            </div>
            <div className="admin-modal-actions" style={{ marginTop: '24px' }}>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
