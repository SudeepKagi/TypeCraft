import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Logo } from '../components/ui/Logo';

import { AVATARS } from '../constants/avatars';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const completeOnboarding = useAuthStore(state => state.completeOnboarding);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  const handleComplete = async () => {
    if (!username || !selectedAvatar) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:4000/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username,
          avatarId: selectedAvatar.id,
          avatarUrl: selectedAvatar.url
        })
      });

      const data = await res.json();
      if (data.success) {
        completeOnboarding(data.user);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Failed to complete setup.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.05)_0%,transparent_70%)]"></div>
      <div className="dot-overlay absolute inset-0 opacity-20"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg glass-card p-10 rounded-2xl border border-white/5 relative z-10"
      >
        <div className="mb-10">
          <div className="flex items-center gap-6 mb-6 px-1">
            <Logo size={48} />
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                 <span className="text-[10px] font-mono text-primary uppercase tracking-[0.3em]">TypeCraft_System_v.2.4</span>
              </div>
              <h1 className="text-3xl md:text-3xl font-heading font-black text-white tracking-tighter uppercase leading-none">Profile Setup</h1>
            </div>
          </div>
          <p className="text-neutral-500 text-sm mt-2 font-inter font-medium leading-relaxed">
            Welcome to TypeCraft. Before you begin, please set up your professional profile and choose an avatar to identify yourself in the arena.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono text-neutral-400 tracking-widest block px-1">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. User_01"
                  className="w-full bg-neutral-900/50 border border-white/5 rounded-xl px-5 py-4 text-white font-mono placeholder:text-neutral-700 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
              
              <button 
                onClick={() => username.length > 2 && setStep(2)}
                disabled={username.length <= 2}
                className="w-full py-4 bg-primary text-neutral-900 font-heading font-black text-lg uppercase tracking-wider rounded-xl shadow-teal-glow transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
              >
                Continue
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-4 gap-3">
                {AVATARS.map((avatar) => (
                  <motion.div 
                    key={avatar.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`aspect-square rounded-2xl p-0.5 cursor-pointer transition-all ${selectedAvatar?.id === avatar.id ? 'bg-primary shadow-teal-glow-sm' : 'bg-neutral-800/50 hover:bg-neutral-800'}`}
                  >
                    <div className="w-full h-full bg-neutral-900 rounded-[14px] overflow-hidden relative">
                       <img src={avatar.url} alt={avatar.name} className={`w-full h-full object-cover transition-all ${selectedAvatar?.id === avatar.id ? 'brightness-110' : 'grayscale brightness-50'}`} />
                       <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                          <span className="text-[9px] font-mono font-bold text-white uppercase tracking-widest">{avatar.name}</span>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {error && <p className="text-red-500 text-xs font-mono text-center">{error}</p>}

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-neutral-900 border border-white/5 text-neutral-400 font-heading font-black uppercase tracking-widest rounded-xl hover:text-white transition-all shadow-sm"
                >
                  Back
                </button>
                <button 
                  onClick={handleComplete}
                  disabled={!selectedAvatar || loading}
                  className="flex-[2] py-4 bg-primary text-neutral-900 font-heading font-black text-lg uppercase tracking-wider rounded-xl shadow-teal-glow transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30"
                >
                  {loading ? 'Saving...' : 'Complete Setup'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Onboarding;
