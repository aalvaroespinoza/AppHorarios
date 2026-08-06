/**
 * Interfaces para las entidades extraídas de los textos.
 */
export interface ExtractedTask {
  title: string;
  dueDate: string | null;
}

export interface ExtractedExpense {
  amount: number;
  description: string;
  category?: string;
}

export interface ExtractedEvent {
  title: string;
  startTime: string;
  endTime?: string;
}
