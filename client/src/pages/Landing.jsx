import React from 'react';
import { motion } from 'framer-motion';
import { PageWrapper } from '../components/layout/PageWrapper';
import useAuthStore from '../store/authStore';

const Landing = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  const handleLogin = (provider) => {
    window.location.href = `http://localhost:4000/auth/${provider}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen relative overflow-hidden bg-black text-white font-inter">
        {/* Neural Ambience */}
        <div className="absolute top-0 left-0 w-full h-[800px] bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.08)_0%,transparent_60%)] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-full h-[800px] bg-[radial-gradient(circle_at_70%_80%,rgba(34,211,238,0.05)_0%,transparent_60%)] pointer-events-none"></div>
        <div className="dot-overlay absolute inset-0 opacity-10"></div>

        <motion.main 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          {/* HERO SECTION */}
          <section className="pt-32 pb-24 px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-3 px-4 py-1.5 glass-card rounded-full border border-primary/20 bg-primary/5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary font-mono">Neural_Link_Protocol_v.2.4</span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-8xl font-syne font-black leading-[0.9] tracking-tighter uppercase italic max-w-5xl"
            >
              Compete. Improve. <br />
              <span className="text-primary italic drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]">Dominate.</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants} 
              className="mt-8 text-lg md:text-xl text-neutral-400 max-w-2xl font-medium leading-relaxed"
            >
              The world's most precise typing engine designed for elite performers. Experience sub-millisecond response times and neural-grade analytics.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-5 pt-10 justify-center">
              {!isAuthenticated ? (
                <div className="flex gap-4 flex-wrap justify-center">
                  <button 
                    onClick={() => handleLogin('google')}
                    className="px-8 py-4 bg-white text-neutral-900 font-syne font-black rounded-xl hover:scale-[1.05] transition-all flex items-center gap-3 active:scale-95 shadow-glow-sm"
                  >
                    <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-5 h-5" />
                    Get Started with Google
                  </button>
                  <button 
                    onClick={() => handleLogin('github')}
                    className="px-8 py-4 bg-neutral-900 text-white border border-white/10 font-syne font-black rounded-xl hover:scale-[1.05] transition-all flex items-center gap-3 active:scale-95"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.627-5.373-12-12-12"/></svg>
                    Continue with GitHub
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-10 py-5 bg-primary text-neutral-900 font-syne font-black rounded-xl shadow-teal-glow hover:scale-[1.05] transition-all uppercase tracking-widest active:scale-95"
                >
                  Enter_The_Arena
                </button>
              )}
            </motion.div>
          </section>

          {/* ENGINE TECHNICALS */}
          <section className="py-24 px-8 max-w-7xl mx-auto border-t border-white/5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div variants={itemVariants} className="space-y-8">
                <h2 className="text-4xl font-syne font-black uppercase italic text-white tracking-widest">
                  Zero-Latency <br />
                  <span className="text-primary italic">Engine.</span>
                </h2>
                <p className="text-neutral-400 leading-relaxed text-lg font-medium">
                  Built on a low-level binary protocol, TypeCraft delivers 0.02ms input-to-render latency. Our engine handles millions of keystrokes per second without dropped frames, ensuring your rhythm remains unbroken.
                </p>
                <div className="space-y-4">
                  {[
                    "Raw Socket Data Transmission",
                    "Sub-pixel Rendering Optimization",
                    "Anticipatory Character Pre-loading"
                  ].map((tech, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-mono text-neutral-300">
                      <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                      {tech}
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className="relative group">
                <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="glass-card p-1 rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative bg-black/80">
                  <div className="aspect-[4/3] bg-neutral-900/50 rounded-[14px] p-8 flex flex-col justify-center">
                     <div className="flex justify-between items-center mb-8">
                        <div className="text-[10px] font-mono text-primary uppercase tracking-[0.2em]">Live_Stream :: Protocol_0.02</div>
                        <div className="flex gap-2">
                           <div className="w-2 h-2 rounded-full bg-red-400"></div>
                           <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                           <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="h-2 w-3/4 bg-neutral-800 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             whileInView={{ width: "80%" }}
                             transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                             className="h-full bg-primary"
                           ></motion.div>
                        </div>
                        <div className="h-2 w-1/2 bg-neutral-800 rounded-full"></div>
                        <div className="h-2 w-2/3 bg-neutral-800 rounded-full"></div>
                     </div>
                     <div className="mt-12 flex items-center justify-between">
                        <span className="font-syne text-5xl font-black text-white italic">148<span className="text-xs font-mono text-neutral-500 uppercase ml-2">WPM</span></span>
                        <div className="text-right">
                           <div className="text-[8px] font-mono text-neutral-600 uppercase tracking-widest leading-none">LATENCY_MS</div>
                           <div className="text-xl font-mono font-bold text-primary italic">0.02ms</div>
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* COMPETITIVE PLAY */}
          <section className="py-32 px-8 max-w-7xl mx-auto bg-[#050505] relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-primary/2 blur-[100px] pointer-events-none"></div>
            <div className="relative z-10 text-center mb-20">
               <h2 className="text-4xl font-syne font-black uppercase italic text-white mb-4">Competitive Play</h2>
               <p className="text-neutral-500 text-sm font-medium uppercase tracking-[0.2em]">Race against the clock or against the world's best.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  id: "sprints", 
                  title: "1v1 Sprints", 
                  desc: "Head-to-head battles with real-time ghosting. No distractions, just pure speed and focus.",
                  btn: "Join Lobby"
                },
                { 
                  id: "pro", 
                  title: "Pro Series", 
                  desc: "Official weekly tournaments with massive XP rewards and unique cosmetic character drops.",
                  btn: "Register_Next"
                },
                { 
                  id: "raids", 
                  title: "Squad Raids", 
                  desc: "Group challenges where collective accuracy determines the global reward multiplier.",
                  btn: "Find a Squad"
                }
              ].map((mode, i) => (
                <motion.div 
                  key={mode.id}
                  variants={itemVariants}
                  whileHover={{ y: -10, borderColor: "rgba(34,211,238,0.2)" }}
                  className="glass-card p-8 rounded-2xl border border-white/5 flex flex-col justify-between group transition-all"
                >
                  <div>
                    <h3 className="text-xl font-syne font-black text-white italic uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">{mode.title}</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed font-medium mb-8 italic">{mode.desc}</p>
                  </div>
                  <button className="flex items-center gap-2 text-[10px] font-mono font-bold text-primary uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                    {mode.btn} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </section>

          {/* MASTER THE CRAFT */}
          <section className="py-24 px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <motion.div variants={itemVariants} className="order-2 lg:order-1 glass-card p-10 rounded-2xl border border-white/5 relative overflow-hidden">
                  <div className="grid grid-cols-8 gap-2">
                     {Array.from({ length: 32 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`aspect-square rounded-sm transition-colors duration-500 ${i % 3 === 0 ? 'bg-primary/40 shadow-[0_0_8px_rgba(34,211,238,0.2)]' : 'bg-neutral-900 border border-white/5'}`}
                        ></div>
                     ))}
                  </div>
                  <div className="mt-8 flex justify-between items-end">
                     <div>
                        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Finger_Heatmap</div>
                        <div className="text-xs font-mono text-primary font-bold italic">Index_Stability: 98.4%</div>
                     </div>
                     <div className="text-right">
                        <div className="text-[8px] font-mono text-neutral-600 uppercase mb-1">Live_Pulse</div>
                        <div className="w-16 h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                           <div className="w-2/3 h-full bg-primary"></div>
                        </div>
                     </div>
                  </div>
               </motion.div>
               <motion.div variants={itemVariants} className="order-1 lg:order-2 space-y-6">
                  <h2 className="text-4xl font-syne font-black uppercase italic text-white tracking-widest">Master <br />The Craft.</h2>
                  <p className="text-neutral-400 leading-relaxed font-medium">Our neural engine analyzes every single keystroke to identify your "weak links." It dynamically generates training drills focused on your specific speed-bottlenecks.</p>
                  <div className="space-y-6 pt-4">
                    <div>
                       <h4 className="text-white font-syne font-bold uppercase italic text-sm mb-1 tracking-widest">Heatmap Analysis</h4>
                       <p className="text-neutral-500 text-sm font-medium">See exactly which fingers are slowing you down with key-by-key pressure maps and latency tracking.</p>
                    </div>
                    <div>
                       <h4 className="text-white font-syne font-bold uppercase italic text-sm mb-1 tracking-widest">Dynamic Pacing</h4>
                       <p className="text-neutral-500 text-sm font-medium">The engine adjusts difficulty in real-time to keep you perfectly in the "flow state" for maximum growth.</p>
                    </div>
                  </div>
               </motion.div>
            </div>
          </section>

          {/* SOCIAL PROOF QUOTE */}
          <section className="py-32 px-8 max-w-5xl mx-auto text-center border-b border-white/5">
             <motion.div variants={itemVariants} className="space-y-10">
                <span className="material-symbols-outlined text-6xl text-primary/40 block">format_quote</span>
                <h2 className="text-2xl md:text-4xl font-syne font-black italic text-neutral-200 leading-tight tracking-tight">
                  "TypeCraft isn't just a trainer, it's an instrument. The tactile feedback and the sheer precision of the tracking engine are miles ahead of anything else I've ever used."
                </h2>
                <div className="flex flex-col items-center">
                   <div className="w-12 h-12 rounded-full border border-primary/40 p-0.5 bg-neutral-900 mb-3">
                      <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center font-black text-primary font-syne italic text-lg">P</div>
                   </div>
                   <span className="text-[10px] font-mono text-primary uppercase font-bold tracking-[0.3em]">Top 0.1% Operator // Pro Circuit</span>
                </div>
             </motion.div>
          </section>

          {/* NEURAL FOOTER */}
          <footer className="pt-24 pb-12 px-8 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 border-t border-white/5 mt-20">
            <div className="col-span-2 lg:col-span-1 space-y-6">
              <h3 className="font-syne font-black text-2xl tracking-tighter text-white">TYPECRAFT</h3>
              <p className="text-neutral-600 text-xs font-mono font-medium leading-relaxed uppercase">The world's highest performance typing engine. Precision-engineered for competitive play and rapid skill acquisition.</p>
              <div className="flex gap-4">
                 <div className="w-8 h-8 rounded bg-neutral-900 border border-white/5"></div>
                 <div className="w-8 h-8 rounded bg-neutral-900 border border-white/5"></div>
                 <div className="w-8 h-8 rounded bg-neutral-900 border border-white/5"></div>
              </div>
            </div>
            <div>
               <h5 className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-bold mb-6">Product</h5>
               <ul className="space-y-3 font-mono text-[10px] text-neutral-600 uppercase font-bold">
                 <li><button className="hover:text-primary transition-colors">Typing Engine</button></li>
                 <li><button className="hover:text-primary transition-colors">AI Trainer</button></li>
                 <li><button className="hover:text-primary transition-colors">Pro Mode</button></li>
                 <li><button className="hover:text-primary transition-colors">Tournaments</button></li>
               </ul>
            </div>
            <div>
               <h5 className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-bold mb-6">Community</h5>
               <ul className="space-y-3 font-mono text-[10px] text-neutral-600 uppercase font-bold">
                 <li><button className="hover:text-primary transition-colors">Leaderboards</button></li>
                 <li><button className="hover:text-primary transition-colors">Discord Server</button></li>
                 <li><button className="hover:text-primary transition-colors">Badges & Ranks</button></li>
                 <li><button className="hover:text-primary transition-colors">Squads</button></li>
               </ul>
            </div>
            <div>
               <h5 className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-bold mb-6">Resources</h5>
               <ul className="space-y-3 font-mono text-[10px] text-neutral-600 uppercase font-bold">
                 <li><button className="hover:text-primary transition-colors">Documentation</button></li>
                 <li><button className="hover:text-primary transition-colors">Latency Report</button></li>
                 <li><button className="hover:text-primary transition-colors">Developer API</button></li>
                 <li><button className="hover:text-primary transition-colors">Status</button></li>
               </ul>
            </div>
            <div>
               <h5 className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-bold mb-6">Company</h5>
               <ul className="space-y-3 font-mono text-[10px] text-neutral-600 uppercase font-bold">
                 <li><button className="hover:text-primary transition-colors">About Us</button></li>
                 <li><button className="hover:text-primary transition-colors">Privacy Policy</button></li>
                 <li><button className="hover:text-primary transition-colors">Terms of Service</button></li>
                 <li><button className="hover:text-primary transition-colors">Contact</button></li>
               </ul>
            </div>
          </footer>
          <div className="py-8 text-center text-neutral-800 text-[8px] font-mono uppercase tracking-[0.5em] border-t border-white/5 mx-8">
            Transmission_End // © 2026 TypeCraft Neural Systems
          </div>
        </motion.main>
      </div>
    </PageWrapper>
  );
};

export default Landing;
