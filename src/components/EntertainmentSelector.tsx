"use client";

import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

const options = [
  { label: 'Playlist 1', url: 'spotify:playlist:0KSrhygf74dHRge1AmoAUt' },
  { label: 'Playlist 2', url: 'spotify:playlist:4mqOCbTwQ2NUzFsKZnQ3YT' },
  { label: 'Playlist 3', url: 'spotify:playlist:6ACBy2RHlSjUIrrr2iWHmr' },
  { label: 'Playlist 4', url: 'spotify:playlist:2ijtVRH8rnUBsatc60N7Jr' },
  { label: 'Playlist 5', url: 'spotify:playlist:6c3erhsizpRRLjZub5shsB' },
  { label: 'Playlist 6', url: 'spotify:playlist:37i9dQZF1E371Blon1t7ay' },
];

export default function EntertainmentSelector() {
  return (
    <div className="mt-6 mb-2">
      <h3 className="text-[13px] uppercase text-[var(--color-text-secondary)] font-medium tracking-wide mb-3 ml-1">
        Modo Viaje 🎧
      </h3>
      <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 -mx-4 px-4 snap-x">
        {options.map((opt, index) => (
          <motion.a
            key={opt.label}
            href={opt.url}
            whileTap={{ scale: 0.95 }}
            className="snap-start shrink-0 flex items-center gap-2 bg-zinc-800/80 border border-zinc-700/50 rounded-full px-4 py-2.5 transition-colors hover:bg-zinc-700"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 400, damping: 30 }}
          >
            <Music size={16} className="text-emerald-400" />
            <span className="text-sm font-semibold text-zinc-100">{opt.label}</span>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
