import { NextRequest, NextResponse } from 'next/server';
import { Telegraf, Markup } from 'telegraf';
import { calcularColectivoRecomendado } from '../../../../engine/recommendationEngine';
import { MATERIAS } from '../../../../data/materiasDB';
import { DiaSemana, EscenarioUsuario, Horario } from '../../../../types';

// Soportamos ambos nombres de variables de entorno para evitar problemas
const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;

if (!botToken) {
  throw new Error('El token del bot de Telegram no está definido en las variables de entorno.');
}

const bot = new Telegraf(botToken);

// --- Helpers estáticos ---
const getDiaActual = (): DiaSemana => {
  const map: Record<number, DiaSemana> = {
    0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles',
    4: 'jueves', 5: 'viernes', 6: 'sabado'
  };
  return map[new Date().getDay()];
};

const getDiaManana = (): DiaSemana => {
  const map: Record<number, DiaSemana> = {
    0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles',
    4: 'jueves', 5: 'viernes', 6: 'sabado'
  };
  return map[(new Date().getDay() + 1) % 7];
};

const escenarioPorDefecto: EscenarioUsuario = {
  cursaArquitecturaMartes: true,
  duermeEnCordobaViernes: true,
  minutosCaminandoTerminal: 10,
};

const mainMenu = Markup.inlineKeyboard([
  [Markup.button.callback('📅 Hoy', 'cmd_hoy'), Markup.button.callback('🌅 Mañana', 'cmd_manana')],
  [Markup.button.callback('⏳ Estado Actual', 'cmd_estado')]
]);

// --- Lógica del Bot ---

bot.start((ctx) => {
  // Imagen genérica representativa de sierras de Córdoba / paisaje
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
  if (dia === 'domingo') {
    return ctx.reply('☕ Hoy es Domingo. No viajás, ¡a descansar!', mainMenu);
  }

  const recIda = calcularColectivoRecomendado(dia, 'ida', escenarioPorDefecto);
  const recVuelta = calcularColectivoRecomendado(dia, 'vuelta', escenarioPorDefecto);

  if (!recIda.recomendado) {
    return ctx.reply('Hoy no tienes viajes programados según tu configuración.', mainMenu);
  }

  let respuesta = `🚌 *Resumen del día (${dia.toUpperCase()})*\n\n`;
  respuesta += `*IDA:*\n`;
  respuesta += `🏆 Recomendado: *${recIda.recomendado.horaSalida}* (${recIda.recomendado.empresa})\n`;
  if (recIda.alternativas.length > 0) {
    respuesta += `⏱️ Siguientes: ${recIda.alternativas.map(a => a.horaSalida).join(', ')}\n`;
  }
  
  if (recVuelta.recomendado) {
    respuesta += `\n*VUELTA:*\n`;
    respuesta += `🏆 Recomendado: *${recVuelta.recomendado.horaSalida}* (${recVuelta.recomendado.empresa})\n`;
    if (recVuelta.alternativas.length > 0) {
      respuesta += `⏱️ Siguientes: ${recVuelta.alternativas.map(a => a.horaSalida).join(', ')}\n`;
    }
  } else {
    respuesta += `\n*VUELTA:*\nNo hay vuelta recomendada (Dormís allá).`;
  }

  return ctx.replyWithMarkdown(respuesta, mainMenu);
};

bot.command('hoy', handleHoy);
bot.action('cmd_hoy', handleHoy);

const handleManana = (ctx: any) => {
  const dia = getDiaManana();
  if (dia === 'domingo' || dia === 'sabado') {
    return ctx.reply(`🏖️ Mañana es ${dia.charAt(0).toUpperCase() + dia.slice(1)}. No cursás, a disfrutar.`, mainMenu);
  }

  let materiasDelDia = MATERIAS.filter((m) => m.dia === dia);
  materiasDelDia = materiasDelDia.filter((m) => {
    if (m.obligatoria) return true;
    if (dia === 'martes' && m.nombre === 'Arquitectura' && escenarioPorDefecto.cursaArquitecturaMartes) return true;
    return false;
  });

  const recIda = calcularColectivoRecomendado(dia, 'ida', escenarioPorDefecto);
  
  if (!recIda.recomendado || materiasDelDia.length === 0) {
    return ctx.reply(`Mañana ${dia.charAt(0).toUpperCase() + dia.slice(1)} no tienes viajes programados.`, mainMenu);
  }

  materiasDelDia.sort((a, b) => {
    const minA = parseInt(a.horaInicio.split(':')[0]) * 60 + parseInt(a.horaInicio.split(':')[1]);
    const minB = parseInt(b.horaInicio.split(':')[0]) * 60 + parseInt(b.horaInicio.split(':')[1]);
    return minA - minB;
  });

  const primeraMateria = materiasDelDia[0];
  const ultimaMateria = materiasDelDia[materiasDelDia.length - 1];

  let respuesta = `🌅 *Mañana ${dia.charAt(0).toUpperCase() + dia.slice(1)} cursás de ${primeraMateria.horaInicio} a ${ultimaMateria.horaFin}.*\n\n`;
  respuesta += `Tu mejor opción de ida es el *${recIda.recomendado.empresa}* de las *${recIda.recomendado.horaSalida}*.`;

  return ctx.replyWithMarkdown(respuesta, mainMenu);
};

bot.command('manana', handleManana);
bot.action('cmd_manana', handleManana);

const handleEstado = (ctx: any) => {
  const dia = getDiaActual();
  const recIda = calcularColectivoRecomendado(dia, 'ida', escenarioPorDefecto);
  const recVuelta = calcularColectivoRecomendado(dia, 'vuelta', escenarioPorDefecto);
  
  const ahora = new Date();
  const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
  
  let proximo: Horario | null = null;
  
  if (recIda.recomendado) {
    const [h, m] = recIda.recomendado.horaSalida.split(':').map(Number);
    if (h * 60 + m > minutosActuales) {
      proximo = recIda.recomendado;
    }
  }
  
  if (!proximo && recVuelta.recomendado) {
    const [h, m] = recVuelta.recomendado.horaSalida.split(':').map(Number);
    if (h * 60 + m > minutosActuales) {
      proximo = recVuelta.recomendado;
    }
  }
  
  if (!proximo) {
    return ctx.reply('No hay más viajes programados para hoy.', mainMenu);
  }
  
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
