# Legacy Local Bot

Este código utiliza "polling" (node-cron y Telegraf persistent) y solo sirve para hacer debug local, ya que no es compatible con el entorno serverless (Vercel) usado en producción. La aplicación real en producción usa el sistema de Webhook y los cron jobs de Vercel (ver `/src/app/api/bot/`).
