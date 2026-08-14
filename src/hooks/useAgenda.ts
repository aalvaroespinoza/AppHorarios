"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  getStoredSubjectsSync, 
  SUBJECTS_UPDATED_EVENT, 
  SUBJECTS_STORAGE_KEY 
} from '@/core/services/subject.service';

export interface CustomEvent {
  id: string;
  titulo: string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string;
  horaFin: string;
  tipo: 'materia' | 'custom';
  descripcion?: string;
  ubicacion?: string;
  color?: string;
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
  const [, setSubjectVersion] = useState(0);

  const getDateForCurrentWeekDay = (dayName: string): string => {
    const map: Record<string, number> = {
      'lunes': 1, 'martes': 2, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sabado': 6, 'domingo': 0
    };
    const target = map[dayName.toLowerCase()] ?? 1;
    const now = new Date();
    const current = now.getDay();
    const currentDist = current === 0 ? 6 : current - 1;
    const targetDist = target === 0 ? 6 : target - 1;
    const diff = targetDist - currentDist;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);
    // Para zona local
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('academia_agenda_eventos');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const migrated = parsed.map((e: any) => {
            return {
              id: e.id || crypto.randomUUID(),
              titulo: e.titulo || 'Evento',
              fecha: e.fecha || (e.dia ? getDateForCurrentWeekDay(e.dia) : getDateForCurrentWeekDay('lunes')),
              horaInicio: e.horaInicio || '00:00',
              horaFin: e.horaFin || '23:59',
              tipo: e.tipo || 'custom',
              descripcion: e.descripcion,
              ubicacion: e.ubicacion,
              color: e.color
            } as CustomEvent;
          });
          setEventos(migrated);
        } catch (e) {
          console.error("Error parsing academia_agenda_eventos:", e);
        }
      }

      // Escuchar cambios en las materias dinámicas para forzar re-evaluación
      const handleSubjectsUpdated = () => {
        setSubjectVersion(v => v + 1);
      };

      const handleStorage = (e: StorageEvent) => {
        if (e.key === SUBJECTS_STORAGE_KEY) {
          setSubjectVersion(v => v + 1);
        }
      };

      window.addEventListener(SUBJECTS_UPDATED_EVENT as any, handleSubjectsUpdated);
      window.addEventListener('storage', handleStorage);

      return () => {
        window.removeEventListener(SUBJECTS_UPDATED_EVENT as any, handleSubjectsUpdated);
        window.removeEventListener('storage', handleStorage);
      };
    }
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('academia_agenda_eventos', JSON.stringify(eventos));
    }
  }, [eventos, isMounted]);

  // Permitimos pasar 'dia' en Omit para mantener retrocompatibilidad con AgendaView
  const agregarEvento = (eventoInput: Omit<CustomEvent, 'fecha' | 'tipo'> & { dia?: string, fecha?: string }, skipICS: boolean = false) => {
    const nuevaFecha = eventoInput.fecha || (eventoInput.dia ? getDateForCurrentWeekDay(eventoInput.dia) : getDateForCurrentWeekDay('lunes'));
    
    const nuevoEvento: CustomEvent = {
      id: eventoInput.id || crypto.randomUUID(),
      titulo: eventoInput.titulo,
      fecha: nuevaFecha,
      horaInicio: eventoInput.horaInicio,
      horaFin: eventoInput.horaFin,
      tipo: 'custom',
      descripcion: eventoInput.descripcion,
      ubicacion: eventoInput.ubicacion,
      color: eventoInput.color
    };

    setEventos(prev => [...prev, nuevoEvento]);
    if (!skipICS) {
      descargarICS(nuevoEvento);
    }
  };

  const descargarICS = (evento: CustomEvent) => {
    const formatICSDate = (dateStr: string, timeStr: string) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);
      const d = new Date(year, month - 1, day, hours, minutes);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
    };

    const dtstart = formatICSDate(evento.fecha, evento.horaInicio);
    const dtend = formatICSDate(evento.fecha, evento.horaFin);
    
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth()+1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

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

  // Recibe 'lunes', 'martes', etc o una fecha YYYY-MM-DD
  const obtenerAgendaDelDia = useCallback((diaOFecha: string): AgendaItem[] => {
    const agenda: AgendaItem[] = [];
    
    const esFechaISO = /^\d{4}-\d{2}-\d{2}$/.test(diaOFecha);
    let targetDateISO = diaOFecha;
    let targetDayName = diaOFecha.toLowerCase();

    if (esFechaISO) {
      const [year, month, day] = diaOFecha.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      targetDayName = dias[d.getDay()];
    } else {
      targetDateISO = getDateForCurrentWeekDay(diaOFecha);
    }

    // 1. Agregar materias dinámicas (recurrentes) según el nombre del día
    const currentSubjects = getStoredSubjectsSync();
    currentSubjects.forEach(subject => {
      subject.classBlocks.forEach(block => {
        if (block.day.toLowerCase() === targetDayName) {
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

    // 2. Agregar eventos personalizados (solo para esa fecha exacta)
    const eventosDelDia = eventos.filter(e => e.fecha === targetDateISO);
    eventosDelDia.forEach(e => {
      agenda.push({
        id: e.id,
        titulo: e.titulo,
        horaInicio: e.horaInicio,
        horaFin: e.horaFin,
        tipo: 'custom',
        color: e.color || 'bg-zinc-700 text-zinc-100'
      });
    });

    // 3. Ordenar cronológicamente
    agenda.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

    return agenda;
  }, [eventos]);

  return {
    eventos,
    isMounted,
    agregarEvento,
    eliminarEvento,
    obtenerAgendaDelDia
  };
}
