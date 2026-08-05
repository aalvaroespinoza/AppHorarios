"use client";

import { useMemo, useState, useEffect } from "react";
import { calcularColectivoRecomendado } from "../engine/recommendationEngine";
import { DiaSemana, Horario, Materia } from "../types";
import { MATERIAS } from "../data/materiasDB";
import { ChevronLeft, ChevronRight, BookOpen, MapPin, Moon } from "lucide-react";
import RelojMinimalista from "../components/RelojMinimalista";

// Helper para obtener el día local
const getDiaSemana = (date: Date): DiaSemana => {
  const map: Record<number, DiaSemana> = {
    0: "domingo", 1: "lunes", 2: "martes", 3: "miercoles",
    4: "jueves", 5: "viernes", 6: "sabado",
  };
  return map[date.getDay()];
};

// Formateador "Miércoles 5 de agosto"
const formatearFecha = (date: Date): string => {
  const day = date.getDate();
  const month = new Intl.DateTimeFormat("es-AR", { month: "long" }).format(date);
  const weekday = new Intl.DateTimeFormat("es-AR", { weekday: "long" }).format(date);
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day} de ${month}`;
};

// Píldora de Countdown que envuelve RelojMinimalista
const PildoraCountdown = ({ horaSalida }: { horaSalida: string }) => {
  const [minutosFaltantes, setMinutosFaltantes] = useState<number | null>(null);

  useEffect(() => {
    const calcularFaltante = () => {
      const now = new Date();
      const [horas, minutos] = horaSalida.split(":").map(Number);
      
      const salidaDate = new Date(now);
      salidaDate.setHours(horas, minutos, 0, 0);

      const diffMs = salidaDate.getTime() - now.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      setMinutosFaltantes(diffMin);
    };

    calcularFaltante();
    const interval = setInterval(calcularFaltante, 10000);
    return () => clearInterval(interval);
  }, [horaSalida]);

  if (minutosFaltantes === null) return null;

  if (minutosFaltantes < 0) {
    return (
      <div className="bg-red-900/40 text-red-400 rounded-full px-3 py-1 text-sm font-medium border border-red-800/50">
        Ya salió
      </div>
    );
  }

  return (
    <div className="bg-emerald-900/40 text-emerald-400 rounded-full px-3 py-1 text-sm font-medium flex items-center gap-1.5">
      Sale en {minutosFaltantes} min
      {/* El RelojMinimalista se monta internamente como fue requerido, aunque lo mostremos sutilmente */}
      <span className="opacity-40 text-[10px] hidden sm:inline-block"><RelojMinimalista /></span>
    </div>
  );
};

// Componente para renderizar la Tarjeta de Viaje (Ida o Vuelta)
const ViajeCard = ({ 
  titulo, 
  recomendacion, 
  esHoy 
}: { 
  titulo: string; 
  recomendacion: { recomendado: Horario | null; siguiente_disponible: Horario | null; alternativas: Horario[] }; 
  esHoy: boolean;
}) => {
  if (!recomendacion.recomendado) {
    return null;
  }

  const rec = recomendacion.recomendado;
  
  // Unificar alternativas (siguiente disponible + opciones anteriores)
  const opcionesCrudas = [recomendacion.siguiente_disponible, ...recomendacion.alternativas].filter(Boolean) as Horario[];
  const alternativas = Array.from(new Set(opcionesCrudas.map(a => a.horaSalida + a.empresa)))
    .map(id => opcionesCrudas.find(a => (a.horaSalida + a.empresa) === id)!)
    .sort((a, b) => {
      const timeA = a.horaSalida.split(':').map(Number);
      const timeB = b.horaSalida.split(':').map(Number);
      return (timeA[0]*60 + timeA[1]) - (timeB[0]*60 + timeB[1]);
    });

  return (
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden mb-6">
      <div className="p-6 pb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-zinc-400 font-medium text-sm uppercase tracking-wider">
            <MapPin size={16} />
            {titulo}
          </div>
          {esHoy && <PildoraCountdown horaSalida={rec.horaSalida} />}
        </div>
        
        <div className="flex items-end gap-3 mb-1">
          <h2 className="text-6xl font-bold font-sans tracking-tight text-white leading-none">
            {rec.horaSalida}
          </h2>
          <span className="text-lg font-semibold text-zinc-500 pb-1 uppercase">
            {rec.empresa}
          </span>
        </div>
      </div>
      
      {alternativas.length > 0 && (
        <div className="border-t border-zinc-800/80 bg-zinc-900/40">
          <div className="divide-y divide-zinc-800/50">
            {alternativas.map((alt, idx) => (
              <div key={idx} className="flex justify-between items-center px-6 py-3.5">
                <span className="text-zinc-300 font-medium text-lg">{alt.horaSalida}</span>
                <span className="text-zinc-500 text-sm">{alt.empresa}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [offsetDias, setOffsetDias] = useState(0);
  const [fechaActual] = useState(new Date());
  
  // Controles Contextuales Dinámicos (Estado Local)
  const [cursaArquitectura, setCursaArquitectura] = useState(true);
  const [duermeCordoba, setDuermeCordoba] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fechaVisible = useMemo(() => {
    const d = new Date(fechaActual);
    d.setDate(d.getDate() + offsetDias);
    return d;
  }, [fechaActual, offsetDias]);

  const diaSemana = getDiaSemana(fechaVisible);
  const esHoy = offsetDias === 0;

  const recomendacionIda = useMemo(() => {
    return calcularColectivoRecomendado(diaSemana, "ida", cursaArquitectura, duermeCordoba);
  }, [diaSemana, cursaArquitectura, duermeCordoba]);

  const recomendacionVuelta = useMemo(() => {
    return calcularColectivoRecomendado(diaSemana, "vuelta", cursaArquitectura, duermeCordoba);
  }, [diaSemana, cursaArquitectura, duermeCordoba]);

  const materiasDelDia = useMemo(() => {
    return MATERIAS.filter((m) => m.dia === diaSemana).filter(m => {
        if (m.obligatoria) return true;
        if (diaSemana === 'martes' && m.nombre === 'Arquitectura' && cursaArquitectura) return true;
        if (diaSemana === 'martes' && m.nombre === 'Arquitectura' && !cursaArquitectura) return false;
        return false;
    });
  }, [diaSemana, cursaArquitectura]);

  if (!isMounted) return <div className="min-h-screen bg-black" />;

  const labelDiaBoton = offsetDias === 0 ? "Hoy" : offsetDias === -1 ? "Ayer" : offsetDias === 1 ? "Mañana" : `${Math.abs(offsetDias)}d`;

  return (
    <div className="flex flex-col min-h-screen p-6 pt-12 pb-32 max-w-md mx-auto">
      
      {/* 1. Header & Controles de Día */}
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white capitalize mb-4">
          {formatearFecha(fechaVisible)}
        </h1>
        
        <div className="inline-flex items-center bg-zinc-900 rounded-full p-1 border border-zinc-800">
          <button onClick={() => setOffsetDias(o => o - 1)} className="p-2 text-zinc-400 hover:text-white transition-colors active:scale-95">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setOffsetDias(0)} className="px-6 py-1.5 text-sm font-medium text-white bg-zinc-800 rounded-full mx-1 shadow-sm border border-zinc-700 active:scale-95">
            {labelDiaBoton}
          </button>
          <button onClick={() => setOffsetDias(o => o + 1)} className="p-2 text-zinc-400 hover:text-white transition-colors active:scale-95">
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      {/* 2. Controles Contextuales Dinámicos */}
      {(diaSemana === "martes" || diaSemana === "viernes") && (
        <div className="mb-6 bg-zinc-900 rounded-3xl border border-zinc-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${diaSemana === 'martes' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
              {diaSemana === 'martes' ? <BookOpen size={20} /> : <Moon size={20} />}
            </div>
            <span className="font-medium text-zinc-200 text-sm">
              {diaSemana === "martes" ? "¿Cursás Arquitectura hoy?" : "¿Te quedás a dormir en Cba?"}
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={diaSemana === "martes" ? cursaArquitectura : duermeCordoba}
              onChange={(e) => {
                if (diaSemana === "martes") setCursaArquitectura(e.target.checked);
                else setDuermeCordoba(e.target.checked);
              }}
            />
            <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
      )}

      {/* 3. Tarjetas de Viajes */}
      {!recomendacionIda.recomendado && !recomendacionVuelta.recomendado && materiasDelDia.length === 0 ? (
        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-8 text-center mt-6">
          <h2 className="text-xl font-bold mb-2 text-zinc-100">Día libre</h2>
          <p className="text-zinc-500 text-sm">No hay viajes ni materias programadas para hoy.</p>
        </div>
      ) : (
        <div className="mt-2">
          
          <ViajeCard 
            titulo="Hacia Córdoba" 
            recomendacion={recomendacionIda} 
            esHoy={esHoy} 
          />

          {/* Tarjeta de Materias */}
          {materiasDelDia.length > 0 && (
            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 mb-6">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BookOpen size={18} />
                Materias de {diaSemana}
              </h3>
              <div className="divide-y divide-zinc-800/50">
                {materiasDelDia.map((m, idx) => (
                  <div key={idx} className="py-3.5 flex justify-between items-center first:pt-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="text-zinc-100 font-medium text-lg">{m.nombre}</span>
                      <span className="text-zinc-500 text-sm">
                        {m.horaInicio} - {m.horaFin}
                      </span>
                    </div>
                    {!m.obligatoria && (
                      <span className="bg-zinc-800 text-zinc-400 text-xs px-2.5 py-1 rounded-full font-medium">
                        Opcional
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <ViajeCard 
            titulo="Regreso a Casa" 
            recomendacion={recomendacionVuelta} 
            esHoy={esHoy} 
          />
          
        </div>
      )}
    </div>
  );
}
