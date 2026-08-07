"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, CalendarClock, Clock } from 'lucide-react';
import Link from 'next/link';
import NativeCard from '@/core/components/ui/NativeCard';
import { useAgenda } from '@/hooks/useAgenda';
import { WeatherWidget } from '@/features/resumen/WeatherWidget';
import { NewsCarousel } from '@/features/resumen/NewsCarousel';
import { TravelMode } from '@/features/resumen/TravelMode';

interface NewsItem {
  title: string;
  summary: string;
  url: string;
}

interface BriefingData {
  greeting: string;
  weather: string;
  news: NewsItem[];
}

export default function ResumenDiarioPage() {
  const agenda = useAgenda();
  const [isMounted, setIsMounted] = useState(false);
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Obtener fecha de hoy en ISO
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  useEffect(() => {
    setIsMounted(true);
    
    const fetchBriefing = async () => {
      try {
        const res = await fetch('/api/briefing');
        if (res.ok) {
          const data = await res.json();
          setBriefing(data);
        }
      } catch (e) {
        console.error("Error fetching briefing", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBriefing();
  }, []);

  if (!isMounted || !agenda.isMounted) return <div className="min-h-[100dvh] bg-[#0a0a0c]" />;

  const agendaDelDia = agenda.obtenerAgendaDelDia(todayISO);
  const hayEventos = agendaDelDia.length > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 min-h-[100dvh] relative bg-gray-50 dark:bg-[#0a0a0c] text-neutral-900 dark:text-white pb-24"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex flex-col gap-2 mt-2">
        <Link 
          href="/boveda"
          className="w-10 h-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full flex items-center justify-center text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors shadow-sm mb-2"
        >
          <ChevronLeft size={20} />
        </Link>
        <div className="flex flex-col items-start gap-4">
          <div className="w-full">
            {loading ? (
              <div className="h-10 w-3/4 bg-gray-200 dark:bg-zinc-800/50 animate-pulse rounded-lg" />
            ) : (
              <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
                {briefing?.greeting || 'Buenos días, Álvaro.'}
              </h1>
            )}
            <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium mt-1">
              Este es tu resumen para hoy.
            </p>
          </div>
          <WeatherWidget />
        </div>
      </header>

      {/* Agenda del Día */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-widest text-gray-500 dark:text-zinc-500 uppercase px-1 flex items-center gap-2">
          <CalendarClock size={16} /> Agenda de Hoy
        </h2>
        
        {hayEventos ? (
          <div className="flex flex-col gap-3">
            {agendaDelDia.map((evt, idx) => (
              <NativeCard key={idx} className="bg-white dark:bg-zinc-900/60 border border-gray-100 dark:border-zinc-800 p-4 flex gap-4 items-center shadow-sm">
                <div className="flex flex-col items-center justify-center shrink-0 w-12 h-12 bg-gray-50 dark:bg-zinc-800 rounded-xl">
                  <Clock size={16} className="text-gray-400 dark:text-zinc-400 mb-0.5" />
                  <span className="text-xs font-bold text-gray-600 dark:text-zinc-300">{evt.horaInicio}</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{evt.titulo}</h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400">{evt.horaFin ? `Hasta las ${evt.horaFin}` : 'Evento de hoy'}</p>
                </div>
              </NativeCard>
            ))}
          </div>
        ) : (
          <NativeCard className="bg-white/50 dark:bg-zinc-900/40 border border-gray-200/60 dark:border-zinc-800/60 border-dashed p-6 flex flex-col items-center justify-center text-center gap-2">
            <CalendarClock size={32} className="text-gray-400 dark:text-zinc-600 mb-1" />
            <p className="text-gray-500 dark:text-zinc-400 font-medium">Tienes el día libre. No hay eventos programados.</p>
          </NativeCard>
        )}
      </section>

      {/* Carrete de Noticias */}
      <NewsCarousel news={briefing?.news || []} loading={loading} />

      {/* Modo Viaje */}
      <TravelMode />

    </motion.div>
  );
}
