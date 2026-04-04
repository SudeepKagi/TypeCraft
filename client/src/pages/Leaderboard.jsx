import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import useAuthStore from '../store/authStore';
import { calculateRank } from '../lib/rankCalc';

const Leaderboard = () => {
  const user = useAuthStore(state => state.user);
// ... (rest of the intermediate state stays as I just added it)
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Derive my standing
  const myStandingIndex = user ? leaderboard.findIndex(p => p.username === user.username) : -1;
  const myRank = myStandingIndex !== -1 ? myStandingIndex + 1 : '---'; 
  const myWpm = myStandingIndex !== -1 ? leaderboard[myStandingIndex].wpm : 0;
  const myAccuracy = myStandingIndex !== -1 ? leaderboard[myStandingIndex].accuracy : 100;
  
  // Calculate my rank info
  const myRankInfo = calculateRank(myWpm, myAccuracy);

  useEffect(() => {
    fetch('http://localhost:4000/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setLeaderboard(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <PageWrapper>
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: User Stats */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="custom-glass p-6 rounded-xl border border-outline-variant/10 flex flex-col gap-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full"></div>
             <span className="text-[10px] uppercase font-inter text-neutral-500 tracking-widest font-bold">Your Standing</span>
             
             <div className="flex items-center gap-4">
                <h1 className="font-syne text-5xl font-black text-primary italic drop-shadow-[0_0_15px_rgba(29,158,117,0.3)]">#{myRank}</h1>
                <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-white/5 ${myRankInfo.glow}`} style={{ backgroundColor: myRankInfo.color + '20', color: myRankInfo.color }}>
                   {myRankInfo.name}
                </div>
             </div>
             <p className="text-xs text-neutral-400 font-inter">Top of the pack.</p>

             <div className="w-full h-[1px] bg-neutral-800/50 my-2"></div>

             <div className="flex justify-between items-center">
                <span className="text-xs font-inter text-neutral-500">Avg Race</span>
                <span className="text-sm font-mono text-neutral-100 font-bold">{myWpm} WPM</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-xs font-inter text-neutral-500">Consistency</span>
                <span className="text-sm font-mono text-neutral-100">94%</span>
             </div>
          </div>

          <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-1 h-full bg-primary"></div>
              <span className="text-[10px] uppercase font-inter text-primary tracking-widest font-bold">Weekly Goal</span>
             <p className="text-xs text-neutral-300 font-inter mt-3 leading-relaxed">
               You are {Math.pow(user?.level || 1, 2) * 50 - (user?.xp || 0)} XP away from the next tier.
             </p>
             <div className="mt-4 w-full h-[3px] bg-neutral-900 rounded-full overflow-hidden">
               <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, (((user?.xp || 0) - Math.pow((user?.level || 1) - 1, 2) * 50) / (Math.pow(user?.level || 1, 2) * 50 - Math.pow((user?.level || 1) - 1, 2) * 50)) * 100))}%` }}></div>
             </div>
          </div>
        </div>

        {/* Right Main Panel: Leaderboard */}
        <div className="lg:col-span-9 flex flex-col">
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
               <h1 className="text-5xl md:text-7xl font-syne font-black text-neutral-100 tracking-tighter">Leaderboard</h1>
               <p className="text-sm text-neutral-400 font-inter mt-2">Compete with the world's most efficient typists.</p>
            </div>
            
            <div className="flex bg-neutral-900/50 p-1 rounded-xl border border-neutral-800/50">
              <button className="px-6 py-2 text-xs font-mono font-bold bg-primary text-on-primary rounded-lg transition-all shadow-teal-glow">Global</button>
              <button className="px-6 py-2 text-xs font-mono text-neutral-500 hover:text-neutral-300 transition-all">Friends</button>
              <button className="px-6 py-2 text-xs font-mono text-neutral-500 hover:text-neutral-300 transition-all">This Week</button>
            </div>
          </div>

          {/* Table Headers */}
          <div className="grid grid-cols-12 gap-4 px-6 text-[10px] uppercase font-inter text-neutral-500 tracking-widest mb-4">
             <div className="col-span-1">Rank</div>
             <div className="col-span-5">User</div>
             <div className="col-span-2 text-center">Avg WPM</div>
             <div className="col-span-2 text-center">Tests</div>
             <div className="col-span-2 text-right">Accuracy</div>
          </div>

          {/* Leaderboard List */}
          <div className="flex flex-col gap-2">
            {loading ? (
               <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 rounded-full border-2 border-primary border-t-transparent"></div></div>
            ) : leaderboard.map((p, i) => {
              const rank = i + 1;
              const isTop3 = rank <= 3;
              const isMe = user && p.username === user.username;
              const rankInfo = calculateRank(p.wpm, p.accuracy);

              return (
                <div 
                  key={p.id} 
                  className={`grid grid-cols-12 gap-4 items-center px-6 py-4 rounded-xl border transition-all ${
                    isTop3 ? 'bg-neutral-900/40 border-neutral-800' :
                    isMe ? 'bg-primary/5 border-primary/30 shadow-teal-glow' :
                    'border-transparent hover:bg-neutral-900/20'
                  }`}
                >
                  <div className={`col-span-1 font-syne font-black text-xl italic ${
                    rank === 1 ? 'text-[#FFB800]' : 
                    rank === 2 ? 'text-[#FFD700]' : 
                    rank === 3 ? 'text-[#CD7F32]' : 
                    isMe ? 'text-primary' :
                    'text-neutral-500 text-sm not-italic font-mono'
                  }`}>
                    {rank < 10 ? `0${rank}` : rank}
                  </div>
                  
                  <div className="col-span-5 flex items-center gap-4">
                    <div className={`w-8 h-8 rounded shrink-0 overflow-hidden ${isTop3 ? 'border border-neutral-700' : ''}`}>
                      {p.avatarUrl ? (
                         <img src={p.avatarUrl} alt={p.username} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                            <span className="text-xs text-neutral-500">{p.username[0]}</span>
                         </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-mono text-sm truncate ${isMe ? 'text-primary font-bold' : 'text-neutral-300'}`}>
                        {isMe ? 'You (' + p.username + ')' : p.username}
                      </span>
                      <span className="text-[10px] font-mono leading-none" style={{ color: rankInfo.color }}>{rankInfo.name}</span>
                    </div>
                  </div>

                  <div className={`col-span-2 text-center font-syne font-bold ${isTop3 || isMe ? 'text-primary' : 'text-neutral-100'}`}>
                     {Math.floor(p.wpm)}
                  </div>

                  <div className="col-span-2 text-center font-mono text-xs text-neutral-400">
                     {p.tests.toLocaleString()}
                  </div>

                  <div className="col-span-2 text-right font-mono text-xs text-neutral-400">
                     {p.accuracy.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <button className="px-6 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-inter text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors flex items-center gap-2">
               Load Next 50 Users <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>
          </div>
        </div>

      </main>
    </PageWrapper>
  );
};

export default Leaderboard;
