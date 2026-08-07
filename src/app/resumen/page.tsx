"use client";

import { motion } from 'framer-motion';
import { ChevronLeft, CloudSun, Newspaper, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import NativeCard from '@/core/components/ui/NativeCard';

export default function ResumenDiarioPage() {
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
            Resumen Diario
          </h1>
        </div>
      </header>

      {/* Clima */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <CloudSun size={16} /> Clima
        </h2>
        <NativeCard className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 p-5 flex items-center justify-between">
          <div>
            <p className="text-3xl font-black text-white">24°C</p>
            <p className="text-sm font-semibold text-blue-400 mt-1">Parcialmente nublado</p>
          </div>
          <CloudSun size={48} className="text-blue-400 opacity-80" />
        </NativeCard>
      </section>

      {/* Novedades */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <Newspaper size={16} /> Novedades
        </h2>
        <NativeCard className="bg-zinc-900/60 border border-zinc-800 p-4">
          <ul className="flex flex-col gap-3">
            <li className="flex gap-3 items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
              <p className="text-sm text-zinc-300 leading-relaxed">No hay alertas de transporte para hoy.</p>
            </li>
            <li className="flex gap-3 items-start">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
              <p className="text-sm text-zinc-300 leading-relaxed">Recordá hidratarte durante la tarde.</p>
            </li>
          </ul>
        </NativeCard>
      </section>

      {/* Agenda del Día */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <CalendarClock size={16} /> Próximos
        </h2>
        <NativeCard className="bg-zinc-900/60 border border-zinc-800 p-6 flex flex-col items-center justify-center text-center gap-2">
          <CalendarClock size={32} className="text-zinc-600 mb-2" />
          <p className="text-zinc-400 font-medium">No hay eventos próximos hoy.</p>
        </NativeCard>
      </section>

    </motion.div>
  );
}
