"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { DayOfWeek } from '@/types/common';

export interface EscenarioUsuario {
  diaSeleccionado: DayOfWeek;
  cursaArquitectura: boolean;
  duermeEnCordoba: boolean;
}

export interface EscenarioContextProps {
  diaSeleccionado: DayOfWeek;
  cursaArquitectura: boolean;
  duermeEnCordoba: boolean;
  setDiaSeleccionado: (dia: DayOfWeek) => void;
  setCursaArquitectura: (val: boolean) => void;
  setDuermeEnCordoba: (val: boolean) => void;
  isMounted: boolean;
}

const getDiaActual = (): DayOfWeek => {
  const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const diaIndex = new Date().getDay();
  if (diaIndex === 0) return 'lunes'; // Si es domingo, por defecto mostramos lunes
  return dias[diaIndex] as DayOfWeek;
};

const defaultEscenario: EscenarioUsuario = {
  diaSeleccionado: getDiaActual(),
  cursaArquitectura: true,
  duermeEnCordoba: false,
};

export const EscenarioContext = createContext<EscenarioContextProps | undefined>(undefined);

const STORAGE_KEY = 'appHorarios_escenario';

export function EscenarioProvider({ children }: { children: ReactNode }) {
  const [escenario, setEscenario] = useState<EscenarioUsuario>(defaultEscenario);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        const storedEscenario = JSON.parse(item) as Partial<EscenarioUsuario>;
        const cleanEscenario: Partial<EscenarioUsuario> = {};
        if (storedEscenario.diaSeleccionado) cleanEscenario.diaSeleccionado = storedEscenario.diaSeleccionado;
        if (typeof storedEscenario.cursaArquitectura === 'boolean') cleanEscenario.cursaArquitectura = storedEscenario.cursaArquitectura;
        if (typeof storedEscenario.duermeEnCordoba === 'boolean') cleanEscenario.duermeEnCordoba = storedEscenario.duermeEnCordoba;
        
        setEscenario((prev) => ({ ...prev, ...cleanEscenario }));
      }
    } catch (error) {
      console.error('Error al intentar leer del localStorage:', error);
    }
  }, []);

  const saveEscenario = useCallback((nuevoEstado: EscenarioUsuario) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevoEstado));
      }
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  }, []);

  const setDiaSeleccionado = useCallback((diaSeleccionado: DayOfWeek) => {
    setEscenario((prev) => {
      const newState = { ...prev, diaSeleccionado };
      saveEscenario(newState);
      return newState;
    });
  }, [saveEscenario]);

  const setCursaArquitectura = useCallback((cursaArquitectura: boolean) => {
    setEscenario((prev) => {
      const newState = { ...prev, cursaArquitectura };
      saveEscenario(newState);
      return newState;
    });
  }, [saveEscenario]);

  const setDuermeEnCordoba = useCallback((duermeEnCordoba: boolean) => {
    setEscenario((prev) => {
      const newState = { ...prev, duermeEnCordoba };
      saveEscenario(newState);
      return newState;
    });
  }, [saveEscenario]);

  return (
    <EscenarioContext.Provider value={{
      ...escenario,
      setDiaSeleccionado,
      setCursaArquitectura,
      setDuermeEnCordoba,
      isMounted
    }}>
      {children}
    </EscenarioContext.Provider>
  );
}
