"use client";

import { motion } from 'framer-motion';
import { Headphones, Mic, Play } from 'lucide-react';

export function TravelMode() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
        <Headphones size={16} /> Modo Viaje
      </h2>
      
      <div className="grid grid-cols-2 gap-3 w-full">
        <a 
          href="https://open.spotify.com/show/TU_ID_AQUI" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl aspect-[4/3] active:scale-95 transition-all shadow-sm hover:border-emerald-500/50 group p-2"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
            <Mic size={24} />
          </div>
          <span className="font-bold text-xs sm:text-sm text-gray-700 dark:text-neutral-300 text-center">Tierra de Hackers</span>
        </a>

        <a 
          href="https://www.youtube.com/@ElPinguinodeMario" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl aspect-[4/3] active:scale-95 transition-all shadow-sm hover:border-red-500/50 group p-2"
        >
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
            <Play size={24} />
          </div>
          <span className="font-bold text-xs sm:text-sm text-gray-700 dark:text-neutral-300 text-center">Pingüino de Mario</span>
        </a>
      </div>
    </section>
  );
}
