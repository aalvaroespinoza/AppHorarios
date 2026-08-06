# Catálogo de Eventos LifeOS

Este documento sirve como el contrato oficial de eventos para LifeOS. Al utilizar una Arquitectura Orientada a Eventos (Event-Driven Architecture), estos eventos actúan como el sistema nervioso central que conecta la PWA, Supabase, n8n y la API de Gemini.

---

## Convención de Nombres

Todos los eventos deben seguir obligatoriamente la estructura `[Entidad][Acción en Pasado]`. Esta convención (`NounPastVerb` o PascalCase) asegura claridad sobre qué entidad fue afectada y garantiza que el evento representa algo que ya ocurrió irrevocablemente en el sistema.

- **Válido:** `ExpenseCreated`, `BusBoarded`, `TaskCompleted`
- **Inválido:** `CreateExpense`, `NewTask`, `UpdateMemory`

## Estructura General del Payload

Todo evento emitido a través de Supabase o n8n debe incluir una estructura envolvente (wrapper) estándar para facilitar la trazabilidad:
```json
{
  "eventId": "uuid-v4",
  "timestamp": "2026-08-06T12:00:00Z",
  "eventType": "ExpenseCreated",
  "data": { ... }
}
```
A continuación se detalla exclusivamente el contenido del objeto `data` para cada evento oficial.

---

## Eventos Oficiales

### 1. ExpenseCreated
- **Descripción:** Se emite cuando se registra un nuevo gasto financiero en el sistema.
- **Quién lo emite:** LifeOS PWA (Módulo de Finanzas) -> Supabase.
- **Quién lo consume:** n8n (para análisis de presupuesto mensual), integración con Google Sheets/Notion.
- **Datos asociados:**
  - `amount`: Number
  - `currency`: String
  - `category`: String
  - `description`: String
- **Ejemplo:**
  ```json
  { "amount": 2500, "currency": "ARS", "category": "Transporte", "description": "Taxi a la facultad" }
  ```

### 2. ExpenseUpdated
- **Descripción:** Se emite cuando un gasto existente es modificado (ej. corrección de monto o cambio de categoría).
- **Quién lo emite:** LifeOS PWA -> Supabase.
- **Quién lo consume:** n8n (para impactar la actualización en tableros externos).
- **Datos asociados:**
  - `expenseId`: String
  - `previousData`: Object
  - `newData`: Object
- **Ejemplo:**
  ```json
  { "expenseId": "exp_123", "newData": { "category": "Comida" } }
  ```

### 3. ReminderCreated
- **Descripción:** Se emite cuando se agenda un nuevo recordatorio, ya sea basado en tiempo o en un contexto específico.
- **Quién lo emite:** LifeOS PWA o la API de Gemini (deducido autónomamente vía n8n).
- **Quién lo consume:** n8n (para programar notificaciones Push o en Telegram), LifeOS PWA (para mostrar en el Dashboard).
- **Datos asociados:**
  - `message`: String
  - `triggerTime`: ISO 8601 Date String (opcional)
  - `contextTrigger`: String (opcional, ej. "llegando_a_casa")
- **Ejemplo:**
  ```json
  { "message": "Cargar la tarjeta del colectivo", "triggerTime": "2026-08-06T20:00:00Z" }
  ```

### 4. BusBoarded
- **Descripción:** Se emite cuando el usuario marca explícitamente en la UI que ha subido a un colectivo.
- **Quién lo emite:** LifeOS PWA (Módulo de Horarios).
- **Quién lo consume:** n8n (para análisis de demoras reales), Memory Layer (para que Gemini aprenda hábitos de transporte).
- **Datos asociados:**
  - `serviceId`: String (Línea/Empresa)
  - `scheduledDeparture`: ISO 8601 Date String
  - `actualDeparture`: ISO 8601 Date String
  - `originStop`: String
- **Ejemplo:**
  ```json
  { "serviceId": "Sarmiento_Cordoba", "actualDeparture": "2026-08-06T14:32:00Z", "originStop": "Despeñaderos" }
  ```

### 5. ScheduleCompleted
- **Descripción:** Se emite cuando finaliza el último bloque de cursada o trabajo programado para el día.
- **Quién lo emite:** LifeOS PWA (Scenario Engine) o automatización de calendario.
- **Quién lo consume:** Gemini API (para generar un resumen del día y sugerencias para el día siguiente), n8n (para apagar alarmas o rutinas IoT).
- **Datos asociados:**
  - `date`: ISO 8601 Date String
  - `completedBlocks`: Number
- **Ejemplo:**
  ```json
  { "date": "2026-08-06", "completedBlocks": 3 }
  ```

### 6. TaskCompleted
- **Descripción:** Se emite cuando una tarea accionable es marcada como completada.
- **Quién lo emite:** LifeOS PWA.
- **Quién lo consume:** n8n (módulo de gamificación y métricas de productividad), Memory Layer (cálculo de tiempos de finalización).
- **Datos asociados:**
  - `taskId`: String
  - `title`: String
  - `completionTime`: ISO 8601 Date String
- **Ejemplo:**
  ```json
  { "taskId": "tsk_88", "title": "Terminar plano de Arquitectura", "completionTime": "2026-08-06T16:45:00Z" }
  ```

### 7. PriceTrackingStarted
- **Descripción:** Se emite cuando el usuario le solicita a LifeOS que comience a monitorear el precio de un producto en línea.
- **Quién lo emite:** LifeOS PWA (Módulo de Bóveda/Compras) o bot de Telegram.
- **Quién lo consume:** n8n (para crear y activar un flujo cronograma de web scraping).
- **Datos asociados:**
  - `itemName`: String
  - `url`: String
  - `targetPrice`: Number
- **Ejemplo:**
  ```json
  { "itemName": "Monitor 24 pulgadas", "url": "https://tienda.com/monitor", "targetPrice": 150000 }
  ```

### 8. PriceTrackingStopped
- **Descripción:** Se emite cuando se cancela el seguimiento de un producto o cuando el objetivo de compra fue alcanzado.
- **Quién lo emite:** LifeOS PWA.
- **Quién lo consume:** n8n (para desactivar el flujo cronograma correspondiente y ahorrar recursos).
- **Datos asociados:**
  - `trackingId`: String
  - `reason`: String ("purchased", "cancelled")
- **Ejemplo:**
  ```json
  { "trackingId": "ptrk_99", "reason": "purchased" }
  ```

### 9. MemoryUpdated
- **Descripción:** Se emite cuando la Inteligencia Artificial deduce un nuevo hábito o "hecho" a partir del comportamiento del usuario y lo guarda en la memoria a largo plazo.
- **Quién lo emite:** Gemini API (orquestado por n8n) -> Supabase.
- **Quién lo consume:** LifeOS PWA (sincroniza silenciosamente para adaptar la UI y las recomendaciones futuras al nuevo conocimiento).
- **Datos asociados:**
  - `factId`: String
  - `category`: String ("transit", "productivity", "finance")
  - `content`: String
  - `confidence`: Number (0.0 a 1.0)
- **Ejemplo:**
  ```json
  { "category": "transit", "content": "El usuario prefiere evitar el colectivo de las 18:00 si el clima es lluvioso.", "confidence": 0.92 }
  ```
