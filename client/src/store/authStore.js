import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
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
      const res = await fetch('http://localhost:4000/auth/me', {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.authenticated) {
        set({ 
          user: data.user, 
          isAuthenticated: true, 
          userId: data.user.id,
          onboardingCompleted: data.onboardingCompleted 
        });
      } else {
        set({ user: null, isAuthenticated: false, userId: null, onboardingCompleted: false });
      }
    } catch (err) {
      console.error('Auth initialization failed:', err);
    } finally {
      set({ isInitialized: true });
    }
  },

  completeOnboarding: (userData) => {
    set({ user: userData, onboardingCompleted: true });
  },

  logout: async () => {
    try {
      await fetch('http://localhost:4000/auth/logout', { 
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
}));

export default useAuthStore;
