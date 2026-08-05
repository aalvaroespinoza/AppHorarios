import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { setupRoutes } from './routes/botRoutes.js';
import { startNotifier } from './services/notifier.js';

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error('ERROR: Falta BOT_TOKEN en el archivo .env');
  process.exit(1);
}

const bot = new Telegraf(token);

// Configurar rutas/comandos del bot
setupRoutes(bot);

// Iniciar tareas programadas (alertas de 15 minutos)
startNotifier(bot);

bot.launch()
  .then(() => console.log('🤖 Bot iniciado correctamente'))
  .catch((err) => console.error('Error al iniciar el bot', err));

// Habilitar la detención elegante
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
