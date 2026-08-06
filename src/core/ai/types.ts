export interface GeminiRequestPayload {
  systemInstruction?: string;
  prompt: string;
}

export interface GeminiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}
