import { NextResponse } from 'next/server';

// NOTA IMPORTANTE DE USO:
// Shodan tiene un tier gratuito con un límite mensual de consultas MUY bajo.
// Nunca dispares esta API automáticamente (por ej. al abrir la página o por background cron).
// Solo debe llamarse mediante una acción explícita y manual del usuario.

export async function POST(request: Request) {
  try {
    const { ip } = await request.json();

    if (!ip || typeof ip !== 'string') {
      return NextResponse.json({ error: 'Falta proveer una dirección IP válida.' }, { status: 400 });
    }

    const apiKey = process.env.SHODAN_API_KEY;
    
    if (!apiKey) {
      // Retornamos 401 con mensaje específico para que el front muestre el fallback visual
      return NextResponse.json({ error: 'MISSING_API_KEY' }, { status: 401 });
    }

    const url = `https://api.shodan.io/shodan/host/${ip}?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store' // Para traer info fresca al ser click manual
    });

    if (!response.ok) {
      // Shodan puede retornar 404 si la IP no fue escaneada
      if (response.status === 404) {
        return NextResponse.json({ error: 'IP no encontrada en los registros de Shodan.' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Error consultando Shodan.' }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({
      ports: data.ports || [],
      org: data.org || 'Unknown',
      country_name: data.country_name || 'Unknown',
    });

  } catch (error: any) {
    console.error('Shodan API lookup error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
