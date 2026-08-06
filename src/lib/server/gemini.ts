import 'server-only';
import { GeminiService } from '@/core/ai/service';

/**
 * Cliente de Gemini securizado.
 * Gracias al import 'server-only', este archivo fallará en tiempo de compilación
 * si cualquier componente de cliente (Client Component) intenta importarlo,
 * garantizando que la API Key (GEMINI_API_KEY) jamás se envíe al navegador.
 */
export const serverGemini = GeminiService;
