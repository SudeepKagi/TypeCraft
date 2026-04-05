import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import useSettingsStore from '../store/settingsStore';
import useAuthStore from '../store/authStore';

const Settings = () => {
  const { soundEnabled, soundType, volume, themeColor, toggleSound, setSoundType, setVolume, setThemeColor } = useSettingsStore();
  const { user } = useAuthStore();

  const themes = [
    { name: 'Teal', color: '#1D9E75' },
    { name: 'Neon Purple', color: '#8B5CF6' },
    { name: 'Amber', color: '#F59E0B' },
    { name: 'Crimson', color: '#EF4444' },
    { name: 'Electric Blue', color: '#3B82F6' },
  ];

  return (
    <PageWrapper>
      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-screen flex flex-col gap-12">
        <header>
           <h1 className="text-4xl md:text-5xl font-syne font-black text-neutral-100 tracking-tighter uppercase">Settings</h1>
           <p className="text-sm text-neutral-500 font-mono mt-2 tracking-widest uppercase">User Preferences // Configuration</p>
        </header>

        {/* Audio Section */}
        <section className="bg-[#111111] p-8 rounded-xl border border-white/5 space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
             <span className="material-symbols-outlined text-primary">volume_up</span>
             <h2 className="font-syne text-xl uppercase tracking-tight">Audio Feedback</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">Typing Sounds</span>
                <button 
                  onClick={toggleSound}
                  className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-primary' : 'bg-neutral-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-neutral-100 transition-all ${soundEnabled ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block">Volume Control</span>
                <input 
                  type="range" 
                  min="0" max="1" step="0.01" 
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-primary bg-neutral-900"
                />
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block">Sound Profile</span>
              <div className="flex gap-2">
                {['mechanical', 'minimal', 'retro'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSoundType(type)}
                    className={`flex-1 py-3 rounded border text-[10px] font-mono uppercase tracking-widest transition-all ${soundType === type ? 'bg-primary/10 border-primary text-primary' : 'bg-neutral-900 border-white/5 text-neutral-500 hover:border-white/20'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Visual Section */}
        <section className="bg-[#111111] p-8 rounded-xl border border-white/5 space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
             <span className="material-symbols-outlined text-primary">palette</span>
             <h2 className="font-syne text-xl uppercase tracking-tight">Visual Interface</h2>
          </div>

          <div className="space-y-4">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block">Interface Theme</span>
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
        <section className="bg-[#111111] p-8 rounded-xl border border-white/5 space-y-8">
           <div className="flex items-center gap-3 border-b border-white/5 pb-4">
             <span className="material-symbols-outlined text-primary">person</span>
             <h2 className="font-syne text-xl uppercase tracking-tight">Account Profile</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full border-2 border-primary p-1">
              <img src={user?.avatarUrl} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-syne font-bold uppercase">{user?.username}</span>
                <span className="text-xs font-mono text-primary font-bold">LVL {user?.level}</span>
              </div>
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Status: Active // Identity Verified</p>
            </div>
            <button className="bg-neutral-800 px-4 py-2 text-[10px] font-mono text-neutral-400 hover:text-neutral-100 transition-colors uppercase border border-white/5">Edit Profile</button>
          </div>
        </section>

      </main>
    </PageWrapper>
  );
};

export default Settings;
