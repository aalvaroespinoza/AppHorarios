"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, Wallet, Zap } from 'lucide-react';
import Link from 'next/link';
import { WeatherWidget } from '@/features/resumen/WeatherWidget';
import { NewsCarousel } from '@/features/resumen/NewsCarousel';
import { TravelMode } from '@/features/resumen/TravelMode';

import { useFinanzas } from '@/hooks/useFinanzas';
import { useDeadlines } from '@/hooks/useDeadlines';
import { useBateriaMental } from '@/hooks/useBateriaMental';

interface NewsItem {
  title: string;
  summary: string;
  url: string;
}

interface BriefingData {
  greeting: string;
  news: NewsItem[];
}

const MOCK_NEWS: NewsItem[] = [
  {
    title: "Nueva máquina en HackTheBox",
    summary: "Aprende a vulnerar servicios SMB y escalar privilegios con las nuevas tácticas de S4vitar.",
    url: "https://hackthebox.com"
  },
  {
    title: "Vulnerabilidad Zero-Day en Windows",
    summary: "Microsoft lanza parche urgente. Aprende cómo explotarla en entornos controlados.",
    url: "https://thehackernews.com"
  },
  {
    title: "Certificación eJPT: Tips para aprobar",
    summary: "Los mejores consejos y metodologías de Pentesting para tu examen.",
    url: "https://medium.com"
  }
];

export default function ResumenDiarioPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);

  // Hooks state
  const { transacciones, isMounted: finanzasMounted } = useFinanzas();
  const { deadlines, isMounted: deadlinesMounted } = useDeadlines();
  const { tareas: bateriaTareas, isMounted: bateriaMounted } = useBateriaMental();
  
  useEffect(() => {
    setIsMounted(true);
    
    const fetchBriefing = async () => {
      try {
        const res = await fetch('/api/briefing');
        if (res.ok) {
          const data = await res.json();
          if (!data || !data.news || data.news.length === 0) {
             setBriefing({ greeting: "¡Buen día, Alvaro!", news: MOCK_NEWS });
          } else {
             setBriefing(data);
          }
        } else {
          setBriefing({ greeting: "¡Buen día, Alvaro!", news: MOCK_NEWS });
        }
      } catch (e) {
        console.error("Error fetching briefing", e);
        setBriefing({ greeting: "¡Buen día, Alvaro!", news: MOCK_NEWS });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBriefing();
  }, []);

  if (!isMounted) return <div className="min-h-[100dvh] bg-gray-50 dark:bg-[#0a0a0c]" />;

  const displayNews = briefing?.news || MOCK_NEWS;

  // -- Cálculos "De un vistazo" --
  const hoyStr = new Date().toDateString();
  const gastosHoy = transacciones
    .filter(t => t.tipo === 'gasto' && new Date(t.fecha).toDateString() === hoyStr)
    .reduce((acc, t) => acc + Number(t.monto), 0);

  const hoyIso = new Date().toISOString().split('T')[0];
  const proximos = deadlines.filter(d => d.fecha >= hoyIso).sort((a,b) => a.fecha.localeCompare(b.fecha));
  const proximoEvento = proximos[0];

  const bateriaPendiente = bateriaTareas.filter(t => !t.completada);
  let costeGasto = 0;
  bateriaPendiente.forEach(t => {
     if (t.energia === 'alta') costeGasto += 30;
     else if (t.energia === 'media') costeGasto += 20;
     else costeGasto += 10;
  });
  const energiaActual = Math.max(0, 100 - costeGasto);
  let batteryColor = "text-emerald-500 border-emerald-500/20 bg-emerald-500/10";
  let batteryIconColor = "text-emerald-500";
  if (energiaActual < 30) {
    batteryColor = "text-red-500 border-red-500/20 bg-red-500/10";
    batteryIconColor = "text-red-500";
  } else if (energiaActual <= 70) {
    batteryColor = "text-amber-500 border-amber-500/20 bg-amber-500/10";
    batteryIconColor = "text-amber-500";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 min-h-[100dvh] relative bg-gray-50 dark:bg-[#0a0a0c] text-neutral-900 dark:text-white pb-24 overflow-x-hidden"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex flex-col gap-4 mt-2">
        <Link 
          href="/boveda"
          className="w-10 h-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full flex items-center justify-center text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors shadow-sm shrink-0"
        >
          <ChevronLeft size={20} />
        </Link>
        <div className="flex flex-col items-start gap-4">
          <div className="w-full">
            {loading ? (
              <div className="h-8 w-3/4 bg-gray-200 dark:bg-zinc-800/50 animate-pulse rounded-lg" />
            ) : (
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                {briefing?.greeting || '¡Buen día, Alvaro!'}
              </h1>
            )}
          </div>
          
          {/* De un vistazo */}
          {(finanzasMounted && deadlinesMounted && bateriaMounted) && (
            <div className="flex overflow-x-auto snap-x hide-scrollbar gap-3 w-[calc(100vw-2rem)] sm:w-full pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 items-center">
              
              <Link href="/tareas" className="snap-start shrink-0 flex items-center gap-2 bg-white dark:bg-neutral-800/60 border border-gray-100 dark:border-neutral-700 rounded-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors shadow-sm active:scale-95">
                <Calendar size={15} className="text-indigo-500" />
                <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-neutral-300">
                  {proximoEvento ? `${proximoEvento.hora || 'Hoy'} - ${proximoEvento.titulo}` : 'Día libre'}
                </span>
              </Link>
              
              {gastosHoy > 0 && (
                <Link href="/finanzas" className="snap-start shrink-0 flex items-center gap-2 bg-white dark:bg-neutral-800/60 border border-gray-100 dark:border-neutral-700 rounded-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors shadow-sm active:scale-95">
                  <Wallet size={15} className="text-rose-500" />
                  <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-neutral-300">
                    ${gastosHoy.toLocaleString()} hoy
                  </span>
                </Link>
              )}

              <Link href="/focus" className={`snap-start shrink-0 flex items-center gap-2 border rounded-full px-4 py-2 transition-colors shadow-sm active:scale-95 ${batteryColor}`}>
                <Zap size={15} className={batteryIconColor} />
                <span className="text-xs sm:text-sm font-bold">
                  {energiaActual}%
                </span>
              </Link>
            </div>
          )}

          <WeatherWidget />
        </div>
      </header>

      {/* Carrete de Noticias */}
      <NewsCarousel news={displayNews} loading={loading} />

      {/* Modo Viaje */}
      <TravelMode />

    </motion.div>
  );
}
