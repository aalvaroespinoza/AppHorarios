"use client";

import { useState, useEffect } from 'react';
import { subjectData } from '@/data/subjects';

export interface CustomEvent {
  id: string;
  titulo: string;
  horaInicio: string;
  horaFin: string;
  dia: string;
}

export interface AgendaItem {
  id: string;
  titulo: string;
  horaInicio: string;
  horaFin: string;
  tipo: 'materia' | 'custom';
  color?: string;
  modalidad?: string;
}

export function useAgenda() {
  const [eventos, setEventos] = useState<CustomEvent[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('academia_agenda_eventos');
      if (stored) {
        try {
          setEventos(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing academia_agenda_eventos:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('academia_agenda_eventos', JSON.stringify(eventos));
    }
  }, [eventos, isMounted]);

  const agregarEvento = (nuevoEvento: CustomEvent) => {
    setEventos(prev => [...prev, nuevoEvento]);
  };

  const eliminarEvento = (id: string) => {
    setEventos(prev => prev.filter(e => e.id !== id));
  };

  const obtenerAgendaDelDia = (dia: string): AgendaItem[] => {
    const agenda: AgendaItem[] = [];

    // 1. Agregar materias estáticas
    subjectData.subjects.forEach(subject => {
      subject.classBlocks.forEach(block => {
        if (block.day.toLowerCase() === dia.toLowerCase()) {
          agenda.push({
            id: `${subject.id}-${block.day}`,
            titulo: subject.name,
            horaInicio: block.startTime,
            horaFin: block.endTime,
            tipo: 'materia',
            color: subject.color,
            modalidad: subject.modality
          });
        }
      });
    });

    // 2. Agregar eventos personalizados
    const eventosDelDia = eventos.filter(e => e.dia.toLowerCase() === dia.toLowerCase());
    eventosDelDia.forEach(e => {
      agenda.push({
        id: e.id,
        titulo: e.titulo,
        horaInicio: e.horaInicio,
        horaFin: e.horaFin,
        tipo: 'custom',
        color: 'bg-zinc-700 text-zinc-100' // Default styling for custom events
      });
    });

    // 3. Ordenar cronológicamente
    agenda.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

    return agenda;
  };

  return {
    eventos,
    isMounted,
    agregarEvento,
    eliminarEvento,
    obtenerAgendaDelDia
  };
}
