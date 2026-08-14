import { Subject } from '@/types/subject';
import { idb } from '@/core/utils/indexedDB';
import { subjectData as defaultSubjectData } from '@/data/subjects';

export const SUBJECTS_STORAGE_KEY = 'lifeos_subjects';
export const SUBJECTS_UPDATED_EVENT = 'lifeos_subjects_updated';

/**
 * Obtiene la lista de materias de forma síncrona desde localStorage.
 * Ideal para Providers, ContextEngine y funciones de utilidad que se ejecutan en el cliente.
 */
export function getStoredSubjectsSync(): Subject[] {
  if (typeof window === 'undefined') {
    return defaultSubjectData.subjects;
  }
  try {
    const raw = localStorage.getItem(SUBJECTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error al leer materias de localStorage:', e);
  }
  return defaultSubjectData.subjects;
}

/**
 * Obtiene la lista de materias de forma asíncrona consultando IndexedDB con fallback a localStorage.
 */
export async function getStoredSubjects(): Promise<Subject[]> {
  if (typeof window === 'undefined') {
    return defaultSubjectData.subjects;
  }
  try {
    const idbData = await idb.get<Subject[]>(SUBJECTS_STORAGE_KEY);
    if (idbData && Array.isArray(idbData) && idbData.length > 0) {
      return idbData;
    }
    const syncData = getStoredSubjectsSync();
    if (syncData && syncData.length > 0) {
      return syncData;
    }
  } catch (e) {
    console.error('Error al obtener materias desde IndexedDB:', e);
  }
  return defaultSubjectData.subjects;
}

/**
 * Persiste la lista de materias tanto en IndexedDB (Local-First) como en localStorage (Sync),
 * emitiendo un evento global para actualizar reactivamente todas las vistas.
 */
export async function saveStoredSubjects(subjects: Subject[]): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(subjects));
      window.dispatchEvent(new CustomEvent(SUBJECTS_UPDATED_EVENT, { detail: subjects }));
    } catch (e) {
      console.error('Error al guardar materias en localStorage:', e);
    }
  }
  await idb.set(SUBJECTS_STORAGE_KEY, subjects);
}
