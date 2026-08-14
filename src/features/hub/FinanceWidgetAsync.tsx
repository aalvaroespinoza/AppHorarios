"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, AlertCircle } from 'lucide-react';
import { useFinanzas } from '@/hooks/useFinanzas';

export function FinanceWidgetAsync() {
  const finanzas = useFinanzas();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatoMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(valor);
  };

  if (!isMounted) {
    return (
      <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-[28px] p-5 flex flex-col gap-2 aspect-square justify-between animate-pulse">
        <div className="w-8 h-8 rounded-full bg-neutral-800" />
        <div className="flex flex-col gap-1">
          <div className="w-16 h-3 bg-neutral-800 rounded" />
          <div className="w-24 h-5 bg-neutral-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <Link href="/finanzas" className="block group">
      <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-[28px] p-5 flex flex-col gap-2 aspect-square justify-between hover:bg-neutral-800/50 transition-all shadow-md active:scale-95">
        <div className="flex items-center justify-between">
          <span className="text-2xl">💸</span>
          <ArrowUpRight size={15} className="text-neutral-600 group-hover:text-white transition-colors" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-neutral-500 font-medium mb-1">Presupuesto</p>
          <p className="text-lg font-bold text-white truncate">
            {formatoMoneda(finanzas.balanceTotal || 0)}
          </p>
        </div>
      </div>
    </Link>
  );
}
