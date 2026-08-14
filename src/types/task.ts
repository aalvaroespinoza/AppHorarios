export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: 'baja' | 'media' | 'alta';
  createdAt?: string;
  dueDate?: string;
}
