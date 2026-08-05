import 'dotenv/config';

const token = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
const url = process.argv[2];

if (!token || !url) {
  console.error('Uso incorrecto. Ejecuta: npm run webhook https://tu-url-de-vercel.app');
  process.exit(1);
}

// Limpiamos la URL por si el usuario le puso barra al final
const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
const webhookUrl = `${cleanUrl}/api/bot/webhook`;

console.log(`Registrando Webhook en Telegram hacia: ${webhookUrl}`);

fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`)
  .then(res => res.json())
  .then(data => {
    if(data.ok) {
      console.log('✅ Webhook configurado con éxito!', data.description);
    } else {
      console.error('❌ Error de Telegram:', data);
    }
  })
  .catch(err => console.error('❌ Error de conexión:', err));
