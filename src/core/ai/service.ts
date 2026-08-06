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
      const text = response.text();
      
      let cleanText = text;
      // Remover bloques de markdown si los hubiera (gemini a veces ignora responseMimeType)
      cleanText = cleanText.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      // Intentar extraer el primer objeto JSON o array si hay basura extra
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }
      
      let parsedData: T;
      try {
        parsedData = JSON.parse(cleanText) as T;
      } catch (parseError) {
        console.error('[GeminiService] Error parseando JSON. Texto limpio:', cleanText, 'Texto original:', text);
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
