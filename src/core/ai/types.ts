export interface GeminiRequestPayload {
  systemInstruction?: string;
  prompt: string;
  responseSchema?: any; // Agregado para validación robusta
}

export interface GeminiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}
