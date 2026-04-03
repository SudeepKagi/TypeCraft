import { create } from 'zustand';

const useRaceStore = create((set, get) => ({
  roomCode: null,
  players: [],
  status: 'idle', // idle, lobby, countdown, racing, finished
  GhostRun: null,
  myDbId: null,
  
  setRoom: (roomCode) => set({ roomCode }),
  setPlayers: (players) => set({ players }),
  updatePlayerProgress: (userId, progress, wpm) => set((state) => ({
    players: state.players.map(p => p.id === userId ? { ...p, progress, wpm } : p)
  })),
  setStatus: (status) => set({ status }),
  setDbId: (myDbId) => set({ myDbId }),
  
  // Actions that can be called upon receiving socket events
  handleRaceUpdate: (data) => {
    set((state) => ({
      roomCode: data.roomCode || state.roomCode,
      status: data.status,
      players: data.players
    }));
  }
}));

export default useRaceStore;
