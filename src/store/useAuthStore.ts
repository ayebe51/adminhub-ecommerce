import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 'admin-001',
    email: 'admin@ecommerce.io',
    name: 'Sarah Chen',
    avatar: '',
    role: 'super_admin',
    permissions: [
      'products:read', 'products:write', 'products:delete', 'products:bulk',
      'inventory:read', 'inventory:write',
      'promotions:read', 'promotions:write', 'promotions:delete',
      'audit:read',
      'settings:read', 'settings:write',
      'users:read', 'users:write',
    ],
    lastLoginAt: new Date().toISOString(),
  },
  token: 'mock-jwt-token',
  isAuthenticated: true,
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
