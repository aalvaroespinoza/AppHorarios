import { NextResponse } from 'next/server';
import { geminiClient } from '@/core/ai/client';

const SYSTEM_PROMPT = `
Genera un resumen matutino para el usuario 'Alvaro'. Devuelve EXCLUSIVAMENTE un JSON con:
1) 'greeting': un saludo corto motivador.
2) 'weather': un string simulado del clima actual.
3) 'news': un array de 3 a 5 objetos con 'title', 'summary' corto y 'url' simulada o real de Medium/TheHackerNews enfocados estrictamente en Ciberseguridad, Pentesting y preparación de certificaciones.

Ejemplo de respuesta válida:
{
  "greeting": "¡Buenos días, Alvaro! Listo para dominar el día.",
  "weather": "24°C, Soleado",
  "news": [
    {
      "title": "Nuevas vulnerabilidades en la nube",
      "summary": "Descubre las tácticas más recientes usadas por los red teams.",
      "url": "https://thehackernews.com/123"
    }
  ]
}
`;

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
    
    // Fallback parsing just in case
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      // In case gemini returned some markdown wrapper
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
