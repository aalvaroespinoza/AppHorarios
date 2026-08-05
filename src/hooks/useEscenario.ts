import { useState, useEffect, useCallback } from 'react';
import { DiaSemana } from '../types';

export interface EscenarioUsuario {
  diaSeleccionado: DiaSemana;
  cursaArquitectura: boolean;
  duermeEnCordoba: boolean;
}

const getDiaActual = (): DiaSemana => {
  const dias: DiaSemana[] = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const diaIndex = new Date().getDay();
  if (diaIndex === 0) return 'lunes'; // Si es domingo (0), por defecto mostramos lunes
  return dias[diaIndex];
};

const defaultEscenario: EscenarioUsuario = {
  diaSeleccionado: getDiaActual(),
  cursaArquitectura: true,
  duermeEnCordoba: false,
};

const STORAGE_KEY = 'appHorarios_escenario';

export const useEscenario = () => {
  const [escenario, setEscenario] = useState<EscenarioUsuario>(defaultEscenario);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        const storedEscenario = JSON.parse(item) as Partial<EscenarioUsuario>;
        // Filtrar solo las propiedades permitidas para evitar inyecciones viejas
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

  const setDiaSeleccionado = useCallback((diaSeleccionado: DiaSemana) => {
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

  return {
    diaSeleccionado: escenario.diaSeleccionado,
    cursaArquitectura: escenario.cursaArquitectura,
    duermeEnCordoba: escenario.duermeEnCordoba,
    setDiaSeleccionado,
    setCursaArquitectura,
    setDuermeEnCordoba,
    isMounted,
  };
};
