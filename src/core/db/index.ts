export * from './client';
export * from './repository';
export * from './errors';
export * from './helpers';

import { BaseRepository } from './repository';
import { STORES } from './client';
import { BaseEntity } from '../types/db';

// Ejemplo de entidad fuertemente tipada:
export interface TaskEntity extends BaseEntity {
  title: string;
  completed: boolean;
}

// Instancias pre-configuradas (Singleton) para cada dominio:
export const tasksRepository = new BaseRepository<TaskEntity>(STORES.TAREAS);
export const expensesRepository = new BaseRepository<any>(STORES.GASTOS);
export const agendaRepository = new BaseRepository<any>(STORES.AGENDA);
