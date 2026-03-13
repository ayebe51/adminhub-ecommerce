import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap, Plus, Calendar, Eye, Edit3, Trash2, Play, Pause,
  ChevronDown, ChevronRight, AlertCircle, CheckCircle2, Clock, Archive,
  X, GripVertical, Copy
} from 'lucide-react';
import { promotionsApi } from '@/mocks/api';
import type { PromotionRule, PromotionStatus, ConditionGroup, Condition, PromotionAction } from '@/types';
import { v4 as uuid } from 'uuid';

const statusConfig: Record<PromotionStatus, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  active: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', icon: <Play size={12} />, label: 'Active' },
  draft: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: <Edit3 size={12} />, label: 'Draft' },
  scheduled: { color: '#818cf8', bg: 'rgba(129,140,248,0.12)', icon: <Clock size={12} />, label: 'Scheduled' },
  paused: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', icon: <Pause size={12} />, label: 'Paused' },
  expired: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', icon: <AlertCircle size={12} />, label: 'Expired' },
  archived: { color: '#64748b', bg: 'rgba(100,116,139,0.12)', icon: <Archive size={12} />, label: 'Archived' },
};

const conditionTypeLabels: Record<string, string> = {
  cart_total: 'Cart Total',
  cart_quantity: 'Cart Quantity',
  product_category: 'Product Category',
  product_brand: 'Product Brand',
  product_tag: 'Product Tag',
  product_price: 'Product Price',
  customer_group: 'Customer Group',
  customer_order_count: 'Order Count',
  coupon_code: 'Coupon Code',
  day_of_week: 'Day of Week',
  time_of_day: 'Time of Day',
};

const operatorLabels: Record<string, string> = {
  equals: '=', not_equals: '≠', greater_than: '>', less_than: '<',
  greater_than_or_equal: '≥', less_than_or_equal: '≤',
  contains: 'contains', not_contains: 'not contains',
  in: 'in', not_in: 'not in', between: 'between',
};

const actionTypeLabels: Record<string, string> = {
  percentage_discount: '% Discount',
  fixed_discount: 'Fixed Discount',
  free_shipping: 'Free Shipping',
  buy_x_get_y: 'Buy X Get Y',
  fixed_price: 'Fixed Price',
};

// ── Condition Renderer ──────────────────────────────
const ConditionBadge: React.FC<{ condition: Condition }> = ({ condition }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '6px 12px', borderRadius: 'var(--radius-md)',
    background: 'var(--color-surface-tertiary)', border: '1px solid var(--color-border-primary)',
    fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary)',
  }}>
    <span style={{ color: 'var(--color-brand-400)', fontWeight: 600 }}>{conditionTypeLabels[condition.type] || condition.type}</span>
    <span style={{ color: 'var(--color-text-warning)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{operatorLabels[condition.operator] || condition.operator}</span>
    <span style={{ color: 'var(--color-text-success)' }}>{Array.isArray(condition.value) ? condition.value.join(', ') : String(condition.value)}</span>
  </div>
);

const ConditionGroupView: React.FC<{ group: ConditionGroup; depth?: number }> = ({ group, depth = 0 }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', gap: '6px',
    padding: depth > 0 ? '10px' : '0',
    borderLeft: depth > 0 ? '2px solid var(--color-brand-500)' : 'none',
    marginLeft: depth > 0 ? '8px' : '0',
  }}>
    {group.conditions.map((item, i) => (
      <React.Fragment key={i}>
        {i > 0 && (
          <span style={{
            fontSize: '11px', fontWeight: 700, color: group.operator === 'AND' ? 'var(--color-brand-400)' : 'var(--color-text-warning)',
            textTransform: 'uppercase', letterSpacing: '0.1em', alignSelf: 'flex-start',
            padding: '2px 8px', borderRadius: '4px',
            background: group.operator === 'AND' ? 'rgba(99,102,241,0.1)' : 'rgba(251,191,36,0.1)',
          }}>
            {group.operator}
          </span>
        )}
        {'type' in item
          ? <ConditionBadge condition={item as Condition} />
          : <ConditionGroupView group={item as ConditionGroup} depth={depth + 1} />
        }
      </React.Fragment>
    ))}
  </div>
);

// ── Rule Builder Modal ─────────────────────────────
interface RuleBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: Partial<PromotionRule>) => void;
  editingRule?: PromotionRule | null;
}

const RuleBuilderModal: React.FC<RuleBuilderModalProps> = ({ isOpen, onClose, onSave, editingRule }) => {
  const [name, setName] = useState(editingRule?.name || '');
  const [description, setDescription] = useState(editingRule?.description || '');
  const [conditions, setConditions] = useState<Condition[]>(
    editingRule?.conditions?.conditions?.filter((c): c is Condition => 'type' in c) || []
  );
  const [conditionOp, setConditionOp] = useState<'AND' | 'OR'>(editingRule?.conditions?.operator || 'AND');
  const [actions, setActions] = useState<PromotionAction[]>(editingRule?.actions || []);
  const [startDate, setStartDate] = useState(editingRule?.schedule?.startDate?.slice(0, 10) || '');
  const [endDate, setEndDate] = useState(editingRule?.schedule?.endDate?.slice(0, 10) || '');

  // Preview
  const [showPreview, setShowPreview] = useState(false);
  const previewCart = { subtotal: 150, items: 4, category: 'Electronics' };
  const previewDiscount = actions.reduce((total, action) => {
    if (action.type === 'percentage_discount') return total + (previewCart.subtotal * action.value / 100);
    if (action.type === 'fixed_discount') return total + action.value;
    return total;
  }, 0);

  const addCondition = () => {
    setConditions([...conditions, {
      id: uuid(), type: 'cart_total', field: 'subtotal', operator: 'greater_than', value: 0,
    }]);
  };

  const addAction = () => {
    setActions([...actions, {
      id: uuid(), type: 'percentage_discount', value: 10, maxDiscount: null, target: 'order', targetProductIds: [], targetCategoryIds: [],
    }]);
  };

  const removeCondition = (id: string) => setConditions(conditions.filter(c => c.id !== id));
  const removeAction = (id: string) => setActions(actions.filter(a => a.id !== id));

  const handleSave = () => {
    onSave({
      name, description, status: 'draft', priority: 1,
      conditions: { operator: conditionOp, conditions },
      actions,
      schedule: {
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
        isRecurring: false, recurringDays: [], recurringStartTime: null, recurringEndTime: null, timezone: 'UTC',
      },
    });
  };

  if (!isOpen) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border-primary)', background: 'var(--color-surface-tertiary)',
    color: 'var(--color-text-primary)', fontSize: '14px', outline: 'none', fontFamily: 'var(--font-sans)',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle, cursor: 'pointer', appearance: 'none' as const,
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--color-surface-overlay)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 'var(--z-modal)' as unknown as number,
    }} onClick={onClose}>
      <div
        className="animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '800px', maxHeight: '85vh', overflow: 'auto',
          background: 'var(--color-surface-secondary)', borderRadius: 'var(--radius-2xl)',
          border: '1px solid var(--color-border-primary)', boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '24px 28px', borderBottom: '1px solid var(--color-border-primary)',
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
              {editingRule ? 'Edit Promotion Rule' : 'Create Promotion Rule'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>
              Define conditions and actions for your promotion
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Basic Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Promotion Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Summer Sale 20% Off" style={inputStyle} />
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this promotion..." rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {/* Conditions (IF) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-brand-400)' }}>IF</span>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Conditions</span>
                <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-primary)', overflow: 'hidden' }}>
                  {(['AND', 'OR'] as const).map(op => (
                    <button key={op} onClick={() => setConditionOp(op)} style={{
                      padding: '4px 12px', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                      background: conditionOp === op ? 'var(--color-brand-600)' : 'transparent',
                      color: conditionOp === op ? 'white' : 'var(--color-text-tertiary)',
                    }}>{op}</button>
                  ))}
                </div>
              </div>
              <button onClick={addCondition} style={{
                display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
                borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border-primary)',
                background: 'transparent', color: 'var(--color-brand-400)', cursor: 'pointer',
                fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-sans)',
              }}>
                <Plus size={14} /> Add Condition
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {conditions.map((cond, i) => (
                <div key={cond.id} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-tertiary)', border: '1px solid var(--color-border-primary)',
                }}>
                  <GripVertical size={14} style={{ color: 'var(--color-text-tertiary)', cursor: 'grab', flexShrink: 0 }} />
                  {i > 0 && <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-brand-400)', textTransform: 'uppercase' }}>{conditionOp}</span>}
                  <select value={cond.type} onChange={(e) => {
                    const updated = [...conditions];
                    updated[i] = { ...cond, type: e.target.value as Condition['type'] };
                    setConditions(updated);
                  }} style={{ ...selectStyle, width: 'auto', padding: '6px 10px', fontSize: '12px' }}>
                    {Object.entries(conditionTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <select value={cond.operator} onChange={(e) => {
                    const updated = [...conditions];
                    updated[i] = { ...cond, operator: e.target.value as Condition['operator'] };
                    setConditions(updated);
                  }} style={{ ...selectStyle, width: 'auto', padding: '6px 10px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                    {Object.entries(operatorLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <input
                    type="text" value={String(cond.value)}
                    onChange={(e) => {
                      const updated = [...conditions];
                      updated[i] = { ...cond, value: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value) };
                      setConditions(updated);
                    }}
                    style={{ ...inputStyle, width: '120px', padding: '6px 10px', fontSize: '12px' }}
                  />
                  <button onClick={() => removeCondition(cond.id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-danger)', cursor: 'pointer', flexShrink: 0 }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              {conditions.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px', border: '1px dashed var(--color-border-primary)', borderRadius: 'var(--radius-md)' }}>
                  No conditions. Click "Add Condition" to define when this promotion applies.
                </div>
              )}
            </div>
          </div>

          {/* Actions (THEN) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-success)' }}>THEN</span>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Actions</span>
              </div>
              <button onClick={addAction} style={{
                display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
                borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border-primary)',
                background: 'transparent', color: 'var(--color-text-success)', cursor: 'pointer',
                fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-sans)',
              }}>
                <Plus size={14} /> Add Action
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {actions.map((action, i) => (
                <div key={action.id} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.15)',
                }}>
                  <select value={action.type} onChange={(e) => {
                    const updated = [...actions];
                    updated[i] = { ...action, type: e.target.value as PromotionAction['type'] };
                    setActions(updated);
                  }} style={{ ...selectStyle, width: 'auto', padding: '6px 10px', fontSize: '12px' }}>
                    {Object.entries(actionTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  {action.type !== 'free_shipping' && (
                    <input
                      type="number" value={action.value}
                      onChange={(e) => {
                        const updated = [...actions];
                        updated[i] = { ...action, value: Number(e.target.value) };
                        setActions(updated);
                      }}
                      style={{ ...inputStyle, width: '100px', padding: '6px 10px', fontSize: '12px' }}
                      placeholder="Value"
                    />
                  )}
                  <select value={action.target} onChange={(e) => {
                    const updated = [...actions];
                    updated[i] = { ...action, target: e.target.value as PromotionAction['target'] };
                    setActions(updated);
                  }} style={{ ...selectStyle, width: 'auto', padding: '6px 10px', fontSize: '12px' }}>
                    <option value="order">Order</option>
                    <option value="product">Product</option>
                    <option value="shipping">Shipping</option>
                  </select>
                  <button onClick={() => removeAction(action.id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-danger)', cursor: 'pointer', flexShrink: 0 }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Calendar size={16} style={{ color: 'var(--color-text-warning)' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Schedule</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '4px' }}>Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '4px' }}>End Date (optional)</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <button onClick={() => setShowPreview(!showPreview)} style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              padding: '12px 16px', borderRadius: 'var(--radius-md)',
              background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
              color: 'var(--color-brand-400)', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              fontFamily: 'var(--font-sans)',
            }}>
              <Eye size={15} />
              Preview Promotion Effect
              <ChevronDown size={14} style={{ marginLeft: 'auto', transform: showPreview ? 'rotate(180deg)' : 'none', transition: 'transform var(--transition-fast)' }} />
            </button>
            {showPreview && (
              <div className="animate-fade-in" style={{
                marginTop: '8px', padding: '16px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-tertiary)', border: '1px solid var(--color-border-primary)',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                  Sample Cart Preview
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal ({previewCart.items} items)</span>
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>${previewCart.subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-success)' }}>Discount</span>
                    <span style={{ color: 'var(--color-text-success)', fontWeight: 700 }}>-${previewDiscount.toFixed(2)}</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--color-border-primary)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Total</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '16px' }}>
                      ${(previewCart.subtotal - previewDiscount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: '8px',
          padding: '16px 28px', borderTop: '1px solid var(--color-border-primary)',
        }}>
          <button onClick={onClose} style={{
            padding: '10px 20px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-primary)', background: 'transparent',
            color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '14px', fontFamily: 'var(--font-sans)',
          }}>Cancel</button>
          <button onClick={handleSave} disabled={!name} style={{
            padding: '10px 24px', borderRadius: 'var(--radius-md)',
            border: 'none', background: 'var(--color-brand-600)',
            color: 'white', cursor: name ? 'pointer' : 'not-allowed',
            fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-sans)',
            opacity: name ? 1 : 0.5,
          }}>Save Rule</button>
        </div>
      </div>
    </div>
  );
};

// ── Promotions Page ─────────────────────────────────
export const PromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState<PromotionRule | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await promotionsApi.getAll();
      setPromotions(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPromotions(); }, [loadPromotions]);

  const handleSave = async (ruleData: Partial<PromotionRule>) => {
    if (editingRule) {
      await promotionsApi.update(editingRule.id, ruleData);
    } else {
      await promotionsApi.create(ruleData);
    }
    setShowBuilder(false);
    setEditingRule(null);
    loadPromotions();
  };

  const handleDelete = async (id: string) => {
    await promotionsApi.delete(id);
    loadPromotions();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Promotions</h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
            {promotions.length} rules • Rule-based promotion engine
          </p>
        </div>
        <button
          onClick={() => { setEditingRule(null); setShowBuilder(true); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: 'var(--radius-md)',
            border: 'none', background: 'var(--color-brand-600)',
            color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
            fontFamily: 'var(--font-sans)', boxShadow: 'var(--shadow-glow)',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Plus size={18} /> Create Rule
        </button>
      </div>

      {/* Promotion Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-tertiary)' }}>Loading...</div>
        ) : promotions.map((promo) => {
          const cfg = statusConfig[promo.status];
          const isExpanded = expandedId === promo.id;

          return (
            <div
              key={promo.id}
              className="animate-fade-in"
              style={{
                background: 'var(--color-surface-card)', backdropFilter: 'blur(12px)',
                border: '1px solid var(--color-border-primary)', borderRadius: 'var(--radius-xl)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {/* Card Header */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', cursor: 'pointer' }}
                onClick={() => setExpandedId(isExpanded ? null : promo.id)}
              >
                <Zap size={20} style={{ color: 'var(--color-brand-400)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{promo.name}</span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '2px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                      color: cfg.color, background: cfg.bg,
                    }}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      P{promo.priority}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{promo.description}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Usage</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {promo.usageCount.toLocaleString()}{promo.usageLimit ? ` / ${promo.usageLimit.toLocaleString()}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={(e) => { e.stopPropagation(); setEditingRule(promo); setShowBuilder(true); }} style={{ padding: '6px', background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer' }}>
                      <Edit3 size={15} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(JSON.stringify(promo, null, 2)); }} style={{ padding: '6px', background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer' }}>
                      <Copy size={15} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(promo.id); }} style={{ padding: '6px', background: 'none', border: 'none', color: 'var(--color-text-danger)', cursor: 'pointer' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--color-text-tertiary)', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform var(--transition-fast)' }} />
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="animate-fade-in" style={{
                  padding: '0 24px 20px', borderTop: '1px solid var(--color-border-secondary)',
                  paddingTop: '16px',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-brand-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                        IF — Conditions
                      </div>
                      <ConditionGroupView group={promo.conditions} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-success)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                        THEN — Actions
                      </div>
                      {promo.actions.map(action => (
                        <div key={action.id} style={{
                          padding: '8px 12px', borderRadius: 'var(--radius-md)',
                          background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.12)',
                          fontSize: '13px', color: 'var(--color-text-primary)', marginBottom: '6px',
                        }}>
                          <span style={{ fontWeight: 600 }}>{actionTypeLabels[action.type]}</span>
                          {action.value > 0 && <span style={{ color: 'var(--color-text-success)', fontWeight: 700 }}> {action.type.includes('percentage') ? `${action.value}%` : `$${action.value}`}</span>}
                          <span style={{ color: 'var(--color-text-tertiary)' }}> on {action.target}</span>
                          {action.maxDiscount && <span style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}> (max ${action.maxDiscount})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--color-text-tertiary)', display: 'flex', gap: '16px' }}>
                    <span>📅 {new Date(promo.schedule.startDate).toLocaleDateString()} → {promo.schedule.endDate ? new Date(promo.schedule.endDate).toLocaleDateString() : 'No end date'}</span>
                    <span>🔄 {promo.stackable ? 'Stackable' : 'Non-stackable'}</span>
                    {promo.perCustomerLimit && <span>👤 {promo.perCustomerLimit} per customer</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <RuleBuilderModal
        isOpen={showBuilder}
        onClose={() => { setShowBuilder(false); setEditingRule(null); }}
        onSave={handleSave}
        editingRule={editingRule}
      />
    </div>
  );
};
