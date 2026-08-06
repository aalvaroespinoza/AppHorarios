"use client";

import { useLocalStorageState } from '@/core/hooks/useLocalStorageState';

export interface Deadline {
  id: string;
  fecha: string; // Formato YYYY-MM-DD
  titulo: string;
  colorIcono: string;
}

export function useDeadlines() {
  const [deadlines, setDeadlines, isMounted] = useLocalStorageState<Deadline[]>('academia_deadlines', []);

  const agregarDeadline = (nuevo: Deadline) => {
    setDeadlines(prev => [...prev, nuevo]);
  };

  const eliminarDeadline = (id: string) => {
    setDeadlines(prev => prev.filter(d => d.id !== id));
  };

  const calcularDiasFaltantes = (fechaString: string): number => {
    // Parse fecha considerando que es YYYY-MM-DD en la zona horaria local
    const [year, month, day] = fechaString.split('-').map(Number);
    const fechaObj = new Date(year, month - 1, day);
    
    // Normalizar "hoy" a medianoche para que la diferencia sea exacta en días calendario
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const diferenciaMs = fechaObj.getTime() - hoy.getTime();
    return Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
  };

  return {
    deadlines,
    isMounted,
    agregarDeadline,
    eliminarDeadline,
    calcularDiasFaltantes
  };
}
