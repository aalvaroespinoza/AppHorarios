import { NextResponse } from 'next/server';
import { GeminiService } from '@/core/ai';

const SYSTEM_PROMPT = `
Eres el motor de Extracción de Entidades y NLP (Procesamiento de Lenguaje Natural) de LifeOS.
Tu tarea es analizar el texto libre ingresado por el usuario y extraer la intención primaria hacia un JSON estrictamente estructurado.

Tipos de intención (type):
1. "task": Tareas por hacer, recordatorios o pendientes.
2. "expense": Gastos financieros, compras, egresos de dinero.
3. "event": Eventos de agenda, exámenes, turnos, reuniones.
4. "unknown": Charla trivial o intención no identificada.

Debes extraer todos los datos implícitos o explícitos.
El formato de respuesta OBLIGATORIO debe ser exactamente:
{
  "type": "task" | "expense" | "event" | "unknown",
  "confidence": 0.95,
  "extractedData": {
    "title": "Descripción clara del hecho",
    "amount": null, // Solo numérico si es un expense (ej: 2500)
    "dueDate": null // Fecha o momento en formato ISO 8601 si se detecta (usa la fecha actual como ancla temporal)
  }
}
`;

export interface ParseRequest {
  text: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as ParseRequest;
    
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json({ error: 'El campo "text" es obligatorio y debe ser un string.' }, { status: 400 });
    }

    // Inyectamos la fecha actual en el prompt para que la IA entienda cuándo es "mañana" o "el lunes".
    const anchorDate = new Date().toISOString();
    const prompt = `Contexto temporal: Hoy es ${anchorDate}.\n\nTexto del usuario: "${body.text}"\n\nExtrae las entidades en el JSON solicitado.`;

    // Usamos el modelo Flash que es 10x más rápido y económico, ideal para clasificación NLP simple.
    const response = await GeminiService.askJson('gemini-1.5-flash', {
      systemInstruction: SYSTEM_PROMPT,
      prompt
    });

    if (!response.success) {
      return NextResponse.json({ error: response.error }, { status: 502 });
    }

    return NextResponse.json(response.data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
