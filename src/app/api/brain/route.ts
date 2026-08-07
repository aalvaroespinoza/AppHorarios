import { NextResponse } from 'next/server';
import { GeminiService } from '@/core/ai/service';
import { supabaseServerAdmin } from '@/lib/server/supabase';
import { ActionPayload } from '@/core/engine/types';

const SYSTEM_PROMPT = `Eres el Action Dispatcher de LifeOS. Analiza la petición del usuario y devuelve una intención estructurada en JSON.
NUNCA inventes datos. Si faltan datos cruciales (ej: título, fecha de un recordatorio, o monto de un gasto), indica "needs_input": true y pregunta qué falta en "reply".
Para fechas, asume la zona horaria de Argentina. No inventes fechas ambiguas.

Tipos de acciones soportadas:
- create_expense (payload: amount (numero entero), description (string), category (string))
- create_reminder (payload: title, date (YYYY-MM-DD), time (opcional HH:mm), priority (opcional "baja"|"media"|"alta"))
- create_event (payload: title, date (YYYY-MM-DD), startTime (HH:mm), endTime (HH:mm))
- create_task (payload: title, date (YYYY-MM-DD))
- query_schedule (payload: date (YYYY-MM-DD))

Esquema de respuesta esperado (devuelve solo el JSON):
{
  "type": "create_expense" | "create_reminder" | "create_event" | "create_task" | "query_schedule" | "unknown",
  "payload": { ... },
  "needs_input": boolean (true si falta información clave como el monto, fecha o título),
  "missing_fields": ["campo1"],
  "reply": "Respuesta MUY concisa. Si creas algo da confirmación breve (Ej: 'Recordatorio guardado: Estudiar el 20/08'). Si faltan datos, pregunta."
}`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;
    
    console.log('Iniciando API Brain', { text });

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Falta el texto a analizar' }, { status: 400 });
    }

    const aiResponse = await GeminiService.askJson<ActionPayload>(
      'gemini-3.5-flash',
      {
        systemInstruction: SYSTEM_PROMPT,
        prompt: text
      }
    );

    if (!aiResponse.success || !aiResponse.data) {
      throw new Error(aiResponse.error || 'Error procesando texto en Gemini');
    }

    const actionData = aiResponse.data;

    // Guardar en Supabase (raw_events)
    const { error: dbError } = await supabaseServerAdmin
      .from('raw_events')
      .insert([
        {
          raw_text: text,
          parsed_data: actionData,
          status: 'processed'
        }
      ]);

    if (dbError) {
      console.error('Error insertando en Supabase:', dbError);
    }

    return NextResponse.json({ success: true, data: actionData }, { status: 200 });
  } catch (error: any) {
    console.error('Error en API Brain:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
