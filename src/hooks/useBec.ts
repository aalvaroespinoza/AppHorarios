"use client";

import { useLocalStorageState } from '@/core/hooks/useLocalStorageState';

export interface BecDayRecord {
  fecha: string; // Formato YYYY-MM-DD
  idaUsado: boolean;
  vueltaUsado: boolean;
}

export interface BecMonthSummary {
  idaTotal: number;
  vueltaTotal: number;
  totalCombinado: number;
}

export function useBec() {
  const [historialBec, setHistorialBec, isMounted] = useLocalStorageState<BecDayRecord[]>('historialBec', []);

  /**
   * Marca un viaje como usado en el día actual (zona horaria Argentina).
   */
  const marcarViaje = (tipo: 'ida' | 'vuelta') => {
    const hoy = new Date();
    // 'en-CA' formatea la fecha exactamente como YYYY-MM-DD
    const formatter = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const fechaString = formatter.format(hoy);

    setHistorialBec(prev => {
      const copy = [...prev];
      const index = copy.findIndex(record => record.fecha === fechaString);

      if (index >= 0) {
        // Actualizar registro existente del día
        copy[index] = {
          ...copy[index],
          idaUsado: tipo === 'ida' ? true : copy[index].idaUsado,
          vueltaUsado: tipo === 'vuelta' ? true : copy[index].vueltaUsado,
        };
      } else {
        // Crear nuevo registro para el día de hoy
        copy.push({
          fecha: fechaString,
          idaUsado: tipo === 'ida',
          vueltaUsado: tipo === 'vuelta'
        });
      }
      return copy;
    });
  };

  /**
   * Obtiene el resumen de pasajes usados en un mes determinado.
   * @param mes Mes (1 = Enero, 12 = Diciembre)
   * @param anio Año (ej: 2026)
   */
  const obtenerResumenMensual = (mes: number, anio: number): BecMonthSummary => {
    const prefijo = `${anio}-${mes.toString().padStart(2, '0')}`;
    
    let idaTotal = 0;
    let vueltaTotal = 0;

    historialBec.forEach(record => {
      if (record.fecha.startsWith(prefijo)) {
        if (record.idaUsado) idaTotal++;
        if (record.vueltaUsado) vueltaTotal++;
      }
    });

    return {
      idaTotal,
      vueltaTotal,
      totalCombinado: idaTotal + vueltaTotal
    };
  };

  /**
   * Obtiene el estado del día actual para renderizado en la UI.
   */
  const getRegistroHoy = (): BecDayRecord => {
    const hoy = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const fechaString = formatter.format(hoy);
    
    return historialBec.find(r => r.fecha === fechaString) || { 
      fecha: fechaString, 
      idaUsado: false, 
      vueltaUsado: false 
    };
  };

  /**
   * Borra todo el historial de BEC localmente.
   */
  const reiniciarHistorial = () => {
    setHistorialBec([]);
    localStorage.removeItem('historialBec');
  };

  /**
   * Desmarca un viaje como usado en el día actual (zona horaria Argentina).
   */
  const desmarcarViaje = (tipo: 'ida' | 'vuelta') => {
    const hoy = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const fechaString = formatter.format(hoy);

    setHistorialBec(prev => {
      const copy = [...prev];
      const index = copy.findIndex(record => record.fecha === fechaString);

      if (index >= 0) {
        copy[index] = {
          ...copy[index],
          idaUsado: tipo === 'ida' ? false : copy[index].idaUsado,
          vueltaUsado: tipo === 'vuelta' ? false : copy[index].vueltaUsado,
        };
      }
      return copy;
    });
  };

  return {
    historialBec,
    isMounted,
    marcarViaje,
    desmarcarViaje,
    obtenerResumenMensual,
    getRegistroHoy,
    reiniciarHistorial
  };
}
