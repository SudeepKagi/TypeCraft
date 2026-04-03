import React from 'react';

import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export const Navbar = () => {
  const { user } = useAuthStore();

  return (
    <nav className="fixed top-0 w-full z-50 bg-neutral-950/50 backdrop-blur-xl border-b border-neutral-900 shadow-[0_0_32px_rgba(29,158,117,0.08)] flex justify-between items-center px-8 py-4">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-bold font-syne text-primary">TypeCraft</Link>
        <div className="hidden md:flex gap-6 font-mono text-sm">
          <Link to="/play" className="text-on-surface hover:text-primary transition-colors duration-200">Play</Link>
          <Link to="/race" className="text-neutral-500 hover:text-neutral-50 transition-colors duration-200">Race</Link>
          <Link to="/train" className="text-neutral-500 hover:text-neutral-50 transition-colors duration-200">Train</Link>
          <Link to="/dashboard" className="text-neutral-500 hover:text-neutral-50 transition-colors duration-200">Dashboard</Link>
          <Link to="/leaderboard" className="text-neutral-500 hover:text-neutral-50 transition-colors duration-200">Leaderboard</Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-neutral-900 border border-white/5 px-4 py-1.5 rounded-lg shadow-inner">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-tighter">Pilot Level</span>
            <span className="text-xs font-syne font-black text-primary">LVL_{user?.level || 1}</span>
          </div>
          <div className="w-[1px] h-6 bg-white/10"></div>
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-tighter">XP Progress</span>
            <span className="text-xs font-mono text-neutral-200">{user?.xp || 0}</span>
          </div>
        </div>
        
        <Link to="/settings" className="p-2 rounded-lg bg-neutral-900 border border-white/5 text-neutral-500 hover:text-primary transition-all group">
          <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform duration-500">settings</span>
        </Link>

        <Link to="/dashboard" className="w-10 h-10 rounded-lg overflow-hidden border border-primary/20 hover:border-primary transition-all p-0.5 bg-neutral-900">
          <img src={user?.avatarUrl} alt="User avatar" className="w-full h-full object-cover rounded-[6px]" />
        </Link>
      </div>
    </nav>
  );
};
