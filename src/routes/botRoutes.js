import { handleStart, handleHorariosHoy } from '../controllers/botController.js';

export const setupRoutes = (bot) => {
  // Comando de inicio
  bot.start(handleStart);
  
  // Comando para ver los horarios del día actual
  bot.command('horarios', handleHorariosHoy);
  bot.command('hoy', handleHorariosHoy);
  
  // Se pueden agregar más comandos como /manana, /semana, etc.
};
