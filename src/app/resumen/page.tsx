"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, CloudSun, Newspaper, CalendarClock, Music, BookOpen, Clock, Zap } from 'lucide-react';
import Link from 'next/link';
import NativeCard from '@/core/components/ui/NativeCard';
import { useAgenda } from '@/hooks/useAgenda';

interface WeatherData {
  temp: number;
  description: string;
}

export default function ResumenDiarioPage() {
  const agenda = useAgenda();
  const [isMounted, setIsMounted] = useState(false);
  const [greeting, setGreeting] = useState("Hola");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  
  // Obtener fecha de hoy en ISO
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  useEffect(() => {
    setIsMounted(true);
    
    // Dynamic greeting
    const hour = today.getHours();
    if (hour < 12) setGreeting("Buenos días");
    else if (hour < 20) setGreeting("Buenas tardes");
    else setGreeting("Buenas noches");
    
    // Fetch Weather (Open-Meteo for Cordoba: -31.42, -64.18)
    const fetchWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-31.42&longitude=-64.18&current_weather=true');
        const data = await res.json();
        const current = data.current_weather;
        if (current) {
          let desc = "Despejado";
          if (current.weathercode > 0) desc = "Nublado";
          if (current.weathercode > 50) desc = "Lluvioso";
          setWeather({ temp: Math.round(current.temperature), description: desc });
        }
      } catch (e) {
        console.error("Error fetching weather", e);
      }
    };
    
    fetchWeather();
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
        <h1 className="text-3xl font-black tracking-tight text-white leading-tight">
          {greeting}, Álvaro.
        </h1>
        <p className="text-sm text-zinc-400 font-medium">
          Este es tu resumen para hoy.
        </p>
      </header>

      {/* Clima */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <CloudSun size={16} /> Clima (Córdoba)
        </h2>
        <NativeCard className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 p-5 flex items-center justify-between">
          <div>
            {weather ? (
              <>
                <p className="text-3xl font-black text-white">{weather.temp}°C</p>
                <p className="text-sm font-semibold text-blue-400 mt-1">{weather.description}</p>
              </>
            ) : (
              <p className="text-sm text-zinc-400">Cargando clima...</p>
            )}
          </div>
          <CloudSun size={48} className="text-blue-400 opacity-80" />
        </NativeCard>
      </section>

      {/* Atajos Rápidos */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <Zap size={16} /> Atajos
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer" className="flex flex-col gap-2 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 active:scale-95 transition-all">
            <Music size={24} className="text-emerald-400" />
            <span className="font-bold text-sm text-zinc-200">Música</span>
          </a>
          <a href="https://medium.com" target="_blank" rel="noopener noreferrer" className="flex flex-col gap-2 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 active:scale-95 transition-all">
            <BookOpen size={24} className="text-indigo-400" />
            <span className="font-bold text-sm text-zinc-200">Lectura</span>
          </a>
        </div>
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

    </motion.div>
  );
}
