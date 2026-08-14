"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, BarChart3, Activity, Zap, 
  Calendar, ArrowUpRight, TrendingUp, Sparkles, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import { getStats, AnalyticsSummary } from '@/core/analytics/engine';
import { HabitHeatmap } from '@/features/insights/components/HabitHeatmap';
import { Skeleton } from '@/components/ui/Skeleton';
import { PAGE_TRANSITION, TAP_ANIMATION } from '@/lib/animations';

export default function EstadisticasPage() {
  const [range, setRange] = useState<number>(7);
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simular carga asíncrona real (permite que el Skeleton se muestre)
    const timer = setTimeout(() => {
      setStats(getStats(range));
      setIsLoading(false);
    }, 80);
    return () => clearTimeout(timer);
  }, [range]);

  const formatoMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(valor);
  };

  const hasActivity = stats ? stats.dailyActivity.some(d => d.count > 0) : false;
  const hasCategories = stats ? stats.categoryBreakdown.length > 0 : false;

  return (
    <motion.div
      {...PAGE_TRANSITION}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 min-h-[100dvh] bg-[#0a0a0c] text-white pb-28"
      style={{ paddingTop: 'max(1.2rem, env(safe-area-inset-top))' }}
    >
      {/* Header Estilo Umami */}
      <header className="flex items-center justify-between mt-1 px-1">
        <div className="flex items-center gap-3">
          <Link 
            href="/boveda"
            className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors shadow-sm active:scale-95"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Estadísticas <BarChart3 size={17} className="text-emerald-400" />
            </h1>
            <p className="text-[11px] text-neutral-500 font-medium">Panel analítico del sistema</p>
          </div>
        </div>

        {/* Range Selector */}
        <div className="flex bg-neutral-900 border border-neutral-800 p-0.5 rounded-xl">
          {[7, 30].map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                range === d
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {d}D
            </button>
          ))}
        </div>
      </header>

      {/* SECCIÓN 1: KPIs Principales (Umami Big Numbers) */}
      <section className="grid grid-cols-2 gap-y-6 gap-x-4 px-2 py-4 border-y border-neutral-800/80">
        <div>
          {isLoading ? (
            <Skeleton className="w-16 h-10 rounded-lg" />
          ) : (
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {stats!.tasksCompleted}
            </div>
          )}
          <div className="text-[11px] text-neutral-500 uppercase tracking-widest font-bold mt-1">
            Tareas Listas
          </div>
        </div>

        <div>
          {isLoading ? (
            <Skeleton className="w-16 h-10 rounded-lg" />
          ) : (
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {stats!.focusHours}h
            </div>
          )}
          <div className="text-[11px] text-neutral-500 uppercase tracking-widest font-bold mt-1">
            Horas de Foco
          </div>
        </div>

        <div>
          {isLoading ? (
            <Skeleton className="w-24 h-8 rounded-lg" />
          ) : (
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight truncate">
              {formatoMoneda(stats!.totalExpenses)}
            </div>
          )}
          <div className="text-[11px] text-neutral-500 uppercase tracking-widest font-bold mt-1">
            Gastos Totales
          </div>
        </div>

        <div>
          {isLoading ? (
            <Skeleton className="w-16 h-10 rounded-lg" />
          ) : (
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {stats!.travelsCount}
            </div>
          )}
          <div className="text-[11px] text-neutral-500 uppercase tracking-widest font-bold mt-1">
            Viajes BEC
          </div>
        </div>
      </section>

      {/* SECCIÓN 1.5: Mapa de Calor de Hábitos y Constancia (GitHub style) */}
      <section className="px-1">
        <HabitHeatmap />
      </section>

      {/* SECCIÓN 2: Activity Chart (Umami Minimalist Graph) */}
      <section className="flex flex-col gap-3 px-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Activity size={14} className="text-emerald-400" /> Actividad Diaria
          </span>
          <span className="text-[10px] text-neutral-500 font-mono">
            Últimos {range} días
          </span>
        </div>

        {isLoading ? (
          <Skeleton className="w-full h-44 rounded-xl mt-2" />
        ) : !hasActivity ? (
          <div className="w-full h-44 mt-2 flex flex-col items-center justify-center text-center text-neutral-500 gap-2 border border-dashed border-neutral-800 rounded-2xl">
            <Activity size={28} className="opacity-30" />
            <p className="text-xs font-medium">Sin actividad registrada</p>
            <p className="text-[10px] text-neutral-600">Usá la app para generar métricas reales</p>
          </div>
        ) : (
          <div className="w-full h-44 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats!.dailyActivity} margin={{ top: 10, right: 2, left: 2, bottom: 0 }}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#737373', fontSize: 11, fontWeight: 600 }}
                />
                <YAxis hide domain={[0, 'auto']} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)', radius: 8 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-neutral-900/95 border border-neutral-800 shadow-2xl rounded-xl px-3 py-2 backdrop-blur-xl">
                          <p className="text-[10px] uppercase font-bold text-neutral-400">{item.day} • {item.date}</p>
                          <p className="text-xs font-black text-emerald-400 mt-0.5">
                            {item.count} interacciones
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[6, 6, 2, 2]} 
                  fill="#10b981"
                  maxBarSize={range === 7 ? 32 : 12}
                >
                  {stats!.dailyActivity.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === stats!.dailyActivity.length - 1 ? '#10b981' : '#10b98180'}
                      className="transition-all hover:opacity-100" 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* SECCIÓN 3: Desglose por Módulos (Umami Breakdown Bars) */}
      <section className="flex flex-col gap-3 px-1 pt-4 border-t border-neutral-800/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Zap size={14} className="text-cyan-400" /> Distribución por Módulo
          </span>
          <span className="text-[10px] text-neutral-500 font-mono">
            Eventos registrados
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3 mt-1">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="w-full h-8 rounded-lg" />
            ))}
          </div>
        ) : !hasCategories ? (
          <div className="py-8 flex flex-col items-center justify-center text-center text-neutral-500 gap-2">
            <Zap size={24} className="opacity-30" />
            <p className="text-xs font-medium">Sin eventos por categoría</p>
            <p className="text-[10px] text-neutral-600">Los módulos registran actividad automáticamente</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-1">
            {stats!.categoryBreakdown.map((item) => (
              <div key={item.category} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-neutral-200">{item.category}</span>
                  <span className="font-mono text-neutral-400 text-[11px]">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/50">
                  <div 
                    className="h-full bg-emerald-500/80 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
