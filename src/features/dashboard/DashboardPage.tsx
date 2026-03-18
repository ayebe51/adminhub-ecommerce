import React, { useEffect, useState, useMemo } from 'react';
import {
  Package, TrendingUp, TrendingDown,
  ArrowUpRight, AlertTriangle, ShoppingCart, DollarSign,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { productsApi, inventoryApi } from '@/mocks/api';
import { useTranslation } from 'react-i18next';

const initialRevenueData = [
  { name: 'Jan', revenue: 42000, orders: 380, category: 'Electronics' },
  { name: 'Feb', revenue: 38000, orders: 340, category: 'Clothing' },
  { name: 'Mar', revenue: 55000, orders: 450, category: 'Electronics' },
  { name: 'Apr', revenue: 47000, orders: 400, category: 'Accessories' },
  { name: 'May', revenue: 61000, orders: 520, category: 'Home' },
  { name: 'Jun', revenue: 58000, orders: 490, category: 'Electronics' },
  { name: 'Jul', revenue: 72000, orders: 610, category: 'Clothing' },
];

const categoryData = [
  { name: 'Electronics', value: 35, color: '#6366f1' },
  { name: 'Clothing', value: 25, color: '#ec4899' },
  { name: 'Accessories', value: 20, color: '#8b5cf6' },
  { name: 'Home', value: 20, color: '#06b6d4' },
];

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps & { vsLastMonth?: string }> = ({ title, value, change, changeType, icon, color, vsLastMonth }) => (
  <div
    className="animate-fade-in"
    style={{
      background: 'var(--color-surface-card)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--color-border-primary)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      transition: 'all var(--transition-base)',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = color;
      e.currentTarget.style.boxShadow = `0 0 20px ${color}22`;
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'var(--color-border-primary)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>{value}</div>
      </div>
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-lg)',
          background: `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
        }}
      >
        {icon}
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          fontSize: '13px',
          fontWeight: 600,
          color: changeType === 'up' ? 'var(--color-text-success)' : 'var(--color-text-danger)',
        }}
      >
        {changeType === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {change}
      </div>
      <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{vsLastMonth || 'vs last month'}</span>
    </div>
  </div>
);

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<{ total: number; inStock: number; lowStock: number; outOfStock: number; totalValue: number } | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [liveOrders, setLiveOrders] = useState<{ id: string; amount: number; time: string }[]>([]);

  useEffect(() => {
    inventoryApi.getStats().then(setStats);
    productsApi.getAll(1, 1).then(r => setProductCount(r.total));

    const interval = setInterval(() => {
      setLiveOrders(prev => [{
        id: Math.random().toString(36).slice(2, 9).toUpperCase(),
        amount: Math.floor(Math.random() * 500) + 20,
        time: 'Just now'
      }, ...prev].slice(0, 5));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const filteredRevenue = useMemo(() => {
    if (!selectedCategory) return initialRevenueData;
    return initialRevenueData.map(d => ({
      ...d,
      revenue: d.category === selectedCategory ? d.revenue : d.revenue * 0.2,
      orders: d.category === selectedCategory ? d.orders : Math.floor(d.orders * 0.2)
    }));
  }, [selectedCategory]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
            {t('common.dashboard')}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
            {selectedCategory ? `Viewing analysis for ${selectedCategory}` : 'Overview of your e-commerce operations'}
          </p>
        </div>
        {selectedCategory && (
          <button 
            onClick={() => setSelectedCategory(null)}
            style={{ 
              padding: '6px 12px', borderRadius: 'var(--radius-md)', 
              background: 'var(--color-surface-tertiary)', border: '1px solid var(--color-border-primary)',
              color: 'var(--color-text-primary)', fontSize: '13px', cursor: 'pointer' 
            }}
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <StatCard
          title={t('dashboard.total_products')}
          value={productCount.toLocaleString()}
          change="+12.5%"
          changeType="up"
          icon={<Package size={22} />}
          color="#6366f1"
          vsLastMonth={t('dashboard.vs_last_month')}
        />
        <StatCard
          title={t('dashboard.total_revenue')}
          value="$72,450"
          change="+8.2%"
          changeType="up"
          icon={<DollarSign size={22} />}
          color="#10b981"
          vsLastMonth={t('dashboard.vs_last_month')}
        />
        <StatCard
          title={t('dashboard.active_orders')}
          value="1,284"
          change="+23.1%"
          changeType="up"
          icon={<ShoppingCart size={22} />}
          color="#8b5cf6"
          vsLastMonth={t('dashboard.vs_last_month')}
        />
        <StatCard
          title={t('dashboard.low_stock')}
          value={stats?.lowStock?.toString() || '—'}
          change={stats?.outOfStock ? `${stats.outOfStock} out` : '—'}
          changeType="down"
          icon={<AlertTriangle size={22} />}
          color="#f59e0b"
          vsLastMonth={t('dashboard.vs_last_month')}
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        {/* Revenue Chart */}
        <div
          className="animate-fade-in"
          style={{
            background: 'var(--color-surface-card)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{t('dashboard.revenue_overview')}</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', margin: 0 }}>{t('dashboard.revenue_overview')}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-success)', fontSize: '14px', fontWeight: 600 }}>
              <ArrowUpRight size={16} /> +24.5%
            </div>
          </div>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredRevenue}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a3e',
                    border: '1px solid rgba(148,163,184,0.12)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#f1f5f9',
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`$${Number(value || 0).toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div
          className="animate-fade-in"
          style={{
            background: 'var(--color-surface-card)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 20px 0' }}>
            {t('dashboard.sales_by_category')}
          </h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={categoryData} 
                  cx="50%" cy="50%" 
                  innerRadius={55} outerRadius={80} 
                  dataKey="value" stroke="none"
                  onClick={(data) => {
                    if (data && data.name) {
                      setSelectedCategory(data.name);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={index} 
                      fill={entry.color} 
                      stroke={selectedCategory === entry.name ? '#fff' : 'none'}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '8px', fontSize: '13px', color: '#f1f5f9' }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${value || 0}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {categoryData.map((cat) => (
              <div 
                key={cat.name} 
                onClick={() => setSelectedCategory(cat.name)}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  fontSize: '13px', cursor: 'pointer',
                  opacity: !selectedCategory || selectedCategory === cat.name ? 1 : 0.5,
                  padding: '4px', borderRadius: '4px',
                  background: selectedCategory === cat.name ? `${cat.color}12` : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>{cat.name}</span>
                </div>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Orders Chart */}
        <div
          className="animate-fade-in"
          style={{
            background: 'var(--color-surface-card)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 20px 0' }}>
            Orders by Month
          </h3>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredRevenue}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '8px', fontSize: '13px', color: '#f1f5f9' }}
                />
                <Bar dataKey="orders" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Feed */}
        <div
          className="animate-fade-in"
          style={{
            background: 'var(--color-surface-card)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
              Live Order Feed
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-success)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 8px currentColor' }} />
              Live
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {liveOrders.map((order, i) => (
              <div 
                key={order.id} 
                className="animate-slide-in-new"
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', background: 'var(--color-surface-tertiary)', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-primary)',
                  animationDelay: `${i * 0.1}s`
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Order #{order.id}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{order.time}</div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-success)' }}>
                  +${order.amount}
                </div>
              </div>
            ))}
            {liveOrders.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '14px' }}>
                Waiting for new orders...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
