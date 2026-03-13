import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, type ColDef } from 'ag-grid-community';
import { Warehouse, AlertTriangle, Package, TrendingDown, Search, RefreshCw, ArrowDownUp } from 'lucide-react';
import { inventoryApi } from '@/mocks/api';
import type { StockEntry, StockStatus } from '@/types';

ModuleRegistry.registerModules([AllCommunityModule]);

const statusColors: Record<StockStatus, { color: string; bg: string; label: string }> = {
  in_stock: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', label: 'In Stock' },
  low_stock: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', label: 'Low Stock' },
  out_of_stock: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', label: 'Out of Stock' },
  discontinued: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', label: 'Discontinued' },
};

export const InventoryPage: React.FC = () => {
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ total: number; inStock: number; lowStock: number; outOfStock: number; totalValue: number } | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, unknown> = {};
      if (statusFilter) filters.status = [statusFilter];
      const result = await inventoryApi.getAll(1, 10000, search || undefined, filters);
      setRowData(result.data);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadData();
    inventoryApi.getStats().then(setStats);
  }, [loadData]);

  const columnDefs = useMemo<ColDef<StockEntry>[]>(() => [
    { headerName: 'SKU', field: 'sku', width: 140, cellStyle: { fontFamily: 'var(--font-mono)', fontSize: '12px' } },
    { headerName: 'Product', field: 'productName', flex: 2, minWidth: 220 },
    { headerName: 'Warehouse', field: 'warehouseName', width: 160 },
    {
      headerName: 'Quantity', field: 'quantity', width: 110,
      cellStyle: (params) => ({
        fontWeight: 700,
        color: params.value === 0 ? 'var(--color-text-danger)' : params.value <= 10 ? 'var(--color-text-warning)' : 'var(--color-text-primary)',
      }),
    },
    { headerName: 'Reserved', field: 'reservedQuantity', width: 100, cellStyle: { color: 'var(--color-text-secondary)' } },
    {
      headerName: 'Available', field: 'availableQuantity', width: 110,
      cellStyle: (params) => ({
        fontWeight: 600,
        color: params.value <= 0 ? 'var(--color-text-danger)' : 'var(--color-text-success)',
      }),
    },
    { headerName: 'Reorder Point', field: 'reorderPoint', width: 120, cellStyle: { color: 'var(--color-text-tertiary)', fontSize: '12px' } },
    {
      headerName: 'Status', field: 'status', width: 130,
      cellRenderer: (params: { value: StockStatus }) => {
        const cfg = statusColors[params.value];
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, color: cfg.color, background: cfg.bg }}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      headerName: 'Last Counted', field: 'lastCountedAt', width: 140,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never',
      cellStyle: { fontSize: '12px', color: 'var(--color-text-tertiary)' },
    },
  ], []);

  const statCards = [
    { label: 'Total SKUs', value: stats?.total?.toLocaleString() || '—', icon: <Package size={20} />, color: '#6366f1' },
    { label: 'In Stock', value: stats?.inStock?.toLocaleString() || '—', icon: <Warehouse size={20} />, color: '#34d399' },
    { label: 'Low Stock', value: stats?.lowStock?.toLocaleString() || '—', icon: <AlertTriangle size={20} />, color: '#fbbf24' },
    { label: 'Out of Stock', value: stats?.outOfStock?.toLocaleString() || '—', icon: <TrendingDown size={20} />, color: '#f87171' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 120px)' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Inventory</h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>Stock levels and warehouse management</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {statCards.map((card) => (
          <div
            key={card.label}
            className="animate-fade-in"
            style={{
              background: 'var(--color-surface-card)', backdropFilter: 'blur(12px)',
              border: '1px solid var(--color-border-primary)', borderRadius: 'var(--radius-lg)',
              padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: `${card.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>{card.label}</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 16px', borderRadius: 'var(--radius-lg)',
        background: 'var(--color-surface-card)', border: '1px solid var(--color-border-primary)',
      }}>
        <Search size={16} style={{ color: 'var(--color-text-tertiary)' }} />
        <input
          type="text" placeholder="Search inventory..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadData()}
          style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--color-text-primary)', fontSize: '14px', outline: 'none', fontFamily: 'var(--font-sans)' }}
        />
        <select
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '6px 12px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-primary)', background: 'var(--color-surface-tertiary)',
            color: 'var(--color-text-primary)', fontSize: '13px', fontFamily: 'var(--font-sans)',
            cursor: 'pointer', outline: 'none', appearance: 'none',
          }}
        >
          <option value="">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
        <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-primary)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-sans)' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Grid */}
      <div className="ag-theme-custom" style={{ flex: 1, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border-primary)' }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, resizable: true }}
          animateRows={true}
          pagination={true}
          paginationPageSize={100}
          paginationPageSizeSelector={[50, 100, 500]}
          loading={loading}
          getRowId={(params) => params.data.id}
          rowHeight={44}
          headerHeight={44}
        />
      </div>
    </div>
  );
};
