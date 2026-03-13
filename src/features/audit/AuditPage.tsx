import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, Search, Filter, User, ArrowRight,
  Package, Warehouse, Zap, Tag, ChevronRight
} from 'lucide-react';
import { auditApi } from '@/mocks/api';
import type { AuditEntry, EntityType } from '@/types';

const entityIcons: Record<EntityType, React.ReactNode> = {
  product: <Package size={16} />,
  inventory: <Warehouse size={16} />,
  promotion: <Zap size={16} />,
  category: <Tag size={16} />,
  user: <User size={16} />,
  order: <ClipboardList size={16} />,
  setting: <Filter size={16} />,
};

const entityColors: Record<EntityType, string> = {
  product: '#6366f1',
  inventory: '#10b981',
  promotion: '#f59e0b',
  category: '#8b5cf6',
  user: '#ec4899',
  order: '#06b6d4',
  setting: '#64748b',
};

const actionColors: Record<string, { color: string; bg: string }> = {
  create: { color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  update: { color: '#818cf8', bg: 'rgba(129,140,248,0.12)' },
  delete: { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  bulk_update: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  import: { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  export: { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  status_change: { color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  publish: { color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  archive: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
};

export const AuditPage: React.FC = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, unknown> = {};
      if (search) filters.search = search;
      if (entityFilter) filters.entityType = [entityFilter];
      if (actionFilter) filters.action = [actionFilter];
      const result = await auditApi.getAll(page, 50, filters);
      setEntries(result.data);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [page, search, entityFilter, actionFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border-primary)', background: 'var(--color-surface-tertiary)',
    color: 'var(--color-text-primary)', fontSize: '13px', fontFamily: 'var(--font-sans)',
    cursor: 'pointer', outline: 'none', appearance: 'none' as const,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Audit Log</h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
          {total} entries • Complete change history
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '12px 16px', borderRadius: 'var(--radius-lg)',
        background: 'var(--color-surface-card)', border: '1px solid var(--color-border-primary)',
      }}>
        <Search size={16} style={{ color: 'var(--color-text-tertiary)' }} />
        <input
          type="text" placeholder="Search audit log..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadData()}
          style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--color-text-primary)', fontSize: '14px', outline: 'none', fontFamily: 'var(--font-sans)' }}
        />
        <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="">All Entities</option>
          <option value="product">Products</option>
          <option value="inventory">Inventory</option>
          <option value="promotion">Promotions</option>
          <option value="category">Categories</option>
        </select>
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="bulk_update">Bulk Update</option>
          <option value="import">Import</option>
          <option value="status_change">Status Change</option>
        </select>
      </div>

      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-tertiary)' }}>Loading...</div>
        ) : entries.map((entry) => {
          const acColor = actionColors[entry.action] || actionColors.update;
          const isExpanded = expandedId === entry.id;

          return (
            <div
              key={entry.id}
              className="animate-fade-in"
              style={{
                display: 'flex', gap: '16px',
                padding: '16px 20px',
                background: 'var(--color-surface-card)',
                border: '1px solid var(--color-border-secondary)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                marginBottom: '4px',
              }}
              onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-secondary)'; }}
            >
              {/* Timeline dot */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', paddingTop: '4px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
                  background: `${entityColors[entry.entityType]}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: entityColors[entry.entityType],
                }}>
                  {entityIcons[entry.entityType]}
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>{entry.userName}</span>
                  <span style={{
                    padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                    color: acColor.color, background: acColor.bg,
                  }}>
                    {entry.action.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{entry.entityName}</span>
                  <span style={{
                    fontSize: '11px', color: 'var(--color-text-tertiary)',
                    padding: '1px 6px', background: 'var(--color-surface-tertiary)',
                    borderRadius: '4px', textTransform: 'capitalize',
                  }}>
                    {entry.entityType}
                  </span>
                </div>

                {/* Changes (expanded) */}
                {isExpanded && entry.changes.length > 0 && (
                  <div className="animate-fade-in" style={{
                    marginTop: '12px', padding: '12px 16px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface-tertiary)', border: '1px solid var(--color-border-primary)',
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Changes
                    </div>
                    {entry.changes.map((change, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '13px', borderBottom: i < entry.changes.length - 1 ? '1px solid var(--color-border-secondary)' : 'none' }}>
                        <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500, minWidth: '100px' }}>{change.fieldLabel}</span>
                        <span style={{ color: 'var(--color-text-danger)', textDecoration: 'line-through', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{String(change.oldValue)}</span>
                        <ArrowRight size={12} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
                        <span style={{ color: 'var(--color-text-success)', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}>{String(change.newValue)}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                      IP: {entry.ipAddress} • Role: {entry.userRole}
                    </div>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{formatTimestamp(entry.timestamp)}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                  {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <ChevronRight size={14} style={{ color: 'var(--color-text-tertiary)', alignSelf: 'center', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform var(--transition-fast)', flexShrink: 0 }} />
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {total > 50 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px 0' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-primary)', background: 'transparent',
              color: page === 1 ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)',
              cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '13px', fontFamily: 'var(--font-sans)',
            }}
          >Previous</button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Page {page} of {Math.ceil(total / 50)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / 50)}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-primary)', background: 'transparent',
              color: page >= Math.ceil(total / 50) ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)',
              cursor: page >= Math.ceil(total / 50) ? 'not-allowed' : 'pointer', fontSize: '13px', fontFamily: 'var(--font-sans)',
            }}
          >Next</button>
        </div>
      )}
    </div>
  );
};
