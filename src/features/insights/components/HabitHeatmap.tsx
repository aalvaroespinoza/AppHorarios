"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles, Calendar, CheckCircle2 } from 'lucide-react';
import { getHeatmapData, HeatmapDay } from '@/core/analytics/engine';

export function HabitHeatmap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Traer los últimos 105 días (15 semanas completas)
    setHeatmapData(getHeatmapData(105));
  }, []);

  // Organizar los datos en semanas (columnas de 7 días)
  const weeks = useMemo(() => {
    if (heatmapData.length === 0) return [];
    const result: HeatmapDay[][] = [];
    let currentWeek: HeatmapDay[] = [];

    heatmapData.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === heatmapData.length - 1) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });

    return result;
  }, [heatmapData]);

  // Calcular métricas de constancia y racha
  const { totalActiveDays, currentStreak, totalEvents } = useMemo(() => {
    let active = 0;
    let events = 0;
    let streak = 0;

    // Calcular racha contando desde hoy hacia atrás
    for (let i = heatmapData.length - 1; i >= 0; i--) {
      if (heatmapData[i].count > 0) {
        streak++;
      } else if (i < heatmapData.length - 1) {
        // Si el día anterior no tuvo actividad, termina la racha
        break;
      }
    }

    heatmapData.forEach((d) => {
      if (d.count > 0) active++;
      events += d.count;
    });

    return {
      totalActiveDays: active,
      currentStreak: streak,
      totalEvents: events
    };
  }, [heatmapData]);

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-neutral-800/80 hover:ring-1 hover:ring-neutral-600';
    if (count === 1) return 'bg-emerald-900 hover:ring-1 hover:ring-emerald-500';
    if (count === 2) return 'bg-emerald-700 hover:ring-1 hover:ring-emerald-400';
    return 'bg-emerald-500 hover:ring-1 hover:ring-emerald-300 shadow-[0_0_6px_rgba(16,185,129,0.4)]';
  };

  if (!isMounted) return null;

  return (
    <div className="w-full bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-4.5 backdrop-blur-xl flex flex-col gap-3.5 shadow-xl">
      {/* Header del Mapa de Calor */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Flame size={15} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight leading-tight">
              Constancia & Hábitos
            </h3>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
              {totalActiveDays} días activos • Racha de {currentStreak} {currentStreak === 1 ? 'día' : 'días'}
            </p>
          </div>
        </div>

        {/* Badge de Racha */}
        {currentStreak > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <Flame size={12} className="text-amber-400 animate-pulse" />
            <span>{currentStreak}d racha</span>
          </span>
        )}
      </div>

      {/* Grilla GitHub Style Desplazable */}
      <div className="overflow-x-auto no-scrollbar pb-1 pt-1 -mx-1 px-1">
        <div className="inline-flex flex-col gap-1.5 min-w-max">
          <div className="flex gap-1.5">
            {/* Días de la semana abreviados */}
            <div className="flex flex-col justify-between text-[9px] font-bold text-neutral-600 pr-1 select-none">
              <span>L</span>
              <span>M</span>
              <span>V</span>
              <span>D</span>
            </div>

            {/* Columnas de semanas */}
            <div className="flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDay(day)}
                      className={`w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-[2px] transition-all cursor-pointer ${getColorClass(day.count)} ${
                        selectedDay?.date === day.date ? 'ring-2 ring-white scale-125 z-10' : ''
                      }`}
                      title={`${day.date}: ${day.count} ${day.count === 1 ? 'actividad' : 'actividades'}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Tooltip de Info al tocar un día */}
          {selectedDay && (
            <div className="mt-1 bg-neutral-950/80 border border-neutral-800 rounded-xl px-3 py-1.5 flex items-center justify-between text-[11px] animate-in fade-in">
              <span className="text-neutral-400 font-mono">📅 {selectedDay.date}</span>
              <span className="font-bold text-emerald-400">
                {selectedDay.count} {selectedDay.count === 1 ? 'evento registrado' : 'eventos registrados'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer con Leyenda */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-[10px] text-neutral-500 font-medium">
        <span>Últimos 3 meses</span>
        <div className="flex items-center gap-1.5">
          <span>Menos</span>
          <div className="flex gap-1">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-neutral-800" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-900" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-700" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500" />
          </div>
          <span>Más</span>
        </div>
      </div>
    </div>
  );
}
