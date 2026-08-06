import { BrainAnalysisResult, BrainContext, IBrainService } from '../types';
import { GeminiService } from '../../ai';
import { SystemPrompts } from '../prompts';

/**
 * Orquestador principal del Brain Engine.
 * Delega peticiones a GeminiService pero aplica reglas de negocio, RAG y preprocesamiento.
 */
export class BrainEngineService implements IBrainService {
  
  async analyzeText(text: string, context: BrainContext): Promise<BrainAnalysisResult> {
    const prompt = `Contexto temporal actual: ${context.currentDateIso} (Timezone: ${context.userTimezone}).\n\nTexto provisto por el usuario: "${text}"`;

    const response = await GeminiService.askJson<BrainAnalysisResult>(
      'gemini-3.5-flash',
      {
        systemInstruction: SystemPrompts.CLASSIFICATION,
        prompt: prompt,
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Fallo desconocido en GeminiService');
    }

    return response.data;
  }

}

export const brainEngine = new BrainEngineService();
