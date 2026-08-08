import { NextResponse } from 'next/server';
import { serverGemini } from '@/lib/server/gemini';

export async function GET() {
  try {
    // 1. Fetch a Open-Meteo
    const weatherRes = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-31.8167&longitude=-64.2833&current=temperature_2m,weather_code&hourly=temperature_2m&timezone=America/Argentina/Cordoba");
    const weatherData = await weatherRes.json();

    // 2. Construir objeto con el clima actual y las próximas 12 horas
    const currentHourIndex = new Date().getHours();
    const next12Hours = weatherData.hourly?.temperature_2m?.slice(currentHourIndex, currentHourIndex + 12) || [];
    
    const weather = {
      current: weatherData.current,
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
