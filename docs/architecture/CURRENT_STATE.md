# Auditoría del Estado Actual del Proyecto

Este documento presenta un análisis de la arquitectura y el código existente de la aplicación, identificando su estado actual, problemas y oportunidades de mejora de cara a la evolución hacia LifeOS.

## 1. Arquitectura Actual

La aplicación está construida sobre **Next.js (App Router)** utilizando **React 19** y **Tailwind CSS v4**. Sigue una arquitectura fuertemente orientada al dominio o "Feature-Sliced Design", donde la lógica de negocio y la interfaz de usuario se agrupan por funcionalidades (features) en lugar de por tipos técnicos.

También incluye una arquitectura híbrida para un bot de Telegram, con código legacy en la raíz (`legacy-local-bot`) y nuevas rutas API de Next.js (`app/api/bot`).

## 2. Estructura de Carpetas

La estructura de `src/` es limpia y modular:

- `app/`: Contiene el App Router de Next.js. Define las páginas, layouts y rutas API.
- `components/`: Componentes UI reutilizables agnósticos al dominio (ej. `Card`, `Badge`, `BottomTabBar`).
- `context/`: Estados globales basados en React Context (ej. `EscenarioContext`).
- `data/`: Datos estáticos harcodeados (horarios, escenarios, materias, compañías).
- `features/`: Módulos específicos del dominio (ej. `academia`, `schedule`). Contienen componentes fuertemente acoplados a la lógica de negocio.
- `hooks/`: Custom hooks para abstraer lógica (ej. `useEscenario`, `useFinanzas`).
- `lib/`: Lógica core, motores de recomendación (`engine/`) y contratos de interfaces.
- `types/`: Definiciones estrictas de TypeScript.
- `utils/`: Funciones puras de utilidad (tiempo, fechas).

Fuera de `src/`, existe la carpeta `legacy-local-bot/` que contiene un proyecto de Node.js tradicional para el bot de Telegram.

## 3. Componentes Importantes

- **Layout/UI**: `BottomTabBar.tsx` (navegación principal móvil), `NativeCard.tsx`.
- **Schedule**: `HorarioCard.tsx` (muestra información del colectivo), `ClassTimeline.tsx` (línea de tiempo visual de clases), `ContextualControls.tsx` (filtros contextuales).
- **Widgets**: `AntiSleepButton.tsx`, `ContadorVivo.tsx`, `PomodoroWidget.tsx`.

## 4. Páginas y Rutas

- `/` (`page.tsx`): Dashboard principal ("Hoy"). Muestra recomendaciones de colectivos y la línea de tiempo de materias del día.
- `/academia`: Vista enfocada en la universidad (agenda, fechas límite).
- `/horarios`: Vista completa de los horarios de colectivos.
- `/finanzas`: Módulo de seguimiento de gastos.
- `/configuracion`: Ajustes del usuario.
- `/boveda`: Sección para recursos o almacenamiento.
- `/offline`: Página de fallback para la PWA cuando no hay conexión.

**Rutas API (`app/api/`)**:
- `/bot/webhook`, `/bot/cron`: Endpoints para el bot de Telegram integrado en Next.js.
- `/proximo-colectivo`: Endpoint de utilidad.
- `/siri`: Integración posiblemente con atajos de iOS o comandos de voz.

## 5. Hooks Destacados

- `useEscenario`: Maneja el contexto principal del usuario (día seleccionado, si cursa o no, si duerme en origen o destino).
- `useRecommendations` y `useSchedule`: Encargados de interactuar con el motor de recomendaciones.
- `useBec`: Lógica relacionada al Boleto Educativo Cordobés.
- `useLocalStorageState`: Utilidad para persistir configuración en el dispositivo.

## 6. Utilidades y Motores (`lib/engine`)

- `recommendation-engine.ts`: Calcula qué colectivo tomar considerando márgenes de tiempo, paradas y estado del usuario.
- `scenario-engine.ts`: Determina el "escenario" del día basado en reglas (ej. si es martes y tiene Arquitectura).

## 7. Dependencias Principales

- **Core**: `next` (v16.3.0), `react` (v19), `typescript` (v7).
- **Estilos y UI**: `tailwindcss` (v4), `framer-motion` (animaciones fluidas), `lucide-react` (íconos).
- **Tiempo**: `dayjs`, `chrono-node`.
- **Bot**: `telegraf` (para el bot de Telegram), `node-cron`.

## 8. Problemas Encontrados y Deuda Técnica

1. **Lógica pesada en la UI (`app/page.tsx`)**: El archivo de la página principal realiza el cálculo y filtrado manual de las materias del día iterando sobre `subjectData` y los bloques de clases. Esta lógica debería estar abstraída en un hook o en el `scenario-engine`.
2. **Fragmentación del Bot (Deuda Técnica)**: Existe una dualidad entre el bot alojado en `legacy-local-bot/` (que corre como un proceso de Node separado vía `tsx`) y la infraestructura de webhooks en `app/api/bot/`.
3. **Datos Estáticos (`src/data/`)**: Toda la información de horarios y materias está hardcodeada en archivos TypeScript. Esto impide que la aplicación sea dinámica o multiusuario sin recompilar.
4. **Estado Global Extenso**: La dependencia intensiva de múltiples custom hooks y Contextos (ej. `EscenarioContext`) puede causar problemas de rendimiento por re-renders innecesarios si la app sigue creciendo.

## 9. Oportunidades de Mejora

- **Migración a Base de Datos**: Reemplazar la carpeta `data/` por una solución local-first (como SQLite/RxDB) o remota (Supabase) para almacenar horarios y rutinas.
- **Unificación del Bot**: Migrar completamente la lógica de `legacy-local-bot` a las Serverless Functions de Next.js (`app/api/bot`), eliminando el proceso en segundo plano.
- **Server Components**: Aprovechar más los React Server Components (RSC) en Next.js. Actualmente, componentes como `app/page.tsx` usan `"use client"` de forma global, desperdiciando la capacidad del servidor para pre-calcular horarios.
- **Patrón de Adaptador**: Implementar interfaces claras para los proveedores de datos (ej. extraer horarios) de forma que el origen pueda cambiar (de JSON estático a API real) sin afectar la UI.

## 10. Qué mantener y Qué reemplazar

### Mantener:
- **Estructura modular (`features/`)**: Es altamente escalable y mantiene el dominio aislado.
- **Stack de UI**: Tailwind CSS v4 y Framer Motion ofrecen una base sólida y moderna.
- **Motores lógicos (`lib/engine/`)**: El concepto de separar las reglas de negocio (motores de escenarios y recomendaciones) de la UI es excelente.
- **PWA Capabilities**: Mantener el soporte offline y el manifiesto.

### Reemplazar:
- **`legacy-local-bot`**: Debe eliminarse una vez migrado al webhook nativo de Next.js.
- **Datos Hardcodeados (`src/data/*.ts`)**: Deben reemplazarse por llamadas asíncronas a un repositorio de datos (Base de datos o API remota).
- **`"use client"` masivo en páginas raíz**: Mover el estado a componentes cliente hoja (leaf components) y dejar que las páginas (pages) funcionen como Server Components.

---

## 11. Lista Priorizada de Mejoras

1. **Refactorización de `app/page.tsx`**: Extraer la lógica de cálculo de materias y escenarios a un custom hook (`useTodaySchedule`) para limpiar el componente UI.
2. **Eliminación de Deuda Técnica del Bot**: Migrar las funciones restantes de `legacy-local-bot/` hacia `app/api/bot/webhook/route.ts` y eliminar la carpeta legacy.
3. **Aislamiento de Componentes de Cliente**: Rediseñar `app/page.tsx` para que sea un Server Component, envolviendo solo las partes interactivas en componentes cliente (ej. `<DashboardInteractivo />`).
4. **Migración a Base de Datos (MVP de LifeOS)**: Reemplazar los archivos de `src/data/` por un cliente de base de datos local o API.
5. **Optimización de Estado**: Evaluar el reemplazo de Contexts grandes por herramientas de manejo de estado atómico o global (Zustand) para mejorar el rendimiento en móviles.
