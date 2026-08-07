"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus, Minus } from 'lucide-react';
import NativeCard from '@/core/components/ui/NativeCard';

export function MateTracker() {
  const [level, setLevel] = useState(0); // 0 to 4 (max 4 termos/vasos)
  const MAX_LEVEL = 4;

  const addLevel = () => {
    if (level < MAX_LEVEL) setLevel(level + 1);
  };

  const removeLevel = () => {
    if (level > 0) setLevel(level - 1);
  };

  const fillPercentage = (level / MAX_LEVEL) * 100;

  return (
    <NativeCard className="bg-zinc-900/60 border border-zinc-800 p-5 flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <h3 className="font-bold text-white flex items-center gap-1.5">
          <Droplets size={16} className="text-emerald-400" />
          Hidratación / Mate
        </h3>
        <p className="text-sm text-zinc-400 font-medium">
          {level === 0 ? 'Aún no arrancaste' : `${level} / ${MAX_LEVEL} termos hoy`}
        </p>
        <div className="flex gap-2 mt-3">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={removeLevel}
            className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            <Minus size={18} />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={addLevel}
            className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
          >
            <Plus size={18} />
          </motion.button>
        </div>
      </div>
      
      {/* Liquid Container */}
      <div className="relative w-16 h-32 bg-zinc-950 rounded-full border-2 border-zinc-800/80 overflow-hidden shadow-inner">
        <motion.div 
          initial={false}
          animate={{ height: `${fillPercentage}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 10, mass: 1.2 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#8EAC50] to-[#A3C065] opacity-90 rounded-b-full"
          style={{ transformOrigin: 'bottom' }}
        />
        {/* Termo Lines Detail */}
        <div className="absolute inset-0 flex flex-col justify-evenly opacity-10 pointer-events-none">
          <div className="w-full h-px bg-white" />
          <div className="w-full h-px bg-white" />
          <div className="w-full h-px bg-white" />
        </div>
      </div>
    </NativeCard>
  );
}
