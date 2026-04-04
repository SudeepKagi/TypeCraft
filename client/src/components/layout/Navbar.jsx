import React from 'react';

import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export const Navbar = () => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  
  // Calculate Progress Percent
  const currentXP = user?.xp || 0;
  const level = user?.level || 1;
  const xpAtStartOfLevel = Math.pow(level - 1, 2) * 50;
  const xpAtNextLevel = Math.pow(level, 2) * 50;
  const progressPercent = Math.min(100, Math.max(0, ((currentXP - xpAtStartOfLevel) / (xpAtNextLevel - xpAtStartOfLevel)) * 100));

  return (
    <nav className="fixed top-0 w-full z-50 bg-neutral-950/50 backdrop-blur-xl border-b border-neutral-900 shadow-[0_0_32px_rgba(29,158,117,0.08)] flex justify-between items-center px-8 py-4">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-bold font-syne text-primary tracking-tighter">TypeCraft</Link>
        {user && (
          <div className="hidden md:flex gap-6 font-mono text-[11px] uppercase tracking-[0.1em]">
            <Link to="/play" className="text-on-surface hover:text-primary transition-colors duration-200">Play</Link>
            <Link to="/race" className="text-neutral-500 hover:text-neutral-50 transition-colors duration-200">Race</Link>
            <Link to="/train" className="text-neutral-500 hover:text-neutral-50 transition-colors duration-200">Train</Link>
            <Link to="/dashboard" className="text-neutral-500 hover:text-neutral-50 transition-colors duration-200">Dashboard</Link>
            <Link to="/leaderboard" className="text-neutral-500 hover:text-neutral-50 transition-colors duration-200">Leaderboard</Link>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-6">
        {user ? (
          <>
            {/* Tier & XP HUD */}
            <div className="hidden sm:flex flex-col gap-1.5 min-w-[140px]">
               <div className="flex justify-between items-end px-0.5">
                 <span className="text-[9px] font-syne font-black text-primary italic tracking-tight">PILOT_LEVEL_{level}</span>
                 <span className="text-[9px] font-mono text-neutral-500 font-bold">{currentXP} / {xpAtNextLevel} XP</span>
               </div>
               <div className="h-[4px] w-full bg-neutral-900 rounded-full border border-white/5 overflow-hidden">
                 <div 
                   className="h-full bg-primary shadow-teal-glow transition-all duration-1000 ease-out" 
                   style={{ width: `${progressPercent}%` }}
                 ></div>
               </div>
            </div>

            <button 
              onClick={logout}
              className="px-4 py-2 bg-neutral-900 border border-red-500/20 text-red-400 font-syne font-black text-[10px] uppercase tracking-[0.2em] rounded-lg hover:bg-red-500/10 hover:border-red-500/40 transition-all active:scale-95"
            >
              Pilot_Exit
            </button>

            <Link to="/dashboard" className="w-10 h-10 rounded-lg overflow-hidden border border-primary/20 hover:border-primary transition-all p-0.5 bg-neutral-900 shadow-glow-primary">
              <img src={user?.avatarUrl} alt="User avatar" className="w-full h-full object-cover rounded-[6px]" />
            </Link>
          </>
        ) : (
          <Link 
            to="/auth" 
            className="px-5 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all duration-300 rounded-lg shadow-teal-glow-sm"
          >
            Pilot_Login
          </Link>
        )}
      </div>
    </nav>
  );
};
