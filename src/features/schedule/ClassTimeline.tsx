"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseMateriaInfo } from '@/core/utils/materiaParser';
import { getSubjectColorMapping } from '@/core/utils/edificio';
import { Clock, MapPin, Sparkles, Bus, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '@/core/analytics/engine';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ClassItem {
  id?: string;
  nombre?: string;
  name?: string;
  title?: string;
  rawText?: string;
  horaInicio?: string;
  horaFin?: string;
  timeStart?: string;
  timeEnd?: string;
  curso?: string;
  aula?: string;
  color?: string;
}

export interface ClassTimelineProps {
  materiasDelDia?: ClassItem[];
  classes?: ClassItem[];
  isToday?: boolean;
  horaActualHHMM?: string;
  linePosition?: "none" | "before" | "inside" | "after";
  activeIndex?: number;
}

export function ClassTimeline({
  materiasDelDia,
  classes,
  isToday,
  horaActualHHMM,
}: ClassTimelineProps) {
  const items = materiasDelDia || classes || [];
  const [selectedMateria, setSelectedMateria] = useState<any | null>(null);
  const [attended, setAttended] = useState<Record<string, boolean>>({});

  // Leer asistencias del día actual desde localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const todayKey = new Date().toISOString().split('T')[0];
      const stored = localStorage.getItem('lifeos_class_attendance');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed._date === todayKey) {
          const { _date, ...rest } = parsed;
          setAttended(rest);
        }
      }
    } catch (e) {}
  }, []);

  const handleAttendance = (materiaName: string, idx: number) => {
    const key = `class-${idx}`;
    if (attended[key]) return;
    const todayKey = new Date().toISOString().split('T')[0];
    const next: Record<string, boolean> = { ...attended, [key]: true };
    setAttended(next);
    localStorage.setItem('lifeos_class_attendance', JSON.stringify({ ...next, _date: todayKey }));
    trackEvent('class_attended', 'academic', 1, { materia: materiaName });
  };

  const currentTime = horaActualHHMM || (() => {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  })();

  const [h, m] = currentTime.split(':').map(Number);
  const currentMinutes = (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);

  const isTimeBetween = (start: string, end: string, current: string) => {
    return current >= start && current < end;
  };

  if (items.length === 0) {
    return (
      <Card className="border-neutral-800 bg-neutral-950/50 backdrop-blur-sm p-5 text-center text-sm text-neutral-400 italic">
        Sin materias programadas para hoy 🏠
      </Card>
    );
  }

  return (
    <section id="seccion-cursado" className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-md relative scroll-mt-24">
      <div className="flex items-center gap-2 mb-4 text-neutral-400">
        <Clock size={18} className="text-zinc-400" />
        <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-300">Cursado / Horario del día</h2>
      </div>

      {/* Timeline Vertical con Componentes Shadcn */}
      <div className="relative border-l-2 border-neutral-800 ml-3 pl-5 flex flex-col gap-4 py-1">
        {/* Línea de tiempo actual */}
        {isToday && (
          <div 
            className="absolute left-0 right-0 border-t-2 border-red-500 z-40 w-full pointer-events-none" 
            style={{ top: `${Math.min(Math.max((currentMinutes / 1440) * 100, 0), 100)}%` }}
          >
            <div className="absolute -top-1.5 -left-1 w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
          </div>
        )}

        {items.map((cls, idx) => {
          const rawString = cls.nombre || cls.name || cls.title || cls.rawText || '';
          const info = parseMateriaInfo(rawString);
          const horaInicio = cls.horaInicio || cls.timeStart || "08:00";
          const horaFin = cls.horaFin || cls.timeEnd || "11:10";
          const isCurrentClass = isToday && isTimeBetween(horaInicio, horaFin, currentTime);
          const mapping = getSubjectColorMapping(cls.color);

          // Si es viaje, renderizar tarjeta horizontal minimalista sin badges de aula/curso/edificio
          if (info.isViaje) {
            return (
              <div key={cls.id || idx} className="relative">
                <span className="absolute -left-[1.65rem] top-3.5 h-3.5 w-3.5 rounded-full border-[3px] border-neutral-950 z-20 bg-sky-400" />
                <div className="bg-sky-900/20 border border-sky-800/50 backdrop-blur-sm rounded-2xl p-3 flex items-center justify-between transition-all">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                      <Bus size={14} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-white leading-tight truncate">
                        {info.nombre}
                      </span>
                      <span className="text-[11px] text-sky-300/80 font-mono">
                        {horaInicio} - {horaFin} hs
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold border-sky-500/30 text-sky-300 bg-sky-500/10 shrink-0">
                    Viaje
                  </Badge>
                </div>
              </div>
            );
          }

          return (
            <div key={cls.id || idx} className="relative">
              {/* Timeline Indicator Dot */}
              <span 
                className={`absolute -left-[1.65rem] top-4 h-3.5 w-3.5 rounded-full border-[3px] border-neutral-950 z-20 transition-all ${
                  isCurrentClass 
                    ? `${mapping.dot} ring-4 ${mapping.ring} scale-110` 
                    : 'bg-neutral-700'
                }`} 
              />

              <Card 
                className={`border-neutral-800 backdrop-blur-sm transition-all overflow-hidden ${
                  isCurrentClass
                    ? `bg-gradient-to-r ${mapping.gradient} ${mapping.border} shadow-lg ${mapping.shadow}`
                    : `bg-neutral-950/50 hover:bg-neutral-900/80`
                }`}
              >
                <CardHeader className="pb-2 flex flex-row justify-between items-start gap-2">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-base sm:text-lg font-bold leading-snug text-white">
                      {info.nombre}
                    </CardTitle>
                    <span className="text-xs text-neutral-400 font-mono">
                      {horaInicio} - {horaFin} hs
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {info.curso && info.curso !== '-' && (
                      <Badge className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-bold" variant="outline">
                        {info.curso}
                      </Badge>
                    )}
                    {isCurrentClass && (
                      <Badge className="bg-red-500 text-white font-extrabold animate-pulse text-[10px]" variant="default">
                        EN CURSO
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-1 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-neutral-500" />
                      Aula: <strong className="text-neutral-200">{info.aula}</strong>
                    </span>
                    {info.edificio && info.edificio !== '-' && (
                      <span className="text-neutral-400 truncate max-w-[140px]">
                        {info.edificio}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 font-semibold text-xs rounded-xl" 
                      onClick={() => setSelectedMateria(cls)} 
                      variant="secondary"
                      size="sm"
                    >
                      <Sparkles size={13} className="mr-1.5 text-cyan-400" />
                      Ver Detalle
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAttendance(info.nombre, idx);
                      }}
                      disabled={!!attended[`class-${idx}`]}
                      className={`text-xs rounded-xl font-bold shrink-0 transition-all ${
                        attended[`class-${idx}`]
                          ? 'text-emerald-400 bg-emerald-500/10 cursor-default'
                          : 'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95'
                      }`}
                    >
                      {attended[`class-${idx}`] ? (
                        <><CheckCircle2 size={14} className="mr-1" /> Asistido</>
                      ) : (
                        '✅ Asistencia'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Modal Detalle de Materia */}
      <AnimatePresence>
        {selectedMateria && (() => {
          const info = parseMateriaInfo(selectedMateria.nombre || selectedMateria.title || selectedMateria.rawText || "");
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setSelectedMateria(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Detalle de Cursado</span>
                  <button onClick={() => setSelectedMateria(null)} className="text-neutral-500 hover:text-white bg-neutral-800 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
                </div>

                <div>
                  <h3 className="text-xl font-bold leading-tight text-white">{info.nombre}</h3>
                  <p className="text-sm text-neutral-400 mt-2">
                    ⏰ Horario: <span className="text-white font-medium">{selectedMateria.horaInicio || selectedMateria.timeStart || "00:00"} a {selectedMateria.horaFin || selectedMateria.timeEnd || "00:00"} hs</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="bg-neutral-800/50 rounded-2xl p-4 flex flex-col border border-neutral-700/50">
                    <span className="text-[11px] text-neutral-400 uppercase font-semibold">Curso</span>
                    <span className="text-lg font-bold text-cyan-300 mt-0.5">{info.curso}</span>
                  </div>
                  <div className="bg-neutral-800/50 rounded-2xl p-4 flex flex-col border border-neutral-700/50">
                    <span className="text-[11px] text-neutral-400 uppercase font-semibold">Aula</span>
                    <span className="text-lg font-bold text-emerald-300 mt-0.5">{info.aula}</span>
                  </div>
                  <div className="col-span-2 bg-neutral-800/50 rounded-2xl p-4 flex flex-col border border-neutral-700/50">
                    <span className="text-[11px] text-neutral-400 uppercase font-semibold">Edificio</span>
                    <span className="text-base font-bold text-amber-300 mt-0.5">📍 {info.edificio}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setSelectedMateria(null)}
                  className="w-full mt-2 font-bold rounded-xl"
                  variant="default"
                >
                  Cerrar
                </Button>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </section>
  );
}
