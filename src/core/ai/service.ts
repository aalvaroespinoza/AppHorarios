import 'server-only';
import { geminiClient } from './client';
import { GeminiAPIError } from './errors';
import { GeminiRequestPayload, GeminiResponse } from './types';

function parseAIResponse(rawResponse: string): any {
  if (typeof rawResponse !== 'string') return rawResponse;
  try {
    // 1. Intentar parseo directo
    return JSON.parse(rawResponse);
  } catch (e) {
    // 2. Limpiar bloques de markdown (```json ... ```) o texto basura
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (err2) {
        console.error("[Parse Error] JSON extraído inválido:", jsonMatch[0]);
        throw new Error("El modelo generó un JSON estructurado inválido.");
      }
    }
    console.error("[Parse Error] No se encontró JSON. RAW:", rawResponse);
    throw new Error("La IA no devolvió un formato estructurado válido.");
  }
}

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
          ...(payload.responseSchema ? { responseSchema: payload.responseSchema } : {})
        }
      });

      const result = await model.generateContent(payload.prompt);
      const response = await result.response;
      const rawText = response.text();
      
      let parsedData: T;
      try {
        parsedData = parseAIResponse(rawText) as T;
      } catch (parseError) {
        console.error('[GeminiService] Error parseando JSON.');
        console.error('Texto original:', rawText);
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

  /**
   * Ejecuta un prompt y devuelve texto puro sin forzar JSON.
   */
  static async askText(
    modelName: 'gemini-3.5-flash',
    systemInstruction: string,
    prompt: string
  ): Promise<string> {
    if (typeof window !== 'undefined') {
      throw new GeminiAPIError('Las llamadas a Gemini no están permitidas desde el cliente. Use una API Route o Server Action.');
    }

    try {
      const model = geminiClient.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('[GeminiService] Error en askText:', error);
      return "Hubo un error generando el mensaje. Intenta nuevamente más tarde.";
    }
  }
}
