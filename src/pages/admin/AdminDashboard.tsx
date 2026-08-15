import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { DollarSign, ShoppingBag, Users, Package, AlertTriangle, RefreshCcw, Download, TrendingUp, PackageSearch } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import './AdminDashboard.css';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingRefunds: number;

  chartData?: any[];
  topProducts?: any[];
}

export const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState('1M');
  
  // Stock Update State
  const [stockUpdateId, setStockUpdateId] = useState('');
  const [stockAmount, setStockAmount] = useState('');

  // Queries
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard/stats');
      return data;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const { data } = await api.get('/admin/orders');
      return data;
    }
  });

  const { data: users } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data;
    }
  });

  const { data: products } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      const { data } = await api.get('/products?size=100');
      return data.content || [];
    }
  });

  // Mutations
  const updateStockMutation = useMutation({
    mutationFn: async (product: any) => api.put(`/admin/products/${product.productId}`, product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      setStockUpdateId('');
      setStockAmount('');
      alert('Stock updated successfully!');
    }
  });

  const handleStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!products) return;
    const prod = products.find((p: any) => p.productId.toString() === stockUpdateId);
    if (prod) {
      updateStockMutation.mutate({ ...prod, stock: Number(stockAmount) });
    } else {
      alert('Product ID not found.');
    }
  };

  const handleExportCSV = () => {
    if (!stats || !orders || !users || !products) {
      alert('Data is still loading, please wait.');
      return;
    }
    
    const BOM = '\uFEFF';
    let csv = BOM + 'Report Date,' + new Date().toLocaleDateString() + '\n\n';
    
    csv += '--- OVERVIEW ---\n';
    csv += `Total Revenue,${stats.totalRevenue}\n`;
    csv += `Total Orders,${stats.totalOrders}\n`;
    csv += `Total Customers,${stats.totalCustomers}\n`;
    csv += `Total Products,${stats.totalProducts}\n`;
    
    csv += '\n--- RECENT ORDERS ---\n';
    csv += 'Order ID,Date,Status,Total Amount\n';
    (orders || []).slice(0, 10).forEach((o: any) => {
      csv += `${o.orderId},${new Date(o.createdAt).toLocaleDateString()},${o.status},${o.totalAmount}\n`;
    });

    csv += '\n--- RECENT CUSTOMERS ---\n';
    csv += 'ID,Name,Email,Role\n';
    (users || []).slice(0, 10).forEach((u: any) => {
      csv += `${u.id},${u.fullName},${u.email},${u.role}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Lumora_Admin_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredChartData = useMemo(() => {
    if (!stats?.chartData) return [];
    
    const now = new Date();
    const rangeInDays: Record<string, number> = {
      '1W': 7,
      '1M': 30,
      '1Y': 365,
      'ALL': Infinity
    };
    const days = rangeInDays[timeRange] || 365;

    if (days === Infinity) return stats.chartData;

    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return stats.chartData.filter((d: any) => new Date(d.date) >= cutoffDate);
  }, [stats?.chartData, timeRange]);

  if (isLoading) {
    return (
      <div className="admin-loading-container">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="16" stroke="rgba(255, 122, 31,0.3)" strokeWidth="3" />
          <circle cx="20" cy="20" r="16" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="20" style={{ animation: 'btn-spin 0.8s linear infinite', transformOrigin: 'center' }} />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error-container">
        <AlertTriangle size={32} color="var(--color-danger)" />
        <h3>Failed to load dashboard stats</h3>
        <p>Please try refreshing the page or check your permissions.</p>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}`, icon: <DollarSign size={24} />, color: 'var(--color-success)' },
    { title: 'Total Orders', value: stats?.totalOrders, icon: <ShoppingBag size={24} />, color: 'var(--color-primary)' },
    { title: 'Total Customers', value: stats?.totalCustomers, icon: <Users size={24} />, color: '#0ea5e9' },
    { title: 'Total Products', value: stats?.totalProducts, icon: <Package size={24} />, color: '#8b5cf6' },
    { title: 'Low Stock Products', value: stats?.lowStockProducts, icon: <AlertTriangle size={24} />, color: 'var(--color-warning)' },
    { title: 'Pending Refunds', value: stats?.pendingRefunds, icon: <RefreshCcw size={24} />, color: 'var(--color-danger)' },
  ];

  const chartWidth = Math.max(800, filteredChartData.length * 60);

  // Derived logic
  const topProductsList = stats?.topProducts || [];

  return (
    <div className="admin-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 className="admin-dashboard-title" style={{ margin: 0 }}>Dashboard Overview</h1>
        <Button onClick={handleExportCSV} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Download size={18} /> Export CSV
        </Button>
      </div>
      
      <div className="admin-stat-grid">
        {statCards.map((card, index) => (
          <div className="admin-stat-card" key={index}>
            <div className="admin-stat-icon" style={{ backgroundColor: '#FFF4EB', color: card.color }}>
              {card.icon}
            </div>
            <div className="admin-stat-content">
              <span className="admin-stat-title">{card.title}</span>
              <span className="admin-stat-value">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="page-section-split" style={{ marginTop: 'var(--space-6)' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Revenue Chart */}
          <div style={{ padding: 'var(--space-6)', border: '1px solid var(--border-general)', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600 }}>Revenue Per Day</h3>
              <select 
                className="input-field" 
                style={{ padding: '6px 12px', width: 'auto', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', minHeight: 'auto' }}
                value={timeRange}
                onChange={e => setTimeRange(e.target.value)}
              >
                <option value="1W" style={{color: 'black'}}>Past Week</option>
                <option value="1M" style={{color: 'black'}}>Past Month</option>
                <option value="1Y" style={{color: 'black'}}>Past Year</option>
                <option value="ALL" style={{color: 'black'}}>All Time</option>
              </select>
            </div>
            <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden', paddingBottom: '10px' }}>
              <div style={{ height: '300px', width: chartWidth }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-general)' }} />
                    <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-general)' }} />
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-general)" vertical={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card-fill)', borderColor: 'var(--border-general)', borderRadius: '8px', color: 'var(--text-primary)' }}
                      itemStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div style={{ padding: 'var(--space-6)', border: '1px solid var(--border-general)', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-card)' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Orders</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-general)' }}>
                    <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Order ID</th>
                    <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Date</th>
                    <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(orders || []).slice(0, 5).map((o: any) => (
                    <tr key={o.orderId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 0', color: 'var(--text-primary)' }}>#{o.orderId}</td>
                      <td style={{ padding: '12px 0', color: 'var(--text-primary)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 0' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          backgroundColor: o.status === 'DELIVERED' ? 'rgba(34,197,94,0.1)' : 'rgba(255,122,31,0.1)',
                          color: o.status === 'DELIVERED' ? 'var(--color-success)' : 'var(--color-primary)'
                        }}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 0', color: 'var(--text-primary)', fontWeight: 600 }}>₹{o.totalAmount}</td>
                    </tr>
                  ))}
                  {(!orders || orders.length === 0) && (
                    <tr>
                      <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No recent orders.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Quick Inventory Update */}
          <div style={{ padding: 'var(--space-6)', border: '1px solid var(--border-general)', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-card)' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PackageSearch size={20} color="var(--color-primary)" /> Quick Stock Update
            </h3>
            <form onSubmit={handleStockUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Product ID</label>
                <Input 
                  placeholder="e.g. 104" 
                  value={stockUpdateId} 
                  onChange={(e) => setStockUpdateId(e.target.value)} 
                  required 
                  style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>New Stock Quantity</label>
                <Input 
                  type="number" 
                  placeholder="e.g. 50" 
                  value={stockAmount} 
                  onChange={(e) => setStockAmount(e.target.value)} 
                  required
                  style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                />
              </div>
              <Button type="submit" disabled={updateStockMutation.isPending} style={{ width: '100%', justifyContent: 'center' }}>
                {updateStockMutation.isPending ? 'Updating...' : 'Update Stock'}
              </Button>
            </form>
          </div>

          {/* Most Selling Products */}
          <div style={{ padding: 'var(--space-6)', border: '1px solid var(--border-general)', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-card)' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="var(--color-success)" /> Top Selling Products
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topProductsList.length > 0 ? topProductsList.map((tp, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)', fontWeight: 600 }}>
                    #{idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{tp.name}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sold: {tp.totalSold} • Stock: {tp.stock}</p>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    ₹{tp.price}
                  </div>
                </div>
              )) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Not enough sales data.</p>
              )}
            </div>
          </div>

          {/* Recent Customers */}
          <div style={{ padding: 'var(--space-6)', border: '1px solid var(--border-general)', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-card)' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Customers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(users || []).slice(0, 5).map((u: any) => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,122,31,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 600 }}>
                    {u.fullName.charAt(0)}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{u.fullName}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</p>
                  </div>
                </div>
              ))}
              {(!users || users.length === 0) && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No recent customers.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
