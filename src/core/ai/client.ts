import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY && typeof window === 'undefined') {
  console.warn('⚠️ GEMINI_API_KEY no está definida en las variables de entorno.');
}

// Instancia única del SDK oficial para todo el backend
export const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
