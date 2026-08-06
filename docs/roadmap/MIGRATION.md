# Plan de Migración a LifeOS

Este documento detalla el plan paso a paso para evolucionar AppHorarios hacia LifeOS.
Para asegurar la estabilidad, la evolución está dividida en fases pequeñas e incrementales. Cada fase es independiente, se puede fusionar en un solo Pull Request (PR) y garantiza que la aplicación siga funcionando perfectamente.

---

## Fase 1: Limpieza del Dashboard Principal (Refactor UI)

**Objetivo Claro:** Extraer la compleja lógica de negocio y de mapeo de fechas de `src/app/page.tsx` hacia un custom hook, mejorando la legibilidad.
**Dependencias:** Ninguna.
**Archivos Afectados:**
- Modifica: `src/app/page.tsx`
- Crea: `src/hooks/useTodaySchedule.ts` (o similar)

**Riesgos:**
- Romper el cálculo de la línea de tiempo interactiva o la sincronización del tiempo real.

**Criterios de Aceptación:**
- `app/page.tsx` debe tener menos de 100 líneas, delegando la lógica al hook.
- La interfaz visual y la interactividad deben permanecer exactamente igual a los usuarios.

---

## Fase 2: Aislamiento de Server y Client Components

**Objetivo Claro:** Minimizar el uso de `"use client"` en la raíz de la página, aprovechando React Server Components para un renderizado inicial más rápido.
**Dependencias:** Fase 1 completada.
**Archivos Afectados:**
- Modifica: `src/app/page.tsx`
- Crea: `src/features/schedule/InteractiveDashboard.tsx`

**Riesgos:**
- Errores de hidratación de React o problemas al pasar props no serializables desde el Server Component al Client Component.

**Criterios de Aceptación:**
- `src/app/page.tsx` no debe tener la directiva `"use client"`.
- Los componentes interactivos (reloj, filtros) deben estar encapsulados dentro del nuevo `InteractiveDashboard.tsx`.
- La app carga sin errores en la consola.

---

## Fase 3: Unificación de la Arquitectura del Bot (Eliminar Deuda Técnica)

**Objetivo Claro:** Centralizar el bot de Telegram dentro de la infraestructura Next.js y eliminar el proyecto Node.js heredado.
**Dependencias:** Ninguna. (Puede hacerse en paralelo a Fase 1).
**Archivos Afectados:**
- Elimina: Todos los archivos en `legacy-local-bot/`
- Modifica: `src/app/api/bot/webhook/route.ts`, `package.json`

**Riesgos:**
- Tiempo de inactividad temporal del bot durante el cambio de entorno o de configuración del Webhook.

**Criterios de Aceptación:**
- La carpeta `legacy-local-bot/` es eliminada por completo.
- El bot responde a los comandos de Telegram utilizando exclusivamente los endpoints del App Router.
- Eliminación de scripts irrelevantes en `package.json`.

---

## Fase 4: Implementación del Patrón Repositorio (Desacople de Datos)

**Objetivo Claro:** Evitar que la UI o los motores lógicos importen directamente desde `src/data/*.ts`, creando servicios intermediarios asíncronos que preparan el terreno para una Base de Datos real.
**Dependencias:** Ninguna.
**Archivos Afectados:**
- Modifica: `src/lib/engine/*`, `src/hooks/*`, `src/app/page.tsx`
- Modifica/Crea: `src/lib/services/*`, `src/lib/interfaces/*`

**Riesgos:**
- Posibles condiciones de carrera en la UI al cambiar datos síncronos por asíncronos (Promesas).

**Criterios de Aceptación:**
- La aplicación ya no debe importar de forma directa arrays u objetos estáticos de `src/data/`.
- Todos los accesos a los datos deben realizarse llamando a una interfaz asíncrona (ej. `scheduleService.getSchedules()`).

---

## Fase 5: Integración del Core LifeOS (Modelos de Datos)

**Objetivo Claro:** Implementar las entidades base de LifeOS (`UserContext`, `Event`, `Routine`) a nivel de TypeScript sin conectarlas aún a la UI.
**Dependencias:** Ninguna. (Basado en `DATA_MODEL.md`)
**Archivos Afectados:**
- Crea/Modifica: `src/types/core.ts`, `src/types/index.ts`

**Riesgos:**
- Ninguno (solo se añaden definiciones de tipos y contratos, sin afectar runtime).

**Criterios de Aceptación:**
- Los tipos están correctamente declarados y exportados.
- Se puede hacer build de TypeScript (`npm run build` o `tsc`) sin errores de tipos.

---

## Fase 6: Base de Datos MVP Local

**Objetivo Claro:** Reemplazar el servicio de datos asíncrono (creado en Fase 4) por una base de datos real en el dispositivo (ej. RxDB, Dexie o IndexedDB).
**Dependencias:** Fases 4 y 5.
**Archivos Afectados:**
- Modifica: `package.json` (nuevas dependencias), `src/lib/services/*`
- Crea: `src/lib/db/*`

**Riesgos:**
- Aumento del tamaño del bundle de la aplicación.
- Complicaciones para migraciones de esquemas en clientes existentes de la PWA.

**Criterios de Aceptación:**
- El servicio de datos ahora lee y escribe directamente en la base de datos local en vez de usar los JSON hardcodeados.
- El usuario final no nota diferencia en el funcionamiento, salvo la capacidad técnica nueva para editar sus propios horarios u rutinas localmente en futuras vistas.

---

## Reglas Continuas para Cada PR
1. **Sin dependencias superfluas:** Solo instalar lo estrictamente necesario.
2. **Validación:** El PR debe aprobar `npm run lint` y `npm run build` antes del merge.
3. **No regresión:** Las funcionalidades base (calcular márgenes de colectivo y la línea temporal de materias) nunca deben dejar de funcionar.
