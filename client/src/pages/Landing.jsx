import React from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';

const Landing = () => {
  return (
    <PageWrapper>
      <div className="min-h-screen relative overflow-hidden pt-32">
        <div className="dot-overlay"></div>
        <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-40 relative z-10">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center space-x-3 px-3 py-1 glass-card rounded-full border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Live performance engine 2.0</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-syne font-extrabold leading-[1.1] text-white tracking-tight">
              Type at the <span className="text-gradient">speed</span> of thought.
            </h1>
            
            <p className="text-xl text-on-surface-variant max-w-xl font-medium leading-relaxed">
              Compete. Improve. Dominate the leaderboard. The world's most precise typing engine designed for elite performers.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/play" className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-lg shadow-[0_0_20px_rgba(29,158,117,0.2)] hover:scale-[1.02] active:scale-95 transition-all duration-150 inline-block">
                Start Typing
              </Link>
              <button className="px-8 py-4 border border-primary/40 text-primary font-bold rounded-lg hover:bg-primary/5 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-5 relative">
            <div className="absolute -top-12 -right-8 glass-card p-6 rounded-xl space-y-1 transform hover:-translate-y-1 transition-transform cursor-default z-20">
              <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest font-label">All-time record</div>
              <div className="text-3xl font-syne font-extrabold text-primary">142 WPM</div>
            </div>
            
            <div className="absolute top-1/2 -left-12 glass-card p-6 rounded-xl space-y-1 transform hover:-translate-y-1 transition-transform cursor-default z-20">
              <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest font-label">Global users</div>
              <div className="text-3xl font-syne font-extrabold text-white">48K Online</div>
            </div>
            
            <div className="relative w-full aspect-[4/3] glass-card rounded-2xl p-8 flex flex-col justify-center">
              <div className="absolute top-4 left-6 flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500/40"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500/20 border border-yellow-500/40"></div>
                <div className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/40"></div>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
                  <div className="font-mono text-primary text-2xl font-bold">80 <span className="text-xs text-on-surface-variant uppercase font-label tracking-normal">WPM</span></div>
                  <div className="font-mono text-on-surface-variant text-xs">Accuracy: 99.2%</div>
                </div>
                <div className="font-mono text-xl leading-relaxed tracking-normal">
                  <span className="text-on-surface">The quick brown fox jumps over the lazy </span>
                  <span className="text-on-surface-variant">dog. Typography is the craft of endowing a </span>
                  <span className="text-on-surface-variant opacity-30">human language with a durable visual form.</span>
                  <span className="caret"></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      </div>
    </PageWrapper>
  );
};

export default Landing;
