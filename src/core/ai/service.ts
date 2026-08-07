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
    modelName: 'gemini-2.5-flash' | 'gemini-3.5-flash' | 'gemini-2.5-pro',
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
      const rawText = response.text();
      const cleanedText = rawText.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
      
      let parsedData: T;
      try {
        parsedData = JSON.parse(cleanedText) as T;
      } catch (parseError) {
        console.error('[GeminiService] Error parseando JSON. Texto limpio:', cleanedText, 'Texto original:', rawText);
        throw parseError;
      }

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
