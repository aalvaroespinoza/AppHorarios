# Estrategia de Persistencia Local (Local Storage)

Este documento define la estrategia de almacenamiento local para LifeOS. Al adoptar un enfoque verdaderamente **Offline-First**, el almacenamiento local no es una simple caché temporal, sino el corazón operativo de la aplicación.

---

## 1. Estrategia Offline-First

La interfaz de usuario (UI) de LifeOS está completamente desacoplada de la latencia de red. La regla de oro es: **La PWA lee y escribe exclusivamente contra la base de datos local (IndexedDB)**. 

La red se trata puramente como un mecanismo asíncrono de transporte (sincronización en segundo plano). Esto garantiza que interacciones críticas, como marcar un colectivo como "Abordado" o completar una tarea, ocurran en 0 milisegundos de latencia percibida, independientemente de si el usuario está en el subsuelo sin señal.

---

## 2. Definición del Almacenamiento

### ¿Qué VIVE en IndexedDB? (Estado Local)
El dispositivo mantiene una réplica parcial de la base de datos de Supabase, optimizada para las necesidades inmediatas del usuario:
- **Catálogos estáticos y preferencias:** Perfil del usuario, estado de la interfaz, configuraciones de rutinas.
- **Agenda Activa (Ventana de 30 días):** Eventos, requerimientos de tránsito y tareas desde hace 7 días (pasado reciente) hasta 30 días en el futuro.
- **Reglas de Memoria (Corto Plazo):** Los hechos o hábitos (`memory_facts`) más relevantes y recurrentes que modifican la UI directamente.
- **Outbox (Bandeja de Salida):** Todos los eventos generados por el usuario (`system_events`) que ocurrieron offline y están pendientes de subirse a la nube.

### ¿Qué NUNCA vive localmente? (Exclusivo en la Nube)
Para proteger el almacenamiento del dispositivo (evitando inflar el espacio a gigabytes) y por cuestiones de privacidad/rendimiento:
- **Vectores de IA:** Los embeddings vectoriales (`memory_facts.embedding`) utilizados para las búsquedas de Gemini no bajan al cliente, ya que la UI no realiza operaciones matemáticas de álgebra lineal ni RAG.
- **Archivo Histórico:** Eventos, gastos y tareas con antigüedad mayor a 6 meses. Permanecen accesibles vía red si el usuario solicita una búsqueda profunda, pero no residen en el almacenamiento inicial de IndexedDB.
- **Configuraciones de Automatización:** Prompts crudos de Gemini, flujos de n8n o claves de API.

---

## 3. Estrategia de Sincronización

### ¿Qué se sincroniza?
- **Sincronización de Subida (Upload / Outbox):** Las escrituras locales no actualizan directamente las tablas de dominio remotas. En su lugar, cualquier mutación local (ej. marcar una tarea completa) se empaqueta como un registro en la tabla `system_events` local. La sincronización sube esta cola de eventos (Append-Only) hacia Supabase.
- **Sincronización de Bajada (Download / Inbox):** Descarga de las resoluciones del servidor, nuevos eventos generados por n8n (ej. reuniones del calendario de Google) o deducciones hechas por Gemini.

### ¿Cuándo se sincroniza?
1. **Cold Start (Al arrancar):** Cada vez que se abre la aplicación, realiza un sondeo optimizado pidiendo a Supabase solo las filas modificadas desde el último `last_sync_timestamp`.
2. **Tiempo Real (Online):** Si la app está en primer plano y con conexión, la sincronización reacciona de forma oportunista frente a las mutaciones locales o mensajes de WebSockets del servidor.
3. **Background Sync (Offline a Online):** Ver sección 4.

---

## 4. Estrategia de Background Sync

Cuando el usuario interactúa estando sin conexión, el Service Worker asume la responsabilidad de la transferencia futura.
- Utiliza la **Background Sync API** (`registration.sync.register('lifeos-sync')`).
- Si la conexión falla o el usuario cierra la PWA antes de que termine el upload, el sistema operativo (Chrome/Android/iOS según soporte) "despierta" silenciosamente al Service Worker cuando detecta conectividad estable.
- El Service Worker vacía la bandeja de salida (IndexedDB `system_events` donde `processed = false`) enviándola al endpoint de Supabase y resolviendo los estados pendientes localmente, sin necesidad de que la aplicación visual esté abierta.

---

## 5. Resolución de Conflictos

Dado que Supabase (PostgreSQL) no es una base de datos distribuida con soporte nativo para CRDTs (Conflict-free Replicated Data Types), LifeOS soluciona los conflictos utilizando una combinación de dos patrones:

1. **Event Sourcing para Acciones (Conflict-Free):**
   - Las acciones atómicas (ej. registrar que se subió al bus, crear un gasto) son eventos de adición (`Insert Only`) en el outbox. No generan conflictos, ya que el servidor simplemente procesa el historial de eventos en el orden en el que ocurrieron (`emitted_at`).

2. **Last Write Wins (LWW) para Mutaciones de Entidades:**
   - Si un usuario edita un mismo registro en dos dispositivos offline (ej. cambia el título de una tarea en el móvil y en la PC de forma simultánea), la resolución al sincronizar se basa en un Timestamp Absoluto UTC.
   - El registro con el `updated_at` más reciente sobrescribe al más antiguo de manera autoritativa.
   - A nivel de la UI local, todo registro mutado offline mantiene una bandera `is_dirty = true` hasta que la sincronización confirme que el servidor (Supabase) asimiló la escritura sin conflictos mayores.

---

## 6. Estrategia de Caché Adicional

Independiente de IndexedDB, el Service Worker utiliza la **Cache Storage API** para:
- **Application Shell:** Estrategia *Cache-First* para HTML, CSS, fuentes, imágenes e íconos (Tailwind, Lucide). Garantiza que la interfaz pinte inmediatamente incluso sin red.
- **Rutas API de Consulta Terciarias:** Estrategia *Stale-While-Revalidate* para llamadas misceláneas no críticas (ej. avatares o metadatos externos), asegurando que la aplicación muestre la última versión guardada mientras busca silenciosamente actualizaciones de red en segundo plano.
