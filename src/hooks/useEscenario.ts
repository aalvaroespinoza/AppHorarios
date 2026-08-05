import { useState, useEffect, useCallback } from 'react';
import { EscenarioUsuario } from '../types';

const defaultEscenario: EscenarioUsuario = {
  tema: 'claro',
};

const STORAGE_KEY = 'appHorarios_escenario';

export const useEscenario = () => {
  // Inicializamos con el estado por defecto para garantizar que el SSR de Next.js
  // renderice exactamente lo mismo en servidor y cliente en la primera pasada (hidratación).
  const [escenario, setEscenario] = useState<EscenarioUsuario>(defaultEscenario);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Una vez montado en el cliente, leemos de localStorage y sobrescribimos si existe.
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        // Hacemos merge con los defaults por si agregamos nuevas propiedades en el futuro
        const storedEscenario = JSON.parse(item) as Partial<EscenarioUsuario>;
        setEscenario((prev) => ({ ...prev, ...storedEscenario }));
      }
    } catch (error) {
      console.error('Error al intentar leer del localStorage:', error);
    }
  }, []);

  const updateEscenario = useCallback((updates: Partial<EscenarioUsuario>) => {
    setEscenario((prev) => {
      const nuevoEstado = { ...prev, ...updates };
      
      // Guardamos la configuración de forma síncrona en localStorage
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevoEstado));
        }
      } catch (error) {
        console.error('Error al intentar guardar en localStorage:', error);
      }
      
      return nuevoEstado;
    });
  }, []);

  return {
    escenario,
    updateEscenario,
    isMounted, // Útil en componentes para mostrar skeleton loaders y evitar destellos de UI durante la hidratación
  };
};
