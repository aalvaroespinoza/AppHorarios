# Arquitectura de Inteligencia Artificial (Gemini API)

Este documento detalla el diseño y la integración técnica de los Modelos de Lenguaje (LLMs) de Google Gemini dentro del ecosistema de LifeOS, especificando sus límites, casos de uso, formatos de salida y estrategias de optimización para operar de manera costo-eficiente.

---

## 1. Reglas de Uso de IA

LifeOS utiliza un enfoque pragmático para la Inteligencia Artificial. No es un simple "Chatbot", es un agente invisible.

### 🟢 Cuándo USAR IA
- **Análisis de Texto no Estructurado:** Procesar notas de voz, mensajes rápidos o correos reenviados para extraer datos estructurados.
- **Clasificación Difusa:** Asignar categorías a gastos financieros donde la correspondencia exacta (regex) no escala.
- **Generación de Insights y Patrones:** Encontrar correlaciones ocultas en el comportamiento del usuario cruzando múltiples puntos de datos abstractos (ej. clima vs demoras vs humor).
- **Traducción de Intenciones:** Transformar el deseo del usuario en acciones mecánicas de la interfaz (Agentic UI).

### 🔴 Cuándo NO USAR IA
- **Lógica de Negocio Determinista:** El cálculo matemático de qué bus tomar ("si tardo 10 mins caminando y el bus pasa a las 14:15, debo salir a las 14:05") **nunca** debe depender de la IA. Eso es trabajo del `recommendation-engine` en TypeScript.
- **Renderizado de Interfaz o Routing Crítico:** La interfaz de la PWA no debe quedar bloqueada (loading) esperando una llamada de red de Gemini.
- **Consultas a Base de Datos Exactas:** Evitar el uso excesivo de "Text-to-SQL" si un filtro directo (WHERE) resuelve el problema en 1 milisegundo.

---

## 2. Optimización: Costo, Latencia y Llamadas

Para evitar una facturación sorpresa en Google Cloud Platform y cuellos de botella de red, se implementan las siguientes técnicas en n8n:

1. **Selección Dinámica de Modelos:**
   - Usar **Gemini 1.5 Flash (o superior, variante ligera)** para Extracción de Entidades, Clasificación y Enrutamiento. Estos son rápidos y 10x más baratos.
   - Usar **Gemini 1.5 Pro** de manera exclusiva para la *Generación de Insights y Memoria* al final del día, donde el razonamiento profundo es vital y la latencia no importa.
2. **Procesamiento por Lotes (Batching):** En lugar de hacer una petición a la API cada vez que el usuario carga un gasto rápido, n8n los encola y le pide a Gemini que clasifique 10 gastos en una sola llamada estructurada de JSON Array.
3. **Filtro Semántico Previo:** Antes de enviar el resumen del día a Gemini, se filtran de la base de datos (con queries tradicionales) las tareas mundanas o redundantes para reducir dramáticamente el conteo de *Input Tokens*.

---

## 3. Diseño de Casos de Uso y Prompts

Gemini siempre será llamado a través de la API REST o SDK forzando el tipo de respuesta a `application/json` (`response_mime_type: "application/json"`) para garantizar compatibilidad nativa con los webhooks de n8n.

### 3.1. Extracción de Entidades (Agenda y Tareas)
- **Objetivo:** Convertir lenguaje natural del usuario a JSON estructurado para insertarlo en Supabase.
- **System Prompt Base:**
  > "Eres el módulo de extracción de entidades de LifeOS. Debes interpretar el comando del usuario y extraer las tareas y eventos. La fecha actual del sistema es [CURRENT_DATE]. No inventes datos que falten."
- **Formato JSON Esperado:**
  ```json
  {
    "tasks": [
      { "title": "string", "due_date": "ISO8601 o nulo", "priority": "high|normal|low" }
    ],
    "events": [
      { "title": "string", "start_time": "ISO8601", "location": "string o nulo" }
    ]
  }
  ```

### 3.2. Clasificación (Gastos Financieros)
- **Objetivo:** Categorizar un gasto en una de las categorías predefinidas de LifeOS.
- **System Prompt Base:**
  > "Clasifica el gasto ingresado en UNA de las siguientes categorías exactas: 'Transporte', 'Alimentos', 'Universidad', 'Entretenimiento', 'Otros'. Evalúa el contexto local de Argentina. Devuelve únicamente un objeto JSON."
- **Formato JSON Esperado:**
  ```json
  {
    "category": "string",
    "confidence_score": 0.95
  }
  ```

### 3.3. Memoria a Largo Plazo y RAG
- **Objetivo:** Construir la base de datos de conocimiento de LifeOS utilizando la base vectorial (`pgvector`).
- **Técnica:** Cuando el usuario pide un consejo, n8n realiza primero un *Similarity Search* (búsqueda por similitud vectorial) en la tabla `memory_facts`. Los 5 hechos con mayor similitud se inyectan en el prompt para darle contexto a la respuesta de Gemini (Retrieval-Augmented Generation).

### 3.4. Generación de Insights (Consolidación Diaria)
- **Objetivo:** Evaluar cómo transcurrió el día del usuario, contrastando lo planeado vs lo ejecutado, para generar un nuevo Hábito/Memoria (Insight).
- **System Prompt Base:**
  > "Eres el módulo cognitivo de LifeOS. A continuación recibes un log de las actividades reales del usuario hoy (gastos, tiempos de traslado, tareas completadas) junto a su planificación inicial.
  > Analiza las discrepancias. ¿Hay un patrón recurrente? Si encuentras una lección de alto valor que el usuario debe recordar en el futuro, extráela como un 'fact'. Sé estricto, no generes facts obvios."
- **Formato JSON Esperado:**
  ```json
  {
    "insight_found": true,
    "fact": {
      "category": "productivity",
      "content": "El rendimiento de estudio cae drásticamente después de tomar el bus de las 18:00, las tareas se aplazan al día siguiente.",
      "confidence": 0.88
    }
  }
  ```
