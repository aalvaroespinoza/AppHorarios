import 'server-only';
import { geminiClient } from './client';
import { GeminiAPIError } from './errors';
import { GeminiRequestPayload, GeminiResponse } from './types';

/**
 * Extrae de forma robusta el primer objeto o array JSON de un texto, 
 * ignorando basura antes y después, garantizando llaves balanceadas.
 */
function extractRobustJson(text: string): string {
  // 1. Limpiar bloques markdown (común en Gemini)
  let cleanText = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();

  // 2. Buscar el inicio del JSON (objeto o array)
  const firstBrace = cleanText.indexOf('{');
  const firstBracket = cleanText.indexOf('[');
  
  if (firstBrace === -1 && firstBracket === -1) {
    throw new Error('No JSON object or array found in text');
  }

  const isObject = firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket);
  const startChar = isObject ? '{' : '[';
  const endChar = isObject ? '}' : ']';
  const startIndex = isObject ? firstBrace : firstBracket;

  // 3. Recorrer caracteres balanceando llaves e ignorando las que estén dentro de strings
  let depth = 0;
  let endIndex = -1;
  let inString = false;
  let escapeNext = false;

  for (let i = startIndex; i < cleanText.length; i++) {
    const char = cleanText[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === startChar) {
        depth++;
      } else if (char === endChar) {
        depth--;
        if (depth === 0) {
          endIndex = i;
          break;
        }
      }
    }
  }

  if (endIndex === -1) {
    // Fallback: tratar de buscar el último cierre si falló la estructura estricta
    const lastEnd = cleanText.lastIndexOf(endChar);
    if (lastEnd > startIndex) {
      return cleanText.substring(startIndex, lastEnd + 1);
    }
    throw new Error('Incomplete JSON structure');
  }

  return cleanText.substring(startIndex, endIndex + 1);
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
      let finalJsonStr = '';
      try {
        finalJsonStr = extractRobustJson(rawText);
        parsedData = JSON.parse(finalJsonStr) as T;
      } catch (parseError) {
        console.error('[GeminiService] Error parseando JSON.');
        console.error('Texto original:', rawText);
        console.error('Extraido (fallido):', finalJsonStr);
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
