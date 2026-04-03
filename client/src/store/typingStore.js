import { create } from 'zustand';

const useTypingStore = create((set) => ({
  mode: 'words', // words | quotes | code | voice
  duration: 60, // 15 | 30 | 60 | 120
  language: 'english',
  history: [],
  setMode: (mode) => set({ mode }),
  setDuration: (duration) => set({ duration }),
  setLanguage: (language) => set({ language }),
  addResultToHistory: (result) => set((state) => ({ history: [result, ...state.history] }))
}));

export default useTypingStore;
