"use client";

import { motion } from 'framer-motion';
import { ExternalLink, Newspaper } from 'lucide-react';
import NativeCard from '@/core/components/ui/NativeCard';

interface NewsItem {
  title: string;
  summary: string;
  url: string;
}

interface NewsCarouselProps {
  news: NewsItem[];
  loading?: boolean;
}

const FALLBACK_NEWS: NewsItem[] = [
  {
    title: "Escalada de privilegios en SMB",
    summary: "Nuevas técnicas para explotar vulnerabilidades de red en entornos corporativos de Windows y Active Directory.",
    url: "https://medium.com/cybersecurity"
  },
  {
    title: "Guía rápida eJPT",
    summary: "Cheat sheet completo para pasar tu certificación eJPT a la primera, cubriendo pivoting y web exploits.",
    url: "https://medium.com/pentesting"
  },
  {
    title: "Últimas evasiones de AMSI",
    summary: "Cómo el malware moderno utiliza ofuscación y llamadas directas al sistema para burlar los antivirus EDR.",
    url: "https://medium.com/red-team"
  }
];

export function NewsCarousel({ news, loading = false }: NewsCarouselProps) {
  const displayNews = !loading && news.length === 0 ? FALLBACK_NEWS : news;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
        <Newspaper size={16} /> Para Leer Hoy
      </h2>
      
      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-4 w-full">
        {loading ? (
          // Skeletons
          [1, 2, 3].map(i => (
            <NativeCard key={i} className="min-w-[80vw] sm:min-w-[300px] bg-zinc-900/40 border border-zinc-800 p-5 snap-center flex flex-col gap-3">
              <div className="h-5 w-3/4 bg-zinc-800 animate-pulse rounded" />
              <div className="h-10 w-full bg-zinc-800/50 animate-pulse rounded" />
              <div className="h-6 w-24 bg-zinc-800/30 animate-pulse rounded-full mt-2" />
            </NativeCard>
          ))
        ) : (
          displayNews.map((item, idx) => (
            <motion.div 
              key={idx}
              className="min-w-[80vw] sm:min-w-[300px] snap-center bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-neutral-700 flex flex-col justify-between gap-4 shrink-0"
            >
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">{item.summary}</p>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                  Ciberseguridad
                </span>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-full active:scale-95"
                >
                  Medium <ExternalLink size={12} />
                </a>
              </div>
            </motion.div>
          ))
        )}


      </div>
    </section>
  );
}
