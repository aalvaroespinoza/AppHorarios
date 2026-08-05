import type { SubjectData } from '@/types/subject';

/**
 * Repositorio de materias.
 * Interfaz que abstrae la fuente de datos (JSON local, API, etc.).
 * Implementar en lib/repositories/subject-repository.ts
 */
export interface SubjectRepository {
  /** Retorna todas las materias registradas */
  getAll(): Promise<SubjectData>;
}
