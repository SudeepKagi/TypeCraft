import { create } from 'zustand';

const useRaceStore = create((set, get) => ({
  status: 'idle', // idle, lobby, countdown, racing, finished
  countdown: null,
  passage: '',
  players: [],
  roomCode: null,
  roomType: 'race', // race, tournament
  GhostRun: null,
  myDbId: null,
  
  setRoom: (roomCode) => set({ roomCode }),
  setPlayers: (players) => set({ players }),
  setCountdown: (countdown) => set({ countdown }),
  setPassage: (passage) => set({ passage }),
  setStatus: (status) => set({ status }),
  setDbId: (myDbId) => set({ myDbId }),
  
  resetRoom: () => set({
    roomCode: null,
    roomType: 'race',
    players: [],
    status: 'idle',
    countdown: null,
    passage: ''
  }),
  
  handleRaceUpdate: (data) => {
    set((state) => ({
      roomCode: data.roomCode || state.roomCode,
      roomType: data.type || state.roomType,
      status: data.status,
      players: data.players
    }));
  }
}));

export default useRaceStore;
