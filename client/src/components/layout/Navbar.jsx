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
    <nav className="fixed top-0 w-full z-50 bg-neutral-950/90 backdrop-blur-xl border-b border-white/5 flex items-center px-10 py-4 h-20">
      {/* LEFT: LOGO */}
      <div className="flex-1 flex items-center justify-start">
        <Link to="/" className="text-3xl font-syne text-primary tracking-tighter">TypeCraft</Link>
      </div>

      {/* CENTER: NAV OPTIONS */}
      {user && (
        <div className="flex-initial hidden md:flex items-center justify-center">
          <div className="flex gap-8 font-mono text-[9px] uppercase tracking-[0.2em] bg-neutral-900 px-6 py-3 rounded-full border border-white/10 items-center">
            <Link to="/play" className={`${location.pathname === '/play' ? 'text-primary' : 'text-neutral-500 hover:text-neutral-200'} transition-all`}>Solo</Link>
            <Link to="/race" className={`${location.pathname === '/race' && !location.search ? 'text-primary' : 'text-neutral-500 hover:text-neutral-200'} transition-all`}>Race</Link>
            <div className="w-[1px] h-3 bg-white/10 mx-1"></div>
            <Link to="/race?type=tournament" className={`${location.search.includes('tournament') ? 'text-amber-400' : 'text-neutral-500 hover:text-amber-300'} transition-all font-bold`}>Pro Series</Link>
            <Link to="/race?type=raid" className={`${location.search.includes('raid') ? 'text-cyan-400' : 'text-neutral-500 hover:text-cyan-300'} transition-all font-bold`}>Raids</Link>
            <div className="w-[1px] h-3 bg-white/10 mx-1"></div>
            <Link to="/train" className={`${location.pathname === '/train' ? 'text-primary' : 'text-neutral-500 hover:text-neutral-200'} transition-all`}>Train</Link>
            <Link to="/dashboard" className={`${location.pathname === '/dashboard' ? 'text-primary' : 'text-neutral-500 hover:text-neutral-200'} transition-all`}>Dash</Link>
          </div>
        </div>
      )}

      {/* RIGHT: PROFILE & STATS */}
      <div className="flex-1 flex items-center justify-end gap-8">
        {user ? (
          <>
            {/* XP HUD */}
            <div className="hidden xl:flex flex-col gap-1 min-w-[180px]">
               <div className="flex justify-between items-end px-0.5">
                 <span className="text-[10px] font-syne text-primary italic tracking-widest uppercase">LVL {level}</span>
                 <span className="text-[10px] font-mono text-neutral-500">{currentXP} XP</span>
               </div>
               <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-primary shadow-teal-glow transition-all duration-1000 ease-out" 
                   style={{ width: `${progressPercent}%` }}
                 ></div>
               </div>
            </div>

            <button 
              onClick={logout}
              className="px-5 py-2.5 bg-neutral-900 border border-white/5 text-neutral-500 font-syne text-[10px] uppercase tracking-widest rounded-lg hover:text-neutral-200 transition-all"
            >
              SIGN OUT
            </button>

            <Link to="/settings" className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/5 hover:border-primary transition-all p-0.5 bg-neutral-900 flex items-center justify-center">
              <img src={user?.avatarUrl} alt="User Avatar" className="w-full h-full object-cover rounded-full" />
            </Link>
          </>
        ) : (
          <Link 
            to="/auth" 
            className="px-8 py-3 bg-primary text-neutral-950 text-xs font-syne uppercase tracking-widest hover:bg-emerald-400 transition-all rounded-xl shadow-teal-glow active:scale-95"
          >
            SIGN IN
          </Link>
        )}
      </div>
    </nav>
  );
};
