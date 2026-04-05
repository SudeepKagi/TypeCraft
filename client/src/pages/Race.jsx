import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { WordDisplay } from '../components/typing/WordDisplay';
import { useTyping } from '../hooks/useTyping';
import useAuthStore from '../store/authStore';
import useRaceStore from '../store/raceStore';
import socket from '../lib/socket';
import { calculateRank } from '../lib/rankCalc';
import RaceResultsOverlay from '../components/typing/RaceResultsOverlay';
import { ProtocolManual } from '../components/typing/ProtocolManual';

const Race = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { players, status, roomCode, roomType, raidProgress, raidTarget } = useRaceStore();
  const [passage, setPassage] = useState("SELECT A LOBBY TO BEGIN YOUR COMPETITIVE SESSION"); 
  
  const { 
    words, currentWordIndex, currentCharIndex, currentWPM, 
    reset, status: typingStatus, accuracy, endTest
  } = useTyping(passage);

  const [joinCode, setJoinCode] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [stats, setStats] = useState({ avgWpm: 0, recentAccuracy: 0, rank: '---' });
  const [isManualOpen, setIsManualOpen] = useState(false);

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

    // Handle initial mode from URL
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type === 'tournament' && status === 'idle' && user) {
       socket.emit('race:join:tournament', { user });
    } else if (type === 'raid' && status === 'idle' && user) {
       socket.emit('race:create', { user, type: 'raid' });
    }
  }, [user?.id, location.search]);

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
      
      // Dispatch dummy keystroke to trigger 'running' state
      setTimeout(() => {
         window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' }));
      }, 50);
    });

    socket.on('race:tournament:found', ({ roomCode }) => {
      socket.emit('race:join', { roomCode, user });
    });

    return () => {
      socket.disconnect();
      socket.off('race:created');
      socket.off('race:update');
      socket.off('race:countdown');
      socket.off('race:started');
    };
  }, []);

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
             <span className="text-[120px] md:text-[150px] font-syne text-primary animate-pulse drop-shadow-[0_0_80px_rgba(29,158,117,0.5)]">
               {countdown}
             </span>
             <p className="mt-4 font-mono text-xl text-neutral-300 tracking-[0.3em] uppercase">Get Ready</p>
          </div>
        )}

        {/* Race HUD & Track Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex justify-between items-center mb-[-12px] px-2">
             <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] italic">System Status: {status === 'waiting' ? 'Synchronizing' : 'Active'}</span>
             <button 
               onClick={() => setIsManualOpen(true)}
               className="flex items-center gap-2 text-[10px] font-mono text-primary hover:text-white transition-colors group"
             >
                <span className="material-symbols-outlined text-sm">help_outline</span>
                <span className="underline underline-offset-4 tracking-widest uppercase">Protocol Manual</span>
             </button>
          </div>
          
          <div className={`flex flex-col md:flex-row items-center justify-between p-4 rounded-lg border transition-all duration-500 ${isTimeWarpActive ? 'bg-primary/10 border-primary shadow-glow-primary' : 'bg-neutral-900/50 border-neutral-800/50'}`}>
            <div className="flex items-center gap-6 mb-4 md:mb-0">
              <div className="flex items-center gap-2">
                <span className={`flex h-2 w-2 rounded-full animate-pulse ${isTimeWarpActive ? 'bg-primary' : (roomType === 'tournament' ? 'bg-amber-400' : (roomType === 'raid' ? 'bg-cyan-400' : 'bg-red-500'))}`}></span>
                <span className={`text-xs font-bold tracking-widest ${isTimeWarpActive ? 'text-primary' : (roomType === 'tournament' ? 'text-amber-400' : (roomType === 'raid' ? 'text-cyan-400' : 'text-red-500'))}`}>
                   {status === 'waiting' ? (
                      roomType === 'tournament' ? 'SCANNING FOR COMPETITORS' : 
                      roomType === 'raid' ? 'CALIBRATING SQUAD UPLINK' : 'AWAITING INSTRUCTOR'
                   ) : (
                      isTimeWarpActive ? 'TIME WARP ACTIVE' : 'LIVE PROTOCOL'
                   )}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 font-inter uppercase tracking-tighter">
                   {roomType === 'tournament' ? 'Tournament ID' : 'Room Code'}
                </span>
                <span className="text-sm font-mono text-neutral-200">#{roomCode || 'NONE'}</span>
              </div>
            </div>
            <div className="flex gap-8 md:gap-12">
              {roomType === 'raid' && (
                <div className="text-center border-r border-white/5 pr-8">
                  <span className="block text-[10px] text-primary font-mono uppercase tracking-widest">Total WPM</span>
                  <span className="text-2xl font-syne text-primary animate-pulse">{Math.floor(raidProgress)}</span>
                </div>
              )}
              <div className="text-center">
                <span className="block text-[10px] text-neutral-500 font-inter uppercase tracking-widest">WPM</span>
                <span className={`text-2xl font-syne transition-colors ${isTimeWarpActive ? 'text-white' : 'text-primary'}`}>{Math.floor(currentWPM)}</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] text-neutral-500 font-inter uppercase tracking-widest">Accuracy</span>
                <span className="text-2xl font-syne text-neutral-100">{accuracy.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* RAID BOSS HUD */}
          {roomType === 'raid' && status === 'racing' && (
            <div className="w-full p-6 bg-gradient-to-r from-red-950/40 via-neutral-900 to-red-950/40 border border-red-500/20 rounded-xl relative overflow-hidden shadow-2xl">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
               <div className="flex justify-between items-center mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                     <span className="material-symbols-outlined text-red-500 animate-spin">cyclone</span>
                     <span className="font-syne font-black text-red-500 tracking-tighter uppercase italic">Encryption Wall</span>
                  </div>
                  <span className="font-mono text-xs text-red-400 uppercase tracking-widest animate-pulse">
                     Structural Degradation: {Math.max(0, 100 - (raidProgress / raidTarget * 100)).toFixed(1)}%
                  </span>
               </div>
               <div className="h-4 bg-neutral-950 rounded-full border border-white/5 overflow-hidden relative shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-red-600 to-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-500"
                    style={{ width: `${Math.min(100, (raidProgress / raidTarget) * 100)}%` }}
                  />
               </div>
               <div className="mt-3 flex justify-between text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
                  <span>Current_Output: {raidProgress} WPM</span>
                  <span>Target_Breach: {raidTarget} WPM</span>
               </div>
            </div>
          )}

          {/* Typing Arena */}
          <div className={`custom-glass p-6 md:p-10 rounded-xl relative overflow-hidden border transition-all duration-500 ${isTimeWarpActive ? 'border-primary shadow-teal-glow scale-[1.01]' : (status === 'racing' ? 'border-primary/40' : 'border-outline-variant/10 opacity-50 pointer-events-none')}`}>
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

            {/* Active Players */}
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

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="custom-glass p-6 rounded-xl space-y-6 border border-outline-variant/10">
            <h3 className="font-syne text-xl text-neutral-100 tracking-tight uppercase">Race Standings</h3>
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

          {/* Protocol Briefing Section */}
          {status === 'waiting' && (roomType === 'tournament' || roomType === 'raid') && (
            <div className="relative p-6 bg-gradient-to-br from-neutral-900/50 to-neutral-800/30 rounded-xl border border-white/5 overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                  <span className="material-symbols-outlined text-7xl">{roomType === 'tournament' ? 'military_tech' : 'verified_user'}</span>
               </div>
               <div className="flex items-center gap-2 mb-4">
                  <span className={`w-2 h-2 rounded-full ${roomType === 'tournament' ? 'bg-amber-400' : 'bg-cyan-400'} animate-pulse`}></span>
                  <h4 className={`font-syne text-xs uppercase tracking-[0.3em] font-bold ${roomType === 'tournament' ? 'text-amber-400' : 'text-cyan-400'}`}>Protocol Briefing</h4>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <div className="space-y-4">
                     <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest leading-relaxed">
                        {roomType === 'tournament' 
                          ? "Pro Series matches require thermal stabilization (Quorum). The system initiates only when 4 elite typists are synchronized. 2.5x XP reward is applied to all finishers."
                          : "Team challenges focus on collective baud rate. Deplete the Encryption Wall by outputting a combined 400 WPM with your squad. Shared XP bounties awarded on breach."}
                     </p>
                     <button 
                        onClick={() => setIsManualOpen(true)}
                        className="text-[9px] font-mono text-primary underline underline-offset-4 uppercase tracking-widest hover:text-white transition-colors"
                     >
                        Detailed Mode Guide
                     </button>
                  </div>
                  <div className="flex flex-col gap-2">
                     <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">Objective</span>
                        <span className="text-[10px] font-syne text-neutral-200 uppercase">{roomType === 'tournament' ? 'Competitive / Multiplier' : 'Collaborative / Shared'}</span>
                     </div>
                     <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">Quorum Status</span>
                        <span className={`text-[10px] font-syne ${roomType === 'tournament' ? 'text-amber-400' : 'text-cyan-400'} uppercase`}>{roomType === 'tournament' ? players.length + ' / 4 typists' : 'Active Squad'}</span>
                     </div>
                  </div>
               </div>
            </div>
          )}

          <div className="relative p-6 bg-neutral-900/30 rounded-xl overflow-hidden border border-neutral-800/30">
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-7xl opacity-[0.03] rotate-12">keyboard</span>
            <p className="font-inter text-sm text-neutral-500 leading-relaxed italic">
              "Precision is the byproduct of practice. In the heat of the race, focus on the rhythm of your keys."
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-primary/50"></span>
              <span className="text-[10px] font-mono uppercase text-neutral-400">Typing Excellence</span>
            </div>
          </div>

          {!roomCode ? (
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  const params = new URLSearchParams(location.search);
                  params.set('type', 'race');
                  navigate(`/race?${params.toString()}`);
                  handleCreateRace();
                }} 
                className="w-full py-4 rounded bg-gradient-to-br from-primary to-primary-container text-on-primary font-syne uppercase tracking-widest text-sm hover:scale-[0.98] transition-all shadow-teal-glow"
              >
                Create Race Lobby
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
              {status === 'waiting' && roomType === 'tournament' && (
                <div className="p-6 bg-amber-400/5 border border-amber-400/20 rounded-xl text-center space-y-4">
                   <div className="mx-auto w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-amber-400 animate-pulse">groups</span>
                   </div>
                   <div>
                      <h4 className="font-syne text-amber-400 uppercase tracking-tighter text-lg leading-tight">Matchmaking</h4>
                      <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-1">Awaiting Quorum ({players.length}/4)</p>
                   </div>
                   <div className="h-1 bg-neutral-900 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${(players.length / 4) * 100}%` }}></div>
                   </div>
                </div>
              )}
              {status === 'waiting' && roomType === 'private' && currentPlayers.find(p => p.isMe)?.isHost && (
                <button onClick={handleStartRace} className="w-full py-4 rounded bg-gradient-to-br from-primary to-primary-container text-on-primary font-syne font-bold uppercase tracking-widest text-sm hover:scale-[0.98] transition-all shadow-teal-glow">
                  Start Race
                </button>
              )}
              {status === 'waiting' && roomType === 'raid' && (
                 <button onClick={handleStartRace} className="w-full py-4 rounded bg-cyan-500 text-neutral-900 font-syne font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    INITIATE RAID
                 </button>
              )}
              {status === 'waiting' && roomType === 'private' && !currentPlayers.find(p => p.isMe)?.isHost && (
                <div className="w-full py-4 rounded bg-neutral-800 text-neutral-400 font-syne font-bold uppercase tracking-widest text-sm text-center">
                   Awaiting Instructor...
                </div>
              )}
              {status !== 'waiting' && (
                <button onClick={() => window.location.href='/race'} className="w-full py-4 rounded bg-red-900/20 border border-red-900/30 text-red-500 font-syne font-bold uppercase tracking-widest text-sm hover:bg-red-900/40 transition-colors">
                  Exit Session
                </button>
              )}
            </div>
          )}
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

        <ProtocolManual 
          isOpen={isManualOpen} 
          onClose={() => setIsManualOpen(false)} 
          defaultTab={roomType === 'tournament' ? 'tournament' : (roomType === 'raid' ? 'raid' : 'sprints')}
        />
      </main>
    </PageWrapper>
  );
};

export default Race;
