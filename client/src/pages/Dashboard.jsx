import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import useAuthStore from '../store/authStore';
import { calculateRank } from '../lib/rankCalc';

const Dashboard = () => {
  const userId = useAuthStore(state => state.userId);
  const user = useAuthStore(state => state.user);
  const [activeTab, setActiveTab] = useState('global');
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({
    bestWpm: 0,
    avgWpm: 0,
    totalTests: 0,
    momentum: [],
    recentAccuracy: 0,
    recentRaces: []
  });
  const [heatmap, setHeatmap] = useState({});

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:4000/api/users/${userId}/stats`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error('Failed to fetch stats:', err));

      fetch(`http://localhost:4000/api/users/${userId}/heatmap`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => setHeatmap(data))
        .catch(err => console.error('Failed to fetch heatmap:', err));
      
      fetch('http://localhost:4000/api/leaderboard')
        .then(res => res.json())
        .then(data => setLeaderboard(data.slice(0, 5)))
        .catch(err => console.error('Failed to fetch leaderboard:', err));
    }
  }, [userId]);

  const generatePath = (data) => {
    if (!data.length) return "";
    const width = 100;
    const height = 100;
    const maxVal = Math.max(...data, 100);
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (val / maxVal) * height;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const sparklinePath = generatePath(stats.momentum);

  const getHeatColor = (char) => {
    const data = heatmap[char.toLowerCase()];
    if (!data || data.total < 1) return 'bg-neutral-800/30 text-neutral-600';
    const acc = data.accuracy;
    if (acc >= 98) return 'bg-primary text-on-primary font-bold shadow-[0_0_10px_rgba(29,158,117,0.4)]';
    if (acc >= 90) return 'bg-primary/70 text-on-primary-container';
    if (acc >= 80) return 'bg-primary/40 text-neutral-300';
    if (acc >= 60) return 'bg-error/40 text-neutral-200';
    return 'bg-error text-white font-bold shadow-[0_0_10px_rgba(255,82,82,0.4)]';
  };

  const criticalWeakness = Object.entries(heatmap)
    .filter(([_, data]) => data.total > 5)
    .sort((a, b) => a[1].accuracy - b[1].accuracy)[0];
    
  const peakPrecision = Object.entries(heatmap)
    .filter(([_, data]) => data.total > 5)
    .sort((a, b) => b[1].accuracy - a[1].accuracy)[0];

  return (
    <PageWrapper>
      <main className="pt-24 pb-12 px-8 max-w-7xl mx-auto space-y-8 min-h-screen">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-6xl brutal-heading text-on-surface uppercase tracking-tighter shadow-glow-primary">
              Dashboard
            </h1>
            <p className="tech-label mt-2">Performance Analysis // System Alpha-09</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-surface-container-high px-4 py-2 text-xs font-mono border border-outline-variant/30 hover:border-primary transition-all duration-200 uppercase">Export Data</button>
            <button className="bg-gradient-to-br from-primary to-primary-container px-4 py-2 text-xs font-mono text-on-primary-container font-bold shadow-[0_0_20px_rgba(29,158,117,0.2)] uppercase">Start Test</button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111111] p-6 border-t border-primary/20 flex flex-col justify-between group hover:bg-[#161616] transition-colors rounded-b-xl border-x border-b border-white/5 cursor-default">
            <span className="tech-label opacity-60">Best WPM</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-heading font-black text-primary">{Math.floor(stats.bestWpm)}</span>
              <span className="tech-label opacity-40 truncate">WORDS/MIN</span>
            </div>
          </div>
          <div className="bg-[#111111] p-6 border-t border-outline-variant/20 flex flex-col justify-between group hover:bg-[#161616] transition-colors rounded-b-xl border-x border-b border-white/5 cursor-default">
            <span className="tech-label opacity-60">Avg WPM (30d)</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-heading font-black text-on-surface">{stats.avgWpm}</span>
              <span className="tech-label text-primary">+0.0%</span>
            </div>
          </div>
          <div className="bg-[#111111] p-6 border-t border-outline-variant/20 flex flex-col justify-between group hover:bg-[#161616] transition-colors rounded-b-xl border-x border-b border-white/5 cursor-default">
            <span className="tech-label opacity-60">Tests Completed</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-heading font-black text-on-surface">{stats.totalTests}</span>
              <span className="tech-label opacity-40">TOTAL</span>
            </div>
          </div>
          <div className="bg-[#111111] p-6 border-t border-primary/20 flex flex-col justify-between group hover:bg-[#161616] transition-colors rounded-b-xl border-x border-b border-white/5 cursor-default">
            <span className="tech-label opacity-60">Precision</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-heading font-black text-primary">{stats.recentAccuracy.toFixed(1)}</span>
              <span className="tech-label opacity-40">%</span>
            </div>
          </div>
        </div>

        {/* HP Modes / Competitive Entry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Link to="/race?type=tournament" className="group relative overflow-hidden bg-[#111111] p-8 rounded-xl border border-amber-400/10 hover:border-amber-400/40 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <span className="material-symbols-outlined text-8xl text-amber-400 rotate-12">trophy</span>
              </div>
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span className="tech-label !text-amber-400">Pro Series</span>
                 </div>
                 <h3 className="text-2xl font-heading font-black text-white uppercase italic tracking-tighter">Enter Tournament</h3>
                 <p className="text-neutral-500 text-xs mt-2 max-w-xs leading-relaxed italic">Join the competitive quorum. 4-player minimum. 2.5x XP rewards await the elite.</p>
                 <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                       Find Match <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </div>
                    <div className="text-[9px] font-mono text-neutral-600 uppercase tracking-tighter hidden group-hover:block transition-all">
                       4-Player Quorum Req.
                    </div>
                 </div>
              </div>
           </Link>

           <Link to="/race" className="group relative overflow-hidden bg-[#111111] p-8 rounded-xl border border-white/10 hover:border-primary/40 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <span className="material-symbols-outlined text-8xl text-white -rotate-12">electric_bolt</span>
              </div>
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-2">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                    <span className="tech-label !text-white">1v1 Sprint</span>
                 </div>
                 <h3 className="text-2xl font-heading font-black text-white uppercase italic tracking-tighter">Quick Race</h3>
                 <p className="text-neutral-500 text-xs mt-2 max-w-xs leading-relaxed italic">Direct head-to-head competition. Precision racing with no delays.</p>
                 <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-white uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                       Join Sprint <span className="material-symbols-outlined text-sm text-primary">arrow_forward</span>
                    </div>
                 </div>
              </div>
           </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#111111] p-8 flex flex-col gap-8 rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-black text-xl uppercase tracking-widest">Performance History</h3>
              <div className="flex gap-1 p-1 bg-surface-container-lowest rounded-lg border border-outline-variant/10">
                <button className="px-3 py-1 text-[10px] font-mono text-on-surface-variant hover:text-on-surface">SESSION</button>
                <button className="px-3 py-1 text-[10px] font-mono bg-primary text-on-primary-container rounded-sm">RECENT</button>
              </div>
            </div>
            <div className="relative h-64 w-full">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#1D9E75" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#1D9E75" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                {stats.momentum.length > 0 ? (
                  <>
                    <path d={`${sparklinePath} L 100,100 L 0,100 Z`} fill="url(#chartGradient)"></path>
                    <path d={sparklinePath} fill="none" stroke="#1D9E75" strokeWidth="1"></path>
                  </>
                ) : (
                  <text x="50" y="50" fill="#444" textAnchor="middle" className="text-[5px] font-mono uppercase tracking-widest">Initialize a test to view momentum</text>
                )}
              </svg>
            </div>
          </div>

          <div className="bg-[#111111] p-8 flex flex-col gap-8 rounded-xl border border-white/5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-black text-xl uppercase tracking-tighter">Profile Status</h3>
                <span className="tech-label">Level {user?.level}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                   <span>Progress</span>
                   <span>{user?.xp % 50} / 50 XP</span>
                </div>
                <div className="h-2 bg-neutral-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                   <div 
                     className="h-full bg-primary rounded-full shadow-teal-glow transition-all duration-1000" 
                     style={{ width: `${((user?.xp % 50) / 50) * 100}%` }}
                   ></div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5 flex-1">
              <div className="flex bg-neutral-900/50 p-1 rounded-lg mb-4">
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-1 text-[9px] font-mono uppercase tracking-widest rounded transition-all ${activeTab === 'history' ? 'bg-primary text-on-primary shadow-teal-glow' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                  Activity
                </button>
                <button 
                  onClick={() => setActiveTab('global')}
                  className={`flex-1 py-1 text-[9px] font-mono uppercase tracking-widest rounded transition-all ${activeTab === 'global' ? 'bg-primary text-on-primary shadow-teal-glow' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                  Global Top 5
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {activeTab === 'history' ? (
                  stats?.recentRaces?.length > 0 ? (
                    stats.recentRaces.map(race => (
                      <div key={race.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:border-primary/20 transition-colors">
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-heading text-neutral-100 font-black uppercase tracking-tight">{Math.floor(race.wpm)} WPM</span>
                          <span className="tech-label !text-[9px] opacity-40">{new Date(race.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-mono text-primary font-bold">{Math.floor(race.accuracy)}%</span>
                          <span className="text-[8px] font-mono text-neutral-600 uppercase tracking-widest">Success</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/5 rounded-xl">
                      <span className="material-symbols-outlined text-neutral-700 text-3xl">history</span>
                      <p className="text-[10px] font-mono text-neutral-600 mt-2 uppercase tracking-widest">Awaiting Data</p>
                    </div>
                  )
                ) : (
                  leaderboard?.length > 0 ? (
                    leaderboard.map((p, i) => {
                      const rank = i + 1;
                      const isMe = user && p.username === user.username;
                      const rankInfo = calculateRank(p.wpm, p.accuracy);
                      return (
                        <div key={p.id} className={`flex items-center justify-between p-3 border rounded-lg transition-all ${isMe ? 'bg-primary/10 border-primary/40' : 'bg-white/5 border-white/5 hover:border-neutral-700'}`}>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-heading font-black italic w-4 ${rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-neutral-400' : rank === 3 ? 'text-orange-400' : 'text-neutral-600'}`}>
                              {rank}
                            </span>
                            <div className="flex flex-col text-left">
                               <span className={`text-[11px] font-heading font-black uppercase tracking-tight ${isMe ? 'text-primary' : 'text-neutral-200'}`}>{p.username}</span>
                               <span className="text-[8px] font-mono leading-none" style={{ color: rankInfo.color }}>{rankInfo.name}</span>
                            </div>
                          </div>
                          <div className="text-right">
                             <div className="text-xs font-heading text-neutral-100 font-black italic">{Math.floor(p.wpm)} <span className="text-[9px] not-italic opacity-40">WPM</span></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="animate-pulse flex flex-col gap-3">
                       {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg"></div>)}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-outline-variant/10 text-center flex justify-between items-center">
              <Link to="/settings" className="text-[10px] font-mono text-neutral-500 hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">tune</span> Settings
              </Link>
              <Link to="/leaderboard" className="text-[10px] font-mono text-primary hover:underline uppercase tracking-widest flex items-center gap-2">
                Full Board <span className="material-symbols-outlined text-[14px]">trending_up</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-3 bg-[#111111] p-8 flex flex-col gap-8 rounded-xl border border-white/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-black text-xl uppercase tracking-widest">Accuracy Heatmap</h3>
                <p className="tech-label opacity-60 !tracking-normal">Accuracy Distribution across the keyboard matrix</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="text-[10px] font-mono text-on-surface-variant uppercase">Perfect</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-error"></span>
                  <span className="text-[10px] font-mono text-on-surface-variant uppercase">Error Prone</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 max-w-4xl mx-auto w-full mb-4">
              {[
                ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
                ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
                ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
              ].map((row, i) => (
                <div key={i} className={`flex gap-1 justify-center ${i === 1 ? 'ml-4' : i === 2 ? 'ml-8' : ''}`}>
                  {row.map(key => (
                    <div key={key} className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-mono text-xs rounded-sm transition-all duration-500 ${getHeatColor(key)}`}>
                      {key}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-outline-variant/10">
              <div className="flex flex-col">
                <span className="tech-label opacity-60">Critical Weakness</span>
                <span className={`text-xl font-heading font-black mt-1 uppercase truncate ${criticalWeakness ? 'text-error' : 'text-neutral-500 text-sm font-inter'}`}>
                   {criticalWeakness ? `${criticalWeakness[0]} KEY (${criticalWeakness[1].accuracy.toFixed(0)}%)` : 'No Data'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="tech-label opacity-60">Peak Precision</span>
                <span className={`text-xl font-heading font-black mt-1 uppercase truncate ${peakPrecision ? 'text-primary' : 'text-neutral-500 text-sm font-inter'}`}>
                   {peakPrecision ? `${peakPrecision[0]} KEY (${peakPrecision[1].accuracy.toFixed(0)}%)` : 'No Data'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="tech-label opacity-60">Average Latency</span>
                <span className="text-xl font-heading font-black text-on-surface mt-1 uppercase">42ms</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
};

export default Dashboard;
