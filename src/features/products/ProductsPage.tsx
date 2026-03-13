import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, type ColDef, type SelectionChangedEvent } from 'ag-grid-community';
import {
  Download, Upload, Trash2, Edit3, RefreshCw,
  CheckCircle2, AlertCircle, Archive, Clock, Eye, EyeOff, Search, X, ChevronDown
} from 'lucide-react';
import { productsApi } from '@/mocks/api';
import { useBulkOperations } from '@/store/useBulkOperations';
import type { Product, ProductStatus } from '@/types';
import Papa from 'papaparse';

ModuleRegistry.registerModules([AllCommunityModule]);

const statusConfig: Record<ProductStatus, { color: string; bg: string; icon: React.ReactNode }> = {
  active: { color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', icon: <CheckCircle2 size={14} /> },
  draft: { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)', icon: <Clock size={14} /> },
  archived: { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)', icon: <Archive size={14} /> },
  discontinued: { color: '#f87171', bg: 'rgba(248, 113, 113, 0.12)', icon: <AlertCircle size={14} /> },
};

const StatusBadge: React.FC<{ status: ProductStatus }> = ({ status }) => {
  const cfg = statusConfig[status];
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '3px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
        color: cfg.color, background: cfg.bg, textTransform: 'capitalize',
      }}
    >
      {cfg.icon} {status}
    </span>
  );
};

export const ProductsPage: React.FC = () => {
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [search, setSearch] = useState('');
  const [showBulkPanel, setShowBulkPanel] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkValue, setBulkValue] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const pushOperation = useBulkOperations((s) => s.pushOperation);

  const loadProducts = useCallback(async (searchTerm?: string) => {
    setLoading(true);
    try {
      const result = await productsApi.getAll(1, 10000, searchTerm);
      setRowData(result.data);
      setTotalProducts(result.total);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const columnDefs = useMemo<ColDef<Product>[]>(() => [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      maxWidth: 50,
      resizable: false,
      sortable: false,
      filter: false,
    },
    {
      headerName: 'SKU',
      field: 'sku',
      width: 140,
      cellStyle: { fontSize: '12px', color: 'var(--color-text-secondary)' } as Record<string, string | number>,
    },
    {
      headerName: 'Product Name',
      field: 'name',
      flex: 2,
      minWidth: 250,
      cellRenderer: (params: { data: Product }) => {
        const p = params.data;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
            <img
              src={p.images[0]?.url || 'https://via.placeholder.com/32'}
              alt={p.name}
              style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }}
              loading="lazy"
            />
            <div>
              <div style={{ fontWeight: 500, fontSize: '13px', lineHeight: 1.3, color: 'var(--color-text-primary)' }}>{p.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{p.brandName}</div>
            </div>
          </div>
        );
      },
    },
    {
      headerName: 'Category',
      field: 'categoryName',
      width: 130,
      filter: true,
    },
    {
      headerName: 'Price',
      field: 'price',
      width: 110,
      editable: true,
      cellStyle: { fontWeight: 600 } as Record<string, string | number>,
      valueFormatter: (params) => `$${params.value?.toFixed(2)}`,
      filter: 'agNumberColumnFilter',
    },
    {
      headerName: 'Cost',
      field: 'costPrice',
      width: 100,
      valueFormatter: (params) => `$${params.value?.toFixed(2)}`,
      cellStyle: { color: 'var(--color-text-secondary)', fontSize: '12px' } as Record<string, string | number>,
    },
    {
      headerName: 'Margin',
      width: 90,
      valueGetter: (params) => {
        const p = params.data as Product;
        if (!p) return 0;
        return p.price > 0 ? +((1 - p.costPrice / p.price) * 100).toFixed(1) : 0;
      },
      valueFormatter: (params) => `${params.value}%`,
      cellStyle: (params) => ({
        color: params.value > 40 ? 'var(--color-text-success)' : params.value > 20 ? 'var(--color-text-warning)' : 'var(--color-text-danger)',
        fontSize: '12px',
      } as Record<string, string | number>),
    },
    {
      headerName: 'Stock',
      field: 'stockQuantity',
      width: 90,
      editable: true,
      filter: 'agNumberColumnFilter',
      cellStyle: (params) => ({
        color: params.value === 0 ? 'var(--color-text-danger)' : params.value <= 10 ? 'var(--color-text-warning)' : 'var(--color-text-primary)'
      } as Record<string, string | number>),
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 130,
      cellRenderer: (params: { value: ProductStatus }) => <StatusBadge status={params.value} />,
      filter: true,
    },
    {
      headerName: 'Visibility',
      field: 'visibility',
      width: 100,
      cellRenderer: (params: { value: string }) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: params.value === 'visible' ? 'var(--color-text-success)' : 'var(--color-text-tertiary)', fontSize: '12px' }}>
          {params.value === 'visible' ? <Eye size={14} /> : <EyeOff size={14} />}
          {params.value}
        </span>
      ),
    },
    {
      headerName: 'Updated',
      field: 'updatedAt',
      width: 140,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      },
      sort: 'desc',
      cellStyle: { fontSize: '12px', color: 'var(--color-text-tertiary)' } as Record<string, string | number>,
    },
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    resizable: true,
    filter: false,
  }), []);

  const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    setSelectedRows(event.api.getSelectedRows());
  }, []);

  const handleSearch = useCallback(() => {
    loadProducts(search || undefined);
  }, [search, loadProducts]);

  const handleExport = useCallback(() => {
    const csv = Papa.unparse(rowData.map(p => ({
      SKU: p.sku, Name: p.name, Category: p.categoryName, Brand: p.brandName,
      Price: p.price, CostPrice: p.costPrice, Stock: p.stockQuantity, Status: p.status,
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `products-export-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${rowData.length} products to CSV`, 'success');
  }, [rowData, showToast]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          showToast(`Parsed ${results.data.length} products from CSV. Import preview ready.`, 'info');
        },
        error: () => showToast('Failed to parse CSV file', 'error'),
      });
    };
    input.click();
  }, [showToast]);

  const handleBulkApply = useCallback(async () => {
    if (!bulkAction || selectedRows.length === 0) return;
    const ids = selectedRows.map(r => r.id);
    const prevValues: Record<string, Partial<Product>> = {};
    selectedRows.forEach(r => { prevValues[r.id] = { [bulkAction]: r[bulkAction as keyof Product] }; });

    let changes: Partial<Product> = {};
    if (bulkAction === 'price') changes = { price: parseFloat(bulkValue) || 0 };
    else if (bulkAction === 'status') changes = { status: bulkValue as ProductStatus };
    else if (bulkAction === 'stockQuantity') changes = { stockQuantity: parseInt(bulkValue) || 0 };

    const versionsMap: Record<string, number> = {};
    selectedRows.forEach(r => { versionsMap[r.id] = r.version; });

    try {
      const result = await productsApi.bulkUpdate(ids, changes, versionsMap);
      pushOperation({
        type: 'update',
        affectedIds: result.success,
        previousValues: prevValues,
        newValues: Object.fromEntries(result.success.map(id => [id, changes])),
        description: `Bulk ${bulkAction} update on ${result.success.length} products`,
      });

      await loadProducts(search || undefined);
      setShowBulkPanel(false);
      setBulkAction(''); setBulkValue('');

      if (result.conflicts.length > 0) {
        showToast(`Updated ${result.success.length} products. ${result.conflicts.length} conflicts detected.`, 'info');
      } else {
        showToast(`Successfully updated ${result.success.length} products`, 'success');
      }
    } catch {
      showToast('Bulk update failed', 'error');
    }
  }, [bulkAction, bulkValue, selectedRows, loadProducts, search, pushOperation, showToast]);

  const handleBulkDelete = useCallback(async () => {
    const ids = selectedRows.map(r => r.id);
    const prevValues: Record<string, Partial<Product>> = {};
    selectedRows.forEach(r => { prevValues[r.id] = { ...r }; });

    pushOperation({
      type: 'delete',
      affectedIds: ids,
      previousValues: prevValues,
      newValues: {},
      description: `Deleted ${ids.length} products`,
    });

    await productsApi.delete(ids);
    await loadProducts(search || undefined);
    setSelectedRows([]);
    showToast(`Deleted ${ids.length} products`, 'success');
  }, [selectedRows, loadProducts, search, pushOperation, showToast]);

  const btnBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border-primary)',
    background: 'transparent', color: 'var(--color-text-secondary)',
    cursor: 'pointer', fontSize: '13px', fontWeight: 500,
    transition: 'all var(--transition-fast)', fontFamily: 'var(--font-sans)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 120px)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Products</h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
            {totalProducts.toLocaleString()} products • {selectedRows.length > 0 ? `${selectedRows.length} selected` : 'Spreadsheet view'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={btnBase} onClick={handleImport}><Upload size={15} /> Import</button>
          <button style={btnBase} onClick={handleExport}><Download size={15} /> Export</button>
          <button style={btnBase} onClick={() => loadProducts()}><RefreshCw size={15} /> Refresh</button>
        </div>
      </div>

      {/* Search + Filters + Bulk Actions */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '12px 16px', borderRadius: 'var(--radius-lg)',
        background: 'var(--color-surface-card)', backdropFilter: 'blur(12px)',
        border: '1px solid var(--color-border-primary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <Search size={16} style={{ color: 'var(--color-text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search products by name, SKU, or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{
              flex: 1, border: 'none', background: 'transparent',
              color: 'var(--color-text-primary)', fontSize: '14px',
              outline: 'none', fontFamily: 'var(--font-sans)',
            }}
          />
          {search && (
            <button onClick={() => { setSearch(''); loadProducts(); }} style={{ ...btnBase, padding: '4px', border: 'none' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {selectedRows.length > 0 && (
          <>
            <div style={{ width: '1px', height: '28px', background: 'var(--color-border-primary)' }} />
            <button
              style={{ ...btnBase, background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)', color: 'var(--color-brand-400)' }}
              onClick={() => setShowBulkPanel(!showBulkPanel)}
            >
              <Edit3 size={14} /> Bulk Edit ({selectedRows.length})
            </button>
            <button
              style={{ ...btnBase, background: 'var(--color-status-danger-bg)', borderColor: 'rgba(220, 38, 38, 0.3)', color: 'var(--color-text-danger)' }}
              onClick={handleBulkDelete}
            >
              <Trash2 size={14} /> Delete
            </button>
          </>
        )}
      </div>

      {/* Bulk Edit Panel */}
      {showBulkPanel && (
        <div
          className="animate-slide-in-up"
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '16px 20px', borderRadius: 'var(--radius-lg)',
            background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.15)',
          }}
        >
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            Update {selectedRows.length} products:
          </span>
          <div style={{ position: 'relative' }}>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              style={{
                padding: '8px 32px 8px 12px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-primary)',
                background: 'var(--color-surface-tertiary)',
                color: 'var(--color-text-primary)', fontSize: '13px',
                fontFamily: 'var(--font-sans)', cursor: 'pointer',
                appearance: 'none', outline: 'none',
              }}
            >
              <option value="">Select field...</option>
              <option value="price">Price</option>
              <option value="status">Status</option>
              <option value="stockQuantity">Stock Quantity</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-tertiary)' }} />
          </div>

          {bulkAction === 'status' ? (
            <div style={{ position: 'relative' }}>
              <select
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                style={{
                  padding: '8px 32px 8px 12px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-primary)',
                  background: 'var(--color-surface-tertiary)',
                  color: 'var(--color-text-primary)', fontSize: '13px',
                  fontFamily: 'var(--font-sans)', cursor: 'pointer',
                  appearance: 'none', outline: 'none',
                }}
              >
                <option value="">Select status...</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
                <option value="discontinued">Discontinued</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-tertiary)' }} />
            </div>
          ) : (
            <input
              type="number"
              placeholder={bulkAction === 'price' ? 'New price...' : 'New quantity...'}
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-primary)',
                background: 'var(--color-surface-tertiary)',
                color: 'var(--color-text-primary)', fontSize: '13px',
                width: '150px', outline: 'none', fontFamily: 'var(--font-sans)',
              }}
            />
          )}

          <button
            onClick={handleBulkApply}
            disabled={!bulkAction || !bulkValue}
            style={{
              ...btnBase,
              background: 'var(--color-brand-600)', color: 'white',
              borderColor: 'var(--color-brand-600)',
              opacity: !bulkAction || !bulkValue ? 0.5 : 1,
              cursor: !bulkAction || !bulkValue ? 'not-allowed' : 'pointer',
            }}
          >
            Apply Changes
          </button>
          <button onClick={() => { setShowBulkPanel(false); setBulkAction(''); setBulkValue(''); }} style={{ ...btnBase, border: 'none' }}>
            <X size={14} /> Cancel
          </button>
        </div>
      )}

      {/* AG Grid */}
      <div
        className="ag-theme-custom"
        style={{
          flex: 1,
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--color-border-primary)',
        }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection="multiple"
          onSelectionChanged={onSelectionChanged}
          animateRows={true}
          pagination={true}
          paginationPageSize={100}
          paginationPageSizeSelector={[50, 100, 500, 1000]}
          loading={loading}
          enableCellTextSelection={true}
          getRowId={(params) => params.data.id}
          rowHeight={48}
          headerHeight={44}
        />
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className="animate-slide-in-up"
          style={{
            position: 'fixed', bottom: '24px', right: '24px',
            padding: '14px 20px', borderRadius: 'var(--radius-lg)',
            background: toast.type === 'success' ? 'var(--color-status-success)' : toast.type === 'error' ? 'var(--color-status-danger)' : 'var(--color-status-info)',
            color: 'white', fontSize: '14px', fontWeight: 500,
            boxShadow: 'var(--shadow-xl)',
            zIndex: 'var(--z-toast)' as unknown as number,
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
};
