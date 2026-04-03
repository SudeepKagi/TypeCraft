import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: {
    username: 'Felix',
    xp: 0,
    level: 1,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZ0W1Eu5kYb_wSF6r1wIkrFiUxQmRejb69GYue00jgc1ht5B5fIbNoBaHl2s_wb1Pa6WhRxReNFbDFwg4Ndw1NMOt6nNcseuL47rWgigH14PXBv08iZzmNy9EZWcbBYzm2fhMUCfZkcPJrvK5aK3YVU6zjRmLXT0umFYfH4ydlKO7gS8hod2lEJTfL5mVSGJmjkJgs5DIpt5fbmcJpWHBmgDecMxwfX8BS3rJYtxvaMQLdwJnAjUDhLFMmV7ppClPQouGk1ypuJLw',
  },
  userId: null,
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
  setUserId: (id) => set({ userId: id }),

  addXP: (amount) => set((state) => {
    const newXP = state.user.xp + amount;
    const newLevel = Math.floor(Math.sqrt(newXP / 50)) + 1;
    return { 
      user: { ...state.user, xp: newXP, level: newLevel }
    };
  }),

  syncUser: async () => {
    try {
      const auth = useAuthStore.getState();
      if (!auth.user) return;

      const response = await fetch('http://localhost:4000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: auth.user.username,
          email: `${auth.user.username.toLowerCase()}@typecraft.io`,
          avatarUrl: auth.user.avatarUrl
        })
      });

      if (response.ok) {
        const data = await response.json();
        set({ 
            userId: data.id,
            user: { 
                ...auth.user, 
                xp: data.xp || 0,
                level: Math.floor(Math.sqrt((data.xp || 0) / 50)) + 1
            }
        });
      }
    } catch (error) {
      console.error('Failed to sync user with DB:', error);
    }
  }
}));

export default useAuthStore;
