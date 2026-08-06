# Plan de Migraci√≥n a LifeOS

Este documento detalla el plan paso a paso para evolucionar AppHorarios hacia LifeOS.
Para asegurar la estabilidad, la evoluci√≥n est√° dividida en fases peque√±as e incrementales. Cada fase es independiente, se puede fusionar en un solo Pull Request (PR) y garantiza que la aplicaci√≥n siga funcionando perfectamente.

---

## Fase 1: Limpieza del Dashboard Principal (Refactor UI)

**Objetivo Claro:** Extraer la compleja l√≥gica de negocio y de mapeo de fechas de `src/app/page.tsx` hacia un custom hook, mejorando la legibilidad.
**Dependencias:** Ninguna.
**Archivos Afectados:**
- Modifica: `src/app/page.tsx`
- Crea: `src/hooks/useTodaySchedule.ts` (o similar)

**Riesgos:**
- Romper el c√°lculo de la l√≠nea de tiempo interactiva o la sincronizaci√≥n del tiempo real.

**Criterios de Aceptaci√≥n:**
- `app/page.tsx` debe tener menos de 100 l√≠neas, delegando la l√≥gica al hook.
- La interfaz visual y la interactividad deben permanecer exactamente igual a los usuarios.

---

## Fase 2: Aislamiento de Server y Client Components

**Objetivo Claro:** Minimizar el uso de `"use client"` en la ra√≠z de la p√°gina, aprovechando React Server Components para un renderizado inicial m√°s r√°pido.
**Dependencias:** Fase 1 completada.
**Archivos Afectados:**
- Modifica: `src/app/page.tsx`
- Crea: `src/features/schedule/InteractiveDashboard.tsx`

**Riesgos:**
- Errores de hidrataci√≥n de React o problemas al pasar props no serializables desde el Server Component al Client Component.

**Criterios de Aceptaci√≥n:**
- `src/app/page.tsx` no debe tener la directiva `"use client"`.
- Los componentes interactivos (reloj, filtros) deben estar encapsulados dentro del nuevo `InteractiveDashboard.tsx`.
- La app carga sin errores en la consola.

---

## Fase 3: Unificaci√≥n de la Arquitectura del Bot (Eliminar Deuda T√©cnica)

**Objetivo Claro:** Centralizar el bot de Telegram dentro de la infraestructura Next.js y eliminar el proyecto Node.js heredado.
**Dependencias:** Ninguna. (Puede hacerse en paralelo a Fase 1).
**Archivos Afectados:**
- Elimina: Todos los archivos en `legacy-local-bot/`
- Modifica: `src/app/api/bot/webhook/route.ts`, `package.json`

**Riesgos:**
- Tiempo de inactividad temporal del bot durante el cambio de entorno o de configuraci√≥n del Webhook.

**Criterios de Aceptaci√≥n:**
- La carpeta `legacy-local-bot/` es eliminada por completo.
- El bot responde a los comandos de Telegram utilizando exclusivamente los endpoints del App Router.
- Eliminaci√≥n de scripts irrelevantes en `package.json`.

---

## Fase 4: Implementaci√≥n del Patr√≥n Repositorio (Desacople de Datos)

**Objetivo Claro:** Evitar que la UI o los motores l√≥gicos importen directamente desde `src/data/*.ts`, creando servicios intermediarios as√≠ncronos que preparan el terreno para una Base de Datos real.
**Dependencias:** Ninguna.
**Archivos Afectados:**
- Modifica: `src/lib/engine/*`, `src/hooks/*`, `src/app/page.tsx`
- Modifica/Crea: `src/lib/services/*`, `src/lib/interfaces/*`

**Riesgos:**
- Posibles condiciones de carrera en la UI al cambiar datos s√≠ncronos por as√≠ncronos (Promesas).

**Criterios de Aceptaci√≥n:**
- La aplicaci√≥n ya no debe importar de forma directa arrays u objetos est√°ticos de `src/data/`.
- Todos los accesos a los datos deben realizarse llamando a una interfaz as√≠ncrona (ej. `scheduleService.getSchedules()`).

---

## Fase 5: Integraci√≥n del Core LifeOS (Modelos de Datos)

**Objetivo Claro:** Implementar las entidades base de LifeOS (`UserContext`, `Event`, `Routine`) a nivel de TypeScript sin conectarlas a√∫n a la UI.
**Dependencias:** Ninguna. (Basado en `DATA_MODEL.md`)
**Archivos Afectados:**
- Crea/Modifica: `src/types/core.ts`, `src/types/index.ts`

**Riesgos:**
- Ninguno (solo se a√±aden definiciones de tipos y contratos, sin afectar runtime).

**Criterios de Aceptaci√≥n:**
- Los tipos est√°n correctamente declarados y exportados.
- Se puede hacer build de TypeScript (`npm run build` o `tsc`) sin errores de tipos.

---

## Fase 6: Base de Datos MVP Local (IndexedDB)

**Objetivo Claro:** Reemplazar el servicio de datos as√≠ncrono y el estado persistente por una base de datos real en el dispositivo (IndexedDB).
**Dependencias:** Fases 4 y 5.
**Archivos Afectados:**
- Modifica: `src/core/hooks/*`, `src/context/*`
- Crea: `src/core/utils/indexedDB.ts`

**Riesgos:**
- Aumento del tiempo de montaje inicial al depender de IndexedDB as√≠ncrono.
- Complicaciones para migraciones de esquemas en clientes existentes de la PWA.

**Criterios de Aceptaci√≥n:**
- La PWA guarda todo su estado de manera as√≠ncrona utilizando IndexedDB.
- El usuario final no nota diferencia en el funcionamiento.

---

## Fase 7: Integraci√≥n de Supabase (Sincronizaci√≥n Cloud)

**Objetivo Claro:** Proveer los cimientos para la nube de LifeOS implementando Supabase SSR y preparar la autenticaci√≥n y la capa de acceso a base de datos.
**Dependencias:** Ninguna estrictamente funcional para la UI, pero prepara la conexi√≥n al Backend.
**Archivos Afectados:**
- Crea: `src/core/utils/supabase/client.ts`, `src/core/utils/supabase/server.ts`, `src/core/utils/supabase/middleware.ts`
- Modifica: `src/proxy.ts` (Next.js 16 Middleware), `package.json`

**Riesgos:**
- Romper el build por conflictos de compatibilidad de middlewares o variables de entorno omitidas.

**Criterios de Aceptaci√≥n:**
- SDKs oficiales (`@supabase/supabase-js`, `@supabase/ssr`) instalados.
- Clientes para Server Components, Client Components y Middleware debidamente separados.
- Proyecto compila exitosamente.

---

## Reglas Continuas para Cada PR
1. **Sin dependencias superfluas:** Solo instalar lo estrictamente necesario.
2. **Validaci√≥n:** El PR debe aprobar `npm run lint` y `npm run build` antes del merge.
3. **No regresi√≥n:** Las funcionalidades base (calcular m√°rgenes de colectivo y la l√≠nea temporal de materias) nunca deben dejar de funcionar.

---

## Fase 8: Infraestructura Base para IA (Gemini)

**Objetivo Claro:** Preparar la conexiÛn con el LLM instalando el SDK oficial y creando una capa de abstracciÛn estricta en el servidor para evitar fuga de API Keys.
**Dependencias:** Ninguna estrictamente.
**Archivos Afectados:**
- Modifica: .env.local, package.json`n- Crea: src/core/ai/*`n
**Riesgos:**
- Llamadas accidentales a la API desde el cliente (exposiciÛn de claves).

**Criterios de AceptaciÛn:**
- Dependencia @google/generative-ai instalada.
- Las llaves viven solo en .env.local y el SDK se instancia solo en el backend.
- El servicio base fuerza que las respuestas sean en JSON estructurado.
- Pasa validaciÛn de compilaciÛn.

---

## Fase 9: Primer Endpoint Inteligente (NLP)

**Objetivo Claro:** Crear una API Route que consuma el GeminiService para probar la extracciÛn de lenguaje natural a JSON estructurado.
**Dependencias:** Fase 8 completada.
**Archivos Afectados:**
- Crea: src/app/api/ai/parse/route.ts`n- Crea: 	ests/ai-parse.http`n
**Riesgos:**
- Ninguno, es un endpoint independiente sin conexiÛn a BD ni UI.

**Criterios de AceptaciÛn:**
- El endpoint extrae exitosamente tareas, eventos y gastos de un texto natural.
- Las fechas se infieren usando el ISO string actual como ancla temporal.
- Retorna exclusivamente JSON estructurado.

---

## Fase 10: Sync Engine (Local First a Cloud)

**Objetivo Claro:** Crear el orquestador principal que une IndexedDB con Supabase implementando Background Sync, resoluciÛn de conflictos y reintentos autom·ticos.
**Dependencias:** Fases 6 (Local DB) y 7 (Supabase) completadas.
**Archivos Afectados:**
- Crea: src/core/sync/*`n
**Riesgos:**
- Problemas de compatibilidad cruzada en navegadores para Background Sync.

**Criterios de AceptaciÛn:**
- Cola de reintentos (Exponential Backoff) implementada.
- Observador de estados (idle, syncing, offline, error) disponible para la UI.
- ResoluciÛn de conflictos mediante Last Write Wins (LWW).
- La interfaz de usuario no es bloqueada por el proceso de sincronizaciÛn.

---

## Fase 11: Infraestructura del Brain Engine

**Objetivo Claro:** Construir la arquitectura modular que actuar· como cerebro central de LifeOS, encargada de orquestar prompts, interpretar intenciones y extraer entidades, actuando como capa superior a la API de Gemini pura.
**Dependencias:** Fase 8 (API Gemini) completada.
**Archivos Afectados:**
- Crea: src/core/brain/*`n
**Riesgos:**
- Ninguno funcional. Es cÛdigo pasivo.

**Criterios de AceptaciÛn:**
- Estructura modular creada (/intents, /entities, /prompts, /services, /types).
- Contratos (Interfaces TypeScript) fuertemente tipados definidos.
- Ausencia total de dependencias directas en la UI.

---

## Fase 12: IntegraciÛn Activa del Brain Engine

**Objetivo Claro:** Implementar la lÛgica activa en el servicio del Brain Engine y exponerla mediante una API Route para extraer entidades estandarizadas desde lenguaje natural.
**Dependencias:** Fases 8 (Gemini) y 11 (Brain Infra) completadas.
**Archivos Afectados:**
- Crea: src/app/api/core/brain/route.ts`n- Crea: 	ests/brain-engine.http`n- Modifica: src/core/brain/services/index.ts, prompts/index.ts`n
**Riesgos:**
- Inconsistencias de formato por alucinaciones del modelo (mitigadas forzando responseMimeType y proveyendo un esquema rÌgido).

**Criterios de AceptaciÛn:**
- El endpoint /api/core/brain devuelve exitosamente el an·lisis del intent, nivel de confianza, y campos extraÌdos.
- Usa el contexto de fecha y zona horaria provistos din·micamente.

---

## Fase 13: PreparaciÛn de Interfaz para Insights

**Objetivo Claro:** Construir los componentes visuales (Cards, Skeletons, Estados VacÌos) que renderizar·n los hallazgos del Brain Engine en el Dashboard principal, inyect·ndolos de forma no destructiva.
**Dependencias:** Fase 1 y 12 completadas.
**Archivos Afectados:**
- Modifica: src/app/page.tsx`n- Crea: src/features/insights/*`n
**Riesgos:**
- Desplazamiento brusco del layout (CLS - Cumulative Layout Shift) en mÛviles.

**Criterios de AceptaciÛn:**
- Existen los componentes InsightCard, InsightSkeleton y EmptyInsights.
- El diseÒo mantiene el fondo negro y el glassmorphism preexistente.
- El orquestador DashboardInsights maneja gr·cilmente la ausencia de datos sin romper la experiencia actual.

---

## Fase 14: Flujo Completo de IA (End-to-End)

**Objetivo Claro:** Cerrar el ciclo entre la Interfaz de Usuario y el Brain Engine permitiendo input natural, procesamiento en la nube con Gemini, y renderizado de Insights estructurados en tiempo real. No se incluye persistencia.
**Dependencias:** Fases 12 y 13 completadas.
**Archivos Afectados:**
- Modifica: src/features/insights/DashboardInsights.tsx`n
**Riesgos:**
- Latencia percibida (mitigada por Skeletons de espera).

**Criterios de AceptaciÛn:**
- Se agregÛ un Smart Input estÈticamente cohesivo al Dashboard.
- El usuario puede escribir lenguaje natural y ver el resultado interpretado visualmente.
- No se agregan nuevas dependencias al frontend ni se muta IndexedDB a˙n.

---

## Fase 15: AuditorÌa y RefactorizaciÛn Final (Clean Code)

**Objetivo Claro:** Resolver la deuda tÈcnica masiva identificada en la AuditorÌa Inicial (CODE_AUDIT.md) aplicando el Principio de Responsabilidad ⁄nica.
**Archivos Afectados:**
- Modifica: src/app/page.tsx, src/features/insights/DashboardInsights.tsx`n- Crea: src/hooks/useTodaySchedule.ts`n
**ResoluciÛn de Problemas Reales:**
- Se extrajo toda la lÛgica masiva (filtro de escenarios, c·lculo de timelines y ruteos de colectivos) desde el componente de UI (\page.tsx\) hacia un hook dedicado (\useTodaySchedule\).
- Se redujo el peso cognitivo del archivo principal en m·s del 50%.
- Se corrigiÛ una potencial advertencia (Warning) de React al iterar listas de Insights usando \crypto.randomUUID()\ en vez del Ìndice del array.

**Estado Pre-ProducciÛn:** El compilador de producciÛn (\
ext build\) arrojÛ 0 advertencias, 0 errores, y los tiempos de compilaciÛn son excepcionales.
