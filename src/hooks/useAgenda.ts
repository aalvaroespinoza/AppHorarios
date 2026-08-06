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
    descargarICS(nuevoEvento);
  };

  const descargarICS = (evento: CustomEvent) => {
    const getNextDateForDay = (dayName: string) => {
      const map: Record<string, number> = {
        'lunes': 1, 'martes': 2, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sabado': 6, 'domingo': 0
      };
      const target = map[dayName.toLowerCase()] ?? 1;
      const now = new Date();
      const current = now.getDay();
      let daysToAdd = target - current;
      if (daysToAdd < 0) {
        daysToAdd += 7;
      }
      return new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    };

    const formatICSDate = (date: Date, timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const d = new Date(date);
      d.setHours(hours, minutes, 0, 0);
      
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
    };

    const date = getNextDateForDay(evento.dia);
    const dtstart = formatICSDate(date, evento.horaInicio);
    const dtend = formatICSDate(date, evento.horaFin);
    
    // Para DTSTAMP (momento de creación)
    const now = new Date();
    const dtstamp = formatICSDate(now, `${now.getHours()}:${now.getMinutes()}`);

    const icsString = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AppHorarios//ES',
      'BEGIN:VEVENT',
      `UID:${evento.id}@apphorarios.local`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${evento.titulo}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${evento.titulo.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
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
