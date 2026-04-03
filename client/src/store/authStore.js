import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: {
    username: 'Felix',
    xp: 1240,
    level: 42,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZ0W1Eu5kYb_wSF6r1wIkrFiUxQmRejb69GYue00jgc1ht5B5fIbNoBaHl2s_wb1Pa6WhRxReNFbDFwg4Ndw1NMOt6nNcseuL47rWgigH14PXBv08iZzmNy9EZWcbBYzm2fhMUCfZkcPJrvK5aK3YVU6zjRmLXT0umFYfH4ydlKO7gS8hod2lEJTfL5mVSGJmjkJgs5DIpt5fbmcJpWHBmgDecMxwfX8BS3rJYtxvaMQLdwJnAjUDhLFMmV7ppClPQouGk1ypuJLw',
  },
  token: null,
  isAuthenticated: true,
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false })
}));

export default useAuthStore;
