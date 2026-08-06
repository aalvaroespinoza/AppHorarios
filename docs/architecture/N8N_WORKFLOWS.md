# Arquitectura de Automatizaciones (Flujos de n8n)

Este documento detalla el catálogo de automatizaciones y flujos de trabajo planificados para operar como el **Sistema Nervioso Central** de LifeOS a través de n8n. Los flujos están agrupados por dominio para garantizar alta cohesión y bajo acoplamiento.

Ningún flujo está implementado en código duro dentro del repositorio cliente; actúan de forma asíncrona reaccionando a la Arquitectura Orientada a Eventos (EDA).

---

## 1. Dominio: Agenda y Tránsito

### 1.1. Sincronización Automática de Calendario
- **Descripción:** Mantiene la base de datos local de `events` sincronizada con calendarios externos (clases, turnos médicos).
- **Trigger:** Cron (Cada 24h a las 02:00 AM) o Webhook (Manual force-sync).
- **Entradas:** URLs de calendarios remotos (iCal).
- **Salidas:** Inserts/Updates/Deletes silenciosos en la tabla `events` de Supabase.
- **Eventos Emitidos:** `ScheduleUpdated` (Opcional).
- **Servicios Externos:** Google Calendar API, CalDAV.
- **Complejidad:** Media (Requiere reconciliar diferencias de eventos recurrentes y cancelaciones).

### 1.2. Predicción Proactiva de Viaje (Smart Routing)
- **Descripción:** Notifica al usuario cuándo debe salir hacia su parada dependiendo del contexto ambiental.
- **Trigger:** Cron continuo que monitorea `transit_requirements` próximos a ocurrir en la próxima hora.
- **Entradas:** Ubicación del usuario, horario del evento, pronóstico de lluvias actual.
- **Salidas:** Recomendación de salida adaptada.
- **Eventos Emitidos:** `ReminderCreated` (Con alta urgencia).
- **Servicios Externos:** OpenWeatherMap API, Google Maps Distance Matrix.
- **Complejidad:** Alta (Orquestación múltiple y dependiente del tiempo estricto).

---

## 2. Dominio: Finanzas

### 2.1. Categorización de Gastos por IA
- **Descripción:** Asigna automáticamente una categoría estructurada a gastos rápidos cargados con texto plano.
- **Trigger:** Webhook (`ExpenseCreated` proveniente de Supabase `system_events`).
- **Entradas:** `description` del gasto (ej. "Taxi porque llegaba tarde").
- **Salidas:** Columna `category` actualizada en Supabase.
- **Eventos Emitidos:** `ExpenseUpdated`.
- **Servicios Externos:** Gemini API (con prompt de categorización zero-shot).
- **Complejidad:** Baja.

### 2.2. Backup Transaccional (Spreadsheet Sync)
- **Descripción:** Mantiene una hoja de cálculo en la nube sincronizada para reportes financieros avanzados o compartidos.
- **Trigger:** Webhook (`ExpenseCreated` o `ExpenseUpdated`).
- **Entradas:** Payload completo de la transacción financiera.
- **Salidas:** Fila creada o editada en el documento destino.
- **Eventos Emitidos:** Ninguno.
- **Servicios Externos:** Google Sheets API o Notion API.
- **Complejidad:** Baja.

---

## 3. Dominio: Compras y Marketplace

### 3.1. Motor de Monitoreo de Precios (Price Tracker)
- **Descripción:** Raspa periódicamente sitios web para comprobar si el producto deseado ha alcanzado el precio objetivo.
- **Trigger:** Cron (Cada 12 horas).
- **Entradas:** Query a la tabla `price_trackers` para todos los registros con `status = 'tracking'`.
- **Salidas:** Comprobación del precio actual en el DOM remoto.
- **Eventos Emitidos:** `ReminderCreated` (Si el precio baja del `target_price`), o `PriceTrackingStopped` (Si la URL ya no existe).
- **Servicios Externos:** Nodos de Scraping en n8n (Puppeteer/HTTP Node).
- **Complejidad:** Alta (Manejo de selectores dinámicos, fallos de red, bypass básico de anti-bots).

---

## 4. Dominio: Inteligencia Artificial y Memoria

### 4.1. Extracción de Tareas desde Texto Libre
- **Descripción:** Convierte una nota rápida, audio transcripto o mensaje del usuario en tareas accionables.
- **Trigger:** Webhook desde la PWA (Input de Voz/Texto libre).
- **Entradas:** Cadena de texto no estructurada.
- **Salidas:** Múltiples inserciones en la tabla `tasks`.
- **Eventos Emitidos:** `TaskCreated` (Múltiples).
- **Servicios Externos:** Gemini API.
- **Complejidad:** Media.

### 4.2. Consolidación del Cerebro (Deducción de Memoria a Largo Plazo)
- **Descripción:** Analiza lo ocurrido durante el día para encontrar nuevos hábitos y guardarlos en el cerebro vectorial de LifeOS.
- **Trigger:** Webhook (`ScheduleCompleted` disparado al finalizar el último bloque del día).
- **Entradas:** Vista consolidada del día (`daily_context_view`): tareas terminadas, colectivos tomados o saltados, gastos, y clima.
- **Salidas:** Inserción de un nuevo vector de conocimiento (Fact).
- **Eventos Emitidos:** `MemoryUpdated`.
- **Servicios Externos:** Gemini API, Supabase (Inserción en tabla de embeddings `pgvector`).
- **Complejidad:** Muy Alta (Involucra Prompt Engineering complejo para evitar falsos positivos y deduplicación semántica para no sobreescribir memoria existente válida).

---

## 5. Dominio: Notificaciones

### 5.1. Enrutador Omnicanal de Alertas
- **Descripción:** Actúa como el centro de despacho para cualquier recordatorio o notificación creada en el sistema.
- **Trigger:** Webhook (`ReminderCreated`).
- **Entradas:** `message`, `urgency`, y `contextTrigger`.
- **Salidas:** Envío físico del mensaje al usuario.
- **Eventos Emitidos:** Ninguno.
- **Servicios Externos:** API de Telegram (Bot), API de WebPush.
- **Complejidad:** Baja (Switch/Router basado en nivel de urgencia: urgente = Telegram, normal = Notificación de PWA).
