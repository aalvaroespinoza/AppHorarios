export type BrainIntentType = 'task' | 'expense' | 'event' | 'unknown';

export interface BrainContext {
  currentDateIso: string;
  userTimezone: string;
  recentFacts?: string[]; // Para futuro contexto (RAG)
}

export interface BrainAnalysisResult<T = any> {
  intent: BrainIntentType;
  confidence: number;
  extractedEntities: T;
  reasoning?: string;
}

export interface IBrainService {
  analyzeText(text: string, context: BrainContext): Promise<BrainAnalysisResult>;
}
