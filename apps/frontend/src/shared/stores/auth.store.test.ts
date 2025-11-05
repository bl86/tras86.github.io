import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './auth.store';

describe('Auth Store', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  });

  describe('initialize', () => {
    it('should load user and token from localStorage', () => {
      const mockToken = 'mock-jwt-token';
      const mockUser = { id: '1', email: 'test@test.com', firstName: 'Test', lastName: 'User', role: 'ADMIN' };

      localStorage.setItem('accessToken', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      const { initialize } = useAuthStore.getState();
      initialize();

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe(mockToken);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle missing token/user gracefully', () => {
      const { initialize } = useAuthStore.getState();
      initialize();

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe(null);
      expect(state.user).toBe(null);
      expect(state.isAuthenticated).toBe(false);
    });

    it('should handle corrupted JSON in localStorage', () => {
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('user', 'invalid-json{{{');

      const { initialize } = useAuthStore.getState();
      initialize();

      const state = useAuthStore.getState();
      expect(state.user).toBe(null);
      expect(state.accessToken).toBe(null);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should save token and user to localStorage and state', () => {
      const mockToken = 'mock-jwt-token';
      const mockUser = { id: '1', email: 'test@test.com', firstName: 'Test', lastName: 'User', role: 'ADMIN' };

      const { login } = useAuthStore.getState();
      login(mockToken, mockUser);

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe(mockToken);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);

      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', mockToken);
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    it('should handle login with null values', () => {
      const { login } = useAuthStore.getState();
      // @ts-ignore - testing edge case
      login(null, null);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true); // Still sets authenticated
    });
  });

  describe('logout', () => {
    it('should clear localStorage and reset state', () => {
      // First login
      const mockToken = 'mock-jwt-token';
      const mockUser = { id: '1', email: 'test@test.com', firstName: 'Test', lastName: 'User', role: 'ADMIN' };
      useAuthStore.getState().login(mockToken, mockUser);

      // Then logout
      const { logout } = useAuthStore.getState();
      logout();

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe(null);
      expect(state.user).toBe(null);
      expect(state.isAuthenticated).toBe(false);

      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });
});
