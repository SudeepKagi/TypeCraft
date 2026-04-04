import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { WordDisplay } from '../components/typing/WordDisplay';
import { useTyping } from '../hooks/useTyping';
import useAuthStore from '../store/authStore';
import useRaceStore from '../store/raceStore';
import socket from '../lib/socket';
import { calculateRank } from '../lib/rankCalc';
import RaceResultsOverlay from '../components/typing/RaceResultsOverlay';

const samplePassage = "The quick brown fox jumps over the lazy dog. Programming is the art of algorithm design and the craft of debugging code. High performance typing requires absolute focus and rhythmic precision.";

const Race = () => {
  const { user } = useAuthStore();
  const { players, status, roomCode, GhostRun } = useRaceStore();
  const [passage, setPassage] = useState("The quick brown fox..."); // Initial fallback
  
  const { 
    words, currentWordIndex, currentCharIndex, currentWPM, 
    reset, status: typingStatus, accuracy, endTest
  } = useTyping(passage);

  const [joinCode, setJoinCode] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [stats, setStats] = useState({ avgWpm: 0, recentAccuracy: 0, rank: '---' });

  useEffect(() => {
    if (user?.id) {
       fetch(`http://localhost:4000/api/users/${user.id}/stats`)
         .then(res => res.json())
         .then(data => {
            const rankInfo = calculateRank(data.avgWpm, data.recentAccuracy);
            setStats({ ...data, rank: rankInfo.name });
         })
         .catch(err => console.error(err));
    }
  }, [user?.id]);

  useEffect(() => {
    socket.connect();
    
    socket.on('race:created', (data) => {
      useRaceStore.getState().setRoom(data.roomCode);
      useRaceStore.getState().setPlayers(data.players);
    });

    socket.on('race:update', (data) => {
      useRaceStore.getState().handleRaceUpdate(data);
    });

    socket.on('race:countdown', (count) => {
      setCountdown(count);
    });
    
    socket.on('race:started', ({ passage: serverPassage }) => {
      useRaceStore.getState().setStatus('racing');
      setCountdown(null);
      if (serverPassage) {
        setPassage(serverPassage);
        reset(serverPassage);
      } else {
        reset(passage);
      }
      
      // Dispatch dummy keystroke to trigger 'running' state in useTyping hook
      setTimeout(() => {
         window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' }));
      }, 50);
    });

    return () => {
      socket.disconnect();
      socket.off('race:created');
      socket.off('race:update');
      socket.off('race:countdown');
      socket.off('race:started');
    };
  }, []);

  // Sync typing progress with Socket Server
  useEffect(() => {
    if (status === 'racing' && roomCode) {
      const completionPercent = ((currentWordIndex / words.length) * 100).toFixed(1);
      socket.emit('race:progress', { roomCode, progress: completionPercent, wpm: currentWPM, accuracy });
    }
  }, [currentWordIndex, currentWPM, status, roomCode, words.length, accuracy]);

  // Handle local finish
  useEffect(() => {
    if (status === 'racing' && currentWordIndex === words.length && words.length > 0) {
      endTest();
    }
  }, [currentWordIndex, words.length, status, endTest]);

  const isTimeWarpActive = status === 'racing' && currentWPM > 100;


  const handleCreateRace = () => {
    socket.emit('race:create', { user });
  };

  const handleJoinRace = () => {
    socket.emit('race:join', { roomCode: joinCode, user });
  };

  const handleStartRace = () => {
    if (roomCode) {
      socket.emit('race:start', { roomCode });
    }
  };

  const currentPlayers = players.length > 0 ? players.map(p => ({
    ...p,
    isMe: p.id === socket.id
  })) : [];

  return (
    <PageWrapper>
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-screen relative">
        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md rounded-xl border border-primary/20">
             <span className="text-[150px] font-syne font-black text-primary animate-pulse drop-shadow-[0_0_80px_rgba(29,158,117,0.5)]">
               {countdown}
             </span>
             <p className="mt-4 font-mono text-xl text-neutral-300 tracking-[0.3em] uppercase">Prepare</p>
          </div>
        )}

        {/* Race HUD & Track Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-500 ${isTimeWarpActive ? 'bg-primary/10 border-primary shadow-glow-primary' : 'bg-neutral-900/50 border-neutral-800/50'}`}>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className={`flex h-2 w-2 rounded-full animate-pulse ${isTimeWarpActive ? 'bg-primary' : 'bg-red-500'}`}></span>
                <span className={`text-xs font-bold tracking-widest ${isTimeWarpActive ? 'text-primary' : 'text-red-500'}`}>LIVE</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 font-inter uppercase tracking-tighter">Room Code</span>
                <span className="text-sm font-mono text-neutral-200">#{roomCode || 'NONE'}</span>
              </div>
            </div>
            <div className="flex gap-12">
              <div className="text-center">
                <span className="block text-[10px] text-neutral-500 font-inter uppercase">Time</span>
                <span className="text-xl font-syne text-neutral-100 italic">00:42.12</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] text-neutral-500 font-inter uppercase">WPM</span>
                <span className={`text-xl font-syne transition-colors ${isTimeWarpActive ? 'text-white' : 'text-primary'}`}>{Math.floor(currentWPM)}</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] text-neutral-500 font-inter uppercase">ACC</span>
                <span className="text-xl font-syne text-neutral-100">{accuracy.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Typing Engine Area */}
          <div className={`custom-glass p-10 rounded-xl relative overflow-hidden border transition-all duration-500 ${isTimeWarpActive ? 'border-primary shadow-teal-glow scale-[1.01]' : (status === 'racing' ? 'border-primary/40' : 'border-outline-variant/10 opacity-50 pointer-events-none')}`}>
            <div className={`absolute top-0 left-0 w-1 h-full bg-primary transition-opacity ${status === 'racing' ? 'opacity-100' : 'opacity-0'}`}></div>
            <WordDisplay 
              words={words} 
              currentWordIndex={currentWordIndex} 
              currentCharIndex={currentCharIndex} 
              isTimeWarpActive={isTimeWarpActive}
            />
          </div>

          {/* Race Track Lanes */}
          <div className="flex flex-col gap-2 mt-4">
            
            {/* Ghost Lane */}
            <div className="relative h-12 flex items-center px-4 border border-dashed border-neutral-800 rounded-lg bg-neutral-950/20 opacity-60">
              <div className="flex items-center gap-3 z-10 w-40 shrink-0">
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                  <span className="material-symbols-outlined text-xs text-neutral-500">mist</span>
                </div>
                <span className="text-xs font-inter text-neutral-400">Ghost (Best)</span>
              </div>
              <div className="flex-1 h-1 bg-neutral-900 rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full w-[85%] bg-neutral-600 rounded-full transition-all duration-700 ease-out"></div>
              </div>
              <div className="ml-4 text-[10px] font-mono text-neutral-500">128 WPM</div>
            </div>

            {/* Active Competitors */}
            <div className="space-y-1">
              {currentPlayers.map(p => (
                <div key={p.id} className={`relative h-14 flex items-center px-4 rounded-lg transition-colors ${p.isMe ? 'bg-neutral-900/40 border-l-4 border-primary shadow-teal-glow' : 'hover:bg-neutral-900/20'}`}>
                  <div className="flex items-center gap-3 z-10 w-40 shrink-0">
                    <div className={`w-8 h-8 rounded-full overflow-hidden bg-neutral-800 ${p.isMe ? 'border-2 border-primary' : 'border border-neutral-800'}`}>
                      <img src={p.avatarUrl} alt={p.username} className="w-full h-full object-cover" />
                    </div>
                    <span className={`text-sm font-inter ${p.isMe ? 'font-bold text-neutral-100' : 'text-neutral-400'}`}>{p.isMe ? 'You' : p.username}</span>
                  </div>
                  <div className="flex-1 h-2 bg-neutral-950 rounded-full overflow-hidden relative">
                     <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${p.isMe ? 'bg-primary shadow-teal-glow' : 'bg-neutral-500'}`} style={{ width: `${p.progress}%` }}></div>
                  </div>
                  <div className={`ml-4 text-xs font-mono ${p.isMe ? 'font-bold text-primary' : 'text-neutral-400'}`}>{p.wpm} WPM</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar / Race Info */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="custom-glass p-6 rounded-xl space-y-6 border border-outline-variant/10">
            <h3 className="font-syne text-xl text-neutral-100 tracking-tight">Race Dynamics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] uppercase font-inter text-neutral-500 tracking-widest">Global Rank</span>
                <span className="text-lg font-mono text-neutral-100">{stats.rank}</span>
              </div>
              <div className="w-full h-[2px] bg-neutral-800">
                <div className="w-1/3 h-full bg-primary"></div>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="text-[10px] uppercase font-inter text-neutral-500 tracking-widest">Consistency</span>
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
                        <span className={`text-sm font-inter ${p.isMe ? 'text-neutral-100 font-bold' : 'text-neutral-300'}`}>{p.isMe ? 'You' : p.username}</span>
                      </div>
                      <span className={`text-xs font-mono ${p.isMe ? 'text-primary font-bold' : 'text-neutral-100'}`}>{p.wpm} WPM</span>
                    </div>
                 ))}
              </div>
            </div>
          </div>

          <div className="relative p-6 bg-neutral-900/30 rounded-xl overflow-hidden border border-neutral-800/30">
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-7xl opacity-[0.03] rotate-12">keyboard</span>
            <p className="font-inter text-sm text-neutral-500 leading-relaxed italic">
              "Precision is the byproduct of discipline. In the void of the track, only the rhythm of the keys exists."
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-primary/50"></span>
              <span className="text-[10px] font-mono uppercase text-neutral-400">Elite Protocol</span>
            </div>
          </div>

          {/* Lobby Controls */}
          {!roomCode ? (
            <div className="flex flex-col gap-3">
              <button onClick={handleCreateRace} className="w-full py-4 rounded bg-gradient-to-br from-primary to-primary-container text-on-primary font-syne font-bold uppercase tracking-widest text-sm hover:scale-[0.98] transition-transform shadow-teal-glow">
                Create Lobby
              </button>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ROOM CODE" 
                  className="flex-1 bg-neutral-900/50 border border-neutral-800 rounded px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:border-primary/50 text-neutral-100 placeholder:text-neutral-600"
                />
                <button onClick={handleJoinRace} className="px-6 rounded bg-neutral-800 text-neutral-300 font-syne font-bold uppercase tracking-widest text-sm hover:bg-neutral-700 transition-colors">
                  Join
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {status === 'waiting' && currentPlayers.find(p => p.isMe)?.isHost && (
                <button onClick={handleStartRace} className="w-full py-4 rounded bg-gradient-to-br from-primary to-primary-container text-on-primary font-syne font-bold uppercase tracking-widest text-sm hover:scale-[0.98] transition-transform shadow-teal-glow">
                  Initialize Protocol 
                </button>
              )}
              {status === 'waiting' && !currentPlayers.find(p => p.isMe)?.isHost && (
                <div className="w-full py-4 rounded bg-neutral-800 text-neutral-400 font-syne font-bold uppercase tracking-widest text-sm text-center">
                  Awaiting Host Signal...
                </div>
              )}
              {status !== 'waiting' && (
                <button onClick={() => window.location.reload()} className="w-full py-4 rounded bg-red-900/20 border border-red-900/30 text-red-500 font-syne font-bold uppercase tracking-widest text-sm hover:bg-red-900/40 transition-colors">
                  Abort Run
                </button>
              )}
            </div>
          )}
        </div>

        {/* Global Results Overlay */}
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
      </main>
    </PageWrapper>
  );
};

export default Race;
