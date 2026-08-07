"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
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
  
  useEffect(() => {
    setIsMounted(true);
    
    const fetchBriefing = async () => {
      try {
        const res = await fetch('/api/briefing');
        if (res.ok) {
          const data = await res.json();
          // Fallback if API returned malformed or empty data
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

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 min-h-[100dvh] relative bg-gray-50 dark:bg-[#0a0a0c] text-neutral-900 dark:text-white pb-24"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex flex-col gap-4 mt-2">
        <Link 
          href="/boveda"
          className="w-10 h-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full flex items-center justify-center text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors shadow-sm"
        >
          <ChevronLeft size={20} />
        </Link>
        <div className="flex flex-col items-start gap-4">
          <div className="w-full">
            {loading ? (
              <div className="h-8 w-3/4 bg-gray-200 dark:bg-zinc-800/50 animate-pulse rounded-lg" />
            ) : (
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                ¡Buen día, Alvaro!
              </h1>
            )}
          </div>
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
