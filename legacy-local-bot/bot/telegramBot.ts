import 'dotenv/config';
import { Telegraf } from 'telegraf';
import cron from 'node-cron';
import { calcularColectivos } from '../lib/engine/recommendation-engine';
import { DayOfWeek } from '../types/common';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!botToken) {
  console.error('ERROR: Falta TELEGRAM_BOT_TOKEN en el archivo .env');
  process.exit(1);
}

const bot = new Telegraf(botToken);

// Función de utilidad para obtener el día actual
const getDiaActual = (): DayOfWeek | 'domingo' => {
  const dias: Record<number, DayOfWeek | 'domingo'> = {
    0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles',
    4: 'jueves', 5: 'viernes', 6: 'sabado'
  };
  return dias[new Date().getDay()];
};

bot.start((ctx) => {
  ctx.reply('👋 ¡Hola! Soy el bot local de AppHorarios. Usá /hoy para ver tus viajes de hoy.');
});

// Comando /hoy - Consultar el motor de forma proactiva
bot.command('hoy', (ctx) => {
  const dia = getDiaActual();
  if (dia === 'domingo') {
    return ctx.reply('☕ Hoy es Domingo. No viajás, ¡a descansar!');
  }

  const diaAcademico = dia as DayOfWeek;
  const hora = '00:00'; // O hora actual simulada si usaran
  const recIda = calcularColectivos(diaAcademico, 'ida', true, true, hora);
  const recVuelta = calcularColectivos(diaAcademico, 'vuelta', true, true, hora);

  if (!recIda.recomendado) {
    return ctx.reply('Hoy no tienes viajes programados según tu configuración.');
  }

  let respuesta = `🚌 *Resumen de Viajes (${dia.toUpperCase()})*\n\n`;
  
  respuesta += `*IDA:*\n`;
  respuesta += `Empresa: ${recIda.recomendado.empresa}\n`;
  respuesta += `Salida: ${recIda.recomendado.horaSalida}\n`;
  if (recIda.recomendado.notas) respuesta += `Nota: _${recIda.recomendado.notas}_\n`;
  
  if (recVuelta.recomendado) {
    respuesta += `\n*VUELTA:*\n`;
    respuesta += `Empresa: ${recVuelta.recomendado.empresa}\n`;
    respuesta += `Salida: ${recVuelta.recomendado.horaSalida}\n`;
    if (recVuelta.recomendado.notas) respuesta += `Nota: _${recVuelta.recomendado.notas}_\n`;
  } else {
    respuesta += `\n*VUELTA:*\nNo hay viaje de vuelta programado.`;
  }

  ctx.replyWithMarkdown(respuesta);
});

// CRON JOB: Se ejecuta cada 1 minuto
cron.schedule('* * * * *', () => {
  if (!chatId) {
    console.log('Cron: TELEGRAM_CHAT_ID no configurado. Se salta la alerta.');
    return;
  }

  const dia = getDiaActual();
  if (dia === 'domingo') return;

  const ahora = new Date();
  const minutosDelDia = ahora.getHours() * 60 + ahora.getMinutes();

  const diaAcademico = dia as DayOfWeek;
  const hora = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;
  const revisarViaje = (tipo: 'ida' | 'vuelta') => {
    const rec = calcularColectivos(diaAcademico, tipo, true, true, hora);
    if (rec.recomendado) {
      const [h, m] = rec.recomendado.horaSalida.split(':').map(Number);
      const minutosSalida = h * 60 + m;
      
      const diff = minutosSalida - minutosDelDia;
      
      // Si faltan exactamente 15 minutos, enviamos alerta
      if (diff === 15) {
        bot.telegram.sendMessage(
          chatId, 
          `🏃‍♂️ ¡Che! En 15 minutos sale el *${rec.recomendado.empresa}* de las *${rec.recomendado.horaSalida}*. ¡Andá saliendo para la parada!`,
          { parse_mode: 'Markdown' }
        ).catch(err => console.error('Error enviando alerta:', err));
      }
    }
  };

  revisarViaje('ida');
  revisarViaje('vuelta');
});

// Lanzar el bot
bot.launch()
  .then(() => console.log('🤖 Telegram Bot iniciado con TypeScript'))
  .catch((err) => console.error('Error iniciando el bot:', err));

// Terminar proceso elegantemente
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
