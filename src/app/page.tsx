"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useEscenario } from '@/hooks/useEscenario';
import { useBec } from '@/hooks/useBec';
import ContextualControls from '@/features/schedule/ContextualControls';
import NativeCard from '@/components/ui/NativeCard';
import RelojMinimalista from '@/components/RelojMinimalista';
import AntiSleepButton from '@/components/AntiSleepButton';
import EntertainmentSelector from '@/components/EntertainmentSelector';
import { calcularColectivos, OFFSET_PARADA_VUELTA_MIN, addMinutes } from '@/lib/engine/recommendation-engine';
import { calcularHoraLlegada } from '@/utils/time';
import { determineScenario, findScenario } from '@/lib/engine/scenario-engine';
import { subjectData } from '@/data/subjects';
import { ChevronDown, ChevronUp, Bus, Clock, MapPin, Moon, CheckCircle2, Ticket, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import type { RawScheduleEntry } from '@/types/schedule';
import type { DayOfWeek } from '@/types/common';

/**
 * Hook para calcular minutos restantes para un horario HH:MM
 */
function useCountdown(horaSalida: string | undefined) {
  const [minutosFaltantes, setMinutosFaltantes] = useState<number | null>(null);

  useEffect(() => {
    if (!horaSalida) {
      setMinutosFaltantes(null);
      return;
    }

    const calculate = () => {
      const ahora = new Date();
      const [h, m] = horaSalida.split(':').map(Number);
      
      const salida = new Date();
      salida.setHours(h, m, 0, 0);

      // Si ya pasó, la diferencia será negativa
      const diffMs = salida.getTime() - ahora.getTime();
      const diffMins = Math.ceil(diffMs / 60000);
      
      setMinutosFaltantes(diffMins);
    };

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [horaSalida]);

  return minutosFaltantes;
}

const formatMinutosFaltantes = (mins: number) => {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/**
 * Componente Tarjeta de Colectivo (Ida o Vuelta)
 */
function HorarioCard({ 
  titulo, 
  recomendacion, 
  icon: Icon,
  direction,
  bec
}: { 
  titulo: string, 
  recomendacion: ReturnType<typeof calcularColectivos>, 
  icon: React.ElementType,
  direction: 'ida' | 'vuelta',
  bec: ReturnType<typeof useBec>
}) {
  const [verAlternativas, setVerAlternativas] = useState(false);
  
  const [currentRecomendado, setCurrentRecomendado] = useState<RawScheduleEntry | null>(recomendacion.recomendado);
  const [currentAlternativas, setCurrentAlternativas] = useState<RawScheduleEntry[]>(recomendacion.alternativas);

  useEffect(() => {
    setCurrentRecomendado(recomendacion.recomendado);
    setCurrentAlternativas(recomendacion.alternativas);
  }, [recomendacion]);

  const registroHoy = bec.getRegistroHoy();
  const becUsado = direction === 'ida' ? registroHoy.idaUsado : registroHoy.vueltaUsado;

  const handleSwap = (alt: RawScheduleEntry, idx: number) => {
    if (!currentRecomendado) return;
    const newAlts = [...currentAlternativas];
    newAlts[idx] = currentRecomendado;
    newAlts.sort((a, b) => a.horaSalida.localeCompare(b.horaSalida));
    setCurrentRecomendado(alt);
    setCurrentAlternativas(newAlts);
    setVerAlternativas(false);
  };

  const toggleTomado = () => {
    if (becUsado) {
      bec.desmarcarViaje(direction);
    } else {
      bec.marcarViaje(direction);
    }
  };
  
  const esVuelta = titulo.toLowerCase().includes('vuelta');
  const horaReal = esVuelta && currentRecomendado ? addMinutes(currentRecomendado.horaSalida, OFFSET_PARADA_VUELTA_MIN) : currentRecomendado?.horaSalida;
  
  const targetLat = direction === 'ida' ? -31.4422 : -31.8153;
  const targetLng = direction === 'ida' ? -64.1938 : -64.2894;

  const minutosFaltantes = useCountdown(horaReal);

  if (!currentRecomendado) {
    return (
      <NativeCard className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center border border-zinc-700">
          <Moon size={28} className="text-zinc-400" />
        </div>
        <div>
          <p className="text-lg font-semibold text-white">Hoy no hay {titulo.toLowerCase()} programada 🏠</p>
          <p className="text-sm text-zinc-500 mt-1">Disfrutá tu tiempo o descansá en Córdoba.</p>
        </div>
      </NativeCard>
    );
  }

  return (
    <NativeCard className={`flex flex-col relative overflow-hidden transition-all duration-300 ${becUsado ? 'opacity-70 grayscale-[0.3]' : ''}`}>
      {/* Efecto de resplandor decorativo */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-colors ${becUsado ? 'bg-green-500/10' : 'bg-blue-500/10'}`} />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-zinc-400">
          <Icon size={18} />
          <h2 className="font-semibold text-sm uppercase tracking-wider">{titulo}</h2>
        </div>
        <button 
          onClick={toggleTomado}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            becUsado 
              ? 'bg-green-900/30 text-green-400 border-green-800/50 hover:bg-green-900/50' 
              : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <CheckCircle2 size={16} />
          {becUsado ? 'BEC Usado ✓' : 'Ya lo tomé'}
        </button>
      </div>

      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-zinc-400 font-medium text-sm mb-1">{currentRecomendado.empresa}</p>
          {esVuelta ? (
            <>
              <div className="text-sm text-zinc-400 mb-1 mt-2">Sale de Terminal: {currentRecomendado.horaSalida}</div>
              <div className="text-sm text-blue-400 mb-1 font-medium">Pasa por tu parada (Ministerio):</div>
              <div className="text-6xl font-sans tracking-tight text-white leading-none">
                {horaReal}
              </div>
            </>
          ) : (
            <div className="text-6xl font-sans tracking-tight text-white leading-none">
              {currentRecomendado.horaSalida}
            </div>
          )}
        </div>
        
        {minutosFaltantes !== null && (
          <div className="flex flex-col items-end gap-2">
            <div className={`font-medium px-3 py-1.5 rounded-full text-sm flex items-center gap-2 shadow-sm ${
              minutosFaltantes > 0 && minutosFaltantes <= 60 
                ? 'bg-blue-900/40 text-blue-400 animate-pulse' 
                : minutosFaltantes < 0
                  ? 'bg-red-900/30 text-red-400'
                  : 'bg-zinc-800/80 text-zinc-300'
            }`}>
              <span className="relative flex h-2 w-2">
                {minutosFaltantes > 0 && minutosFaltantes <= 60 && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  minutosFaltantes > 0 && minutosFaltantes <= 60 
                    ? 'bg-blue-500' 
                    : minutosFaltantes < 0
                      ? 'bg-red-500'
                      : 'bg-zinc-500'
                }`}></span>
              </span>
              <span>
                {minutosFaltantes > 0 
                  ? `Sale en ${formatMinutosFaltantes(minutosFaltantes)}` 
                  : minutosFaltantes === 0 
                    ? 'Saliendo...' 
                    : 'Ya salió'}
              </span>
            </div>
          </div>
        )}
      </div>

      {currentRecomendado.notas && (
        <div className="bg-blue-950/20 border border-blue-900/30 p-3 rounded-2xl mb-4 text-sm text-blue-200 flex gap-2 items-start">
          <MapPin size={16} className="text-blue-400 shrink-0 mt-0.5" />
          <span className="leading-snug">
            {currentRecomendado.notas.replace(/llegada estimada/i, `Llegada estimada a las ${calcularHoraLlegada(currentRecomendado.horaSalida, direction)}`)}
          </span>
        </div>
      )}
      
      {/* Botón Anti-Pestañeo */}
      <AntiSleepButton targetLat={targetLat} targetLng={targetLng} />

      {currentAlternativas.length > 0 && (
        <div className="border-t border-zinc-800/80 pt-4 mt-2">
          <button 
            onClick={() => setVerAlternativas(!verAlternativas)}
            className="flex items-center justify-between w-full text-sm text-zinc-400 hover:text-white transition-colors py-1"
          >
            <span>Ver siguientes {currentAlternativas.length} opciones</span>
            {verAlternativas ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <AnimatePresence>
            {verAlternativas && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="mt-4 flex flex-col gap-2 overflow-hidden"
              >
                {currentAlternativas.map((alt: RawScheduleEntry, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => handleSwap(alt, idx)}
                    className="flex flex-col justify-center bg-zinc-800/40 border border-zinc-700/50 p-3 rounded-xl hover:bg-zinc-800/80 transition-colors text-left"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-semibold text-white text-lg">{alt.horaSalida}</span>
                      <span className="text-zinc-400 text-sm font-medium">{alt.empresa}</span>
                    </div>
                    <span className="text-zinc-400 text-sm font-medium mt-1">
                      Hora estimada de Llegada: {calcularHoraLlegada(alt.horaSalida, direction)}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </NativeCard>
  );
}

export default function Hoy() {
  const { cursaArquitectura, duermeEnCordoba, diaSeleccionado, isMounted, setDiaSeleccionado } = useEscenario();
  const bec = useBec();
  const [horaActualHHMM, setHoraActualHHMM] = useState("00:00");
  const [timeMounted, setTimeMounted] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setHoraActualHHMM(`${h}:${m}`);
    };
    updateTime();
    setTimeMounted(true);
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);
  
  if (!isMounted) return <div className="min-h-screen bg-black" />;

  // Filtrar materias del día usando la nueva lógica de escenarios y bloques
  const map: Record<string, number> = {
    'lunes': 1, 'martes': 2, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sabado': 6, 'domingo': 0
  };
  const targetDay = map[diaSeleccionado];
  const refDate = new Date();
  while (refDate.getDay() !== targetDay) {
    refDate.setDate(refDate.getDate() + 1);
  }

  const scenarioId = determineScenario({ 
    tuesdayHasArquitectura: cursaArquitectura,
    referenceDate: refDate 
  });
  const scenarioData = scenarioId ? findScenario(scenarioId) : null;

  let materiasDelDia: Array<{nombre: string, horaInicio: string, horaFin: string, color?: string}> = [];
  if (scenarioData) {
    subjectData.subjects.forEach(subject => {
      if (scenarioData.activeSubjectIds.includes(subject.id)) {
        subject.classBlocks.forEach(block => {
          if (block.day === diaSeleccionado) {
            materiasDelDia.push({
              nombre: subject.name,
              horaInicio: block.startTime,
              horaFin: block.endTime,
              color: subject.color
            });
          }
        });
      }
    });
    // Ordenar cronológicamente
    materiasDelDia.sort((a, b) => {
      const [h1, m1] = a.horaInicio.split(':').map(Number);
      const [h2, m2] = b.horaInicio.split(':').map(Number);
      return (h1 * 60 + m1) - (h2 * 60 + m2);
    });
  }

  // Determinar si estamos viendo "hoy" o un día futuro/pasado
  const isToday = new Date().getDay() === targetDay;
  const horaParaFiltro = isToday ? horaActualHHMM : '00:00';

  // Lógica para la línea de tiempo roja de "ahora"
  let activeIndex = -1;
  let linePosition: 'before' | 'inside' | 'after' | 'none' = 'none';

  if (isToday && materiasDelDia.length > 0) {
    if (horaActualHHMM < materiasDelDia[0].horaInicio) {
      activeIndex = 0;
      linePosition = 'before';
    } else if (horaActualHHMM >= materiasDelDia[materiasDelDia.length - 1].horaFin) {
      activeIndex = materiasDelDia.length - 1;
      linePosition = 'after';
    } else {
      for (let i = 0; i < materiasDelDia.length; i++) {
        const m = materiasDelDia[i];
        if (horaActualHHMM >= m.horaInicio && horaActualHHMM < m.horaFin) {
          activeIndex = i;
          linePosition = 'inside';
          break;
        } else if (i < materiasDelDia.length - 1 && horaActualHHMM >= m.horaFin && horaActualHHMM < materiasDelDia[i+1].horaInicio) {
          activeIndex = i;
          linePosition = 'after';
          break;
        }
      }
    }
  }

  // Ejecutar motor
  const recomendacionIda = calcularColectivos(diaSeleccionado as DayOfWeek, 'ida', cursaArquitectura, duermeEnCordoba, horaParaFiltro);
  const recomendacionVuelta = calcularColectivos(diaSeleccionado as DayOfWeek, 'vuelta', cursaArquitectura, duermeEnCordoba, horaParaFiltro);

  // Capitalizar día
  const diaCapitalizado = diaSeleccionado.charAt(0).toUpperCase() + diaSeleccionado.slice(1);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="p-4 max-w-md mx-auto flex flex-col gap-6"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      
      {/* Header */}
      <header className="flex justify-between items-end mt-2 mb-2">
        <div>
          <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 text-[11px] font-black tracking-[0.25em] uppercase mb-1 drop-shadow-sm">
            APP HORARIO
          </h2>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {diaCapitalizado}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const map: Record<number, DayOfWeek> = {
                0: 'lunes', 1: 'lunes', 2: 'martes', 3: 'miercoles',
                4: 'jueves', 5: 'viernes', 6: 'sabado'
              };
              setDiaSeleccionado(map[new Date().getDay()]);
            }}
            className="text-blue-400 font-bold text-sm bg-blue-500/10 px-3 py-1.5 rounded-full hover:bg-blue-500/20 transition-colors"
          >
            Hoy
          </button>
          <div className="flex gap-2">
            <Link 
              href="/horarios"
              className="bg-zinc-900 w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center shadow-sm hover:bg-zinc-800 transition-colors"
            >
              <LayoutGrid size={16} className="text-zinc-400" />
            </Link>
            <div className="bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800 flex items-center justify-center shadow-sm">
              <RelojMinimalista />
            </div>
          </div>
        </div>
      </header>

      {/* Controladores */}
      <ContextualControls />

      {/* Tarjetas de Resultados */}
      <div className="flex flex-col gap-6 mt-2">
        <HorarioCard 
          titulo={`Ida hacia Córdoba`}
          recomendacion={recomendacionIda} 
          icon={Bus} 
          direction="ida"
          bec={bec}
        />
        
        {/* Modo Viaje (Entretenimiento) */}
        <EntertainmentSelector />
        
        {/* Línea de Tiempo de Materias */}
        {materiasDelDia.length > 0 && (
          <NativeCard className="py-6">
            <div className="flex items-center gap-2 mb-5 text-zinc-400">
              <Clock size={18} />
              <h2 className="font-semibold text-sm uppercase tracking-wider">Cursado</h2>
            </div>
            
            <div className="flex flex-col gap-0 relative">
              {/* Línea vertical continua */}
              <div className="absolute left-[9px] top-3 bottom-3 w-0.5 bg-zinc-800 rounded-full" />
              
              {materiasDelDia.map((materia, idx) => {
                const isFinished = isToday && materia.horaFin <= horaActualHHMM;
                const showLineBefore = isToday && linePosition === 'before' && idx === activeIndex;
                const showLineInside = isToday && linePosition === 'inside' && idx === activeIndex;
                const showLineAfter = isToday && linePosition === 'after' && idx === activeIndex;
                
                const TimeLine = () => (
                  <div className="absolute left-0 right-0 z-20 flex items-center ml-1">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <div className="h-[2px] flex-1 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  </div>
                );

                return (
                  <div key={idx} className="relative pl-8 py-3">
                    {showLineBefore && <div className="absolute -top-1.5 left-0 right-0"><TimeLine /></div>}
                    
                    {/* Punto en la línea */}
                    <div className={`absolute left-[3px] top-[22px] w-3.5 h-3.5 bg-zinc-900 border-[2.5px] rounded-full z-10 transition-colors ${
                      isFinished ? 'border-zinc-700' : 'border-blue-500'
                    }`} />
                    
                    <div className={`bg-zinc-800/30 border rounded-2xl p-4 transition-all relative ${
                      isFinished ? 'border-zinc-800/50 opacity-50 grayscale' : 'border-zinc-700/30'
                    }`}>
                      {showLineInside && <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 -ml-8"><TimeLine /></div>}
                      <h3 className={`font-semibold text-base flex items-center gap-2 ${isFinished ? 'text-zinc-300' : 'text-white'}`}>
                        {materia.color && (
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${materia.color.split(' ')[0]}`} />
                        )}
                        {materia.nombre}
                        {isFinished && <CheckCircle2 size={16} className="text-zinc-500" />}
                      </h3>
                      <p className="text-zinc-400 text-sm mt-1.5 font-medium">
                        {materia.horaInicio} <span className="text-zinc-600 mx-1">-</span> {materia.horaFin}
                      </p>
                    </div>
                    
                    {showLineAfter && <div className="absolute -bottom-1.5 left-0 right-0"><TimeLine /></div>}
                  </div>
                );
              })}
            </div>
          </NativeCard>
        )}

        <HorarioCard 
          titulo={`Vuelta a Despeñaderos`}
          recomendacion={recomendacionVuelta} 
          icon={Bus} 
          direction="vuelta"
          bec={bec}
        />
      </div>

    </motion.div>
  );
}
