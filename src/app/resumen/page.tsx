"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, CloudSun, Newspaper, CalendarClock, Clock, Headphones, Guitar, Radio, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import NativeCard from '@/core/components/ui/NativeCard';
import { useAgenda } from '@/hooks/useAgenda';

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
        {loading ? (
          <div className="h-10 w-3/4 bg-zinc-800/50 animate-pulse rounded-lg" />
        ) : (
          <h1 className="text-3xl font-black tracking-tight text-white leading-tight">
            {briefing?.greeting || 'Buenos días, Álvaro.'}
          </h1>
        )}
        <p className="text-sm text-zinc-400 font-medium">
          Este es tu resumen para hoy.
        </p>
      </header>

      {/* Clima */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <CloudSun size={16} /> Clima
        </h2>
        <NativeCard className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 p-5 flex items-center justify-between">
          <div>
            {loading ? (
              <div className="flex flex-col gap-2">
                <div className="h-8 w-20 bg-blue-500/20 animate-pulse rounded-md" />
                <div className="h-4 w-32 bg-blue-500/10 animate-pulse rounded-md" />
              </div>
            ) : (
              <>
                <p className="text-3xl font-black text-white">{briefing?.weather?.split(',')[0] || '24°C'}</p>
                <p className="text-sm font-semibold text-blue-400 mt-1">{briefing?.weather?.split(',')[1]?.trim() || 'Despejado'}</p>
              </>
            )}
          </div>
          <CloudSun size={48} className="text-blue-400 opacity-80" />
        </NativeCard>
      </section>

      {/* Agenda del Día */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <CalendarClock size={16} /> Agenda de Hoy
        </h2>
        
        {hayEventos ? (
          <div className="flex flex-col gap-3">
            {agendaDelDia.map((evt, idx) => (
              <NativeCard key={idx} className="bg-zinc-900/60 border border-zinc-800 p-4 flex gap-4 items-center">
                <div className="flex flex-col items-center justify-center shrink-0 w-12 h-12 bg-zinc-800 rounded-xl">
                  <Clock size={16} className="text-zinc-400 mb-0.5" />
                  <span className="text-xs font-bold text-zinc-300">{evt.horaInicio}</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-white text-base leading-tight">{evt.titulo}</h3>
                  <p className="text-sm text-zinc-400">{evt.horaFin ? `Hasta las ${evt.horaFin}` : 'Evento de hoy'}</p>
                </div>
              </NativeCard>
            ))}
          </div>
        ) : (
          <NativeCard className="bg-zinc-900/40 border border-zinc-800/60 border-dashed p-6 flex flex-col items-center justify-center text-center gap-2">
            <CalendarClock size={32} className="text-zinc-600 mb-1" />
            <p className="text-zinc-400 font-medium">Tienes el día libre. No hay eventos programados.</p>
          </NativeCard>
        )}
      </section>

      {/* Carrete de Noticias */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <Newspaper size={16} /> Para Leer Hoy
        </h2>
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-4">
          {loading ? (
            // Skeletons
            [1, 2, 3].map(i => (
              <NativeCard key={i} className="min-w-[80vw] sm:min-w-72 bg-zinc-900/40 border border-zinc-800 p-5 snap-center flex flex-col gap-3">
                <div className="h-5 w-3/4 bg-zinc-800 animate-pulse rounded" />
                <div className="h-16 w-full bg-zinc-800/50 animate-pulse rounded" />
              </NativeCard>
            ))
          ) : (
            briefing?.news?.map((item, idx) => (
              <NativeCard key={idx} className="min-w-[80vw] sm:min-w-72 bg-zinc-900/80 border border-zinc-800 p-5 snap-center flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-white leading-tight">{item.title}</h3>
                  <p className="text-sm text-zinc-400 line-clamp-3">{item.summary}</p>
                </div>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 w-max bg-indigo-500/10 px-3 py-1.5 rounded-full"
                >
                  Leer artículo <ExternalLink size={12} />
                </a>
              </NativeCard>
            ))
          )}
        </div>
      </section>

      {/* Modo Viaje */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <Headphones size={16} /> Modo Viaje
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <a href="https://open.spotify.com/genre/trap" target="_blank" rel="noopener noreferrer" className="flex flex-col gap-2 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 active:scale-95 transition-all">
            <Radio size={24} className="text-emerald-400" />
            <span className="font-bold text-sm text-zinc-200">Trap & Rap</span>
          </a>
          <a href="https://open.spotify.com/genre/rock" target="_blank" rel="noopener noreferrer" className="flex flex-col gap-2 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 active:scale-95 transition-all">
            <Guitar size={24} className="text-indigo-400" />
            <span className="font-bold text-sm text-zinc-200">Rock Nacional</span>
          </a>
        </div>
      </section>

    </motion.div>
  );
}
