"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Zap, Timer, PenLine, Droplets, Bike, Dumbbell, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { BateriaMentalSection } from '@/features/academia/BateriaMentalSection';
import PomodoroWidget from '@/components/PomodoroWidget';
import NativeCard from '@/core/components/ui/NativeCard';
import { GymTracker } from '@/features/focus/GymTracker';
import { MateTracker } from '@/features/focus/MateTracker';



function StravaWidget() {
  const [data, setData] = useState<{ authenticated: boolean; activities?: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/strava/activities')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#fc4c02] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.authenticated) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-[#fc4c02]/10 to-[#fc4c02]/5 border border-[#fc4c02]/20 rounded-2xl p-5 flex items-center justify-between cursor-pointer shadow-sm"
        onClick={() => window.location.href = '/api/strava/auth'}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#fc4c02]/20 flex items-center justify-center shrink-0 border border-[#fc4c02]/30">
            <Bike size={24} className="text-[#fc4c02]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-[#fc4c02]/80 mb-0.5">Strava</span>
            <h3 className="font-bold text-white text-base">Conectar con Strava</h3>
          </div>
        </div>
      </motion.div>
    );
  }

  const act = data?.activities?.[0];

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
        <span className="text-xs font-bold uppercase tracking-widest text-[#fc4c02]/80 mb-0.5">Última Actividad</span>
        <h3 className="font-bold text-white text-base">{act?.name || 'Ciclismo'}</h3>
        <p className="text-sm text-zinc-400 font-medium">
          {act ? `${(act.distance / 1000).toFixed(1)} km • ${Math.floor(act.moving_time / 60)}m` : '0 km • 0m'}
        </p>
      </div>
    </motion.div>
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
        <StravaWidget />
        <GymTracker />
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
