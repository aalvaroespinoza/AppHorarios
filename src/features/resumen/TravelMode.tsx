"use client";

import { Mic, Play } from 'lucide-react';
import EntertainmentSelector from '@/components/EntertainmentSelector';

export function TravelMode() {
  return (
    <section className="flex flex-col">
      <EntertainmentSelector />

      <div className="flex flex-col gap-2 mt-2">
        <h3 className="text-[13px] uppercase text-[var(--color-text-secondary)] font-medium tracking-wide mb-1 ml-1">
          Podcasts & Shows 🎙️
        </h3>
        <div className="grid grid-cols-2 gap-3 w-full">
          <a 
            href="https://open.spotify.com/show/TU_ID_AQUI" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl active:scale-95 transition-all shadow-sm hover:border-emerald-500/50 group p-3"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex shrink-0 items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Mic size={18} />
            </div>
            <span className="font-bold text-xs sm:text-sm text-zinc-300 leading-tight">Tierra de Hackers</span>
          </a>

          <a 
            href="https://www.youtube.com/@ElPinguinodeMario" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl active:scale-95 transition-all shadow-sm hover:border-red-500/50 group p-3"
          >
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex shrink-0 items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
              <Play size={18} />
            </div>
            <span className="font-bold text-xs sm:text-sm text-zinc-300 leading-tight">Pingüino de Mario</span>
          </a>
        </div>
      </div>
    </section>
  );
}

