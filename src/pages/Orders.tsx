import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Package, MapPin, ShoppingBag, Download, Eye, X } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PageWrapper } from '../components/layout/PageWrapper';
import { BackButton } from '../components/ui/BackButton';
import { useNavigate } from 'react-router-dom';
import './Orders.css';

interface OrderItem {
  id: number;
  productNameSnapshot: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

interface Order {
  orderId: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

const TABS = ['All Orders', 'Current', 'Delivered', 'Cancelled'] as const;
type Tab = typeof TABS[number];

const STATUS_BADGE: Record<string, 'primary' | 'success' | 'error' | 'warning'> = {
  PENDING: 'warning',
  PROCESSING: 'warning',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

export const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('All Orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data;
    }
  });

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'All Orders') return true;
    if (activeTab === 'Current') return o.status === 'PENDING' || o.status === 'PROCESSING' || o.status === 'SHIPPED';
    if (activeTab === 'Delivered') return o.status === 'DELIVERED';
    if (activeTab === 'Cancelled') return o.status === 'CANCELLED';
    return true;
  });

  const handleDownloadInvoice = async (orderId: number) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_LMR-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error downloading invoice', error);
      // Optional: show an error toast here
    }
  };

  return (
    <PageWrapper>
      <div className="orders-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 var(--space-outer) 4rem', width: '100%' }}>
        <BackButton label="Back to Profile" />

        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '42px', color: 'var(--text-primary)' }}>My Orders</h1>
          <p className="text-body" style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            View and track your past and present order history
          </p>
        </div>

        {/* Tabs */}
        <div className="orders-tabs" role="tablist" aria-label="Order tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`orders-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {isLoading ? (
          <div style={{ padding: 'var(--space-10)', textAlign: 'center', border: '1px solid var(--border-general)' }}>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Loading order history...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-empty" role="status">
            <Package size={56} strokeWidth={1} color="var(--text-secondary)" style={{ marginBottom: 'var(--space-4)' }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>No {activeTab} Orders</h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
              When you place an order, it will appear here with live tracking updates.
            </p>
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              <ShoppingBag size={16} style={{ marginRight: '6px' }} />
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map(order => (
              <div key={order.orderId} className="order-card">
                <div className="order-card-header" style={{ marginBottom: 'var(--space-4)' }}>
                  <div>
                    <span className="text-body-sm" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Order Reference</span>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--text-primary)', margin: 0, marginTop: 'var(--space-1)' }}>#LMR-{order.orderId}</p>
                  </div>
                  <Badge variant={STATUS_BADGE[order.status] ?? 'primary'}>
                    {order.status}
                  </Badge>
                </div>

                <div style={{ padding: 'var(--space-4) 0', borderTop: '1px solid var(--border-general)', borderBottom: '1px solid var(--border-general)', marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Order Date:</span>
                    <span className="text-body-sm" style={{ color: 'var(--text-primary)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Payment Status:</span>
                    <span className="text-body-sm" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{order.paymentStatus}</span>
                  </div>
                  
                </div>

                <div className="order-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Total Amount</span>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', color: 'var(--text-primary)', margin: 0, marginTop: 'var(--space-1)' }}>₹{order.totalAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <Button size="sm" variant="outline" leftIcon={<Download size={16} strokeWidth={1} />} onClick={() => handleDownloadInvoice(order.orderId)}>Invoice</Button>
                    <Button size="sm" variant="secondary" leftIcon={<Eye size={16} strokeWidth={1} />} onClick={() => setSelectedOrder(order)}>View Order</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Order Modal */}
        {selectedOrder && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
            <div style={{ padding: 'var(--space-8)', maxWidth: '600px', width: '100%', background: 'var(--color-bg)', border: '1px solid var(--border-general)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', color: 'var(--text-primary)' }}>Order Details</h2>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
                  <X size={24} strokeWidth={1} />
                </button>
              </div>

              <div style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <span className="text-body" style={{ color: 'var(--text-secondary)' }}>Order Reference:</span>
                  <span className="text-body" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>#LMR-{selectedOrder.orderId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <span className="text-body" style={{ color: 'var(--text-secondary)' }}>Date:</span>
                  <span className="text-body" style={{ color: 'var(--text-primary)' }}>
                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <span className="text-body" style={{ color: 'var(--text-secondary)' }}>Status:</span>
                  <Badge variant={STATUS_BADGE[selectedOrder.status] ?? 'primary'}>{selectedOrder.status}</Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <span className="text-body" style={{ color: 'var(--text-secondary)' }}>Payment Status:</span>
                  <span className="text-body" style={{ color: 'var(--text-primary)' }}>{selectedOrder.paymentStatus}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-general)', paddingTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>Items ({selectedOrder.items?.length || 0})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {selectedOrder.items?.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p className="text-body" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.productNameSnapshot}</p>
                        <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Qty: {item.quantity} × ₹{item.pricePerUnit.toLocaleString('en-IN')}</p>
                      </div>
                      <p className="text-body" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-general)', paddingTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--text-primary)' }}>Total</h3>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', color: 'var(--text-primary)' }}>
                  ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};
