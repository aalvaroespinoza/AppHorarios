import { BaseEntity } from '../types/db';

/**
 * Motor de resolución de conflictos de datos.
 */
export class ConflictResolver {
  /**
   * Resuelve colisiones utilizando el patrón Last Write Wins (LWW).
   * Compara los timestamps absolutos y retorna la entidad ganadora.
   */
  static resolveLWW<T extends BaseEntity>(local: T, remote: T): T {
    const localTime = new Date(local.updated_at).getTime();
    const remoteTime = new Date(remote.updated_at).getTime();

    return localTime > remoteTime ? local : remote;
  }
}
