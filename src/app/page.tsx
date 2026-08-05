"use client";

import React, { useState, useEffect } from 'react';
import { useEscenario } from '@/hooks/useEscenario';
import ContextualControls from '@/features/schedule/ContextualControls';
import NativeCard from '@/components/ui/NativeCard';
import RelojMinimalista from '@/components/RelojMinimalista';
import { calcularColectivos, OFFSET_PARADA_VUELTA_MIN, addMinutes } from '@/lib/engine/recommendation-engine';
import { determineScenario, findScenario } from '@/lib/engine/scenario-engine';
import { subjectData } from '@/data/subjects';
import { ChevronDown, ChevronUp, Bus, Clock, MapPin, Moon, CheckCircle2 } from 'lucide-react';
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

/**
 * Componente Tarjeta de Colectivo (Ida o Vuelta)
 */
function HorarioCard({ 
  titulo, 
  recomendacion, 
  icon: Icon,
  direction
}: { 
  titulo: string, 
  recomendacion: ReturnType<typeof calcularColectivos>, 
  icon: React.ElementType,
  direction: 'ida' | 'vuelta'
}) {
  const [verAlternativas, setVerAlternativas] = useState(false);
  const [yaTomado, setYaTomado] = useState(false);
  const [storageKey, setStorageKey] = useState('');
  const { recomendado, alternativas } = recomendacion;
  
  useEffect(() => {
    // Usar la fecha local para construir la clave
    const d = new Date();
    d.setHours(d.getHours() - 3); // Ajuste UTC-3
    const today = d.toISOString().split('T')[0];
    const key = `tomado:${today}:${direction}`;
    setStorageKey(key);
    
    if (localStorage.getItem(key) === 'true') {
      setYaTomado(true);
    }
  }, [direction]);

  const toggleTomado = () => {
    const newValue = !yaTomado;
    setYaTomado(newValue);
    if (newValue) {
      localStorage.setItem(storageKey, 'true');
    } else {
      localStorage.removeItem(storageKey);
    }
  };
  
  const esVuelta = titulo.toLowerCase().includes('vuelta');
  const horaReal = esVuelta && recomendado ? addMinutes(recomendado.horaSalida, OFFSET_PARADA_VUELTA_MIN) : recomendado?.horaSalida;
  
  const minutosFaltantes = useCountdown(horaReal);

  if (!recomendado) {
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
    <NativeCard className={`flex flex-col relative overflow-hidden transition-all duration-300 ${yaTomado ? 'opacity-70 grayscale-[0.3]' : ''}`}>
      {/* Efecto de resplandor decorativo */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-colors ${yaTomado ? 'bg-green-500/10' : 'bg-blue-500/10'}`} />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-zinc-400">
          <Icon size={18} />
          <h2 className="font-semibold text-sm uppercase tracking-wider">{titulo}</h2>
        </div>
        <button 
          onClick={toggleTomado}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            yaTomado 
              ? 'bg-green-900/30 text-green-400 border-green-800/50' 
              : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <CheckCircle2 size={16} />
          {yaTomado ? 'Completado' : 'Ya lo tomé'}
        </button>
      </div>

      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-zinc-400 font-medium text-sm mb-1">{recomendado.empresa}</p>
          {esVuelta ? (
            <>
              <div className="text-sm text-zinc-400 mb-1 mt-2">Sale de Terminal: {recomendado.horaSalida}</div>
              <div className="text-sm text-blue-400 mb-1 font-medium">Pasa por tu parada (Ministerio):</div>
              <div className="text-6xl font-sans tracking-tight text-white leading-none">
                {horaReal}
              </div>
            </>
          ) : (
            <div className="text-6xl font-sans tracking-tight text-white leading-none">
              {recomendado.horaSalida}
            </div>
          )}
        </div>
        {minutosFaltantes !== null && (
          <div className={`font-medium px-3 py-1.5 rounded-full text-sm flex items-center gap-2 shadow-sm ${
            minutosFaltantes > 0 && minutosFaltantes <= 60 
              ? 'bg-blue-900/40 text-blue-400 animate-pulse' 
              : 'bg-zinc-800 text-zinc-300'
          }`}>
            <span className="relative flex h-2 w-2">
              {minutosFaltantes > 0 && minutosFaltantes <= 60 && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                minutosFaltantes > 0 && minutosFaltantes <= 60 ? 'bg-blue-500' : 'bg-zinc-500'
              }`}></span>
            </span>
            {minutosFaltantes > 0 
              ? `en ${minutosFaltantes} min` 
              : minutosFaltantes === 0 
                ? 'Saliendo...' 
                : 'Ya salió'}
          </div>
        )}
      </div>

      {recomendado.notas && (
        <div className="bg-blue-950/20 border border-blue-900/30 p-3 rounded-2xl mb-4 text-sm text-blue-200 flex gap-2 items-start">
          <MapPin size={16} className="text-blue-400 shrink-0 mt-0.5" />
          <span className="leading-snug">{recomendado.notas}</span>
        </div>
      )}

      {alternativas.length > 0 && (
        <div className="border-t border-zinc-800/80 pt-4 mt-2">
          <button 
            onClick={() => setVerAlternativas(!verAlternativas)}
            className="flex items-center justify-between w-full text-sm text-zinc-400 hover:text-white transition-colors py-1"
          >
            <span>Ver siguientes {alternativas.length} opciones</span>
            {verAlternativas ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {verAlternativas && (
            <div className="mt-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {alternativas.map((alt: RawScheduleEntry, idx: number) => (
                <div key={idx} className="flex justify-between items-center bg-zinc-800/40 border border-zinc-700/50 p-3 rounded-xl">
                  <span className="font-semibold text-white text-lg">{alt.horaSalida}</span>
                  <span className="text-zinc-400 text-sm font-medium">{alt.empresa}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </NativeCard>
  );
}

export default function HomePage() {
  const escenario = useEscenario();
  const [horaActualHHMM, setHoraActualHHMM] = useState<string>("00:00");
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
  
  if (!escenario.isMounted) return <div className="min-h-screen bg-black" />;

  const { diaSeleccionado, cursaArquitectura, duermeEnCordoba } = escenario;

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

  let materiasDelDia: Array<{nombre: string, horaInicio: string, horaFin: string}> = [];
  if (scenarioData) {
    subjectData.subjects.forEach(subject => {
      if (scenarioData.activeSubjectIds.includes(subject.id)) {
        subject.classBlocks.forEach(block => {
          if (block.day === diaSeleccionado) {
            materiasDelDia.push({
              nombre: subject.name,
              horaInicio: block.startTime,
              horaFin: block.endTime
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

  // Ejecutar motor
  const recomendacionIda = calcularColectivos(diaSeleccionado as DayOfWeek, 'ida', cursaArquitectura, duermeEnCordoba, horaParaFiltro);
  const recomendacionVuelta = calcularColectivos(diaSeleccionado as DayOfWeek, 'vuelta', cursaArquitectura, duermeEnCordoba, horaParaFiltro);

  // Capitalizar día
  const diaCapitalizado = diaSeleccionado.charAt(0).toUpperCase() + diaSeleccionado.slice(1);

  return (
    <div 
      className="p-4 max-w-md mx-auto flex flex-col gap-6"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      
      {/* Header */}
      <header className="flex justify-between items-end mt-2 mb-2">
        <div>
          <p className="text-zinc-500 text-sm font-medium tracking-wide uppercase mb-1">App Horarios</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {diaCapitalizado}
          </h1>
        </div>
        <div className="bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800 flex items-center justify-center shadow-sm">
          <RelojMinimalista />
        </div>
      </header>

      {/* Controladores */}
      <ContextualControls />

      {/* Tarjetas de Resultados */}
      <div className="flex flex-col gap-6 mt-2">
        <HorarioCard titulo="Viaje de Ida" recomendacion={recomendacionIda} icon={Bus} direction="ida" />
        
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
              
              {materiasDelDia.map((materia, idx) => (
                <div key={idx} className="relative pl-8 py-3">
                  {/* Punto en la línea */}
                  <div className="absolute left-[3px] top-[22px] w-3.5 h-3.5 bg-zinc-900 border-[2.5px] border-blue-500 rounded-full z-10" />
                  
                  <div className="bg-zinc-800/30 border border-zinc-700/30 rounded-2xl p-4">
                    <h3 className="font-semibold text-white text-base">{materia.nombre}</h3>
                    <p className="text-zinc-400 text-sm mt-1.5 font-medium">
                      {materia.horaInicio} <span className="text-zinc-600 mx-1">-</span> {materia.horaFin}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </NativeCard>
        )}

        <HorarioCard titulo="Viaje de Vuelta" recomendacion={recomendacionVuelta} icon={Bus} direction="vuelta" />
      </div>

    </div>
  );
}
