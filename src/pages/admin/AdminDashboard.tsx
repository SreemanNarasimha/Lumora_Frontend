import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { DollarSign, ShoppingBag, Users, Package, AlertTriangle, RefreshCcw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingRefunds: number;
  chartData?: any[];
}

export const AdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('1M');

  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard/stats');
      return data;
    },
  });

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

  return (
    <div className="admin-dashboard">
      <h1 className="admin-dashboard-title">Dashboard Overview</h1>
      
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

      <div className="admin-dashboard-charts" style={{ marginTop: '2rem' }}>
        <div style={{ padding: 'var(--space-6)', border: '1px solid var(--border-general)', backgroundColor: 'var(--color-bg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-text)', fontSize: '1.25rem', fontWeight: 600 }}>Revenue Per Day</h3>
            <select 
              className="input-field" 
              style={{ padding: '6px 12px', width: 'auto', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--color-text)', minHeight: 'auto' }}
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
            <div style={{ height: '400px', width: chartWidth }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fill: '#ffffff' }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: '#ffffff' }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 15, 15, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
