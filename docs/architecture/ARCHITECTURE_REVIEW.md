# Auditoría Arquitectónica de LifeOS (Review)

Este documento contiene un análisis crítico exhaustivo del diseño arquitectónico propuesto para LifeOS. Se evalúan contradicciones, riesgos, cuellos de botella y problemas estructurales graves que podrían comprometer la viabilidad del proyecto si no se resuelven de antemano.

---

## 1. Contradicciones Estructurales Graves

### 1.1. "Offline-First" vs "Next.js App Router"
- **Problema:** En `ARCHITECTURE.md` se define el proyecto como "Offline-First", sin embargo, la aplicación utiliza Next.js 16 con App Router.
- **Crítica:** App Router está intrínsecamente diseñado en torno a React Server Components (RSC) y Server Actions. Estas tecnologías requieren **conexión constante con el servidor**. Una PWA offline-first en Next.js App Router es un antipatrón masivo. Si el usuario pierde conexión, la navegación hacia nuevas rutas que dependan del servidor fallará.
- **Resolución requerida:** Se debe decidir si la aplicación será una verdadera SPA offline (usando Vite o Next.js Static Export) o si se abandonará el "Offline-First" estricto a favor de un enfoque "Server-First con caché".

### 1.2. "Local y Privado Primero" vs "Gemini API"
- **Problema:** `PRINCIPLES.md` exige un enfoque privado, pero `GEMINI.md` y `EVENTS.md` proponen enviar rutinas, finanzas, ubicaciones y hábitos a una API en la nube (Google).
- **Crítica:** Existe una enorme brecha de privacidad al enviar telemetría vital (`BusBoarded`, `ExpenseCreated`) a un LLM en la nube.
- **Resolución requerida:** Minimizar el uso de la nube para datos confidenciales, usar un modelo local (LocalLLM vía WebGPU) para análisis de rutinas, u ofuscar totalmente la PII (Personal Identifiable Information) antes de enviar a Gemini a través de n8n.

---

## 2. Problemas con Sincronización Offline y Base de Datos

### 2.1. Resolución de Conflictos (IndexedDB vs Supabase)
- **Problema:** Se sugiere WatermelonDB/RxDB en cliente y Supabase (PostgreSQL) en servidor con "Background Sync".
- **Crítica:** Supabase es una base de datos relacional estándar; no maneja CRDTs (Conflict-free Replicated Data Types) de forma nativa. Si un usuario edita una tarea offline, y otro dispositivo hace lo mismo, la sincronización fallará o sobrescribirá datos silenciosamente. 
- **Riesgo:** Pérdida de datos. Implementar sincronización bidireccional custom sobre PostgreSQL es extremadamente complejo.

### 2.2. Efecto "Thundering Herd" en la Arquitectura de Eventos
- **Problema:** Si un usuario está offline por 3 días y acumula 150 eventos, al conectarse, la Background Sync insertará los 150 eventos de golpe en Supabase.
- **Crítica:** Esto disparará 150 Webhooks simultáneos desde Supabase hacia n8n. n8n (especialmente si es auto-alojado) podría colapsar, y las llamadas concurrentes a la API de Gemini generarán bloqueos por Rate Limiting (429 Too Many Requests).

---

## 3. Problemas con la Arquitectura Orientada a Eventos (EDA)

### 3.1. Reacción a Eventos Diferidos
- **Problema:** n8n reacciona a los eventos en tiempo real cuando llegan a Supabase.
- **Crítica:** ¿Qué ocurre si un evento `ScheduleCompleted` llega 2 días tarde por estar offline? n8n podría disparar una notificación de "Buen trabajo hoy" totalmente desfasada.
- **Resolución requerida:** Todos los flujos en n8n deben validar el `timestamp` del evento frente al tiempo actual (`now()`). Si el `delta` es mayor a X minutos, debe descartar las acciones en tiempo real (como notificaciones) y procesar solo la actualización del estado (Memory Layer).

---

## 4. Problemas de Escalabilidad de la Memory Layer

### 4.1. Cuello de botella del Contexto
- **Problema:** Se propone una "Memory Layer" donde Gemini analiza los hábitos.
- **Crítica:** A medida que la "Memory Layer" crece, extraer todos los hábitos y enviarlos en el prompt de Gemini para que este deduzca nuevos hábitos consumirá excesivos tokens, aumentará radicalmente la latencia y disparará los costos de la API.
- **Resolución requerida:** Implementar Retrieval-Augmented Generation (RAG) en n8n antes de invocar a Gemini. Supabase `pgvector` debe filtrar solo el contexto semánticamente relevante a la acción actual antes del análisis.

---

## 5. Decisiones Faltantes y Riesgos Ocultos

### 5.1. Autenticación Local
- **Riesgo:** Si el sistema usa Supabase Auth, ¿cómo se valida el token al abrir la PWA sin internet? Se requiere implementar un mecanismo criptográfico local (JSON Web Keys) para permitir acceso seguro a los datos de IndexedDB mientras se está offline.

### 5.2. Complejidad Innecesaria de n8n
- **Crítica:** Meter n8n entre Supabase y Gemini añade latencia, puntos de fallo y complejidad de despliegue. Si la aplicación ya tiene el backend de Next.js (`app/api`), ¿por qué no procesar los webhooks de Supabase directamente en una API Route de Next.js? n8n tiene sentido para integraciones no-code (clima, email), pero usarlo como middleware obligatorio para la IA es sobreingeniería.

---

## 6. Lista Priorizada de Cambios Recomendados

1. **Re-evaluar Next.js App Router (Crítico):** Decidir si se migrará a Next.js Static Export (SPA pura) para garantizar un offline real, o si se abandona la postura offline-first por una offline-tolerant (solo caché parcial). Documentar esta decisión en `ARCHITECTURE.md`.
2. **Definir Arquitectura de Sincronización:** Documentar el uso de librerías CRDT o un patrón `append-only` event-sourcing en lugar de sincronización CRUD directa para evitar colisiones entre IndexedDB y Supabase.
3. **Manejo de Eventos Desfasados (Stale Events):** Actualizar `EVENTS.md` y `N8N.md` para exigir una lógica de expiración (TTL) en las automatizaciones. Si un evento es más antiguo que N horas al momento de recibirse, omitir side-effects visuales.
4. **Desacoplamiento de IA y PII (Seguridad):** Modificar `GEMINI.md` para introducir una fase obligatoria de "Data Anonymization" antes de que los datos salgan del sistema hacia Google, o proponer un LLM local.
5. **Reducir Dependencia de n8n:** Cambiar el flujo en `ARCHITECTURE.md` para que los Database Events críticos de la Memory Layer vayan directo a las Serverless Functions de Next.js, limitando n8n estrictamente a integraciones con APIs externas de terceros.
6. **Diseño del Sistema de Autenticación:** Escribir un documento nuevo detallando cómo se autenticará el usuario en modo Offline-First sin exponer sus datos locales del dispositivo.
