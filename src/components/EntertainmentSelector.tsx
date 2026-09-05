"use client";

import { motion } from 'framer-motion';
import { Music } from 'lucide-react';
import { TAP_ANIMATION, SPRING_CONFIG_QUICK } from '@/lib/animations';

const options = [
  { label: 'Beyakooo', tag: 'CH.01', url: 'spotify:playlist:0KSrhygf74dHRge1AmoAUt' },
  { label: '🥷🏿 Trap', tag: 'CH.02', url: 'spotify:playlist:4mqOCbTwQ2NUzFsKZnQ3YT' },
  { label: 'Rock & Chill', tag: 'CH.03', url: 'spotify:playlist:6ACBy2RHlSjUIrrr2iWHmr' },
  { label: '0600 💊', tag: 'CH.04', url: 'spotify:playlist:2ijtVRH8rnUBsatc60N7Jr' },
  { label: 'Old but Gold', tag: 'CH.05', url: 'spotify:playlist:6c3erhsizpRRLjZub5shsB' },
  { label: 'Mix Diario', tag: 'CH.06', url: 'spotify:playlist:37i9dQZF1E371Blon1t7ay' },
];

export default function EntertainmentSelector() {
  return (
    <div className="mt-4 mb-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 flex items-center gap-1.5">
          <Music size={11} className="text-zinc-400" />
          <span>SYS.AUDIO // MODO VIAJE</span>
        </h3>
        <span className="text-[9px] font-mono text-zinc-600 uppercase">
          SPOTIFY BUS
        </span>
      </div>
      
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 -mx-4 px-4 snap-x">
        {options.map((opt, index) => (
          <motion.a
            key={opt.label}
            href={opt.url}
            whileTap={TAP_ANIMATION}
            className="snap-start shrink-0 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-sm px-3 py-1.5 transition-colors hover:border-zinc-700 hover:bg-zinc-800 shadow-none"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, ...SPRING_CONFIG_QUICK }}
          >
            <span className="text-[9px] font-mono font-bold text-safety-orange border border-safety-orange/40 bg-safety-orange/10 px-1.5 py-0.5 rounded-sm">
              {opt.tag}
            </span>
            <span className="text-xs font-mono font-semibold text-zinc-200">{opt.label}</span>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
