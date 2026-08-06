import { BrainAnalysisResult, BrainContext } from '../types';

/**
 * Contrato base para manejar intenciones específicas después de que el texto ha sido clasificado.
 */
export interface IIntentHandler<T> {
  canHandle(intentType: string): boolean;
  process(data: T, context: BrainContext): Promise<void>;
}
