import { NextResponse } from 'next/server';
import { geminiClient } from '@/core/ai/client';

export async function GET() {
  try {
    // 1. Fetch real news from r/netsec
    const redditResponse = await fetch('https://www.reddit.com/r/netsec/new.json?limit=5', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    let realNews = [];
    if (redditResponse.ok) {
      const data = await redditResponse.json();
      realNews = data.data.children.map((child: any) => ({
        title: child.data.title,
        url: child.data.url
      }));
    }

    if (realNews.length === 0) {
      // Fallback just in case Reddit fails
      realNews = [
        { title: "Noticias de ciberseguridad del día", url: "https://thehackernews.com/" }
      ];
    }

    // 2. Prepare the prompt for Gemini
    const SYSTEM_PROMPT = `Actúa como un asistente para un profesional de ciberseguridad. 
A continuación tienes una lista de artículos reales de ciberseguridad obtenidos de r/netsec:
${JSON.stringify(realNews)}

Tu tarea es:
1. Generar un saludo corto, motivador y profesional para "Alvaro".
2. Traducir o adaptar los títulos al español (si están en inglés) y generar un resumen MUY corto (1 o 2 líneas) de lo que trata cada artículo basándote en su título.
3. DEBES conservar la "url" original proporcionada en la lista exacta, no la cambies ni la inventes.

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta: 
{ 
  "greeting": "mensaje motivador", 
  "news": [ 
    { "title": "titulo en español", "summary": "resumen corto", "url": "URL ORIGINAL INTACTA" } 
  ] 
}
No uses bloques de markdown como \`\`\`json.`;

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
