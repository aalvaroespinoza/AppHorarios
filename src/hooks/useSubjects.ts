"use client";

import { useState, useEffect, useCallback } from 'react';
import { Subject, ClassBlock } from '@/types/subject';
import { DayOfWeek, Shift } from '@/core/types/common';
import { subjectData as defaultSubjectData } from '@/data/subjects';
import { parseMateriaInfo } from '@/core/utils/edificio';
import { 
  getStoredSubjectsSync, 
  getStoredSubjects, 
  saveStoredSubjects, 
  SUBJECTS_STORAGE_KEY, 
  SUBJECTS_UPDATED_EVENT 
} from '@/core/services/subject.service';

export { SUBJECTS_STORAGE_KEY, SUBJECTS_UPDATED_EVENT };

export interface SubjectFormData {
  nombre: string;
  dia: DayOfWeek;
  horaInicio: string;
  horaFin: string;
  curso: string;
  aula: string;
}

/**
 * Convierte los datos del formulario al modelo de dominio Subject.
 */
export function formDataToSubject(
  data: SubjectFormData,
  existingSubject?: Partial<Subject>
): Subject {
  const cleanNombre = data.nombre.trim();
  const cleanCurso = data.curso.trim();
  const cleanAula = data.aula.trim();

  // Armar el nombre estructurado reconocible por los parsers (ej: "2K3 Aula:400 Análisis de Sistemas")
  let formattedName = cleanNombre;
  if (cleanCurso && cleanAula) {
    formattedName = `${cleanCurso} Aula:${cleanAula} ${cleanNombre}`;
  } else if (cleanCurso) {
    formattedName = `${cleanCurso} ${cleanNombre}`;
  } else if (cleanAula) {
    formattedName = `Aula:${cleanAula} ${cleanNombre}`;
  }

  // Calcular el turno según la hora de inicio
  const [h] = data.horaInicio.split(':').map(Number);
  let shift: Shift = 'mañana';
  if (h >= 13 && h < 18) shift = 'tarde';
  else if (h >= 18) shift = 'noche';

  const defaultColors = [
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'bg-rose-500/20 text-rose-300 border-rose-500/30',
    'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'bg-pink-500/20 text-pink-300 border-pink-500/30',
    'bg-amber-500/20 text-amber-300 border-amber-500/30'
  ];
  const randomColor = defaultColors[Math.floor(Math.random() * defaultColors.length)];

  const block: ClassBlock = {
    day: data.dia,
    startTime: data.horaInicio,
    endTime: data.horaFin,
    classroom: cleanAula || undefined
  };

  return {
    id: existingSubject?.id || `subj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: formattedName,
    code: existingSubject?.code,
    year: existingSubject?.year,
    semester: existingSubject?.semester,
    shift: existingSubject?.shift || shift,
    modality: existingSubject?.modality || 'presencial',
    isOptional: existingSubject?.isOptional ?? false,
    color: existingSubject?.color || randomColor,
    classBlocks: [block]
  };
}

/**
 * Convierte un Subject existente al formato plano editable del formulario.
 */
export function subjectToFormData(subject: Subject): SubjectFormData {
  const block = subject.classBlocks && subject.classBlocks[0];
  const parsed = parseMateriaInfo(subject.name);

  const cleanNombre = parsed.nombre && parsed.nombre !== 'Materia' && parsed.nombre !== 'Consultar'
    ? parsed.nombre
    : subject.name;

  return {
    nombre: cleanNombre,
    dia: (block?.day as DayOfWeek) || 'lunes',
    horaInicio: block?.startTime || '08:00',
    horaFin: block?.endTime || '11:10',
    curso: parsed.curso && parsed.curso !== 'Consultar' ? parsed.curso : '',
    aula: block?.classroom || (parsed.aula && parsed.aula !== 'N/A' ? parsed.aula : '')
  };
}

/**
 * Hook para la gestión integral de materias con soporte reactivo Local-First (IndexedDB + localStorage).
 */
export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    return getStoredSubjectsSync();
  });
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshSubjects = useCallback(async () => {
    try {
      const loaded = await getStoredSubjects();
      setSubjects(loaded);
    } catch (err) {
      console.error('Error al refrescar materias:', err);
    } finally {
      setLoading(false);
      setIsMounted(true);
    }
  }, []);

  // Carga inicial y suscripción a eventos de actualización
  useEffect(() => {
    refreshSubjects();

    const handleCustomUpdate = (event: CustomEvent<Subject[]>) => {
      if (event.detail && Array.isArray(event.detail)) {
        setSubjects(event.detail);
      } else {
        refreshSubjects();
      }
    };

    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === SUBJECTS_STORAGE_KEY) {
        refreshSubjects();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(SUBJECTS_UPDATED_EVENT as any, handleCustomUpdate);
      window.addEventListener('storage', handleStorageUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(SUBJECTS_UPDATED_EVENT as any, handleCustomUpdate);
        window.removeEventListener('storage', handleStorageUpdate);
      }
    };
  }, [refreshSubjects]);

  const addSubject = useCallback(async (formData: SubjectFormData): Promise<Subject> => {
    const newSubject = formDataToSubject(formData);
    const current = getStoredSubjectsSync();
    const updated = [...current, newSubject];
    await saveStoredSubjects(updated);
    setSubjects(updated);
    return newSubject;
  }, []);

  const updateSubject = useCallback(async (id: string, formData: SubjectFormData): Promise<Subject> => {
    const current = getStoredSubjectsSync();
    const existing = current.find(s => s.id === id);
    const updatedSubject = formDataToSubject(formData, existing);
    const updated = current.map(s => s.id === id ? updatedSubject : s);
    await saveStoredSubjects(updated);
    setSubjects(updated);
    return updatedSubject;
  }, []);

  const deleteSubject = useCallback(async (id: string): Promise<void> => {
    const current = getStoredSubjectsSync();
    const updated = current.filter(s => s.id !== id);
    await saveStoredSubjects(updated);
    setSubjects(updated);
  }, []);

  const resetToDefaults = useCallback(async (): Promise<void> => {
    await saveStoredSubjects(defaultSubjectData.subjects);
    setSubjects(defaultSubjectData.subjects);
  }, []);

  return {
    subjects,
    loading,
    isMounted,
    addSubject,
    updateSubject,
    deleteSubject,
    resetToDefaults,
    refresh: refreshSubjects
  };
}
