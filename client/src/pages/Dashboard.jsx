import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';

const Dashboard = () => {
  return (
    <PageWrapper>
      <main className="pt-24 pb-12 px-8 max-w-7xl mx-auto space-y-8 min-h-screen">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl font-syne font-extrabold tracking-tighter text-on-surface">PERFORMANCE HUB</h1>
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
              <span className="text-5xl font-syne text-primary">142</span>
              <span className="text-xs font-mono text-on-surface-variant">WORDS/MIN</span>
            </div>
          </div>
          <div className="bg-[#111111] p-6 border-t border-outline-variant/20 flex flex-col justify-between group hover:bg-[#161616] transition-colors rounded-b-xl border-x border-b border-transparent hover:border-white/5 cursor-default">
            <span className="text-[10px] font-mono text-on-surface-variant tracking-widest uppercase">Avg WPM (30d)</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-syne text-on-surface">118</span>
              <span className="text-xs font-mono text-primary">+4.2%</span>
            </div>
          </div>
          <div className="bg-[#111111] p-6 border-t border-outline-variant/20 flex flex-col justify-between group hover:bg-[#161616] transition-colors rounded-b-xl border-x border-b border-transparent hover:border-white/5 cursor-default">
            <span className="text-[10px] font-mono text-on-surface-variant tracking-widest uppercase">Tests Taken</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-syne text-on-surface">842</span>
              <span className="text-xs font-mono text-on-surface-variant">TOTAL</span>
            </div>
          </div>
          <div className="bg-[#111111] p-6 border-t border-primary/20 flex flex-col justify-between group hover:bg-[#161616] transition-colors rounded-b-xl border-x border-b border-transparent hover:border-white/5 cursor-default">
            <span className="text-[10px] font-mono text-on-surface-variant tracking-widest uppercase">Current Streak</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-syne text-primary">14</span>
              <span className="text-xs font-mono text-on-surface-variant">DAYS_ACTIVE</span>
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
                <button className="px-3 py-1 text-[10px] font-mono text-on-surface-variant hover:text-on-surface">7D</button>
                <button className="px-3 py-1 text-[10px] font-mono bg-primary text-on-primary-container rounded-sm">30D</button>
                <button className="px-3 py-1 text-[10px] font-mono text-on-surface-variant hover:text-on-surface">90D</button>
                <button className="px-3 py-1 text-[10px] font-mono text-on-surface-variant hover:text-on-surface">ALL</button>
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
                <path d="M0,80 Q10,75 20,60 T40,65 T60,40 T80,30 T100,20 L100,100 L0,100 Z" fill="url(#chartGradient)"></path>
                <path d="M0,80 Q10,75 20,60 T40,65 T60,40 T80,30 T100,20" fill="none" stroke="#1D9E75" strokeWidth="0.5"></path>
                <circle className="hover:r-2 transition-all cursor-pointer" cx="20" cy="60" fill="#1D9E75" r="1"></circle>
                <circle className="hover:r-2 transition-all cursor-pointer" cx="40" cy="65" fill="#1D9E75" r="1"></circle>
                <circle className="hover:r-2 transition-all cursor-pointer" cx="60" cy="40" fill="#1D9E75" r="1"></circle>
                <circle className="hover:r-2 transition-all cursor-pointer" cx="80" cy="30" fill="#1D9E75" r="1"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="border-t border-outline-variant/10 w-full"></div>
                <div className="border-t border-outline-variant/10 w-full"></div>
                <div className="border-t border-outline-variant/10 w-full"></div>
                <div className="border-t border-outline-variant/10 w-full"></div>
              </div>
            </div>
          </div>

          {/* Streak Calendar */}
          <div className="bg-[#111111] p-8 flex flex-col gap-6 rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="font-syne text-xl uppercase">Consistency</h3>
              <span className="text-[10px] font-mono text-primary">LVL 42</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1.5 overflow-hidden font-mono text-[8px] text-center text-outline-variant mt-2">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                
                <div className="aspect-square rounded-sm bg-primary"></div>
                <div className="aspect-square rounded-sm bg-primary/80"></div>
                <div className="aspect-square rounded-sm bg-neutral-900"></div>
                <div className="aspect-square rounded-sm bg-primary/40"></div>
                <div className="aspect-square rounded-sm bg-primary/90"></div>
                <div className="aspect-square rounded-sm bg-primary"></div>
                <div className="aspect-square rounded-sm bg-primary/20"></div>

                <div className="aspect-square rounded-sm bg-neutral-900"></div>
                <div className="aspect-square rounded-sm bg-primary/40"></div>
                <div className="aspect-square rounded-sm bg-primary/60"></div>
                <div className="aspect-square rounded-sm bg-primary"></div>
                <div className="aspect-square rounded-sm bg-primary/10"></div>
                <div className="aspect-square rounded-sm bg-neutral-900"></div>
                <div className="aspect-square rounded-sm bg-neutral-900"></div>

                <div className="aspect-square rounded-sm bg-primary"></div>
                <div className="aspect-square rounded-sm bg-primary/80"></div>
                <div className="aspect-square rounded-sm bg-primary"></div>
                <div className="aspect-square rounded-sm bg-primary/40"></div>
                <div className="aspect-square rounded-sm bg-primary/90"></div>
                <div className="aspect-square rounded-sm bg-primary"></div>
                <div className="aspect-square rounded-sm bg-primary/60"></div>
                
                <div className="aspect-square rounded-sm bg-neutral-900"></div>
                <div className="aspect-square rounded-sm bg-primary/40"></div>
                <div className="aspect-square rounded-sm bg-primary/60"></div>
                <div className="aspect-square rounded-sm bg-primary"></div>
                <div className="aspect-square rounded-sm bg-primary/10"></div>
                <div className="aspect-square rounded-sm bg-neutral-900"></div>
                <div className="aspect-square rounded-sm bg-neutral-900"></div>
                
                <div className="aspect-square rounded-sm bg-primary"></div>
                <div className="aspect-square rounded-sm bg-primary/80"></div>
            </div>

            <div className="mt-auto pt-6 border-t border-outline-variant/10">
              <p className="text-xs font-mono text-on-surface-variant">Last activity detected: <span className="text-on-surface">Today, 14:22</span></p>
              <div className="mt-3 h-1 bg-neutral-900 overflow-hidden">
                <div className="h-full bg-primary w-[75%] shadow-teal-glow"></div>
              </div>
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

            <div className="flex flex-col gap-2 max-w-4xl mx-auto w-full">
              <div className="flex gap-1 justify-center">
                <div className="w-12 h-12 bg-primary/80 flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">Q</div>
                <div className="w-12 h-12 bg-primary flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">W</div>
                <div className="w-12 h-12 bg-primary/90 flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">E</div>
                <div className="w-12 h-12 bg-error/40 flex items-center justify-center font-mono text-on-surface text-xs rounded-sm">R</div>
                <div className="w-12 h-12 bg-primary/70 flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">T</div>
                <div className="w-12 h-12 bg-primary/60 flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">Y</div>
                <div className="w-12 h-12 bg-primary flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">U</div>
                <div className="w-12 h-12 bg-primary flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">I</div>
                <div className="w-12 h-12 bg-primary/90 flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">O</div>
                <div className="w-12 h-12 bg-primary flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">P</div>
              </div>
              <div className="flex gap-1 justify-center ml-4">
                <div className="w-12 h-12 bg-primary flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">A</div>
                <div className="w-12 h-12 bg-primary/80 flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">S</div>
                <div className="w-12 h-12 bg-primary/90 flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">D</div>
                <div className="w-12 h-12 bg-error/60 flex items-center justify-center font-mono text-on-surface text-xs rounded-sm">F</div>
                <div className="w-12 h-12 bg-primary/70 flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">G</div>
                <div className="w-12 h-12 bg-primary/60 flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">H</div>
                <div className="w-12 h-12 bg-primary flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">J</div>
                <div className="w-12 h-12 bg-primary flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">K</div>
                <div className="w-12 h-12 bg-primary/90 flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">L</div>
              </div>
              <div className="flex gap-1 justify-center ml-8">
                <div className="w-12 h-12 bg-error flex items-center justify-center font-mono text-on-primary text-xs rounded-sm">Z</div>
                <div className="w-12 h-12 bg-primary/80 flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">X</div>
                <div className="w-12 h-12 bg-primary/90 flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">C</div>
                <div className="w-12 h-12 bg-primary flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">V</div>
                <div className="w-12 h-12 bg-primary/70 flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">B</div>
                <div className="w-12 h-12 bg-primary/60 flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">N</div>
                <div className="w-12 h-12 bg-primary flex items-center justify-center font-mono text-on-primary-container text-xs rounded-sm">M</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-outline-variant/10">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-on-surface-variant uppercase">Critical Weakness</span>
                <span className="text-xl font-syne text-error mt-1">Z KEY</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-on-surface-variant uppercase">Peak Precision</span>
                <span className="text-xl font-syne text-primary">J KEY</span>
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
