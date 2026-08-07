"use client";

import { motion } from 'framer-motion';
import { Headphones, Radio, Guitar, Music } from 'lucide-react';

export function TravelMode() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
        <Headphones size={16} /> Modo Viaje
      </h2>
      
      <div className="grid grid-cols-3 gap-3 w-full">
        <a 
          href="https://open.spotify.com/genre/trap" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl aspect-square active:scale-95 transition-all shadow-sm hover:border-emerald-500/50 group"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
            <Radio size={24} />
          </div>
          <span className="font-bold text-xs text-gray-700 dark:text-neutral-300 text-center">Trap & Rap</span>
        </a>

        <a 
          href="https://open.spotify.com/genre/rock" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl aspect-square active:scale-95 transition-all shadow-sm hover:border-indigo-500/50 group"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
            <Guitar size={24} />
          </div>
          <span className="font-bold text-xs text-gray-700 dark:text-neutral-300 text-center">Rock Nac.</span>
        </a>

        <a 
          href="https://open.spotify.com/genre/reggaeton" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl aspect-square active:scale-95 transition-all shadow-sm hover:border-rose-500/50 group"
        >
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
            <Music size={24} />
          </div>
          <span className="font-bold text-xs text-gray-700 dark:text-neutral-300 text-center">Reggaeton</span>
        </a>
      </div>
    </section>
  );
}
