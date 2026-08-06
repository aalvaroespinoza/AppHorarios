# Auditoría Técnica de Código (LifeOS)

Este documento contiene la auditoría técnica exhaustiva del código fuente existente de AppHorarios, evaluando su viabilidad como base fundacional para la implementación de LifeOS. Todo ha sido clasificado para guiar el proceso de migración de forma incremental.

---

## 1. Análisis por Categoría

### 1.1. Arquitectura y Estructura de Carpetas
El proyecto utiliza un *Feature-Sliced Design* adaptado a Next.js App Router. Las responsabilidades están divididas en `features`, `components`, `hooks`, `lib` y `utils`. Es una estructura robusta y escalable.

### 1.2. Componentes y Estilos
Los componentes de UI (ej. `NativeCard`, `BottomTabBar`) son altamente reutilizables y aprovechan perfectamente **Tailwind CSS v4** y **Framer Motion** para animaciones a 60fps. El archivo `globals.css` está limpio e implementa variables CSS correctas.
**Accesibilidad y PWA:** El diseño contempla muy bien los márgenes seguros para iOS (`pb-safe`, Home Indicator spacing) y prevención de zoom (`userScalable: false`), comportándose como una app nativa.

### 1.3. Estado Global (Context y LocalStorage)
El archivo `EscenarioContext.tsx` administra el estado crítico del usuario (Día, si cursa, dónde duerme). Si bien funciona, supedita el estado global al ciclo de vida de React y usa un `useEffect` para leer `localStorage`, lo que genera un retardo (flicker) o saltos de hidratación al montar la app, forzando a la PWA a mostrar una pantalla negra temporal (`if (!isMounted) return <div className="min-h-screen bg-black" />`).

### 1.4. Deuda Técnica y Lógica Masiva
El archivo `app/page.tsx` contiene 173 líneas de código donde mezcla:
- Detección del motor de escenarios.
- Filtrado y mapeo de arrays de materias.
- Cálculo de la línea de tiempo activa.
- Renderizado de componentes UI.
Esta violación del principio de responsabilidad única dificulta el testing y el mantenimiento.

### 1.5. Manejo de Datos
Toda la aplicación depende ciegamente de la carpeta estática `src/data/`. No hay interfaces asíncronas preparadas para el salto a Supabase o IndexedDB.

---

## 2. Clasificación de Elementos

### ✅ Mantener (Keep)
- **Estructura de Carpetas (`features/`, `components/ui/`, `types/`)**: Alta cohesión y bajo acoplamiento.
- **Stack UI**: Tailwind CSS v4, Framer Motion y Lucide React.
- **Componentes de Layout (`BottomTabBar.tsx`, `layout.tsx`)**: Excelente soporte para *Safe Areas* de dispositivos móviles.
- **Motores Lógicos (`lib/engine/`)**: La separación matemática del motor de recomendaciones es excelente y pura.

### ⚠️ Refactorizar (Refactor)
- **`app/page.tsx`**: Urge desacoplar la lógica de cálculo de materias y escenarios extrayéndola hacia un Custom Hook (ej. `useTodaySchedule`).
- **`EscenarioContext.tsx`**: El manejo de estado con `Context + localStorage` debe refactorizarse eventualmente (quizás hacia Zustand con middleware de persistencia) para evitar el temido *Hydration Mismatch* y los tiempos de carga en negro.
- **Bot de Telegram**: El código en `legacy-local-bot` debe refactorizarse migrando sus controladores a las rutas `app/api/bot/webhook`.

### ❌ Reemplazar (Replace)
- **Archivos Estáticos (`src/data/*.ts`)**: Deben reemplazarse por la Arquitectura Local-First (IndexedDB / Repositorios Asíncronos).
- **Directivas `"use client"` Masivas**: Reemplazar el uso global de `"use client"` en las páginas principales por un diseño híbrido donde la página es un Server Component y solo los fragmentos interactivos (como los botones) son Client Components.

---

## 3. Propuesta Estratégica: PR #1

Basado en la evaluación de riesgos y la filosofía de cambios pequeños, el primer paso no debe introducir bases de datos ni IA. Debe preparar el terreno limpiando el componente principal.

**Propuesta PR #1: Refactor de Lógica UI en Dashboard (`app/page.tsx`)**

- **Objetivo:** Desacoplar la lógica de negocio de la vista en el Dashboard Principal.
- **Acciones:**
  1. Crear el hook `src/hooks/useTodaySchedule.ts`.
  2. Mover toda la lógica de filtrado de `materiasDelDia`, mapeo de días de la semana y cálculo del `activeIndex` de la línea de tiempo hacia este hook.
  3. Limpiar `app/page.tsx` para que simplemente consuma el hook y devuelva el JSX.
- **Beneficio:** Reducirá el archivo de 173 líneas a menos de 80, aislando la lógica para facilitar la futura transición a Server Components y Base de Datos, **sin cambiar en absoluto el comportamiento visual actual de la aplicación**.
