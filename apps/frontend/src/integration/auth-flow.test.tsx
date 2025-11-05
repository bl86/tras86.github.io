import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../shared/stores/auth.store';

describe('Auth Flow Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  });

  describe('Complete Login Flow', () => {
    it('should handle complete login flow from start to authenticated', () => {
      const { result } = renderHook(() => useAuthStore());

      // 1. Initial state - not authenticated
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.accessToken).toBe(null);

      // 2. User submits login form
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      const mockUser = {
        id: 'user-123',
        email: 'admin@accounting-bih.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      };

      // 3. Backend responds with token and user
      act(() => {
        result.current.login(mockToken, mockUser);
      });

      // 4. State should be updated
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.accessToken).toBe(mockToken);

      // 5. Data should be in localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', mockToken);
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    it('should persist authentication across page reload', () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      const mockUser = {
        id: 'user-123',
        email: 'admin@accounting-bih.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      };

      // 1. User logs in
      const { result: loginResult } = renderHook(() => useAuthStore());
      act(() => {
        loginResult.current.login(mockToken, mockUser);
      });

      // 2. Simulate page reload - store is reset
      useAuthStore.setState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });

      // 3. Mock localStorage having the data
      localStorage.getItem = vi.fn((key: string) => {
        if (key === 'accessToken') return mockToken;
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });

      // 4. Initialize from localStorage (happens in App.tsx)
      const { result: initResult } = renderHook(() => useAuthStore());
      act(() => {
        initResult.current.initialize();
      });

      // 5. Should be authenticated again
      expect(initResult.current.isAuthenticated).toBe(true);
      expect(initResult.current.user).toEqual(mockUser);
      expect(initResult.current.accessToken).toBe(mockToken);
    });

    it('should handle logout completely', () => {
      // 1. Start with logged in user
      const mockToken = 'token';
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'ADMIN',
      };

      const { result } = renderHook(() => useAuthStore());
      act(() => {
        result.current.login(mockToken, mockUser);
      });

      expect(result.current.isAuthenticated).toBe(true);

      // 2. User logs out
      act(() => {
        result.current.logout();
      });

      // 3. All state should be cleared
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.accessToken).toBe(null);

      // 4. localStorage should be cleared
      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle 401 unauthorized gracefully', () => {
      // Simulate 401 error handling
      const { result } = renderHook(() => useAuthStore());

      // User was logged in
      act(() => {
        result.current.login('token', {
          id: '1',
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
        });
      });

      expect(result.current.isAuthenticated).toBe(true);

      // API returns 401, interceptor clears auth
      act(() => {
        result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.getItem = vi.fn((key: string) => {
        if (key === 'accessToken') return 'token';
        if (key === 'user') return 'invalid{json}}';
        return null;
      });

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.initialize();
      });

      // Should handle gracefully
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
    });
  });

  describe('Token Validation', () => {
    it('should accept valid JWT format tokens', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.test';
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.login(validToken, {
          id: '1',
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
        });
      });

      expect(result.current.accessToken).toBe(validToken);
    });
  });
});
