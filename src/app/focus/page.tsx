"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Zap, Timer, PenLine, Droplets, Bike, Dumbbell, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { BateriaMentalSection } from '@/features/academia/BateriaMentalSection';
import PomodoroWidget from '@/components/PomodoroWidget';
import NativeCard from '@/core/components/ui/NativeCard';

function MateTracker() {
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
      <div className="relative w-16 h-28 bg-zinc-950 rounded-[20px] border-2 border-zinc-800/80 overflow-hidden shadow-inner">
        <motion.div 
          initial={false}
          animate={{ height: `${fillPercentage}%` }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-600 to-emerald-400 opacity-90 rounded-b-[16px]"
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

function StravaCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-gradient-to-br from-[#fc4c02]/10 to-[#fc4c02]/5 border border-[#fc4c02]/20 rounded-2xl p-5 flex items-center gap-4 cursor-pointer shadow-sm"
    >
      <div className="w-12 h-12 rounded-full bg-[#fc4c02]/20 flex items-center justify-center shrink-0 border border-[#fc4c02]/30">
        <Bike size={24} className="text-[#fc4c02]" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase tracking-widest text-[#fc4c02]/80 mb-0.5">Actividad Strava</span>
        <h3 className="font-bold text-white text-base">Ciclismo Matutino</h3>
        <p className="text-sm text-zinc-400 font-medium">15.2 km • 45m 12s</p>
      </div>
    </motion.div>
  );
}

function GymCard() {
  const [sets, setSets] = useState([false, false, false, false, false, false, false, false, false]);

  const toggleSet = (index: number) => {
    const newSets = [...sets];
    newSets[index] = !newSets[index];
    setSets(newSets);
  };

  return (
    <NativeCard className="bg-zinc-900/60 border border-zinc-800 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell size={18} className="text-indigo-400" />
          <h3 className="font-bold text-white">Gimnasio (Push Day)</h3>
        </div>
        <span className="text-xs font-bold text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-full">
          {sets.filter(Boolean).length}/9 Series
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {sets.map((isDone, idx) => (
          <motion.button
            key={idx}
            whileTap={{ scale: 0.8 }}
            onClick={() => toggleSet(idx)}
            initial={false}
            animate={{ 
              scale: isDone ? [1, 1.2, 1] : 1,
              backgroundColor: isDone ? 'rgba(74, 222, 128, 0.2)' : 'rgba(39, 39, 42, 1)',
              borderColor: isDone ? 'rgba(74, 222, 128, 0.4)' : 'rgba(63, 63, 70, 1)'
            }}
            transition={{ duration: 0.3 }}
            className={`h-12 rounded-xl flex items-center justify-center border-2 transition-colors relative overflow-hidden`}
          >
            {isDone ? (
              <motion.span 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-emerald-400 font-bold text-sm"
              >
                ✓
              </motion.span>
            ) : (
              <span className="text-zinc-600 font-bold text-xs">S{idx + 1}</span>
            )}
          </motion.button>
        ))}
      </div>
    </NativeCard>
  );
}

export default function FocusPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.5 }}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 min-h-[100dvh] relative bg-[#0a0a0c] text-white pb-24"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex flex-col gap-2 mt-2">
        <Link 
          href="/boveda"
          className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors shadow-sm mb-2"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-3xl font-black tracking-tight text-white leading-tight">
          Focus Station
        </h1>
        <p className="text-sm text-zinc-400 font-medium">
          Controla tu energía, hidratación y entrenamiento.
        </p>
      </header>

      {/* Batería Mental */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <Zap size={16} /> Energía Diaria
        </h2>
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <BateriaMentalSection />
        </motion.div>
      </section>

      {/* Mate Tracker */}
      <section className="flex flex-col gap-3 mt-1">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <Droplets size={16} /> Hidratación
        </h2>
        <MateTracker />
      </section>

      {/* Fitness: Strava & Gym */}
      <section className="flex flex-col gap-4 mt-2">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <Bike size={16} /> Entrenamiento
        </h2>
        <StravaCard />
        <GymCard />
      </section>

      {/* Pomodoro */}
      <section className="flex flex-col gap-3 mt-2">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <Timer size={16} /> Pomodoro Tracker
        </h2>
        <PomodoroWidget />
      </section>

      {/* Notas Rápidas */}
      <section className="flex flex-col gap-3 mt-2">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <PenLine size={16} /> Notas Rápidas
        </h2>
        <textarea 
          placeholder="Escribe lo que tienes en mente..."
          className="w-full h-32 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 resize-none focus:outline-none focus:border-amber-500/50 transition-colors"
        />
      </section>
    </motion.div>
  );
}
