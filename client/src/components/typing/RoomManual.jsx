import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const RoomManual = ({ isOpen, onClose, defaultTab = 'sprints' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const tabs = [
    { 
      id: 'sprints', 
      label: '1v1 SPRINTS', 
      icon: 'electric_bolt',
      content: {
        title: "Competitive Sprints",
        subtitle: "Head-to-Head Precision Racing",
        rules: [
          "Create a lobby or join via Room Code.",
          "Host initiates the countdown sequence.",
          "First typist to hit 100% completion wins.",
          "XP scaled by WPM and Accuracy."
        ],
        stakes: "Standard Rewards"
      }
    },
    { 
      id: 'tournament', 
      label: 'PRO SERIES', 
      icon: 'military_tech',
      content: {
        title: "Tournament Room",
        subtitle: "Quorum-Based Elite Matchmaking",
        rules: [
          "Matchmaking requires a 4-player quorum.",
          "System auto-initiates once quorum is reached.",
          "8-second countdown for thermal stabilization.",
          "Proximity-based global rankings affected."
        ],
        stakes: "2.5x XP Multiplier"
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-4xl bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.15)] flex flex-col md:flex-row min-h-[500px]"
        >
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 bg-neutral-950 border-r border-white/5 p-6 flex flex-col gap-2">
            <h2 className="brutal-heading !text-white !text-xl mb-8">Room Manual</h2>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-all tech-label text-left ${activeTab === tab.id ? 'bg-primary/20 text-primary border border-primary/20' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
            <button 
              onClick={onClose}
              className="mt-auto px-4 py-4 text-xs font-mono text-red-500 hover:text-red-400 uppercase tracking-widest flex items-center gap-2 group transition-all"
            >
               <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
               <span className="tech-label">Close Manual</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-10 relative overflow-y-auto max-h-[80vh] md:max-h-none">
             <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[150px]">{tabs.find(t => t.id === activeTab).icon}</span>
             </div>

             <div className="relative z-10">
                <div className="mb-10">
                   <h1 className="text-4xl font-heading font-black text-white italic uppercase tracking-tighter leading-tight drop-shadow-sm">
                      {tabs.find(t => t.id === activeTab).content.title}
                   </h1>
                   <p className="text-primary font-mono text-xs uppercase tracking-[0.3em] font-bold mt-2">
                      {tabs.find(t => t.id === activeTab).content.subtitle}
                   </p>
                </div>

                <div className="space-y-12">
                   <div className="space-y-6">
                      <h3 className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest border-b border-white/5 pb-2">Operational Guidelines</h3>
                      <div className="grid gap-4">
                         {tabs.find(t => t.id === activeTab).content.rules.map((rule, i) => (
                           <div key={i} className="flex gap-4 items-start">
                              <span className="text-primary font-mono text-xs pt-1 font-bold">0{i+1}</span>
                              <p className="text-sm text-neutral-300 font-medium leading-relaxed italic">"{rule}"</p>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                      <div>
                         <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest block mb-1">Stakes & Multipliers</span>
                         <span className="text-xl font-syne text-white uppercase italic tracking-tighter">{tabs.find(t => t.id === activeTab).content.stakes}</span>
                      </div>
                      <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center">
                         <span className="material-symbols-outlined text-primary">data_thresholding</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
