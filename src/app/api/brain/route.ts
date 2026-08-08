import { NextResponse } from 'next/server';
import { GeminiService } from '@/core/ai/service';
import { supabaseServerAdmin } from '@/lib/server/supabase';
import { ActionPayload } from '@/core/engine/types';
import { SchemaType } from '@google/generative-ai';

const ACTION_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    type: {
      type: SchemaType.STRING,
      description: "El tipo de acción a ejecutar. Si es solo conversacional o pregunta, usa 'unknown'."
    },
    payload: {
      type: SchemaType.OBJECT,
      description: "Diccionario de argumentos para la acción. Vacío si es 'unknown'.",
      nullable: true
    },
    needs_input: {
      type: SchemaType.BOOLEAN,
      description: "True si faltan datos cruciales para ejecutar la acción.",
    },
    missing_fields: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Lista de nombres de campos que faltan si needs_input es true.",
      nullable: true
    },
    reply: {
      type: SchemaType.STRING,
      description: "Respuesta conversacional al usuario. Si ejecutas una acción, dale una breve confirmación."
    }
  },
  required: ["type", "needs_input", "reply"]
};

const getSystemPrompt = () => {
  const now = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba' });
  return `Eres el cerebro de LifeOS. La fecha y hora actual exacta es: ${now}. NUNCA preguntes la fecha al usuario, usa esta información como ancla absoluta. Analiza la petición del usuario y devuelve SIEMPRE una intención estructurada en JSON.
NUNCA inventes datos. Si faltan datos cruciales (ej: título o monto), indica "needs_input": true y pregunta qué falta en "reply".
Para fechas, asume la zona horaria de Argentina. No inventes fechas ambiguas.

Tipos de acciones soportadas (type):
- create_expense (payload: amount (numero entero), description (string), category (string))
- create_reminder (payload: title, date (YYYY-MM-DD), time (opcional HH:mm), priority (opcional "baja"|"media"|"alta"))
- create_event (payload: title, date (YYYY-MM-DD), startTime (HH:mm), endTime (HH:mm))
- create_task (payload: title, date (YYYY-MM-DD))
- query_schedule (payload: date (YYYY-MM-DD))
- LOG_ENERGY (payload: level ("alta"|"media"|"baja"), notes (opcional string))
- TRACK_HARDWARE (payload: product (string), details (opcional string))
- EVENT (payload: title, date (YYYY-MM-DD), location (opcional string))
- TASK (payload: title, datetimeISO (formato ISO 8601 estricto con hora))
- unknown (Usa este tipo para charlar, saludar, o si la intención no encaja en las acciones anteriores).

Tu respuesta (reply) debe ser MUY concisa y conversacional.`;
};

async function invokeWithRetry(text: string, history: any[] = [], attempt: number = 1): Promise<ActionPayload> {
  let fullPrompt = "";
  if (history && history.length > 0) {
    fullPrompt += "Historial de conversación reciente (contexto):\n";
    history.forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.text}\n`;
    });
    fullPrompt += "\n[FIN DEL HISTORIAL]\n\n" +
    "Ten en cuenta este historial para deducir la intención del usuario. Si el usuario está respondiendo a una pregunta tuya sobre un campo faltante, COMPLETA la acción anterior en lugar de crear una nueva, conservando los datos que ya tenías.\n\n";
  }
  
  fullPrompt += `Mensaje actual del usuario: ${text}`;

  const aiResponse = await GeminiService.askJson<ActionPayload>(
    'gemini-3.5-flash',
    {
      systemInstruction: getSystemPrompt(),
      prompt: attempt === 1 ? fullPrompt : `${fullPrompt}\n\n[SISTEMA]: Tu respuesta anterior fue inválida o incompleta. Asegúrate de responder estrictamente con el JSON solicitado y llaves correctas.`,
      responseSchema: ACTION_SCHEMA
    }
  );

  if (!aiResponse.success || !aiResponse.data) {
    if (attempt < 2) {
      console.warn(`Intento ${attempt} fallido. Reintentando...`);
      return invokeWithRetry(text, history, attempt + 1);
    }
    throw new Error(aiResponse.error || 'Error procesando texto en Gemini');
  }

  // Validaciones mínimas de estructura para asegurar que el Action Dispatcher no crashee
  const data = aiResponse.data;
  if (!data.type || typeof data.type !== 'string') data.type = 'unknown';
  if (!data.reply) data.reply = "Hecho.";
  if (data.needs_input === undefined) data.needs_input = false;
  
  return data;
}

import { createGoogleTask } from '@/lib/server/googleTasks';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, history } = body;
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Falta el texto a analizar' }, { status: 400 });
    }

    const actionData = await invokeWithRetry(text, history || [], 1);

    // Guardar en Supabase asíncronamente (no bloqueante para responder rápido)
    supabaseServerAdmin
      .from('raw_events')
      .insert([{ raw_text: text, parsed_data: actionData, status: 'processed' }])
      .then(({ error }) => {
        if (error) console.error('Error insertando en Supabase:', error);
      });

    // Integración asíncrona con Google Tasks
    if ((actionData.type === 'TASK' || actionData.type === 'create_reminder') && actionData.payload) {
      try {
        const title = actionData.payload.title;
        const date = actionData.payload.datetimeISO || actionData.payload.date;
        createGoogleTask(title, date).catch(err => {
          console.error('Error no bloqueante de Google Tasks:', err);
        });
      } catch (err) {
        console.error('Error al instanciar Google Tasks:', err);
      }
    }

    return NextResponse.json({ success: true, data: actionData }, { status: 200 });
  } catch (error: any) {
    console.error('Error final en API Brain:', error);
    // Errores controlados devuelven success: false para que el frontend no colapse
    return NextResponse.json(
      { error: 'No pude interpretar esa respuesta. Probá nuevamente.' }, 
      { status: 200 } // Retornamos 200 para que LifeOS lo maneje como un fallo "grácil" y el user vea el msg de error.
    );
  }
}
