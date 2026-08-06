"use client";

import { useState, useEffect } from 'react';

export type EnergiaNivel = 'alta' | 'media' | 'baja';

export interface TareaBateria {
  id: string;
  titulo: string;
  energia: EnergiaNivel;
  completada: boolean;
}

export function useBateriaMental() {
  const [tareas, setTareas] = useState<TareaBateria[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('academia_bateria_mental');
      if (stored) {
        try {
          setTareas(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing bateria mental:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('academia_bateria_mental', JSON.stringify(tareas));
    }
  }, [tareas, isMounted]);

  const agregarTarea = (titulo: string, energia: EnergiaNivel) => {
    const nuevaTarea: TareaBateria = {
      id: Date.now().toString(),
      titulo,
      energia,
      completada: false
    };
    setTareas(prev => [...prev, nuevaTarea]);
  };

  const alternarCompletada = (id: string) => {
    setTareas(prev => prev.map(t => 
      t.id === id ? { ...t, completada: !t.completada } : t
    ));
  };

  const eliminarTarea = (id: string) => {
    setTareas(prev => prev.filter(t => t.id !== id));
  };

  return {
    tareas,
    isMounted,
    agregarTarea,
    alternarCompletada,
    eliminarTarea
  };
}
