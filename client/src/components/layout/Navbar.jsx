import React from 'react';

import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Settings, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { Logo } from '../ui/Logo';

export const Navbar = () => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  // Calculate Progress Percent
  const currentXP = user?.xp || 0;
  const level = user?.level || 1;
  const xpAtStartOfLevel = Math.pow(level - 1, 2) * 50;
  const xpAtNextLevel = Math.pow(level, 2) * 50;
  const progressPercent = Math.min(100, Math.max(0, ((currentXP - xpAtStartOfLevel) / (xpAtNextLevel - xpAtStartOfLevel)) * 100));

  const navItems = [
    { label: 'Play', path: '/play' },
    { label: 'Race', path: '/race' },
    { label: 'Train', path: '/train' },
    { label: 'Pro Series', path: '/race?type=tournament' },
    { label: 'Dashboard', path: '/dashboard' }
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-neutral-950/20 backdrop-blur-[40px] border-b border-white/5 flex items-center px-6 md:px-10 h-14 transition-all duration-500">
      {/* MOBILE TOGGLE */}
      <div className="flex-initial md:hidden block mr-4">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-neutral-400 hover:text-primary transition-colors focus:outline-none"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {/* LEFT: LOGO */}
      <div className="flex-1 flex items-center justify-start">
        <Link to="/" className="group flex items-center gap-2">
          <Logo size={32} />
          <span className="text-2xl font-heading font-black tracking-tighter text-white group-hover:text-primary transition-colors">
            TypeCraft
          </span>
        </Link>
      </div>

      {/* CENTER: NAV OPTIONS (DESKTOP) */}
      {user && (
        <div className="flex-initial hidden md:flex items-center justify-center">
          <div className="flex gap-10 items-center">
            {navItems.map((item) => {
              const isActive = location.pathname + location.search === item.path || (item.path === '/race' && location.pathname === '/race' && !location.search);
              return (
                <Link 
                  key={item.label} 
                  to={item.path} 
                  className={`text-[11px] tech-label transition-all relative group ${isActive ? 'text-primary' : 'text-neutral-500 hover:text-neutral-200'}`}
                >
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 w-full h-[1px] bg-primary transition-transform duration-300 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'}`} />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* RIGHT: PROFILE & STATS */}
      <div className="flex-1 flex items-center justify-end gap-8">
        {user ? (
          <>
            {/* XP HUD - Minimalist */}
            <div className="hidden xl:flex flex-col gap-1.5 min-w-[200px] bg-white/[0.04] p-3 rounded-xl border border-white/10 shadow-glow-primary/5">
               <div className="flex justify-between items-baseline px-1">
                 <span className="text-[11px] font-heading font-black text-primary uppercase tracking-[0.2em]">ROOM L{level}</span>
                 <span className="text-[11px] font-mono text-neutral-400 font-bold">{currentXP} XP</span>
               </div>
               <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-primary shadow-teal-glow transition-all duration-1000 ease-out" 
                   style={{ width: `${progressPercent}%` }}
                 ></div>
               </div>
            </div>

            <button 
              onClick={logout}
              className="text-[11px] tech-label text-neutral-500 hover:text-red-500 transition-colors uppercase tracking-[0.2em] font-bold"
            >
              Disconnect
            </button>

            <Link to="/settings" className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/5 hover:border-primary transition-all bg-neutral-900 flex items-center justify-center p-[2px]">
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
      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[-1] md:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-14 left-0 h-screen w-[280px] bg-neutral-950 border-r border-white/5 p-8 md:hidden flex flex-col gap-10"
            >
              <div className="space-y-6">
                <span className="text-[10px] tech-label text-neutral-600 block mb-4 uppercase tracking-[4px]">Navigation</span>
                {navItems.map((item) => {
                  const isActive = location.pathname + location.search === item.path || (item.path === '/race' && location.pathname === '/race' && !location.search);
                  return (
                    <Link 
                      key={item.label}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block text-2xl font-heading font-black uppercase tracking-widest transition-all ${isActive ? 'text-primary shadow-glow-primary' : 'text-neutral-500 hover:text-neutral-200'}`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-auto pb-20 space-y-4">
                 <span className="text-[10px] tech-label text-neutral-600 block mb-2 uppercase tracking-[4px]">Account</span>
                 <Link to="/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-neutral-400 hover:text-primary transition-colors">
                    <Settings size={18} />
                    <span className="tech-label !text-xs">Preferences</span>
                 </Link>
                 <button onClick={() => { logout(); setIsMenuOpen(false); }} className="flex items-center gap-3 text-neutral-400 hover:text-red-500 transition-colors">
                    <LogOut size={18} />
                    <span className="tech-label !text-xs">Disconnect Session</span>
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};
