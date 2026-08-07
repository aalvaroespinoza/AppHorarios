import { NextResponse } from 'next/server';
import { geminiClient } from '@/core/ai/client';

const SYSTEM_PROMPT = `Devuelve ÚNICAMENTE un JSON válido con esta estructura: 
{ 
  "greeting": "mensaje motivador", 
  "news": [ 
    { "title": "titulo", "summary": "resumen corto de ciberseguridad o pentesting", "url": "https://medium.com" } 
  ] 
}.
No uses bloques de markdown como \`\`\`json. Genera un saludo motivador para "Alvaro". Las noticias deben ser de Ciberseguridad, Pentesting (ej. S4vitar, HackTheBox) y certificación.`;

export async function GET() {
  try {
    const model = geminiClient.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(SYSTEM_PROMPT);
    const text = result.response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      data = JSON.parse(cleaned);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error generating briefing:', error);
    return NextResponse.json(
      { error: 'Failed to generate briefing.' },
      { status: 500 }
    );
  }
}
