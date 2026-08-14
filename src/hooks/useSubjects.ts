"use client";

import { useState, useEffect, useCallback } from 'react';
import { Subject, ClassBlock } from '@/types/subject';
import { DayOfWeek, Shift } from '@/core/types/common';
import { subjectData as defaultSubjectData } from '@/data/subjects';
import { idb } from '@/core/utils/indexedDB';
import { parseMateriaInfo } from '@/core/utils/edificio';

export const SUBJECTS_STORAGE_KEY = 'lifeos_subjects';

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
 * Hook para la gestión integral de materias con soporte Local-First (IndexedDB + localStorage).
 */
export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carga inicial
  useEffect(() => {
    let isCancelled = false;

    const loadSubjects = async () => {
      try {
        let loaded: Subject[] | null = null;

        // 1. Intentar leer de IndexedDB
        const idbData = await idb.get<Subject[]>(SUBJECTS_STORAGE_KEY);
        if (idbData && Array.isArray(idbData) && idbData.length > 0) {
          loaded = idbData;
        } else if (typeof window !== 'undefined') {
          // 2. Fallback a localStorage
          const localData = localStorage.getItem(SUBJECTS_STORAGE_KEY);
          if (localData) {
            try {
              const parsed = JSON.parse(localData);
              if (Array.isArray(parsed) && parsed.length > 0) {
                loaded = parsed;
              }
            } catch (e) {
              console.error('Error al parsear localStorage subjects:', e);
            }
          }
        }

        // 3. Si no hay registros previos, inicializar con subjectData por defecto
        if (!loaded || loaded.length === 0) {
          loaded = defaultSubjectData.subjects;
          if (typeof window !== 'undefined') {
            localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(loaded));
          }
          await idb.set(SUBJECTS_STORAGE_KEY, loaded);
        }

        if (!isCancelled) {
          setSubjects(loaded);
          setLoading(false);
          setIsMounted(true);
        }
      } catch (err) {
        console.error('Error cargando materias:', err);
        if (!isCancelled) {
          setSubjects(defaultSubjectData.subjects);
          setLoading(false);
          setIsMounted(true);
        }
      }
    };

    loadSubjects();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Guardar en ambas capas de persistencia
  const saveSubjects = useCallback(async (newSubjects: Subject[]) => {
    setSubjects(newSubjects);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(newSubjects));
    }
    await idb.set(SUBJECTS_STORAGE_KEY, newSubjects);
  }, []);

  const addSubject = useCallback(async (formData: SubjectFormData): Promise<Subject> => {
    const newSubject = formDataToSubject(formData);
    const updated = [...subjects, newSubject];
    await saveSubjects(updated);
    return newSubject;
  }, [subjects, saveSubjects]);

  const updateSubject = useCallback(async (id: string, formData: SubjectFormData): Promise<Subject> => {
    const existing = subjects.find(s => s.id === id);
    const updatedSubject = formDataToSubject(formData, existing);
    const updated = subjects.map(s => s.id === id ? updatedSubject : s);
    await saveSubjects(updated);
    return updatedSubject;
  }, [subjects, saveSubjects]);

  const deleteSubject = useCallback(async (id: string): Promise<void> => {
    const updated = subjects.filter(s => s.id !== id);
    await saveSubjects(updated);
  }, [subjects, saveSubjects]);

  const resetToDefaults = useCallback(async (): Promise<void> => {
    await saveSubjects(defaultSubjectData.subjects);
  }, [saveSubjects]);

  return {
    subjects,
    loading,
    isMounted,
    addSubject,
    updateSubject,
    deleteSubject,
    resetToDefaults
  };
}
