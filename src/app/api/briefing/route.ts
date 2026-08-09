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

    // 3. Llamar a IA (Gemini)
    const prompt = "Eres el asistente de Alvaro. Genera un JSON con: 'greeting' (un saludo corto que diga '¡Buen día, Alvaro!'), y 'mission' (una oración motivacional de enfoque para un estudiante de ciberseguridad e ingeniería).";
    
    const aiResponse = await serverGemini.askJson<{ greeting: string; mission: string }>(
      'gemini-2.5-flash',
      { prompt }
    );

    const aiData = aiResponse.data;

    // 4. Devolver response (El prompt dice: "Devuelve un NextResponse.json({ ai: aiData, weather: weatherData })")
    // Lo más seguro es devolver weatherData exacto o el construido
    return NextResponse.json({ ai: aiData, weather: weather });
  } catch (error) {
    console.error("Error in briefing API:", error);
    return NextResponse.json({ error: "Failed to generate briefing" }, { status: 500 });
  }
}
