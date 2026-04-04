import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToasterContext = createContext();

export const useToaster = () => useContext(ToasterContext);

export const ToasterProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToasterContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-24 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className={`pointer-events-auto min-w-[300px] p-4 rounded-xl border flex items-center gap-4 bg-black/80 backdrop-blur-md shadow-2xl ${
                toast.type === 'error' ? 'border-red-500/30' : 
                toast.type === 'success' ? 'border-primary/30' : 
                'border-white/10'
              }`}
            >
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                toast.type === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                toast.type === 'success' ? 'bg-primary shadow-teal-glow-sm' : 
                'bg-neutral-500'
              }`}></div>
              
              <div className="flex-1">
                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-0.5">
                  System_Message :: {toast.type.toUpperCase()}
                </div>
                <div className="text-sm font-inter text-neutral-200 font-medium leading-tight">
                  {toast.message}
                </div>
              </div>

              <button 
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-white/5 rounded-lg transition-colors text-neutral-600 hover:text-neutral-300"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <ToastAutoTimer onExpire={() => removeToast(toast.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToasterContext.Provider>
  );
};

const ToastAutoTimer = ({ onExpire }) => {
  useEffect(() => {
    const timer = setTimeout(onExpire, 5000);
    return () => clearTimeout(timer);
  }, [onExpire]);
  return null;
};
