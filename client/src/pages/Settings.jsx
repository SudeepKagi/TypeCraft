import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import useSettingsStore from '../store/settingsStore';
import useAuthStore from '../store/authStore';
import { AVATARS } from '../constants/avatars';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const { themeColor, setThemeColor } = useSettingsStore();
  const { user, syncUser } = useAuthStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editUsername, setEditUsername] = React.useState(user?.username || '');
  const [editAvatarUrl, setEditAvatarUrl] = React.useState(user?.avatarUrl || '');
  const [status, setStatus] = React.useState({ type: '', message: '' });
  const [isSaving, setIsSaving] = React.useState(false);

  const themes = [
    { name: 'Teal', color: '#1D9E75' },
    { name: 'Neon Purple', color: '#8B5CF6' },
    { name: 'Amber', color: '#F59E0B' },
    { name: 'Crimson', color: '#EF4444' },
    { name: 'Electric Blue', color: '#3B82F6' },
  ];

  const handleSaveProfile = async () => {
    if (!editUsername) return setStatus({ type: 'error', message: 'Username is required' });
    
    setIsSaving(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('http://localhost:4000/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: editUsername, avatarUrl: editAvatarUrl }),
        credentials: 'include'
      });

      const data = await res.json();
      if (data.success) {
        await syncUser();
        setStatus({ type: 'success', message: 'Identity updated successfully' });
        setIsEditing(false);
      } else {
        setStatus({ type: 'error', message: data.error || 'Update failed' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Connection error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageWrapper>
      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-screen flex flex-col gap-12">
        <header>
           <h1 className="text-4xl md:text-5xl font-heading font-black text-neutral-100 tracking-tighter uppercase leading-none">Settings</h1>
           <p className="text-sm text-neutral-500 font-mono mt-2 tracking-widest uppercase opacity-60">System Configuration // Pulse-Check</p>
        </header>

        {/* Visual Section */}
        <section className="bg-[#111111] p-8 rounded-xl border border-white/5 space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
             <span className="material-symbols-outlined text-primary">palette</span>
             <h2 className="font-heading font-black uppercase tracking-tight">Visual Interface</h2>
          </div>

          <div className="space-y-4">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block">Primary Signature Theme</span>
            <div className="flex flex-wrap gap-4">
              {themes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setThemeColor(t.color)}
                  className={`group relative p-1 rounded-full border-2 transition-all ${themeColor === t.color ? 'border-neutral-100' : 'border-transparent hover:border-neutral-500'}`}
                >
                  <div className="w-10 h-10 rounded-full shadow-lg" style={{ backgroundColor: t.color }}></div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity uppercase whitespace-nowrap">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Profile Section */}
        <section className="bg-[#111111] p-8 rounded-xl border border-white/5 space-y-8 relative overflow-hidden">
           <AnimatePresence>
             {status.message && (
               <motion.div 
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className={`absolute top-0 left-0 right-0 p-2 text-center text-[10px] font-mono uppercase tracking-widest z-20 ${status.type === 'success' ? 'bg-primary/20 text-primary' : 'bg-error/20 text-error'}`}
               >
                 {status.message}
               </motion.div>
             )}
           </AnimatePresence>
           
           <div className="flex items-center gap-3 border-b border-white/5 pb-4">
             <span className="material-symbols-outlined text-primary">person</span>
             <h2 className="font-heading font-black uppercase tracking-tight">Identity Management</h2>
          </div>

          {isEditing ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-[0.2em] block">Username Alias</label>
                  <input 
                    type="text" 
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 p-4 rounded-xl text-md font-mono focus:border-primary outline-none transition-all shadow-inner focus:shadow-teal-glow-sm"
                    placeholder="Enter unique alias"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-[0.2em] block">Avatar Sequence selection</label>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                    {AVATARS.map((avatar) => (
                      <motion.div
                        key={avatar.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditAvatarUrl(avatar.url)}
                        className={`aspect-square rounded-xl cursor-pointer p-0.5 transition-all ${editAvatarUrl === avatar.url ? 'bg-primary shadow-teal-glow-sm' : 'bg-neutral-800/40 hover:bg-neutral-800'}`}
                      >
                         <div className="w-full h-full bg-neutral-900 rounded-[10px] overflow-hidden">
                           <img 
                              src={avatar.url} 
                              alt={avatar.name} 
                              className={`w-full h-full object-cover transition-all ${editAvatarUrl === avatar.url ? 'brightness-110' : 'grayscale brightness-50 opacity-40'}`} 
                           />
                         </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 bg-primary text-on-primary py-4 text-[11px] font-mono font-black uppercase tracking-widest rounded-xl disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-95 shadow-teal-glow"
                >
                  {isSaving ? 'Recalibrating...' : 'Synchronize Identity'}
                </button>
                <button 
                  onClick={() => { setIsEditing(false); setStatus({ type: '', message: '' }); }}
                  className="flex-1 bg-neutral-900 text-neutral-400 py-4 text-[11px] font-mono font-black uppercase tracking-widest rounded-xl border border-white/5 hover:text-white transition-all"
                >
                  Terminate Action
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full border-2 border-primary p-1 bg-neutral-900 overflow-hidden">
                <img src={user?.avatarUrl} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-heading font-black uppercase">{user?.username}</span>
                  <span className="text-xs font-mono text-primary font-bold">LVL {user?.level}</span>
                </div>
                <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Status: Active // Identity Verified</p>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-neutral-800 px-4 py-2 text-[10px] font-mono text-neutral-400 hover:text-neutral-100 transition-colors uppercase border border-white/5"
              >
                Edit Profile
              </button>
            </div>
          )}
        </section>

      </main>
    </PageWrapper>
  );
};

export default Settings;
