"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function VaultWidgetAsync() {
  return (
    <Link href="/boveda" className="block group">
      <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-[28px] p-5 flex flex-col gap-2 aspect-square justify-between hover:bg-neutral-800/50 transition-all shadow-md active:scale-95">
        <div className="flex items-center justify-between">
          <span className="text-2xl">🗄️</span>
          <ArrowUpRight size={15} className="text-neutral-600 group-hover:text-white transition-colors" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-neutral-500 font-medium mb-1">Bóveda</p>
          <p className="text-lg font-bold text-white truncate">
            Menú de Apps
          </p>
        </div>
      </div>
    </Link>
  );
}
