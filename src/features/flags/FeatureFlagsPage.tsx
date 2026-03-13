import React from 'react';
import { useFeatureFlags } from '@/store/useFeatureFlags';
import { Flag, ToggleLeft, ToggleRight, Info } from 'lucide-react';

export const FeatureFlagsPage: React.FC = () => {
  const { flags, toggleFlag } = useFeatureFlags();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Feature Flags</h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
          Toggle features on/off for the admin portal. Changes apply immediately.
        </p>
      </div>

      <div style={{
        padding: '12px 16px', borderRadius: 'var(--radius-md)',
        background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
        display: 'flex', alignItems: 'center', gap: '8px',
        fontSize: '13px', color: 'var(--color-text-secondary)',
      }}>
        <Info size={16} style={{ color: 'var(--color-brand-400)', flexShrink: 0 }} />
        Feature flags are stored client-side for this demo. In production, these would be managed via a service like LaunchDarkly or Split.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {flags.map((flag) => (
          <div
            key={flag.key}
            className="animate-fade-in"
            style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '16px 20px', borderRadius: 'var(--radius-lg)',
              background: 'var(--color-surface-card)', border: '1px solid var(--color-border-primary)',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Flag size={18} style={{ color: flag.enabled ? 'var(--color-text-success)' : 'var(--color-text-tertiary)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                {flag.key}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{flag.description}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginRight: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Rollout</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{flag.rolloutPercentage}%</div>
            </div>
            <button
              onClick={() => toggleFlag(flag.key)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: flag.enabled ? 'var(--color-text-success)' : 'var(--color-text-tertiary)',
                transition: 'color var(--transition-fast)',
                display: 'flex', alignItems: 'center',
              }}
              aria-label={`Toggle ${flag.key}`}
            >
              {flag.enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
