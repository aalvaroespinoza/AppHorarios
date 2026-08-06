import { NextResponse } from 'next/server';
import { GeminiService } from '@/core/ai/service';
import { supabaseServerAdmin } from '@/lib/server/supabase';
import { ParsedAction } from '@/types/brain';

const SYSTEM_PROMPT = `Eres el cerebro de LifeOS. Analiza el siguiente texto y devuelve un objeto JSON estricto clasificando la acción como EXPENSE, TASK o REMINDER, extrayendo los datos clave (monto, fecha, título, etc.). No devuelvas markdown, solo el JSON. 
Esquema de respuesta esperado:
{
  "type": "EXPENSE" | "TASK" | "REMINDER",
  "title": string,
  "amount": number (opcional),
  "date": string (ISO) (opcional),
  "category": string (opcional)
}`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Falta el texto a analizar' }, { status: 400 });
    }

    // Usar la abstracción de Gemini construida en la Fase 1
    const aiResponse = await GeminiService.askJson<ParsedAction>(
      'gemini-1.5-flash',
      {
        systemInstruction: SYSTEM_PROMPT,
        prompt: text
      }
    );

    if (!aiResponse.success || !aiResponse.data) {
      throw new Error(aiResponse.error || 'Error procesando texto en Gemini');
    }

    // Enriquecer con raw text
    const parsedData = {
      ...aiResponse.data,
      rawText: text
    };

    // Guardar en Supabase (raw_events)
    const { error: dbError } = await supabaseServerAdmin
      .from('raw_events')
      .insert([
        {
          raw_text: text,
          parsed_data: parsedData,
          status: 'processed'
        }
      ]);

    if (dbError) {
      console.error('Error insertando en Supabase:', dbError);
      // Retornamos error interno de DB pero seguimos, o podemos fallar
      return NextResponse.json({ error: 'Error guardando en base de datos', details: dbError }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: parsedData }, { status: 200 });
  } catch (error: any) {
    console.error('Error en /api/brain:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
