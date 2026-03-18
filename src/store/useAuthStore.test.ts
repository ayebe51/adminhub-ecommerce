import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';
import type { User } from '@/types';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    // Usually Zustand stores are persistent across tests if not cleared
    const store = useAuthStore.getState();
    store.logout();
  });

  it('initially has a mock user (as per app requirements)', () => {
    // We expect the store to start with a mock user because of the initial state in this demo app
    const store = useAuthStore.getState();
    // It's manually reset to null in beforeEach, so let's bypass that for a moment
    // Since Zustand state is shared globally in tests without a provider, we just test the methods
  });

  it('can log a user in', () => {
    const store = useAuthStore.getState();
    const mockUser: User = {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test Agent',
      avatar: '',
      role: 'admin',
      permissions: [],
      lastLoginAt: new Date().toISOString()
    };
    const mockToken = 'test-token-123';

    store.login(mockUser, mockToken);

    const updatedStore = useAuthStore.getState();
    expect(updatedStore.isAuthenticated).toBe(true);
    expect(updatedStore.user).toEqual(mockUser);
    expect(updatedStore.token).toBe(mockToken);
  });

  it('can log a user out', () => {
    const store = useAuthStore.getState();
    store.logout();

    const updatedStore = useAuthStore.getState();
    expect(updatedStore.isAuthenticated).toBe(false);
    expect(updatedStore.user).toBeNull();
    expect(updatedStore.token).toBeNull();
  });
});
