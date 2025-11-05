/**
 * Authentication Store - SIMPLE VERSION WITHOUT PERSIST
 * No caching issues - direct localStorage management
 */

import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  // Initialize from localStorage
  initialize: () => void;

  // Login - save to localStorage
  login: (accessToken: string, user: User) => void;

  // Logout - clear localStorage
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  // Initialize auth state from localStorage on app start
  initialize: () => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          accessToken: token,
          user,
          isAuthenticated: true,
        });
      } catch (error) {
        // Invalid data, clear everything
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      }
    } else {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });
    }
  },

  // Login - save to state AND localStorage
  login: (accessToken, user) => {
    // Save to localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));

    // Update state
    set({
      accessToken,
      user,
      isAuthenticated: true,
    });
  },

  // Logout - clear state AND localStorage
  logout: () => {
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    // Clear state
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },
}));
