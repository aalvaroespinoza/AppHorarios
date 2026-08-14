"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Activity, Zap, ArrowRight, 
  ChevronDown, ChevronUp, Sparkles, TrendingUp, CheckCircle2, Clock
} from 'lucide-react';
import Link from 'next/link';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import { getStats, AnalyticsSummary } from '@/core/analytics/engine';
import { SPRING_CONFIG, TAP_ANIMATION } from '@/lib/animations';

export function AgendaStatsCard() {
  const [range, setRange] = useState<number>(7);
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setStats(getStats(range));
  }, [range]);

  if (!isMounted || !stats) return null;

  const hasActivity = stats.dailyActivity.some(d => d.count > 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_CONFIG}
      className="bg-gradient-to-br from-neutral-900/80 via-neutral-900/50 to-neutral-950/80 border border-neutral-800/80 rounded-3xl p-4.5 backdrop-blur-xl shadow-xl flex flex-col gap-3.5 relative overflow-hidden"
    >
      {/* Resplandor de fondo esmeralda */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header del Card con Toggle de Expandir */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <BarChart3 size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white tracking-tight leading-tight">
                Rendimiento & Stats
              </h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                En vivo
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
              {stats.tasksCompleted} tareas listas • {stats.focusHours}h foco
            </p>
          </div>
        </div>

        <motion.button
          whileTap={TAP_ANIMATION}
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-8 h-8 rounded-full bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/50 flex items-center justify-center text-neutral-300 transition-colors"
          title={isExpanded ? "Plegar métricas" : "Desplegar gráfico interactivo"}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </motion.button>
      </div>

      {/* Micro KPIs (Grid de 3 columnas) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-neutral-950/50 border border-neutral-800/60 rounded-2xl p-2.5 flex flex-col items-center text-center">
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Tareas</span>
          <span className="text-lg font-black text-white mt-0.5 leading-tight">{stats.tasksCompleted}</span>
          <span className="text-[9px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-0.5">
            <CheckCircle2 size={9} /> listas
          </span>
        </div>

        <div className="bg-neutral-950/50 border border-neutral-800/60 rounded-2xl p-2.5 flex flex-col items-center text-center">
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Foco</span>
          <span className="text-lg font-black text-cyan-300 mt-0.5 leading-tight">{stats.focusHours}h</span>
          <span className="text-[9px] text-cyan-400 font-semibold mt-0.5 flex items-center gap-0.5">
            <Clock size={9} /> acumuladas
          </span>
        </div>

        <div className="bg-neutral-950/50 border border-neutral-800/60 rounded-2xl p-2.5 flex flex-col items-center text-center">
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Asistencia</span>
          <span className="text-lg font-black text-violet-300 mt-0.5 leading-tight">{stats.classesAttended}</span>
          <span className="text-[9px] text-violet-400 font-semibold mt-0.5 flex items-center gap-0.5">
            <Zap size={9} /> cursadas
          </span>
        </div>
      </div>

      {/* Contenido Expandible: Gráfico de Actividad Interactivo */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={SPRING_CONFIG}
            className="flex flex-col gap-3 pt-2 border-t border-neutral-800/60 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={13} className="text-emerald-400" /> Actividad ({range}D)
              </span>

              {/* Selector 7D / 30D */}
              <div className="flex bg-neutral-950 border border-neutral-800 p-0.5 rounded-xl">
                {[7, 30].map(d => (
                  <button
                    key={d}
                    onClick={() => setRange(d)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all ${
                      range === d
                        ? 'bg-neutral-800 text-white shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {d}D
                  </button>
                ))}
              </div>
            </div>

            {/* Gráfico de barras minimalista */}
            {hasActivity ? (
              <div className="w-full h-28 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.dailyActivity} margin={{ top: 5, right: 2, left: 2, bottom: 0 }}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#737373', fontSize: 10, fontWeight: 600 }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)', radius: 6 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 shadow-xl">
                              <p className="text-[9px] uppercase font-bold text-neutral-400">{item.day} • {item.date}</p>
                              <p className="text-[11px] font-black text-emerald-400 mt-0.5">
                                {item.count} eventos
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 1, 1]} fill="#10b981" maxBarSize={range === 7 ? 24 : 8}>
                      {stats.dailyActivity.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === stats.dailyActivity.length - 1 ? '#10b981' : '#10b98180'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-5 text-center text-neutral-500 text-xs flex flex-col items-center gap-1">
                <Activity size={20} className="opacity-30" />
                <span>Sin actividad registrada en los últimos {range} días</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón a Dashboard Completo */}
      <Link href="/estadisticas" className="w-full block">
        <motion.div
          whileTap={TAP_ANIMATION}
          className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-[0.98] text-emerald-400 border border-emerald-500/25 rounded-2xl text-xs font-bold flex items-center justify-between py-2.5 px-3.5 transition-all group shadow-sm"
        >
          <span className="flex items-center gap-1.5 text-[11px]">
            <Sparkles size={13} className="text-emerald-400" />
            <span>Ver Dashboard de Estadísticas Completo</span>
          </span>
          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform shrink-0" />
        </motion.div>
      </Link>
    </motion.div>
  );
}
