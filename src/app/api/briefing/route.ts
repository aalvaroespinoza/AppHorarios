import { NextResponse } from 'next/server';
import { geminiClient } from '@/core/ai/client';

export async function GET() {
  try {
    // 1. Fetch real news from multiple sources in parallel
    const [redditRes, hnRes] = await Promise.allSettled([
      fetch('https://www.reddit.com/r/netsec/new.json?limit=4', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        next: { revalidate: 3600 }
      }),
      fetch('https://hn.algolia.com/api/v1/search?tags=story&query=security&hitsPerPage=4', {
        next: { revalidate: 3600 }
      })
    ]);

    let realNews: { title: string; url: string }[] = [];

    // Process Reddit
    if (redditRes.status === 'fulfilled' && redditRes.value.ok) {
      try {
        const data = await redditRes.value.json();
        const redditItems = data.data.children.map((child: any) => ({
          title: child.data.title,
          url: child.data.url
        }));
        realNews.push(...redditItems);
      } catch (e) {
        console.error('Error parsing Reddit response:', e);
      }
    }

    // Process Hacker News Algolia
    if (hnRes.status === 'fulfilled' && hnRes.value.ok) {
      try {
        const data = await hnRes.value.json();
        const hnItems = data.hits.map((hit: any) => ({
          title: hit.title,
          url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`
        }));
        realNews.push(...hnItems);
      } catch (e) {
        console.error('Error parsing HN response:', e);
      }
    }

    // Fallback if both fail completely
    if (realNews.length === 0) {
      realNews = [
        { title: "Noticias de ciberseguridad del día", url: "https://thehackernews.com/" }
      ];
    } else {
      // Limit to 8 items max just in case
      realNews = realNews.slice(0, 8);
    }

    // 2. Prepare the prompt for Gemini
    const SYSTEM_PROMPT = `Actúa como un asistente para un profesional de ciberseguridad. 
A continuación tienes una lista de artículos reales de ciberseguridad obtenidos de Hacker News y r/netsec:
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
