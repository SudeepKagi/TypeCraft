import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../ui/Logo';

const RaceResultsOverlay = ({ players, wpm, accuracy, xp, onReLobby, onExit }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Enter') onReLobby();
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onReLobby, onExit]);

  // Sort players by progress (then WPM if tied)
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.progress !== a.progress) return b.progress - a.progress;
    return b.wpm - a.wpm;
  });

  const myRank = sortedPlayers.findIndex(p => p.isMe) + 1;
  const rankSuffix = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-fade-in px-4">
      <div className="max-w-4xl w-full p-8 md:p-12 custom-glass border border-primary/20 rounded-3xl shadow-teal-glow relative overflow-hidden flex flex-col md:flex-row gap-12">
        
        {/* Left Side: Performance & Rank */}
        <div className="flex-1 text-center md:text-left">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Logo size={48} />
              <div>
                <h2 className="font-heading font-black text-4xl md:text-6xl text-neutral-100 tracking-tighter leading-none mb-1 uppercase">Race Results</h2>
                <p className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] opacity-60">Protocol Session Complete</p>
              </div>
            </div>
            <div className="w-16 h-1 bg-primary/20 rounded-full mb-8" />
          </div>

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="flex flex-col overflow-hidden">
              <span className="text-5xl md:text-6xl font-heading font-black text-primary truncate tracking-tighter">{wpm}</span>
              <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Words Per Minute</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-5xl md:text-6xl font-heading font-black text-neutral-100 truncate tracking-tighter">{accuracy}<span className="text-2xl text-neutral-600">%</span></span>
              <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Accuracy Rate</span>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-2xl font-heading font-black text-primary">{myRank}</span>
              </div>
              <div>
                <h3 className="text-xl font-heading font-black text-neutral-100 italic uppercase">
                  {myRank}{rankSuffix(myRank)} PLACE
                </h3>
                <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Ending Room Session</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-heading font-black text-primary animate-pulse">+{xp} XP Gained</span>
            </div>
          </div>
        </div>

        {/* Right Side: Leaderboard Breakdown */}
        <div className="w-full md:w-72 flex flex-col pt-4 md:pt-0">
          <h4 className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.3em] mb-6 border-b border-white/5 pb-2">Race Standings</h4>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {sortedPlayers.map((p, i) => (
              <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${p.isMe ? 'bg-primary/10 border-primary/30' : 'bg-neutral-900/40 border-white/5'}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono font-bold ${i === 0 ? 'text-primary' : 'text-neutral-500'}`}>0{i + 1}</span>
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                    <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className={`text-sm font-inter truncate w-24 ${p.isMe ? 'font-bold text-neutral-100' : 'text-neutral-400'}`}>
                    {p.isMe ? 'YOU' : p.username}
                  </span>
                </div>
                <span className={`text-xs font-mono ${p.isMe ? 'text-primary' : 'text-neutral-200'}`}>{p.wpm}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button 
              onClick={onReLobby}
              className="w-full py-4 bg-primary text-neutral-900 font-heading font-black text-sm uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-teal-glow active:scale-95"
            >
              RETURN TO LOBBY
            </button>
            <div className="flex items-center justify-center gap-2 text-[9px] font-mono text-neutral-600 uppercase tracking-widest opacity-60">
              <span>Press Enter to Return</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
      </div>
    </div>
  );
};

export default RaceResultsOverlay;
