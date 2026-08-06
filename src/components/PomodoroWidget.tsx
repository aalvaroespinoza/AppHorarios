"use client";

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PomodoroWidget() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  return (
    <div className="flex flex-col items-center gap-2 w-full mt-2">
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
      
      <a 
        href="shortcuts://run-shortcut?name=Pomodoro"
        className="text-zinc-500 text-xs font-medium hover:text-zinc-300 transition-colors flex items-center gap-1"
      >
        ⏱️ Usar timer nativo de iOS
      </a>
    </div>
  );
}
