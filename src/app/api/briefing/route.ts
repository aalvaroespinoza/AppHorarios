import { NextResponse } from 'next/server';
import { serverGemini } from '@/lib/server/gemini';

export async function GET() {
  try {
    // 1. Fetch a Open-Meteo mediante el servicio central
    const { weatherService } = await import('@/core/services/weather/weather.service');
    const data = await weatherService.getWeather('despenaderos');

    // 2. Construir objeto con el clima actual y las próximas 12 horas
    const nowISO = new Date().toISOString();
    const currentHourIndex = data.hourly.findIndex(h => h.datetimeISO >= nowISO);
    const idx = currentHourIndex === -1 ? 0 : currentHourIndex;
    const next12Hours = data.hourly.slice(idx, idx + 12).map(h => h.temperature);
    
    const weather = {
      current: {
        temperature_2m: data.current.temperature,
        weather_code: data.current.code
      },
      next12Hours
    };

    // 3. Fetch Noticias (Reddit r/netsec y Hacker News)
    const fetchNews = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const fetchReddit = fetch('https://www.reddit.com/r/netsec/top.json?limit=10&t=day', { signal: controller.signal })
        .then(res => res.json())
        .then(data => {
          return data.data.children.map((item: any) => ({
            title: item.data.title,
            url: item.data.url,
            source: 'Reddit (r/netsec)'
          }));
        })
        .catch(err => {
          console.warn('Error fetching Reddit:', err);
          return [];
        });

      const fetchHN = fetch('https://hn.algolia.com/api/v1/search?tags=story&query=security', { signal: controller.signal })
        .then(res => res.json())
        .then(data => {
          return data.hits.slice(0, 10).map((item: any) => ({
            title: item.title,
            url: item.url || `https://news.ycombinator.com/item?id=${item.objectID}`,
            source: 'Hacker News'
          }));
        })
        .catch(err => {
          console.warn('Error fetching HN:', err);
          return [];
        });

      const [redditRes, hnRes] = await Promise.allSettled([fetchReddit, fetchHN]);
      clearTimeout(timeoutId);

      const redditItems = redditRes.status === 'fulfilled' ? redditRes.value : [];
      const hnItems = hnRes.status === 'fulfilled' ? hnRes.value : [];

      return [...redditItems, ...hnItems];
    };

    const rawNews = await fetchNews();

    // 4. Llamar a IA (Gemini)
    const prompt = `
Eres el asistente de Alvaro. Genera un JSON con:
1. 'greeting': Un saludo corto que diga '¡Buen día, Alvaro!'.
2. 'mission': Una oración motivacional de enfoque para un estudiante de ciberseguridad e ingeniería.
3. 'news': Un arreglo de 6 a 8 objetos que resuman las noticias proporcionadas. Selecciona las más relevantes de la lista de abajo (asegúrate de incluir una mezcla equitativa de Reddit y Hacker News si es posible).
   Para cada noticia, incluye:
   - 'title': Un título traducido/resumido (breve).
   - 'summary': Un resumen de 1-2 oraciones explicando la noticia y su impacto (en español, utilizando terminología correcta de ciberseguridad).
   - 'url': La URL original proveída en los datos. ¡REGLA ESTRICTA: NO INVENTES NI MODIFIQUES LA URL! Usa la misma URL que se proporciona a continuación.

Datos crudos de noticias:
${JSON.stringify(rawNews, null, 2)}
`;
    
    const aiResponse = await serverGemini.askJson<{ 
      greeting: string; 
      mission: string; 
      news: Array<{ title: string; summary: string; url: string }> 
    }>(
      'gemini-2.5-flash',
      { prompt }
    );

    const aiData = aiResponse.data;

    // 5. Devolver response
    return NextResponse.json({ ai: aiData, weather: weather });
  } catch (error) {
    console.error("Error in briefing API:", error);
    return NextResponse.json({ error: "Failed to generate briefing" }, { status: 500 });
  }
}
