import { NextRequest, NextResponse } from 'next/server';
import { Telegraf, Markup } from 'telegraf';
import { calcularColectivos } from '../../../../lib/engine/recommendation-engine';
import { DayOfWeek } from '../../../../types/common';
import { RawScheduleEntry } from '../../../../types/schedule';

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  console.error('Falta TELEGRAM_BOT_TOKEN');
}

const bot = new Telegraf(botToken || 'DUMMY_TOKEN_FOR_BUILD');

// --- Helpers estáticos ---
const getDiaActual = (): DayOfWeek | 'domingo' => {
  const map: Record<number, DayOfWeek | 'domingo'> = {
    0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles',
    4: 'jueves', 5: 'viernes', 6: 'sabado'
  };
  const d = new Date();
  // Ajuste UTC-3 para Argentina si Vercel está en UTC (Opcional, pero recomendado)
  d.setHours(d.getHours() - 3);
  return map[d.getDay()];
};

const getDiaManana = (): DayOfWeek | 'domingo' => {
  const map: Record<number, DayOfWeek | 'domingo'> = {
    0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles',
    4: 'jueves', 5: 'viernes', 6: 'sabado'
  };
  const d = new Date();
  d.setHours(d.getHours() - 3);
  return map[(d.getDay() + 1) % 7];
};

const getHoraActualArgHHMM = (): string => {
  const d = new Date();
  d.setHours(d.getHours() - 3); // UTC-3 Argentina
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};

const mainMenu = Markup.inlineKeyboard([
  [Markup.button.callback('📅 Hoy', 'cmd_hoy'), Markup.button.callback('🌅 Mañana', 'cmd_manana')],
  [Markup.button.callback('⏳ Estado Actual', 'cmd_estado')]
]);

// --- Lógica del Bot ---
bot.start((ctx) => {
  const imageUrl = 'https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&w=800&q=80'; 
  const welcomeText = `👋 *¡Hola\\!* Soy el bot de AppHorarios\\.\n\n¿Qué necesitas consultar hoy?`;
  
  return ctx.replyWithPhoto(
    { url: imageUrl },
    {
      caption: welcomeText,
      parse_mode: 'MarkdownV2',
      ...mainMenu
    }
  );
});

const handleHoy = (ctx: any) => {
  const dia = getDiaActual();
  if (dia === 'domingo' || dia === 'lunes' || dia === 'sabado') {
    return ctx.reply(`☕ Hoy es ${dia}. No viajás, ¡a descansar!`, mainMenu);
  }
  
  const diaAcademico = dia as DayOfWeek;
  const horaActual = getHoraActualArgHHMM();
  const recIda = calcularColectivos(diaAcademico, 'ida', true, true, horaActual);
  const recVuelta = calcularColectivos(diaAcademico, 'vuelta', true, true, horaActual);

  if (!recIda.recomendado && !recVuelta.recomendado) {
    return ctx.reply('Hoy ya no tienes viajes recomendados disponibles.', mainMenu);
  }

  let respuesta = `🚌 *Resumen del día (${dia.toUpperCase()})*\n\n`;
  if (recIda.recomendado) {
    respuesta += `*IDA:*\n`;
    respuesta += `🏆 Recomendado: *${recIda.recomendado.horaSalida}* (${recIda.recomendado.empresa})\n`;
    if (recIda.alternativas.length > 0) {
      respuesta += `⏱️ Siguientes: ${recIda.alternativas.map(a => a.horaSalida).join(', ')}\n`;
    }
  }
  
  if (recVuelta.recomendado) {
    respuesta += `\n*VUELTA:*\n`;
    respuesta += `🏆 Recomendado: *${recVuelta.recomendado.horaSalida}* (${recVuelta.recomendado.empresa})\n`;
    if (recVuelta.alternativas.length > 0) {
      respuesta += `⏱️ Siguientes: ${recVuelta.alternativas.map(a => a.horaSalida).join(', ')}\n`;
    }
  } else {
    respuesta += `\n*VUELTA:*\nNo hay vuelta recomendada.`;
  }

  return ctx.replyWithMarkdown(respuesta, mainMenu);
};

bot.command('hoy', handleHoy);
bot.action('cmd_hoy', handleHoy);

const handleManana = (ctx: any) => {
  const dia = getDiaManana();
  if (dia === 'domingo' || dia === 'sabado' || dia === 'lunes') {
    return ctx.reply(`🏖️ Mañana es ${dia.charAt(0).toUpperCase() + dia.slice(1)}. No cursás, a disfrutar.`, mainMenu);
  }

  const diaAcademico = dia as DayOfWeek;
  // Se pasa 00:00 para asegurar que traiga todos los horarios del día de mañana
  const recIda = calcularColectivos(diaAcademico, 'ida', true, true, '00:00');
  
  if (!recIda.recomendado) {
    return ctx.reply(`Mañana ${dia.charAt(0).toUpperCase() + dia.slice(1)} no tienes viajes programados.`, mainMenu);
  }

  let respuesta = `🌅 *Mañana ${dia.charAt(0).toUpperCase() + dia.slice(1)}*\n\n`;
  respuesta += `Tu mejor opción de ida es el *${recIda.recomendado.empresa}* de las *${recIda.recomendado.horaSalida}*.`;

  return ctx.replyWithMarkdown(respuesta, mainMenu);
};

bot.command('manana', handleManana);
bot.action('cmd_manana', handleManana);

const handleEstado = (ctx: any) => {
  const dia = getDiaActual();
  if (dia === 'domingo' || dia === 'lunes' || dia === 'sabado') {
    return ctx.reply('No hay viajes programados para hoy.', mainMenu);
  }
  
  const diaAcademico = dia as DayOfWeek;
  const horaActual = getHoraActualArgHHMM();
  const recIda = calcularColectivos(diaAcademico, 'ida', true, true, horaActual);
  const recVuelta = calcularColectivos(diaAcademico, 'vuelta', true, true, horaActual);
  
  // Como calcularColectivos ya filtra los del pasado y devuelve el próximo como recomendado,
  // simplemente usamos ese
  let proximo: RawScheduleEntry | null = recIda.recomendado || recVuelta.recomendado;
  
  if (!proximo) {
    return ctx.reply('No hay más viajes programados para hoy.', mainMenu);
  }
  
  const d = new Date();
  d.setHours(d.getHours() - 3); // UTC-3
  const minutosActuales = d.getHours() * 60 + d.getMinutes();

  const [h, m] = proximo.horaSalida.split(':').map(Number);
  const diff = (h * 60 + m) - minutosActuales;
  const horas = Math.floor(diff / 60);
  const mins = diff % 60;
  
  let tiempoStr = '';
  if (horas > 0) tiempoStr += `${horas}h `;
  tiempoStr += `${mins}m`;
  
  return ctx.replyWithMarkdown(`⏳ Faltan *${tiempoStr}* para tu próximo viaje:\n*${proximo.empresa}* a las *${proximo.horaSalida}*.`, mainMenu);
};

bot.command('estado', handleEstado);
bot.action('cmd_estado', handleEstado);


// --- Endpoint de Next.js (Serverless Handler) ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error procesando el webhook de Telegram:', error);
    return NextResponse.json({ ok: false, error: 'Internal Error' }, { status: 200 });
  }
}
