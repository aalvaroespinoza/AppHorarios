"use client";

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PomodoroWidget() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [immersiveMode, setImmersiveMode] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && !immersiveMode) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, immersiveMode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const enterImmersive = () => {
    setImmersiveMode(true);
    // Hide Bottom Tab Bar by adding a global class to body if needed, 
    // but doing it visually via z-index overlay is safer.
    document.body.style.overflow = 'hidden';
  };

  const exitImmersive = () => {
    setImmersiveMode(false);
    document.body.style.overflow = 'unset';
  };

  const addFlowTime = () => {
    setTimeLeft(5 * 60);
    setIsActive(true);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  return (
    <>
      {/* Standard Widget */}
      <div className="flex flex-col items-center gap-3 w-full mt-2">
        <div className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-[24px] p-4 flex items-center justify-between shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20">
              <span className="text-xl">🍅</span>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider mb-0.5">Focus Time</span>
              <span className="text-3xl font-mono font-bold tracking-tighter text-white tabular-nums leading-none">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-zinc-950/50 p-1.5 rounded-full border border-zinc-800/50">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={resetTimer}
              className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw size={18} />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTimer}
              className={`w-12 h-12 flex items-center justify-center rounded-full shadow-md transition-colors ${
                isActive 
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' 
                  : 'bg-zinc-100 text-zinc-900'
              }`}
            >
              {isActive ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
            </motion.button>
          </div>
        </div>
        
        <button 
          onClick={enterImmersive}
          className="w-full flex items-center justify-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold py-3 rounded-2xl border border-indigo-500/20 transition-colors active:scale-95"
        >
          <Eye size={18} /> Entrar en Modo Foco
        </button>
      </div>

      {/* Immersive Overlay */}
      <AnimatePresence>
        {immersiveMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6"
          >
            <button 
              onClick={exitImmersive}
              className="absolute top-10 right-6 flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-sm font-medium tracking-wide uppercase"
            >
              Salir <X size={16} />
            </button>

            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="flex flex-col items-center gap-12"
            >
              <div className="flex flex-col items-center gap-4">
                <span className="text-zinc-500 font-bold tracking-[0.3em] uppercase text-sm">In Deep Work</span>
                <span className="text-8xl font-mono font-black tracking-tighter text-white tabular-nums">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>

              {timeLeft > 0 ? (
                <div className="flex items-center gap-6">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={resetTimer}
                    className="w-16 h-16 flex items-center justify-center rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800"
                  >
                    <RotateCcw size={24} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTimer}
                    className={`w-24 h-24 flex items-center justify-center rounded-full shadow-2xl ${
                      isActive 
                        ? 'bg-amber-500 text-black' 
                        : 'bg-white text-black'
                    }`}
                  >
                    {isActive ? <Pause size={32} className="fill-current" /> : <Play size={32} className="fill-current ml-2" />}
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={addFlowTime}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="bg-indigo-500 text-white font-black px-8 py-4 rounded-full text-lg shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:bg-indigo-400"
                >
                  Continuar en Flujo (+5 min)
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
