import { NextResponse } from 'next/server';
import { calcularColectivos, OFFSET_PARADA_VUELTA_MIN, addMinutes } from '@/lib/engine/recommendation-engine';
import { weatherService } from '@/core/services/weather/weather.service';
import { DayOfWeek } from '@/core/types/common';
import { supabaseServerAdmin } from '@/lib/server/supabase';
import { GeminiService } from '@/core/ai/service';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

/**
 * Helper para enviar notificaciones push a través de OneSignal REST API.
 */
async function sendOneSignalPush(title: string, message: string, data?: Record<string, unknown>) {
  const restApiKey = process.env.ONESIGNAL_REST_API_KEY;
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

  if (!restApiKey || !appId) {
    console.warn('[CRON] OneSignal REST API Key o App ID no configurados');
    return { success: false, reason: 'unconfigured' };
  }

  try {
    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${restApiKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        included_segments: ['Subscribed Users'],
        headings: { es: title, en: title },
        contents: { es: message, en: message },
        data: data || {},
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ status: res.status }));
      console.error('[CRON] OneSignal push error:', err);
      return { success: false, error: err };
    }

    const json = await res.json();
    return { success: true, data: json };
  } catch (error) {
    console.error('[CRON] Excepción enviando OneSignal push:', error);
    return { success: false, error };
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');

    // Validación genérica del token (GitHub Actions debe enviarlo)
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error("[CRON] Petición rechazada. Token inválido.");
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log("[CRON] Ejecución iniciada desde gatillo externo HTTP.");

    /* ---------------------------------------------------------
       LÓGICA DE NEGOCIO:
       Consultar horarios, clima y enviar notificación push
       --------------------------------------------------------- */
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Argentina/Cordoba',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long'
    });

    const dayNames: Record<string, DayOfWeek | 'domingo'> = {
      sunday: 'domingo',
      monday: 'lunes',
      tuesday: 'martes',
      wednesday: 'miercoles',
      thursday: 'jueves',
      friday: 'viernes',
      saturday: 'sabado'
    };

    const parts = formatter.formatToParts(now);
    const weekdayPart = parts.find(p => p.type === 'weekday')?.value.toLowerCase() || 'monday';
    const hourPart = parts.find(p => p.type === 'hour')?.value || '00';
    const minutePart = parts.find(p => p.type === 'minute')?.value || '00';

    const diaActual = dayNames[weekdayPart] || 'lunes';
    const horaActualHHMM = `${hourPart.padStart(2, '0')}:${minutePart.padStart(2, '0')}`;
    const currentMinutes = parseInt(hourPart, 10) * 60 + parseInt(minutePart, 10);

    let notificationsSent = 0;
    const evaluatedResults: Array<{ sentido: string; diffMin: number; horaSalida: string; notificado: boolean }> = [];

    // Evaluar horarios de cursada y transporte
    if (diaActual !== 'domingo') {
      const diaAcademico = diaActual as DayOfWeek;
      const direcciones: Array<'ida' | 'vuelta'> = ['ida', 'vuelta'];

      for (const sentido of direcciones) {
        const rec = calcularColectivos(diaAcademico, sentido, true, true, horaActualHHMM);

        if (rec.recomendado) {
          const horaReal = sentido === 'vuelta'
            ? addMinutes(rec.recomendado.horaSalida, OFFSET_PARADA_VUELTA_MIN)
            : rec.recomendado.horaSalida;

          const [h, m] = horaReal.split(':').map(Number);
          const minutosSalida = h * 60 + m;
          const diffMin = minutosSalida - currentMinutes;

          // Ventana de alerta: entre 30 y 60 minutos antes de la salida
          if (diffMin > 30 && diffMin <= 60) {
            let weatherText = '';
            try {
              const location = sentido === 'ida' ? 'despenaderos' : 'cordoba';
              const weather = await weatherService.getWeather(location);

              const hourlyItem = weather.hourly.find(item => {
                const [, time] = item.datetimeISO.split('T');
                const [itemH] = (time || '').split(':');
                return parseInt(itemH, 10) === h;
              });

              const probLluvia = hourlyItem?.precipitationProbability ?? weather.current.precipitation ?? 0;
              if (probLluvia > 30) {
                weatherText = ` 🌧️ Probabilidad de lluvia: ${probLluvia}%.`;
              }
            } catch (weatherErr) {
              console.warn('[CRON] No se pudo consultar el servicio meteorológico:', weatherErr);
            }

            const title = sentido === 'ida' ? '🚍 Colectivo hacia Córdoba' : '🚍 Colectivo de regreso';
            const message = `En ${diffMin} min sale el colectivo ${rec.recomendado.empresa} (${horaReal} hs).${weatherText}`;

            const pushResult = await sendOneSignalPush(title, message, {
              type: 'travel_reminder',
              sentido,
              horaSalida: horaReal,
              empresa: rec.recomendado.empresa
            });

            if (pushResult.success) {
              notificationsSent++;
            }

            evaluatedResults.push({
              sentido,
              diffMin,
              horaSalida: horaReal,
              notificado: pushResult.success
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Ejecución completada.",
      timestamp: now.toISOString(),
      diaActual,
      horaActualHHMM,
      notificationsSent,
      evaluatedResults
    }, { status: 200 });

  } catch (error: any) {
    // Evita que Vercel rompa la ejecución silenciosamente
    console.error("[CRON] Error crítico durante la ejecución:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * Endpoint POST opcional para Daily Briefing
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: 'Server Misconfiguration: Faltan credenciales de Telegram' },
        { status: 500 }
      );
    }

    ejecutarBriefingDiario(botToken, chatId).catch(console.error);

    return NextResponse.json({ status: 'ok', msg: 'Daily Briefing scheduled' }, { status: 200 });
  } catch (error: any) {
    console.error("[CRON] Error en endpoint POST:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function ejecutarBriefingDiario(token: string, chat: string) {
  try {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const hoy = new Date();

    const ayerStr = ayer.toISOString().split('T')[0];
    const hoyStr = hoy.toISOString().split('T')[0];

    const [gastosRes, eventosRes, bateriaRes] = await Promise.all([
      supabaseServerAdmin.from('transacciones').select('*').eq('tipo', 'gasto').gte('fecha', ayerStr).lte('fecha', hoyStr),
      supabaseServerAdmin.from('agenda').select('*').eq('fecha', hoyStr),
      supabaseServerAdmin.from('bateria_mental').select('*').order('created_at', { ascending: false }).limit(1)
    ]);

    const promptData = `
Gastos de ayer: ${JSON.stringify(gastosRes.data || [])}
Eventos de hoy: ${JSON.stringify(eventosRes.data || [])}
Última Batería Mental: ${JSON.stringify(bateriaRes.data || [])}
`;

    const geminiText = await GeminiService.askText(
      'gemini-3.5-flash',
      'Eres LifeOS. Redacta un saludo de buenos días ultra corto (2 líneas) resumiendo hoy según estos datos crudos. Sé directo.',
      promptData
    );

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const tgBody = {
      chat_id: chat,
      text: geminiText,
      reply_markup: {
        inline_keyboard: [
          [{ text: "☀️ Ver LifeOS", url: "https://apphorarios.vercel.app/lifeos" }]
        ]
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tgBody)
    });

    if (!res.ok) {
      console.error('Error de API Telegram en Daily Briefing:', await res.text());
    } else {
      console.log('Daily Briefing enviado con éxito');
    }

  } catch (error) {
    console.error('Error en ejecutarBriefingDiario:', error);
  }
}
