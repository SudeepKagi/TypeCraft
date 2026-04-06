import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper } from '../components/layout/PageWrapper';
import { WordDisplay } from '../components/typing/WordDisplay';
import { useTyping } from '../hooks/useTyping';
import useAuthStore from '../store/authStore';
import useRaceStore from '../store/raceStore';
import socket from '../lib/socket';
import { calculateRank } from '../lib/rankCalc';
import RaceResultsOverlay from '../components/typing/RaceResultsOverlay';
import { RoomManual } from '../components/typing/RoomManual';
import { API_BASE_URL } from '../lib/constants';

const Race = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { 
    players, status, roomCode, roomType, 
    countdown, passage, setStatus
  } = useRaceStore();
  
  const { 
    words, currentWordIndex, currentCharIndex, currentWPM, 
    reset, status: typingStatus, accuracy, endTest
  } = useTyping(passage);

  const isWaitingForStart = (status === 'waiting' || status === 'ready') && roomCode;

  const [joinCode, setJoinCode] = useState('');
  const [stats, setStats] = useState({ avgWpm: 0, recentAccuracy: 0, rank: '---' });
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [selectionView, setSelectionView] = useState('choice'); // choice, join_input

  // Fetch stats once on mount or when user changes
  useEffect(() => {
    if (user?.id) {
       fetch(`${API_BASE_URL}/api/users/${user.id}/stats`)
         .then(res => res.json())
         .then(data => {
            const rankInfo = calculateRank(data.avgWpm, data.recentAccuracy);
            setStats({ ...data, rank: rankInfo.name });
         })
         .catch(err => console.error(err));
    }
  }, [user?.id]);

  // Handle competitive mode transitions and logic
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type') || 'race';
    
    // Only reset if transitioning to a DIFFERENT mode OR coming from nowhere
    const isModeSwitch = type !== roomType;
    const isNewSession = !roomCode && status === 'idle';
    
    if ((isModeSwitch || isNewSession) && status !== 'racing' && status !== 'counting') {
        const isCompatible = (type === 'race' && roomType === 'private') || (type === 'private' && roomType === 'race');
        
        if (isModeSwitch && !isCompatible) {
            useRaceStore.getState().resetRoom();
        }
        useRaceStore.setState({ roomType: type });
    }
    // REMOVED: auto-join tournament. Now handled by button click.
  }, [user?.id, location.search, status, roomType, roomCode]);

  // Auto-reset typing engine when global passage changes
  useEffect(() => {
    if (status === 'racing' && passage) {
      reset(passage);
      setTimeout(() => {
         window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' }));
      }, 50);
    }
  }, [status, passage]);

  useEffect(() => {
    if (status === 'racing' && roomCode) {
      const completionPercent = ((currentWordIndex / words.length) * 100).toFixed(1);
      socket.emit('race:progress', { roomCode, progress: completionPercent, wpm: currentWPM, accuracy });
    }
  }, [currentWordIndex, currentWPM, status, roomCode, words.length, accuracy]);

  useEffect(() => {
    if (status === 'racing' && currentWordIndex === words.length && words.length > 0) {
      endTest();
    }
  }, [currentWordIndex, words.length, status, endTest]);

  const isTimeWarpActive = status === 'racing' && currentWPM > 100;

  const handleCreateRace = () => {
    if (user && socket.connected) {
      socket.emit('race:create', { user });
    }
  };

  const handleJoinRace = () => {
    socket.emit('race:join', { roomCode: joinCode || roomCode, user });
  };

  const handleJoinTournament = () => {
    if (user && socket.connected) {
      socket.emit('race:join:tournament', { user });
    }
  };

  const handleStartRace = () => {
    if (roomCode) {
      socket.emit('race:start', { roomCode });
    }
  };

  const currentPlayers = players.length > 0 ? players.map(p => ({
    ...p,
    isMe: p.id === user?.id || p.username === user?.username
  })) : [];

  return (
    <PageWrapper>
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-screen relative">
        {countdown !== null && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md rounded-xl border border-primary/20">
             <span className="text-[120px] md:text-[180px] brutal-heading text-primary animate-pulse drop-shadow-[0_0_80px_rgba(29,158,117,0.5)]">
               {countdown}
             </span>
             <p className="mt-4 tech-label !text-xl !tracking-[0.4em]">Get Ready</p>
          </div>
        )}

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex justify-between items-center mb-[-12px] px-2">
             <span className="tech-label opacity-40 !italic">System Status: {(status === 'waiting' || (roomType === 'tournament' && !roomCode)) ? 'Synchronizing' : 'Active'}</span>
             <button 
               onClick={() => setIsManualOpen(true)}
               className="flex items-center gap-2 tech-label !text-primary hover:text-white transition-colors group"
             >
                <span className="material-symbols-outlined text-sm">help_outline</span>
                <span className="underline underline-offset-4 text-xs font-mono">Room Manual</span>
             </button>
          </div>
          
          <div className={`flex flex-col md:flex-row items-center justify-between p-4 rounded-lg border transition-all duration-500 ${isTimeWarpActive ? 'bg-primary/10 border-primary shadow-glow-primary' : 'bg-neutral-900/50 border-neutral-800/50'}`}>
            <div className="flex items-center gap-6 mb-4 md:mb-0">
              <div className="flex items-center gap-2">
                <span className={`flex h-2 w-2 rounded-full animate-pulse ${isTimeWarpActive ? 'bg-primary' : (roomType === 'tournament' ? 'bg-amber-400' : 'bg-red-500')}`}></span>
                <span className={`tech-label !tracking-widest ${isTimeWarpActive ? 'text-primary' : (roomType === 'tournament' ? 'text-amber-400' : 'text-red-500')}`}>
                   {(status === 'waiting' || status === 'idle' || (roomType === 'tournament' && !roomCode)) ? (
                      roomType === 'tournament' ? 'PRO SERIES: AWAITING QUORUM' : 'AWAITING ROOM SYNC'
                   ) : (
                      isTimeWarpActive ? 'TIME WARP ACTIVE' : 'LIVE ROOM'
                   )}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 font-inter uppercase tracking-tighter">
                   {roomType === 'tournament' ? 'Tournament ID' : 'Room ID'}
                </span>
                <span className="text-sm font-mono text-neutral-200">#{roomCode || 'NONE'}</span>
              </div>
            </div>
            <div className="flex gap-8 md:gap-12">
              <div className="text-center">
                <span className="block tech-label opacity-40">WPM</span>
                <span className={`text-2xl font-heading font-black transition-colors ${isTimeWarpActive ? 'text-white' : 'text-primary'}`}>{Math.floor(currentWPM)}</span>
              </div>
              <div className="text-center">
                <span className="block tech-label opacity-40">Accuracy</span>
                <span className="text-2xl font-heading font-black text-neutral-100">{accuracy.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div className={`custom-glass p-6 md:p-10 rounded-xl relative overflow-hidden border transition-all duration-500 min-h-[300px] flex items-center justify-center ${isTimeWarpActive ? 'border-primary shadow-teal-glow scale-[1.01]' : (status === 'racing' || status === 'counting' ? 'border-primary/40' : 'border-outline-variant/10')}`}>
            <AnimatePresence mode="wait">
              {status === 'racing' || status === 'counting' ? (
                <motion.div 
                  key="typing"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-full"
                >
                  <WordDisplay 
                    words={words} 
                    currentWordIndex={currentWordIndex} 
                    currentCharIndex={currentCharIndex} 
                    isTimeWarpActive={isTimeWarpActive}
                  />
                </motion.div>
              ) : roomType === 'tournament' && !roomCode ? (
                <motion.div 
                  key="tourney-intro"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center text-center space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
                    <span className="material-symbols-outlined text-amber-400 text-3xl animate-pulse">lock_open</span>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-heading font-black text-amber-400 uppercase tracking-tighter">Pro Series Access</h2>
                    <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest max-w-xs leading-relaxed">Initialization required to sync with global matchmaking tier.</p>
                  </div>
                  <button 
                    onClick={handleJoinTournament}
                    className="group relative px-8 py-3 bg-amber-400 text-neutral-950 font-heading font-black uppercase tracking-widest text-xs overflow-hidden"
                  >
                    <span className="relative z-10 transition-transform group-hover:scale-110 block">Join Tournament</span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  </button>
                </motion.div>
              ) : !roomCode ? (
                <motion.div 
                  key="race-selection"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
                >
                  {selectionView === 'choice' ? (
                    <>
                      <button 
                        onClick={() => {
                          useRaceStore.setState({ roomType: 'race' });
                          handleCreateRace();
                        }}
                        className="group p-8 rounded-lg border border-primary/20 bg-primary/5 flex flex-col items-center gap-4 hover:bg-primary/10 hover:border-primary/50 transition-all text-center"
                      >
                        <span className="material-symbols-outlined text-4xl text-primary group-hover:scale-110 transition-transform">add_comment</span>
                        <div className="space-y-1">
                          <span className="block font-heading font-black uppercase tracking-widest text-neutral-100">Create Room</span>
                          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em]">Host a private session</span>
                        </div>
                      </button>
                      <button 
                        onClick={() => setSelectionView('join_input')}
                        className="group p-8 rounded-lg border border-neutral-800 bg-neutral-900/30 flex flex-col items-center gap-4 hover:border-primary/30 transition-all text-center"
                      >
                        <span className="material-symbols-outlined text-4xl text-neutral-500 group-hover:text-primary transition-colors">login</span>
                        <div className="space-y-1">
                          <span className="block font-heading font-black uppercase tracking-widest text-neutral-100">Join Room</span>
                          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em]">Enter existing ID</span>
                        </div>
                      </button>
                    </>
                  ) : (
                    <div className="col-span-full flex flex-col items-center space-y-6">
                       <button onClick={() => setSelectionView('choice')} className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest hover:text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Selection
                       </button>
                       <div className="w-full max-w-sm flex gap-2">
                          <input 
                            type="text" 
                            autoFocus
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="Enter Room Code"
                            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-primary text-neutral-100"
                          />
                          <button onClick={handleJoinRace} className="px-6 rounded-lg bg-primary text-neutral-950 font-heading font-black uppercase tracking-widest text-sm hover:scale-[0.98] transition-transform">
                             Join
                          </button>
                       </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="waiting-lobby"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center space-y-6 text-center"
                >
                   <div className="relative">
                      <div className={`w-20 h-20 rounded-full border-2 border-dashed animate-spin-slow ${roomType === 'tournament' ? 'border-amber-400/20' : 'border-primary/20'}`}></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className={`w-3 h-3 rounded-full animate-ping ${roomType === 'tournament' ? 'bg-amber-400' : 'bg-primary'}`}></div>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <h3 className={`text-2xl font-heading font-black uppercase tracking-tighter ${roomType === 'tournament' ? 'text-amber-400' : 'text-primary'}`}>
                         {roomType === 'tournament' ? 'Matchmaking Sync' : 'Lobby Synchronized'}
                      </h3>
                      <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.4em] max-w-xs">
                         {roomType === 'tournament' ? `Waiting for elite typists (${players.length}/4)` : 'Awaiting host to initiate session'}
                      </p>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <div className="relative h-12 flex items-center px-4 border border-dashed border-neutral-800 rounded-lg bg-neutral-950/20 opacity-60">
              <div className="flex items-center gap-3 z-10 w-32 md:w-40 shrink-0">
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                  <span className="material-symbols-outlined text-xs text-neutral-500">mist</span>
                </div>
                <span className="text-xs font-inter text-neutral-400 truncate">Personal Best</span>
              </div>
              <div className="flex-1 h-1 bg-neutral-900 rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full w-[85%] bg-neutral-600 rounded-full transition-all duration-700 ease-out"></div>
              </div>
              <div className="ml-4 text-[10px] font-mono text-neutral-500">128 WPM</div>
            </div>

            <div className="space-y-1">
              {currentPlayers.map(p => (
                <div key={p.id} className={`relative h-14 flex items-center px-4 rounded-lg transition-colors ${p.isMe ? 'bg-neutral-900/40 border-l-4 border-primary shadow-teal-glow' : 'hover:bg-neutral-900/20'}`}>
                  <div className="flex items-center gap-3 z-10 w-32 md:w-40 shrink-0">
                    <div className={`w-8 h-8 rounded-full overflow-hidden bg-neutral-800 ${p.isMe ? 'border-2 border-primary' : 'border border-neutral-800'}`}>
                      <img src={p.avatarUrl} alt={p.username} className="w-full h-full object-cover" />
                    </div>
                    <span className={`text-sm font-inter truncate ${p.isMe ? 'font-bold text-neutral-100' : 'text-neutral-400'}`}>{p.isMe ? 'You' : p.username}</span>
                  </div>
                  <div className="flex-1 h-2 bg-neutral-950 rounded-full overflow-hidden relative">
                     <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${p.isMe ? 'bg-primary shadow-teal-glow' : 'bg-neutral-500'}`} style={{ width: `${p.progress}%` }}></div>
                  </div>
                  <div className={`ml-4 text-xs font-mono whitespace-nowrap ${p.isMe ? 'font-bold text-primary' : 'text-neutral-400'}`}>{p.wpm} WPM</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="custom-glass p-6 rounded-xl space-y-6 border border-outline-variant/10">
            <h3 className="font-heading font-black text-xl text-neutral-100 tracking-tight uppercase">Room Standings</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] uppercase font-inter text-neutral-500 tracking-widest">Global Rank</span>
                <span className="text-lg font-mono text-neutral-100">{stats.rank}</span>
              </div>
              <div className="w-full h-[2px] bg-neutral-800">
                <div className="w-1/3 h-full bg-primary"></div>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="text-[10px] uppercase font-inter text-neutral-500 tracking-widest">Accuracy</span>
                <span className="text-lg font-mono text-primary">{stats.recentAccuracy.toFixed(1)}%</span>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-800/50">
              <span className="text-[10px] uppercase font-inter text-neutral-500 tracking-widest block mb-4">Competitors</span>
              <div className="space-y-3">
                 {[...currentPlayers].sort((a,b) => b.wpm - a.wpm).map((p, index) => (
                    <div key={p.id} className={`flex items-center justify-between ${p.isMe ? 'bg-primary/5 py-1 px-2 rounded -mx-2' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-bold ${p.isMe ? 'text-primary' : 'text-neutral-500'}`}>0{index + 1}</span>
                        <span className={`text-sm font-inter truncate ${p.isMe ? 'text-neutral-100 font-bold' : 'text-neutral-300'}`}>{p.isMe ? 'You' : p.username}</span>
                      </div>
                      <span className={`text-xs font-mono whitespace-nowrap ${p.isMe ? 'text-primary font-bold' : 'text-neutral-100'}`}>{p.wpm} WPM</span>
                    </div>
                 ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
             {roomCode && status === 'waiting' && (
                <>
                   {currentPlayers.find(p => p.isMe)?.isHost ? (
                      <button onClick={handleStartRace} className="w-full py-4 rounded bg-primary text-neutral-950 font-heading font-black uppercase tracking-widest text-sm hover:scale-[0.98] transition-all shadow-teal-glow">
                        Start Room Session
                      </button>
                   ) : (
                      <div className="w-full py-4 rounded bg-neutral-900 text-neutral-500 font-mono text-[10px] uppercase tracking-widest text-center border border-neutral-800">
                         Awaiting Room Signal...
                      </div>
                   )}
                </>
             )}
             
             {status !== 'idle' && (
                <button onClick={() => window.location.href='/race'} className="w-full py-3 rounded border border-red-900/20 text-red-900 text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-red-900/5 transition-colors">
                  Terminate Session
                </button>
             )}
          </div>

          <div className="relative p-6 bg-neutral-900/30 rounded-xl overflow-hidden border border-neutral-800/30">
            <p className="font-inter text-xs text-neutral-500 leading-relaxed italic">
              "Precision is the byproduct of practice. In the heat of the race, focus on the rhythm of your keys."
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-primary/50"></span>
              <span className="text-[10px] font-mono uppercase text-neutral-400">Typing Excellence</span>
            </div>
          </div>
        </div>

        {status === 'finished' && (
          <RaceResultsOverlay 
             players={currentPlayers}
             wpm={currentWPM}
             accuracy={accuracy}
             xp={Math.floor(currentWPM * (accuracy / 100))}
             onReLobby={() => {
               useRaceStore.getState().setStatus('waiting');
               reset(passage);
             }}
             onExit={() => {
                window.location.href = '/dashboard';
             }}
          />
        )}

        <RoomManual 
          isOpen={isManualOpen} 
          onClose={() => setIsManualOpen(false)} 
          defaultTab={roomType === 'tournament' ? 'tournament' : 'sprints'}
        />
      </main>
    </PageWrapper>
  );
};

export default Race;
