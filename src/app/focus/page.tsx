"use client";

import { motion } from 'framer-motion';
import { ChevronLeft, Zap, Timer } from 'lucide-react';
import Link from 'next/link';
import { BateriaMentalSection } from '@/features/academia/BateriaMentalSection';
import NativeCard from '@/core/components/ui/NativeCard';

export default function FocusPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 min-h-[100dvh] relative bg-[#0a0a0c] text-white pb-24"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex items-center gap-3 mt-2">
        <Link 
          href="/boveda"
          className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors shadow-sm"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Focus & Energía
          </h1>
        </div>
      </header>

      {/* Batería Mental */}
      <section className="flex flex-col gap-3 mt-2">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <Zap size={16} /> Energía Diaria
        </h2>
        <BateriaMentalSection />
      </section>

      {/* Próximamente: Pomodoro */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <Timer size={16} /> Pomodoro Tracker
        </h2>
        <NativeCard className="bg-zinc-900/40 border border-zinc-800/60 border-dashed p-8 flex flex-col items-center justify-center text-center gap-3">
          <Timer size={36} className="text-zinc-600 mb-1" />
          <p className="text-sm text-zinc-400 font-medium">El módulo de Pomodoro e historial de concentración estará disponible próximamente.</p>
        </NativeCard>
      </section>

    </motion.div>
  );
}
