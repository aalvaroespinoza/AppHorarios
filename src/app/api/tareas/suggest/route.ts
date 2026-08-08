import { NextResponse } from 'next/server';
import { geminiClient } from '@/core/ai/client';

export async function POST(req: Request) {
  try {
    const { tasks } = await req.json();

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: 'No tasks provided' }, { status: 400 });
    }

    const SYSTEM_PROMPT = `Eres un experto en productividad (estilo GTD, Eisenhower, Time Blocking).
Se te proporcionará una lista de tareas pendientes. Tu objetivo es ordenarlas determinando qué se debería hacer primero y dar una razón MUY corta (máximo 1 línea) del por qué.

REGLAS ESTRICTAS:
1. NO inventes tareas nuevas bajo ninguna circunstancia. Usa EXACTAMENTE las que te provee el usuario.
2. NO modifiques los IDs originales.
3. Devuelve ÚNICAMENTE un objeto JSON con la siguiente estructura:
{
  "suggestions": [
    {
      "id": "el-id-original-de-la-tarea",
      "reason": "La breve razón de por qué debería hacerse en este orden"
    }
  ]
}
4. No uses bloques de markdown como \`\`\`json.`;

    const USER_PROMPT = `Aquí están las tareas:\n${JSON.stringify(tasks, null, 2)}`;

    const model = geminiClient.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: USER_PROMPT }
    ]);

    const text = result.response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      data = JSON.parse(cleaned);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in suggest tasks:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestion.' },
      { status: 500 }
    );
  }
}
