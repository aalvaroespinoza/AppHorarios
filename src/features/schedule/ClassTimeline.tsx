"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseMateriaInfo } from '@/core/utils/materiaParser';
import { Clock, MapPin, Sparkles, Bus, CheckCircle2 } from 'lucide-react';
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
          delete parsed._date;
          setAttended(parsed);
        }
      }
    } catch {}
  }, []);

  const handleAttendance = (materiaName: string, idx: number) => {
    const key = `class-${idx}`;
    if (attended[key]) return;
    const todayKey = new Date().toISOString().split('T')[0];
    const next: Record<string, boolean> = { ...attended, [key]: true };
    setAttended(next);
    localStorage.setItem('lifeos_class_attendance', JSON.stringify({ ...next, _date: todayKey }));
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
      <Card className="border-zinc-800 bg-zinc-900 rounded-sm p-5 text-center text-xs font-mono text-zinc-500 uppercase tracking-widest shadow-none">
        [SYS.STATUS // SIN MATERIAS PROGRAMADAS PARA HOY]
      </Card>
    );
  }

  return (
    <section id="seccion-cursado" className="bg-zinc-900 border border-zinc-800 rounded-sm p-4 sm:p-5 shadow-none relative scroll-mt-24">
      {/* Cabecera Técnica */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm border border-zinc-700 bg-zinc-800 flex items-center justify-center text-zinc-300">
            <Clock size={12} />
          </div>
          <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-100 font-mono">
            MATRIZ DE CURSADO // HORARIO DEL DÍA
          </h2>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          [SYS.ACADEMIC]
        </span>
      </div>

      {/* Matriz Técnica / Timeline Vertical */}
      <div className="relative border-l border-zinc-800 ml-2 pl-4 flex flex-col gap-3.5 py-1">
        {/* Línea recta de tiempo actual */}
        {isToday && (
          <div 
            className="absolute left-0 right-0 border-t border-safety-orange z-30 w-full pointer-events-none" 
            style={{ top: `${Math.min(Math.max((currentMinutes / 1440) * 100, 0), 100)}%` }}
          >
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-safety-orange rounded-none" />
          </div>
        )}

        {items.map((cls, idx) => {
          const rawString = cls.nombre || cls.name || cls.title || cls.rawText || '';
          const info = parseMateriaInfo(rawString);
          const horaInicio = cls.horaInicio || cls.timeStart || "08:00";
          const horaFin = cls.horaFin || cls.timeEnd || "11:10";
          const isCurrentClass = isToday && isTimeBetween(horaInicio, horaFin, currentTime);

          // Si es viaje, renderizar bloque técnico de tránsito
          if (info.isViaje) {
            return (
              <div key={cls.id || idx} className="relative">
                <span className="absolute -left-[1.38rem] top-3.5 h-2.5 w-2.5 rounded-none border border-zinc-800 bg-zinc-700 z-20" />
                <div className="bg-zinc-950 border border-zinc-800 rounded-sm p-3 flex items-center justify-between transition-colors shadow-none">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-sm border border-zinc-800 bg-zinc-900 text-zinc-300 flex items-center justify-center shrink-0">
                      <Bus size={13} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-zinc-100 leading-tight truncate uppercase font-mono">
                        {info.nombre}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {horaInicio} - {horaFin} HS
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono uppercase tracking-widest border-zinc-700 text-zinc-300 bg-zinc-900 shrink-0">
                    TRANSIT
                  </Badge>
                </div>
              </div>
            );
          }

          return (
            <div key={cls.id || idx} className="relative">
              {/* Conector de nodo técnico cuadrado */}
              <span 
                className={`absolute -left-[1.38rem] top-4 h-2.5 w-2.5 rounded-none z-20 transition-all ${
                  isCurrentClass 
                    ? 'bg-safety-orange border border-black ring-2 ring-safety-orange/40' 
                    : 'bg-zinc-700 border border-zinc-900'
                }`} 
              />

              <Card 
                className={`border rounded-sm transition-colors overflow-hidden shadow-none ${
                  isCurrentClass
                    ? 'border-safety-orange/80 bg-zinc-900'
                    : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900/90'
                }`}
              >
                <CardHeader className="p-3.5 pb-2 border-b border-zinc-800/80 flex flex-row justify-between items-start gap-2">
                  <div className="flex flex-col gap-0.5">
                    <CardTitle className="text-sm font-bold leading-snug text-zinc-100 font-mono">
                      {info.nombre}
                    </CardTitle>
                    <span className="text-[11px] text-zinc-400 font-mono font-medium">
                      {horaInicio} - {horaFin} HS
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {info.curso && info.curso !== '-' && (
                      <Badge className="border-zinc-700 text-zinc-300 bg-zinc-800 font-mono text-[9px] uppercase tracking-wider" variant="outline">
                        {info.curso}
                      </Badge>
                    )}
                    {isCurrentClass && (
                      <Badge className="border-safety-orange bg-safety-orange text-black font-mono font-extrabold text-[9px] uppercase tracking-widest animate-pulse" variant="default">
                        EN CURSO
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-3.5 pt-2.5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={11} className="text-zinc-500" />
                      <span>AULA: <strong className="text-zinc-200 font-semibold">{info.aula}</strong></span>
                    </span>
                    {info.edificio && info.edificio !== '-' && (
                      <span className="text-zinc-400 truncate max-w-[150px] uppercase text-[10px]">
                        EDIF: {info.edificio}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-zinc-800">
                    <Button 
                      className="flex-1 font-bold text-[10px] rounded-sm h-8 flex items-center justify-center gap-1.5" 
                      onClick={() => setSelectedMateria(cls)} 
                      variant="outline"
                      size="sm"
                    >
                      <Sparkles size={12} className="text-safety-orange shrink-0" />
                      <span>DETALLE</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAttendance(info.nombre, idx);
                      }}
                      disabled={!!attended[`class-${idx}`]}
                      className={`text-[10px] rounded-sm font-bold shrink-0 h-8 px-3 border transition-all flex items-center justify-center gap-1.5 ${
                        attended[`class-${idx}`]
                          ? 'text-acid-green bg-acid-green/15 border-acid-green/60 cursor-default'
                          : 'text-zinc-300 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {attended[`class-${idx}`] ? (
                        <>
                          <CheckCircle2 size={12} className="text-acid-green shrink-0" />
                          <span>ASISTIDO</span>
                        </>
                      ) : (
                        <span>[ REGISTRAR ]</span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Modal Técnico: Detalle de Materia */}
      <AnimatePresence>
        {selectedMateria && (() => {
          const info = parseMateriaInfo(selectedMateria.nombre || selectedMateria.title || selectedMateria.rawText || "");
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-4"
              onClick={() => setSelectedMateria(null)}
            >
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-sm p-5 shadow-none flex flex-col gap-4 text-zinc-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <span className="text-[10px] font-mono font-bold text-safety-orange uppercase tracking-widest">
                    SYS.MATERIA // DETALLE DE CURSADO
                  </span>
                  <button 
                    onClick={() => setSelectedMateria(null)} 
                    className="text-zinc-400 hover:text-zinc-100 bg-zinc-950 border border-zinc-800 rounded-sm w-6 h-6 flex items-center justify-center font-mono text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-mono font-bold leading-tight text-zinc-100 uppercase">{info.nombre}</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    HORARIO: <span className="text-zinc-200 font-semibold">{selectedMateria.horaInicio || selectedMateria.timeStart || "00:00"} a {selectedMateria.horaFin || selectedMateria.timeEnd || "00:00"} HS</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="bg-zinc-950 rounded-sm p-3 flex flex-col border border-zinc-800 font-mono">
                    <span className="text-[9px] text-zinc-500 uppercase font-semibold tracking-widest">CURSO</span>
                    <span className="text-sm font-bold text-zinc-200 mt-0.5">{info.curso}</span>
                  </div>
                  <div className="bg-zinc-950 rounded-sm p-3 flex flex-col border border-zinc-800 font-mono">
                    <span className="text-[9px] text-zinc-500 uppercase font-semibold tracking-widest">AULA</span>
                    <span className="text-sm font-bold text-acid-green mt-0.5">{info.aula}</span>
                  </div>
                  <div className="col-span-2 bg-zinc-950 rounded-sm p-3 flex flex-col border border-zinc-800 font-mono">
                    <span className="text-[9px] text-zinc-500 uppercase font-semibold tracking-widest">EDIFICIO</span>
                    <span className="text-xs font-bold text-safety-orange mt-0.5">📍 {info.edificio}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setSelectedMateria(null)}
                  className="w-full mt-1 font-bold rounded-sm h-8" 
                  variant="secondary"
                >
                  CERRAR
                </Button>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </section>
  );
}
