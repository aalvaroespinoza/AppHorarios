"use client";

import { Music2, ArrowUpRight } from 'lucide-react';

const options = [
  { label: 'Beyakooo', id: '0KSrhygf74dHRge1AmoAUt' },
  { label: '🥷🏿 Trap', id: '4mqOCbTwQ2NUzFsKZnQ3YT' },
  { label: 'Rock & Chill', id: '6ACBy2RHlSjUIrrr2iWHmr' },
  { label: '0600 💊', id: '2ijtVRH8rnUBsatc60N7Jr' },
  { label: 'Old but Gold', id: '6c3erhsizpRRLjZub5shsB' },
  { label: 'Mix Diario', id: '37i9dQZF1E371Blon1t7ay' },
];

export default function EntertainmentSelector() {
  return (
    <section className="min-w-0 pt-4" aria-label="Música para el viaje">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink"><Music2 size={17} className="text-accent" />Música para el camino</h3>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {options.map(option => <a key={option.id} href={'https://open.spotify.com/playlist/' + option.id} target="_blank" rel="noopener noreferrer" className="glass-button shrink-0 gap-2 text-sm">{option.label}<ArrowUpRight size={14} className="text-subtle" /></a>)}
      </div>
    </section>
  );
}
