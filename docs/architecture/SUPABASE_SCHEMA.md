# Esquema de Supabase para LifeOS

Este documento define el esquema conceptual y la estructura de la base de datos en Supabase (PostgreSQL) para LifeOS. El diseño está alineado con la Arquitectura Orientada a Eventos (EDA), las necesidades de la *Memory Layer* (IA) y aborda los riesgos de sincronización offline descubiertos durante la auditoría arquitectónica.

---

## 1. Tablas Core y Dominio

### 1.1. `profiles`
- **Descripción:** Extiende el sistema de autenticación de Supabase (`auth.users`) almacenando preferencias y contexto estático del usuario.
- **PK:** `id` (UUID, referencia a `auth.users.id`)
- **Columnas:**
  - `display_name` (Text)
  - `timezone` (Text, ej. "America/Argentina/Cordoba")
  - `created_at` (Timestampz)
  - `updated_at` (Timestampz)
- **RLS (Row Level Security):** 
  - `SELECT`, `UPDATE`: `auth.uid() = id`

### 1.2. `routines`
- **Descripción:** Representa un conjunto recurrente de actividades o hábitos.
- **PK:** `id` (UUID)
- **FK:** `user_id` (UUID) -> `profiles.id`
- **Columnas:**
  - `name` (Text)
  - `status` (Text: 'active', 'paused')
  - `created_at`, `updated_at` (Timestampz)
- **RLS:** `user_id = auth.uid()`

### 1.3. `events`
- **Descripción:** Ocurrencias acotadas en el tiempo (clases, reuniones, viajes).
- **PK:** `id` (UUID)
- **FK:** `user_id` (UUID) -> `profiles.id`
- **FK:** `routine_id` (UUID, Nullable) -> `routines.id`
- **Columnas:**
  - `title` (Text)
  - `start_time` (Timestampz)
  - `end_time` (Timestampz)
  - `location` (Text)
  - `status` (Text: 'scheduled', 'ongoing', 'completed', 'cancelled')
- **Índices:** B-Tree sobre `start_time` para consultas rápidas del calendario.
- **RLS:** `user_id = auth.uid()`

### 1.4. `tasks`
- **Descripción:** Ítems accionables o quehaceres.
- **PK:** `id` (UUID)
- **FK:** `user_id` (UUID) -> `profiles.id`
- **FK:** `event_id` (UUID, Nullable) -> `events.id` (Si la tarea depende de un evento)
- **Columnas:**
  - `title` (Text)
  - `completed_at` (Timestampz, Nullable)
  - `created_at` (Timestampz)
- **Índices:** B-Tree sobre `completed_at`.
- **RLS:** `user_id = auth.uid()`

### 1.5. `transit_requirements`
- **Descripción:** Requerimientos de movilidad derivados de un evento. Es el core heredado de AppHorarios.
- **PK:** `id` (UUID)
- **FK:** `user_id` (UUID) -> `profiles.id`
- **FK:** `event_id` (UUID) -> `events.id`
- **Columnas:**
  - `origin` (Text)
  - `destination` (Text)
  - `target_arrival_time` (Timestampz)
  - `boarded_service_id` (Text, Nullable)
  - `actual_departure` (Timestampz, Nullable)
  - `status` (Text: 'pending', 'boarded', 'skipped')
- **RLS:** `user_id = auth.uid()`

### 1.6. `expenses`
- **Descripción:** Entradas del módulo financiero.
- **PK:** `id` (UUID)
- **FK:** `user_id` (UUID) -> `profiles.id`
- **Columnas:**
  - `amount` (Numeric)
  - `currency` (Text)
  - `category` (Text)
  - `description` (Text)
  - `date` (Timestampz)
- **RLS:** `user_id = auth.uid()`

### 1.7. `price_trackers`
- **Descripción:** Elementos que el usuario pide monitorear (Bóveda/Shopping).
- **PK:** `id` (UUID)
- **FK:** `user_id` (UUID) -> `profiles.id`
- **Columnas:**
  - `item_name` (Text)
  - `url` (Text)
  - `target_price` (Numeric)
  - `status` (Text: 'tracking', 'purchased', 'cancelled')
- **RLS:** `user_id = auth.uid()`

---

## 2. Capa de Inteligencia (Memory Layer)

### 2.1. `memory_facts`
- **Descripción:** El "cerebro" a largo plazo. Almacena las deducciones, rutinas y hábitos inferidos por Gemini. Utiliza la extensión `pgvector` para posibilitar búsquedas semánticas (RAG).
- **PK:** `id` (UUID)
- **FK:** `user_id` (UUID) -> `profiles.id`
- **Columnas:**
  - `category` (Text, ej. "transit", "finance")
  - `content` (Text, el hecho en sí, ej. "Evita el colectivo de las 18 si llueve")
  - `confidence` (Float, nivel de certeza de la inferencia, 0.0 - 1.0)
  - `embedding` (Vector, representación vectorial del `content`)
  - `created_at` (Timestampz)
- **Índices:** Índice HNSW (Hierarchical Navigable Small World) sobre la columna `embedding` para búsqueda vectorial eficiente.
- **RLS:** `user_id = auth.uid()`

---

## 3. Capa de Eventos Estructurales (EDA)

### 3.1. `system_events` (Event Log / Inbox)
- **Descripción:** **Vital para solucionar el problema offline.** En lugar de disparar webhooks directamente desde las tablas core, la PWA inserta registros aquí. Actúa como un Outbox/Inbox para eventos.
- **PK:** `id` (UUID)
- **FK:** `user_id` (UUID) -> `profiles.id`
- **Columnas:**
  - `event_type` (Text, ej. "ExpenseCreated", "BusBoarded")
  - `payload` (JSONB, contiene los datos asociados al evento)
  - `emitted_at` (Timestampz, cuándo ocurrió realmente en el cliente offline)
  - `processed` (Boolean, default: false)
  - `created_at` (Timestampz, cuándo se insertó en Supabase)
- **Índices:** B-Tree sobre `(user_id, processed, emitted_at)` para procesar la cola ordenadamente.
- **RLS:** `user_id = auth.uid()`

---

## 4. Triggers

### 4.1. `notify_backend_on_system_event`
- **Objetivo:** Informar al Backend de Next.js que hay nuevos eventos pendientes de ser procesados.
- **Mecanismo:** Se dispara *AFTER INSERT* en `system_events`.
- **Lógica:** Ejecuta una función `http_request` que llama al Webhook del Backend. **Importante:** Solo envía un ping indicando que hay eventos nuevos, sin enviar el payload completo, previniendo cuellos de botella (Thundering Herd). El backend luego hará un GET de los eventos `processed = false`.

### 4.2. `update_modified_column`
- **Objetivo:** Mantener automáticamente la columna `updated_at`.
- **Mecanismo:** Se dispara *BEFORE UPDATE* en todas las tablas transaccionales (`profiles`, `routines`, etc.).

---

## 5. Vistas (Views)

### 5.1. `daily_context_view`
- **Descripción:** Una vista segura (Security Definer o con RLS adherido) que consolida el contexto diario del usuario en una sola llamada, optimizando la sincronización de la PWA.
- **Columnas de salida:** `user_id`, `date`, `total_expenses`, `tasks_completed`, `active_events`.
- **Razón:** Enviar a la IA (vía el Backend) o mostrar en el dashboard principal el resumen sin tener que hacer 4 queries distintos.
