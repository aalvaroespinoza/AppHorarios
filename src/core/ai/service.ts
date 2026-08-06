import 'server-only';
import { geminiClient } from './client';
import { GeminiAPIError } from './errors';
import { GeminiRequestPayload, GeminiResponse } from './types';

/**
 * Capa de servicio centralizada para IA.
 * REGLA DE ARQUITECTURA: ESTO SOLO DEBE EJECUTARSE EN EL SERVIDOR (API Routes / Server Actions).
 */
export class GeminiService {
  /**
   * Ejecuta un prompt y garantiza que la respuesta sea un JSON tipado.
   * Optimizado para usar responseMimeType y systemInstructions.
   */
  static async askJson<T>(
    modelName: 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-2.0-flash',
    payload: GeminiRequestPayload
  ): Promise<GeminiResponse<T>> {
    
    // Hard-stop preventivo de seguridad:
    if (typeof window !== 'undefined') {
      throw new GeminiAPIError('Las llamadas a Gemini no están permitidas desde el cliente. Use una API Route o Server Action.');
    }

    try {
      const model = geminiClient.getGenerativeModel({
        model: modelName,
        systemInstruction: payload.systemInstruction,
        generationConfig: {
          responseMimeType: 'application/json',
        }
      });

      const result = await model.generateContent(payload.prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanText) as T;

      return {
        success: true,
        data: parsedData,
        error: null
      };

    } catch (error: any) {
      console.error('[GeminiService] Error en llamada a LLM:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido al invocar Gemini API.'
      };
    }
  }
}
