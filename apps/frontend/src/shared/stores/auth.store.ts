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
    console.log('🔄 INITIALIZE called - loading from localStorage');
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    console.log('  Token:', token ? `${token.substring(0, 20)}...` : 'NULL');
    console.log('  User:', userStr ? 'EXISTS' : 'NULL');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          accessToken: token,
          user,
          isAuthenticated: true,
        });
        console.log('✅ Initialized with token, isAuthenticated: true');
      } catch (error) {
        // Invalid data, clear everything
        console.error('❌ Error parsing user from localStorage:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
        console.log('❌ Cleared localStorage, isAuthenticated: false');
      }
    } else {
      console.log('⚠️ No token/user in localStorage, isAuthenticated: false');
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });
    }
  },

  // Login - save to state AND localStorage
  login: (accessToken, user) => {
    console.log('🔐 LOGIN called with:');
    console.log('  Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NULL');
    console.log('  User:', user);

    // Save to localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    console.log('✅ Saved to localStorage');

    // Verify it was saved
    const savedToken = localStorage.getItem('accessToken');
    console.log('✅ Verified in localStorage:', savedToken ? 'EXISTS' : 'NULL');

    // Update state
    set({
      accessToken,
      user,
      isAuthenticated: true,
    });
    console.log('✅ State updated, isAuthenticated: true');
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
