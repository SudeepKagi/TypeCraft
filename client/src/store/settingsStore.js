import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist(
    (set) => ({
      soundEnabled: true,
      soundType: 'mechanical', // 'mechanical', 'minimal', 'retro'
      volume: 0.5,
      themeColor: '#1D9E75', // Default TypeCraft Teal
      
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      setSoundType: (type) => set({ soundType: type }),
      setVolume: (val) => set({ volume: val }),
      setThemeColor: (color) => {
        set({ themeColor: color });
        document.documentElement.style.setProperty('--primary', color);
        // Also update dependent colors/shadows if needed
      }
    }),
    {
      name: 'typecraft-settings',
    }
  )
);

export default useSettingsStore;
