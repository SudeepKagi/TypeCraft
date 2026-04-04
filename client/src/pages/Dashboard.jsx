import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const userId = useAuthStore(state => state.userId);
  const user = useAuthStore(state => state.user);
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
    }
  }, [userId]);

  // Generate sparkline path
  const generatePath = (data) => {
    if (!data.length) return "";
    const width = 100;
    const height = 100;
    const padding = 10;
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
            <h1 className="text-5xl font-syne font-extrabold tracking-tighter text-on-surface uppercase">{user?.username || 'PILOT'}_DASHBOARD</h1>
            <p className="text-on-surface-variant font-mono mt-2 uppercase tracking-widest text-xs">Elite Training Environment // Alpha-09</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-surface-container-high px-4 py-2 text-xs font-mono border border-outline-variant/30 hover:border-primary transition-all duration-200">EXPORT_DATA</button>
            <button className="bg-gradient-to-br from-primary to-primary-container px-4 py-2 text-xs font-mono text-on-primary-container font-bold shadow-[0_0_20px_rgba(29,158,117,0.2)]">START_PRACTICE</button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111111] p-6 border-t border-primary/20 flex flex-col justify-between group hover:bg-[#161616] transition-colors rounded-b-xl border-x border-b border-transparent hover:border-white/5 cursor-default">
            <span className="text-[10px] font-mono text-on-surface-variant tracking-widest uppercase">Best WPM</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-syne text-primary">{Math.floor(stats.bestWpm)}</span>
              <span className="text-xs font-mono text-on-surface-variant">WORDS/MIN</span>
            </div>
          </div>
          <div className="bg-[#111111] p-6 border-t border-outline-variant/20 flex flex-col justify-between group hover:bg-[#161616] transition-colors rounded-b-xl border-x border-b border-transparent hover:border-white/5 cursor-default">
            <span className="text-[10px] font-mono text-on-surface-variant tracking-widest uppercase">Avg WPM (30d)</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-syne text-on-surface">{stats.avgWpm}</span>
              <span className="text-xs font-mono text-primary">+0.0%</span>
            </div>
          </div>
          <div className="bg-[#111111] p-6 border-t border-outline-variant/20 flex flex-col justify-between group hover:bg-[#161616] transition-colors rounded-b-xl border-x border-b border-transparent hover:border-white/5 cursor-default">
            <span className="text-[10px] font-mono text-on-surface-variant tracking-widest uppercase">Tests Taken</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-syne text-on-surface">{stats.totalTests}</span>
              <span className="text-xs font-mono text-on-surface-variant">TOTAL</span>
            </div>
          </div>
          <div className="bg-[#111111] p-6 border-t border-primary/20 flex flex-col justify-between group hover:bg-[#161616] transition-colors rounded-b-xl border-x border-b border-transparent hover:border-white/5 cursor-default">
            <span className="text-[10px] font-mono text-on-surface-variant tracking-widest uppercase">Accuracy</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-syne text-primary">{stats.recentAccuracy.toFixed(1)}</span>
              <span className="text-xs font-mono text-on-surface-variant">%</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Area Chart: WPM Over Time */}
          <div className="lg:col-span-2 bg-[#111111] p-8 flex flex-col gap-8 rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="font-syne text-xl">WPM_MOMENTUM</h3>
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
                  <text x="50" y="50" fill="#444" textAnchor="middle" className="text-[5px] font-mono">No data available yet. Complete a test to see your momentum.</text>
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-t border-outline-variant/10 w-full"></div>
                <div className="border-t border-outline-variant/10 w-full"></div>
                <div className="border-t border-outline-variant/10 w-full"></div>
                <div className="border-t border-outline-variant/10 w-full"></div>
              </div>
            </div>
          </div>

          {/* Recent Races & Level Progress */}
          <div className="bg-[#111111] p-8 flex flex-col gap-8 rounded-xl border border-white/5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-syne text-xl uppercase tracking-tighter">Pilot_Status</h3>
                <span className="text-[10px] font-mono text-primary uppercase font-bold tracking-widest">LVL_{user?.level}</span>
              </div>
              
              {/* XP Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-neutral-500 uppercase">
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

            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Recent_Combat_Logs</h4>
              <div className="flex flex-col gap-3">
                {stats?.recentRaces?.length > 0 ? (
                  stats.recentRaces.map(race => (
                    <div key={race.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:border-primary/20 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-xs font-syne text-neutral-100 font-bold">{Math.floor(race.wpm)} WPM</span>
                        <span className="text-[10px] font-mono text-neutral-500">{new Date(race.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-mono text-primary font-bold">{Math.floor(race.accuracy)}%</span>
                        <span className="text-[8px] font-mono text-neutral-600 uppercase">Success</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/5 rounded-xl">
                    <span className="material-symbols-outlined text-neutral-700 text-3xl">history</span>
                    <p className="text-[10px] font-mono text-neutral-600 mt-2 uppercase">Awaiting Data...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-outline-variant/10 text-center">
              <Link to="/settings" className="text-[10px] font-mono text-neutral-500 hover:text-primary transition-colors uppercase tracking-widest flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[14px]">tune</span> Customize_HUD
              </Link>
            </div>
          </div>

          {/* Keyboard Heatmap */}
          <div className="lg:col-span-3 bg-[#111111] p-8 flex flex-col gap-8 rounded-xl border border-white/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-syne text-xl">KINETIC_HEATMAP</h3>
                <p className="text-[10px] font-mono text-on-surface-variant uppercase mt-1">Accuracy Distribution across QWERTY matrix</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="text-[10px] font-mono text-on-surface-variant uppercase">Perfect</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-error"></span>
                  <span className="text-[10px] font-mono text-on-surface-variant uppercase">Error_Prone</span>
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
                <span className="text-[10px] font-mono text-on-surface-variant uppercase">Critical Weakness</span>
                <span className={`text-xl font-syne mt-1 uppercase ${criticalWeakness ? 'text-error' : 'text-neutral-500 text-sm italic font-inter'}`}>
                   {criticalWeakness ? `${criticalWeakness[0]} KEY (${criticalWeakness[1].accuracy.toFixed(0)}%)` : 'Insufficient Data'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-on-surface-variant uppercase">Peak Precision</span>
                <span className={`text-xl font-syne mt-1 uppercase ${peakPrecision ? 'text-primary' : 'text-neutral-500 text-sm italic font-inter'}`}>
                   {peakPrecision ? `${peakPrecision[0]} KEY (${peakPrecision[1].accuracy.toFixed(0)}%)` : 'Insufficient Data'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-on-surface-variant uppercase">Average Latency</span>
                <span className="text-xl font-syne text-on-surface mt-1">42MS</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
};

export default Dashboard;
