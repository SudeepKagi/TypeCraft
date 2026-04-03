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
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 font-mono text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          <span className="material-symbols-outlined text-sm">local_fire_department</span>
          <span className="text-xs font-bold">XP {user?.xp || 0}</span>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30">
          <img src={user?.avatarUrl} alt="User avatar" />
        </div>
      </div>
    </nav>
  );
};
