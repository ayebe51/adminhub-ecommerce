import { create } from 'zustand';
import type { FeatureFlag } from '@/types';

interface FeatureFlagState {
  flags: FeatureFlag[];
  isEnabled: (key: string) => boolean;
  toggleFlag: (key: string) => void;
  setFlags: (flags: FeatureFlag[]) => void;
}

const defaultFlags: FeatureFlag[] = [
  { key: 'bulk_operations', enabled: true, description: 'Enable bulk edit/update operations', rolloutPercentage: 100 },
  { key: 'promotion_engine', enabled: true, description: 'Enable promotion rule builder', rolloutPercentage: 100 },
  { key: 'csv_import_export', enabled: true, description: 'Enable CSV import/export', rolloutPercentage: 100 },
  { key: 'audit_log', enabled: true, description: 'Enable audit trail viewer', rolloutPercentage: 100 },
  { key: 'dark_mode', enabled: true, description: 'Enable dark mode', rolloutPercentage: 100 },
  { key: 'advanced_filters', enabled: true, description: 'Enable advanced filtering', rolloutPercentage: 80 },
  { key: 'real_time_sync', enabled: false, description: 'Enable real-time data sync via WebSocket', rolloutPercentage: 0 },
  { key: 'ai_suggestions', enabled: false, description: 'Enable AI-powered product suggestions', rolloutPercentage: 0 },
];

export const useFeatureFlags = create<FeatureFlagState>((set, get) => ({
  flags: defaultFlags,
  isEnabled: (key: string) => {
    const flag = get().flags.find(f => f.key === key);
    return flag?.enabled ?? false;
  },
  toggleFlag: (key: string) =>
    set((state) => ({
      flags: state.flags.map(f =>
        f.key === key ? { ...f, enabled: !f.enabled } : f
      ),
    })),
  setFlags: (flags) => set({ flags }),
}));
