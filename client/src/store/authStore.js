import { create } from 'zustand';
import { API_BASE_URL } from '../lib/constants';
import socket from '../lib/socket';

const useAuthStore = create((set, get) => {
  // Global socket listener for real-time profile sync
  if (typeof window !== 'undefined') {
    socket.on('user:update', (data) => {
      set((state) => ({
        user: state.user ? { ...state.user, xp: data.xp, level: data.level } : null
      }));
    });
  }

  return {
  user: null,
  userId: null,
  isAuthenticated: false,
  isInitialized: false,
  onboardingCompleted: false,

  setUserId: (id) => set({ userId: id }),

  addXP: (amount) => {
    const { user } = get();
    if (!user) return;
    
    const newXP = (user.xp || 0) + amount;
    const newLevel = Math.floor(Math.sqrt(newXP / 50)) + 1;
    set({ 
      user: { ...user, xp: newXP, level: newLevel }
    });
  },

  initializeAuth: async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await res.json();
      if (data.authenticated) {
        const user = data.user;
        const correctLevel = Math.floor(Math.sqrt((user.xp || 0) / 50)) + 1;
        set({ 
          user: { ...user, level: correctLevel }, 
          isAuthenticated: true, 
          userId: user.id,
          onboardingCompleted: data.onboardingCompleted 
        });
      } else {
        set({ user: null, isAuthenticated: false, userId: null, onboardingCompleted: false });
      }
    } catch (err) {
      console.error('Auth initialization failed or timed out:', err);
      set({ user: null, isAuthenticated: false, userId: null, onboardingCompleted: false });
    } finally {
      set({ isInitialized: true });
    }
  },

  completeOnboarding: (userData) => {
    set({ user: userData, onboardingCompleted: true });
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { 
        method: 'POST',
        credentials: 'include'
      });
      set({ user: null, userId: null, isAuthenticated: false });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },

  // Kept for backward compatibility but redirected to re-fetch me
  syncUser: async () => {
    const { initializeAuth } = get();
    await initializeAuth();
  }
  };
});

export default useAuthStore;
