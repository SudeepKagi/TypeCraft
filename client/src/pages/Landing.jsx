import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  motion, 
  AnimatePresence, 
  useInView, 
  useSpring, 
  useMotionValue 
} from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Flame, 
  BarChart, 
  Code2, 
  BrainCircuit, 
  Flag, 
  ChevronDown, 
  Github, 
  Twitter, 
  MessageSquare,
  Zap,
  ChevronRight
} from 'lucide-react';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import useAuthStore from '../store/authStore';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Logo } from '../components/ui/Logo';

// --- CUSTOM HOOKS ---

const useMagnetic = (multiplier = 1) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    try {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const distanceX = clientX - centerX;
        const distanceY = clientY - centerY;
        
        const maxShift = 12 * multiplier;
        const moveX = (distanceX / (width / 2)) * maxShift;
        const moveY = (distanceY / (height / 2)) * maxShift;
        
        x.set(moveX);
        y.set(moveY);
    } catch (err) {
        // Silently fail if calculation errors occur
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { ref, x: springX, y: springY, handleMouseMove, handleMouseLeave };
};

// --- COMPONENTS ---

const MagneticButton = ({ children, className = "", onClick, type = "primary" }) => {
  const { ref, x, y, handleMouseMove, handleMouseLeave } = useMagnetic();
  
  const baseStyles = "relative px-8 py-4 rounded-xl font-heading font-black uppercase tracking-widest transition-shadow duration-300 flex items-center gap-2 z-10 select-none overflow-hidden hover:scale-[1.02] active:scale-[0.98]";
  const typeStyles = type === "primary" 
    ? "bg-[#1D9E75] text-white shadow-[0_0_20px_rgba(29,158,117,0.2)]"
    : "border border-[#1D9E75] text-[#1D9E75]";

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className={`${baseStyles} ${typeStyles} ${className}`}
      onClick={onClick}
    >
      <div className="relative z-20 flex items-center gap-2">
        {children}
      </div>
    </motion.button>
  );
};

const AutoTypingDemo = () => {
  const demoText = "The quick brown fox jumps over the lazy dog. Type at the speed of thought with TypeCraft. Master your muscle memory.";
  const [index, setIndex] = useState(0);
  const [wpm, setWpm] = useState(0);

  useEffect(() => {
    let active = true;
    const typingInterval = setInterval(() => {
        if (!active) return;
        setIndex((prev) => (prev + 1) % (demoText.length + 1));
    }, 75);

    const wpmInterval = setInterval(() => {
        if (!active) return;
        setWpm((prev) => prev < 84 ? prev + 1 : 84);
    }, 100);

    return () => {
        active = false;
        clearInterval(typingInterval);
        clearInterval(wpmInterval);
    };
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto mt-16 p-8 rounded-xl border border-[#1E1E1E] bg-white/[0.03] backdrop-blur-[10px] shadow-2xl">
      <div className="font-mono text-xl md:text-2xl leading-relaxed min-h-[120px] text-left text-[#444444]">
        {demoText.split("").map((char, i) => {
          let color = "#444444";
          if (i < index) color = "#F0F0F0";
          if (i === index) color = "#1D9E75";
          
          return (
            <span key={i} style={{ color }} className="relative transition-colors duration-100">
              {char}
              {i === index && (
                <span className="absolute left-0 bottom-[-2px] w-[2px] h-[1.2em] bg-[#1D9E75] animate-caret-pulse translate-y-[0.1em]"></span>
              )}
            </span>
          );
        })}
      </div>
      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="flex flex-col items-start text-left">
          <span className="tech-label opacity-60">Room Status</span>
          <span className="text-sm font-heading text-[#F0F0F0] font-black uppercase">OPTIMIZED_STREAM</span>
        </div>
        <div className="text-right">
          <span className="tech-label opacity-60">Average Speed</span>
          <div className="text-3xl font-heading text-[#1D9E75] font-black italic">{wpm} <span className="text-xs">WPM</span></div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ value, label, delay = 0 }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    
    return (
        <motion.div 
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay }}
            className="flex-1 min-w-[240px] p-8 bg-[#111111] hover:bg-[#161616] border-l-2 border-[#1D9E75]/20 hover:border-[#1D9E75] transition-all duration-300 group text-left"
        >
            <div className="text-[32px] font-heading font-black text-[#1D9E75] mb-1">
                {value}
            </div>
            <div className="tech-label opacity-60 group-hover:opacity-100 transition-opacity">{label}</div>
        </motion.div>
    );
}

const FeatureCard = ({ icon: Icon, title, desc, index }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="p-8 rounded-xl border border-[#1E1E1E] bg-white/[0.03] backdrop-blur-[10px] hover:border-[#1D9E75]/40 hover:shadow-[inset_0_0_30px_rgba(29,158,117,0.04)] transition-all duration-300 h-full group text-left flex flex-col"
        >
            <div className="w-12 h-12 rounded-lg bg-[#1D9E75]/10 flex items-center justify-center text-[#1D9E75] mb-6 group-hover:scale-110 transition-transform duration-300">
                {Icon && <Icon size={24} />}
            </div>
            <h3 className="text-xl font-heading font-black uppercase text-[#F0F0F0] mb-3 tracking-tight leading-none">{title}</h3>
            <p className="text-[#888888] text-sm leading-relaxed">{desc}</p>
        </motion.div>
    );
};

const Step = ({ number, title, desc, index }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div 
            ref={ref}
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="flex-1 relative text-left"
        >
            <div className="mb-6 flex items-center">
                <div className="w-12 h-12 rounded-full bg-[#1D9E75] flex items-center justify-center text-white font-heading font-black text-lg shadow-[0_0_20px_rgba(29,158,117,0.3)]">
                    {number}
                </div>
                {index < 2 && (
                    <div className="hidden md:block flex-1 h-[2px] border-t-2 border-dashed border-[#1D9E75]/20 ml-4 mr-0"></div>
                )}
            </div>
            <h4 className="text-xl brutal-heading text-[#F0F0F0] mb-2">{title}</h4>
            <p className="text-[#888888] text-sm leading-relaxed max-w-[240px]">{desc}</p>
        </motion.div>
    );
};

const Landing = () => {
  const navigate = useNavigate();
  const [init, setInit] = useState(false);

  useEffect(() => {
    let active = true;
    initParticlesEngine(async (engine) => {
        try {
            await loadSlim(engine);
        } catch (e) {
            console.error("Particles init failed", e);
        }
    }).then(() => {
      if (active) setInit(true);
    });

    return () => { active = false; };
  }, []);

  const headlineLines = [
    "Type at the",
    "speed of",
    "thought"
  ];

  const totalLetters = headlineLines.join("").length;
  let letterCount = 0; // Global counter for consistent stagger delay

  const particlesOptions = useMemo(() => ({
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    particles: {
      color: { value: "#1D9E75" },
      links: { enable: false },
      move: { enable: false },
      number: {
        density: { enable: true, area: 800 },
        value: 40,
      },
      opacity: { value: 0.1 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 2 } },
    },
    detectRetina: true,
  }), []);

  return (
    <PageWrapper hideNav={true}>
      <div className="bg-[#0A0A0A] text-[#F0F0F0] font-inter selection:bg-[#1D9E75]/30 selection:text-[#1D9E75] min-h-screen relative overflow-x-hidden">
        
        {/* --- HERO SECTION --- */}
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 px-8 overflow-hidden z-10">
            {init && (
                <Particles
                    id="tsparticles"
                    options={particlesOptions}
                    className="absolute inset-0 z-0 pointer-events-none"
                />
            )}
            
            <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="border border-[#1D9E75]/30 bg-[#1D9E75]/10 text-[#1D9E75] text-[11px] font-mono tracking-[4px] uppercase px-4 py-2 rounded-full mb-8 z-10"
                >
                  ● NEURAL ROOM ACTIVATED
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="relative group mb-12"
                >
                    <div className="absolute inset-[-20px] bg-[#1D9E75]/10 blur-[40px] rounded-full group-hover:bg-[#1D9E75]/20 transition-all duration-1000" />
                    <Logo size={120} className="relative z-10" />
                </motion.div>

                <motion.h1 
                    className="text-4xl sm:text-5xl md:text-[120px] brutal-heading mb-8 flex flex-col items-center"
                    initial="hidden"
                    animate="visible"
                >
                    {headlineLines.map((line, lineIndex) => (
                      <div key={lineIndex} className="flex flex-wrap justify-center">
                        {line.split("").map((char, charIndex) => {
                          const i = letterCount++;
                          return (
                            <motion.span
                                key={`${lineIndex}-${charIndex}`}
                                variants={{
                                    hidden: { opacity: 0, y: 40 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                transition={{ duration: 0.6, delay: 0.4 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                                className="inline-block"
                            >
                                {char === " " ? "\u00A0" : char}
                            </motion.span>
                          );
                        })}
                      </div>
                    ))}
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ duration: 0.4, delay: 0.4 + totalLetters * 0.04 + 0.4 }}
                    className="text-[#F0F0F0] text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium"
                >
                    The next evolution of competitive typing. Ultra-low latency input, neural training sessions, and global professional rankings.
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + totalLetters * 0.04 + 0.8 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-6"
                >
                    <MagneticButton onClick={() => navigate('/auth')}>
                        Start Typing <Zap size={18} fill="currentColor" />
                    </MagneticButton>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 + totalLetters * 0.04 + 1.2 }}
                >
                    <AutoTypingDemo />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0.4 + totalLetters * 0.04 + 2
                  }}
                  className="mt-16 text-[#444444] hover:text-[#1D9E75] transition-colors cursor-pointer"
                >
                  <ChevronDown size={32} />
                </motion.div>
            </div>
        </section>

        {/* --- STATS SECTION --- */}
        <section className="relative z-10 w-full bg-[#111111] border-y border-[#1E1E1E] py-16">
            <div className="max-w-7xl mx-auto px-8 flex flex-wrap gap-0">
                <StatCard value="2.4M" label="Races Run" delay={0.1} />
                <StatCard value="142 WPM" label="All-time Record" delay={0.2} />
                <StatCard value="48K" label="Online Now" delay={0.3} />
                <StatCard value="99.9%" label="Input Accuracy" delay={0.4} />
            </div>
        </section>

        {/* --- FEATURES SECTION --- */}
        <section className="py-32 px-8 max-w-7xl mx-auto relative z-10" id="features">
            <div className="text-left mb-20 space-y-4">
                <span className="text-[#1D9E75] text-xs font-mono tracking-widest block mb-4">// CORE_MODULES</span>
                <h2 className="text-4xl md:text-7xl brutal-heading text-left">Everything you need to type better</h2>
                <p className="text-[#888888] text-lg font-medium tech-label !tracking-normal text-left">Engineered for perfection, built for speed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { icon: Flag, title: "Multiplayer Race", desc: "Compete with typists worldwide in real-time lobbies with zero-latency synchronization." },
                    { icon: BrainCircuit, title: "AI Trainer", desc: "Our neural algorithms analyze your key-press stability and generate custom drills." },
                    { icon: Code2, title: "Code Mode", desc: "Master syntax with our specialized code snippet library across 20+ programming languages." },
                    { icon: BarChart, title: "Analytics", desc: "Deep performance insights, heatmaps, and burst-speed frequency analysis." },
                    { icon: Flame, title: "Streak System", desc: "Build momentum with daily sessions and unlock limited-edition professional badges." },
                    { icon: Trophy, title: "Tournament Room", desc: "Join official Pro Series brackets every weekend for massive XP rewards and ranking." }
                ].map((feature, i) => (
                    <FeatureCard key={i} {...feature} index={i} />
                ))}
            </div>

            {/* MARQUEE TICKER */}
            <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#111111] border-y border-[#1E1E1E] py-4 mt-24 overflow-hidden">
                <div className="flex whitespace-nowrap animate-marquee">
                    {[1, 2].map((loop) => (
                      <div key={loop} className="flex items-center">
                        {[
                          "MULTIPLAYER RACE", "AI TRAINER", "CODE MODE", "GLOBAL RANKINGS", 
                          "STREAK SYSTEM", "TOURNAMENTS", "NEURAL TRAINING", "REAL-TIME SYNC"
                        ].map((item, i) => (
                          <div key={i} className="flex items-center px-8">
                            <span className="font-mono text-xs text-[#444444] uppercase tracking-[4px]">{item}</span>
                            <span className="text-[#1D9E75] ml-16">●</span>
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
            </div>
        </section>

        {/* --- HOW IT WORKS --- */}
        <section className="py-32 bg-[#050505] border-y border-[#1E1E1E] relative z-10">
            <div className="max-w-7xl mx-auto px-8">
                <div className="text-left mb-20">
                    <span className="text-[#1D9E75] text-xs font-mono tracking-widest block mb-4">// ROOM_INIT</span>
                    <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight brutal-heading uppercase">Get started in seconds</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-16 md:gap-8">
                    <Step number="1" title="Create your account" desc="Sign up instantly with Google or GitHub and initialize your profile." index={0} />
                    <Step number="2" title="Take your first test" desc="Complete a 15-second baseline test to calibrate your starting rank." index={1} />
                    <Step number="3" title="Race and improve" desc="Join high-stakes races, train daily, and climb the global leaderboards." index={2} />
                </div>
            </div>
        </section>

        {/* --- SPEED SHOWCASE SECTION --- */}
        <section className="py-32 px-8 relative z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#1D9E75]/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div className="space-y-8 text-left">
              <span className="text-[#1D9E75] text-xs font-mono tracking-widest">// PERFORMANCE_METRICS</span>
              <h2 className="text-5xl md:text-7xl brutal-heading leading-none uppercase">
                YOUR WEAKNESS.<br/>
                <span className="text-[#1D9E75]">OUR TARGET.</span>
              </h2>
              <p className="text-[#888888] text-lg leading-relaxed max-w-md">
                TypeCraft's neural AI maps every keystroke error, finds your worst bigrams, and generates custom passages engineered to destroy your weak spots.
              </p>
              <ul className="space-y-4">
                {[
                  "Identifies your top 10 error bigrams in real time",
                  "Generates AI passages targeting your weak keys",
                  "Tracks improvement per session with delta scores",
                  "Heatmap shows exactly which fingers slow you down"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#888888] text-sm">
                    <span className="text-[#1D9E75] mt-0.5 flex-shrink-0">→</span>
                    {item}
                  </li>
                ))}
              </ul>
              <MagneticButton onClick={() => navigate('/train')}>
                Start AI Training
              </MagneticButton>
            </div>

            {/* Right: Keyboard Heatmap Visual */}
            <div className="p-8 rounded-xl border border-[#1E1E1E] bg-white/[0.02] space-y-3 z-10">
              <div className="text-[10px] font-mono text-[#888888] tracking-widest uppercase mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse" />
                KEYSTROKE_HEATMAP — LIVE SESSION
              </div>
              {[
                ['Q','W','E','R','T','Y','U','I','O','P'],
                ['A','S','D','F','G','H','J','K','L'],
                ['Z','X','C','V','B','N','M']
              ].map((row, ri) => (
                <div key={ri} className={`flex gap-1 md:gap-2 justify-center ${ri === 1 ? 'ml-2 md:ml-4' : ri === 2 ? 'ml-4 md:ml-8' : ''}`}>
                  {row.map((key, ki) => {
                    const heatColors = [
                      '#1D9E75','#2aad82','#63991A',
                      '#EF9F27','#e07820','#E24B4A',
                      '#1D9E75','#63991A','#EF9F27','#E24B4A'
                    ];
                    const color = heatColors[(ri * 4 + ki) % heatColors.length];
                    return (
                      <div key={ki} 
                        className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-md flex items-center justify-center text-[9px] md:text-[11px] font-mono font-bold transition-all duration-300 hover:scale-110 cursor-default border border-white/5"
                        style={{ 
                          backgroundColor: color + '20',
                          color: color,
                          borderColor: color + '40'
                        }}>
                        {key}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className="pt-4 border-t border-[#1E1E1E] flex justify-between text-[10px] font-mono text-[#888888] tracking-wider">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#1D9E75]/30 inline-block" />
                  ACCURATE
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#EF9F27]/30 inline-block" />
                  SLOW
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#E24B4A]/30 inline-block" />
                  ERROR ZONE
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* --- LEADERBOARD SECTION --- */}
        <section className="py-32 px-8 max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-16 space-y-4">
                <span className="text-[#1D9E75] text-xs font-mono tracking-widest block mb-4 uppercase">// GLOBAL_SENSING</span>
                <div className="flex flex-col items-center gap-4">
                  <h2 className="text-4xl md:text-6xl brutal-heading uppercase">See where you rank</h2>
                  <span className="flex items-center gap-2 text-xs font-mono text-[#888888]">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> LIVE
                  </span>
                </div>
            </div>

            <div className="rounded-xl border border-[#1E1E1E] bg-white/[0.02] overflow-x-auto shadow-2xl custom-scrollbar">
                <table className="w-full text-left font-mono min-w-[600px] md:min-w-0">
                    <thead className="bg-[#111111] border-b border-[#1E1E1E]">
                        <tr>
                            {['Rank', 'User', 'WPM', 'Accuracy', 'Tests'].map(h => (
                                <th key={h} className="px-6 py-4 text-[10px] uppercase text-[#888888] tracking-widest">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { rank: 1, name: "NeonSpirit", wpm: 148, acc: 99.8, tests: 2405, color: "border-amber-400", change: "↑ +2", changeType: "up" },
                            { rank: 2, name: "Cypher_X", wpm: 142, acc: 99.2, tests: 1842, color: "border-neutral-400", change: "↑ +1", changeType: "up" },
                            { rank: 3, name: "Zenith", wpm: 139, acc: 98.9, tests: 3102, color: "border-orange-400", change: "↑ +3", changeType: "up" },
                            { rank: 4, name: "Room_9", wpm: 135, acc: 99.5, tests: 942, color: "border-transparent", change: "↓ -1", changeType: "down" },
                            { rank: 5, name: "Bit_Runner", wpm: 131, acc: 97.4, tests: 1205, color: "border-transparent", change: "↓ -1", changeType: "down" }
                        ].map((user, i) => (
                            <motion.tr 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-20px" }}
                                transition={{ duration: 0.3, delay: i * 0.06 }}
                                className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors border-l-4 ${user.color}`}
                            >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-4">
                                    <span>{user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}</span>
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${user.changeType === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                      {user.change}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#1D9E75]/20 border border-white/10 flex items-center justify-center font-heading font-black text-[10px]">
                                            {user.name.charAt(0)}
                                        </div>
                                        <span className="font-heading font-black uppercase text-[#F0F0F0]">{user.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-[#1D9E75] font-bold">{user.wpm}</td>
                                <td className="px-6 py-4 text-[#888888]">{user.acc}%</td>
                                <td className="px-6 py-4 text-[#444444]">{user.tests}</td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-12 text-center">
                <MagneticButton type="ghost" onClick={() => navigate('/auth')}>
                    View Full Leaderboard
                </MagneticButton>
            </div>
        </section>

        {/* --- TESTIMONIALS SECTION --- */}
        <section className="py-32 px-8 bg-[#050505] border-y border-[#1E1E1E] relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-3">
              <span className="text-[#1D9E75] text-xs font-mono tracking-widest block mb-4">// FIELD_REPORTS</span>
              <h2 className="text-4xl md:text-6xl brutal-heading uppercase">
                WHAT TYPISTS SAY
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  quote: "Went from 87 WPM to 134 WPM in 3 weeks. The AI trainer found patterns I never noticed.", 
                  name: "NeonSpirit", 
                  stat: "↑ 47 WPM",
                  seed: "neon"
                },
                { 
                  quote: "The race mode is insanely competitive. Nothing motivates you like losing to someone typing 150 WPM.", 
                  name: "Cypher_X", 
                  stat: "148 WPM PB",
                  seed: "cypher"
                },
                { 
                  quote: "Keyboard heatmap alone is worth it. I had no idea I was dropping 6% of my E keys.", 
                  name: "Zenith", 
                  stat: "99.2% ACC",
                  seed: "zenith"
                }
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-8 rounded-xl border border-[#1E1E1E] bg-white/[0.02] hover:border-[#1D9E75]/30 transition-all duration-300 flex flex-col gap-6 text-left"
                >
                  <p className="text-[#888888] text-sm leading-relaxed italic flex-1">"{t.quote}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-[#1E1E1E]">
                    <div className="flex items-center gap-3">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.seed}`}
                        className="w-8 h-8 rounded-full bg-[#1D9E75]/20 border border-white/10"
                        alt={t.name}
                      />
                      <span className="font-mono text-sm font-bold text-[#F0F0F0] uppercase">
                        {t.name}
                      </span>
                    </div>
                    <span className="text-[#1D9E75] text-xs font-mono font-bold bg-[#1D9E75]/10 px-3 py-1 rounded-full text-nowrap">
                      {t.stat}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- CTA BANNER --- */}
        <section className="py-40 relative overflow-hidden bg-[#111111] border-y border-white/5 z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1D9E75]/10 rounded-full blur-[120px] pointer-events-none"></div>
            
            <div className="relative z-10 max-w-4xl mx-auto px-8 text-center space-y-10">
                <h2 className="text-5xl md:text-[120px] brutal-heading leading-none uppercase">Ready to type faster?</h2>
                
                <div className="flex flex-wrap items-center justify-center gap-4 text-[#888888] text-xs font-mono tracking-widest uppercase">
                  <span>48K TYPISTS</span>
                  <span className="text-[#1D9E75]">●</span>
                  <span>142 WPM RECORD</span>
                  <span className="text-[#1D9E75]">●</span>
                  <span>FREE FOREVER</span>
                </div>

                <div className="flex justify-center pt-4">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-[#1D9E75] rounded-xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse-ring"></div>
                        <MagneticButton 
                            className="!px-12 !py-6 !text-lg !rounded-xl"
                            onClick={() => navigate('/auth')}>
                            Start for Free
                        </MagneticButton>
                    </div>
                </div>
            </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="bg-[#0A0A0A] pt-24 pb-12 px-8 border-t border-[#1E1E1E] relative z-10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20 items-center">
                    <div className="lg:col-span-4 space-y-6 text-left">
                        <Link to="/" className="flex items-center gap-2">
                            <Logo size={40} />
                            <span className="text-2xl font-heading font-black tracking-tighter uppercase">TypeCraft</span>
                        </Link>
                        <p className="text-[#888888] text-sm leading-relaxed font-medium">
                            The ultimate arena for competitive typing athletes. Race harder. Train smarter. Break the sound barrier.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://github.com/SudeepKagi" target="_blank" rel="noreferrer" className="p-2 bg-white/[0.03] border border-white/5 rounded-lg text-[#444444] hover:text-[#1D9E75] transition-colors"><Github size={20} /></a>
                            <a href="https://www.linkedin.com/in/sudeep-kagi-b87657324/" target="_blank" rel="noreferrer" className="p-2 bg-white/[0.03] border border-white/5 rounded-lg text-[#444444] hover:text-[#1D9E75] transition-colors">
                              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                            </a>
                            <a href="mailto:sudeepskagi@gmail.com" className="p-2 bg-white/[0.03] border border-white/5 rounded-lg text-[#444444] hover:text-[#1D9E75] transition-colors"><MessageSquare size={20} /></a>
                        </div>
                    </div>

                    <div className="lg:col-span-8 bg-[#111111] p-4 md:p-10 rounded-2xl border border-[#1E1E1E] overflow-hidden shadow-2xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1D9E75]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                            ROOM_QUICK_TEST
                        </div>
                        <div className="font-mono text-lg text-[#F0F0F0]/40 leading-relaxed italic cursor-pointer group-hover:text-[#F0F0F0]/60 transition-colors">
                            The world belongs to the efficient. Type fast, think faster. This is your training ground for excellence.
                        </div>
                        <div className="mt-4 flex justify-end">
                            <span className="text-xs font-mono text-[#1D9E75] font-bold">Resync session to start typing →</span>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-[#1E1E1E] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[#444444] text-[12px] font-medium tracking-tight">© 2026 TypeCraft. Engineered by <span className="text-[#888888]">Sudeep S</span>. All systems active.</p>
                    <div className="flex gap-8">
                        <a href="#" className="text-[#444444] text-[12px] hover:text-[#888888] transition-colors">Privacy</a>
                        <a href="#" className="text-[#444444] text-[12px] hover:text-[#888888] transition-colors">Terms</a>
                        <a href="#" className="text-[#444444] text-[12px] hover:text-[#888888] transition-colors">Status</a>
                    </div>
                </div>
            </div>
        </footer>

        {/* --- GLOBAL CSS --- */}
        <style dangerouslySetInnerHTML={{ __html: `
            @keyframes caret-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
            }
            .animate-caret-pulse {
                animation: caret-pulse 1s infinite steps(1);
            }
            @keyframes pulse-ring {
                0% { transform: scale(1); opacity: 0.2; }
                50% { transform: scale(1.1); opacity: 0.4; }
                100% { transform: scale(1.2); opacity: 0; }
            }
            .animate-pulse-ring {
                animation: pulse-ring 3s infinite;
            }
            @keyframes marquee {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 30s linear infinite;
            }
        ` }} />

      </div>
    </PageWrapper>
  );
};

export default Landing;
