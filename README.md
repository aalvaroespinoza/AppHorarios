# AppHorarios

> PWA para saber qué colectivo tomar desde **Despeñaderos → UTN Córdoba** según el día de cursada.

---

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| Next.js (App Router) | 16.x | Framework principal |
| React | 19.x | UI |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 4.x | Estilos |

---

## Estructura de carpetas

```
src/
├── app/                   # App Router de Next.js (rutas y layouts)
│   ├── layout.tsx         # Layout raíz (head, fuentes, providers)
│   ├── page.tsx           # Página principal "/"
│   └── globals.css        # Estilos globales y tokens de Tailwind
│
├── components/            # Componentes reutilizables y agnósticos al dominio
│   └── ui/                # Primitivas de UI (Card, Badge, Button…)
│
├── features/              # Módulos de dominio auto-contenidos
│   ├── schedule/          # Visualización de horarios de colectivos
│   └── recommendations/   # Cálculo y presentación de recomendaciones
│
├── lib/                   # Infraestructura y contratos
│   └── interfaces/        # Interfaces de repositorios (contrato entre features y datos)
│
├── types/                 # Tipos e interfaces TypeScript del dominio
│   ├── common.ts          # Tipos primitivos compartidos (DayOfWeek, Shift, TimeString…)
│   ├── schedule.ts        # BusService, DaySchedule, ScheduleData
│   ├── subject.ts         # ClassBlock, Subject, SubjectData
│   ├── recommendation.ts  # Recommendation, DayRecommendations
│   └── index.ts           # Barrel — re-exporta todo
│
├── data/                  # Datos estáticos del dominio (JSON/TS)
│   ├── schedules.ts       # Horarios de colectivos (a completar)
│   ├── subjects.ts        # Materias de la carrera (a completar)
│   └── index.ts           # Barrel
│
├── hooks/                 # Custom hooks de React
│   ├── useSchedule.ts     # Hook para acceder a horarios
│   ├── useRecommendations.ts # Hook para obtener recomendaciones del día
│   └── index.ts           # Barrel
│
└── utils/                 # Funciones puras sin side effects
    ├── time.ts            # formatTime, calculateMarginMinutes
    ├── date.ts            # getDayOfWeek
    └── index.ts           # Barrel
```

---

## Aliases de importación

Configurados en `tsconfig.json`:

```ts
// En lugar de rutas relativas:
import { BusService } from '../../../types/schedule';

// Usar el alias:
import type { BusService } from '@/types/schedule';
```

| Alias | Carpeta |
|---|---|
| `@/*` | `src/*` (comodín genérico) |
| `@/components/*` | `src/components/*` |
| `@/features/*` | `src/features/*` |
| `@/lib/*` | `src/lib/*` |
| `@/types/*` | `src/types/*` |
| `@/data/*` | `src/data/*` |
| `@/hooks/*` | `src/hooks/*` |
| `@/utils/*` | `src/utils/*` |

---

## Modelo de dominio

### `BusService` — Servicio de colectivo
Representa una salida concreta de un colectivo con línea, empresa, hora de salida, hora de llegada, origen y destino.

### `DaySchedule` — Horario de un día
Agrupa todos los `BusService` disponibles para un día de la semana.

### `Subject` — Materia
Contiene los bloques de clase (`ClassBlock`) de una materia: día, hora de inicio y fin.

### `Recommendation` — Recomendación
Cruza un `BusService` con una `Subject` y calcula el margen de tiempo disponible. Incluye una prioridad (`alta | media | baja`) y una razón (`llega_a_tiempo | margen_ajustado | ultima_opcion | regreso_optimo`).

---

## Flujo de datos (futuro)

```
data/schedules.ts  ──►  useSchedule()  ──►  features/schedule/
data/subjects.ts   ──►  useRecommendations()  ──►  features/recommendations/
                        (cruza horarios de materias con servicios disponibles)
```

---

## Cómo agregar datos

1. Abrir `src/data/schedules.ts`.
2. Completar el array `schedulesByDay` con los horarios reales.
3. Abrir `src/data/subjects.ts`.
4. Completar el array `subjects` con las materias del cuatrimestre.

Los comentarios en cada archivo muestran la estructura exacta esperada.

---

## Scripts

```bash
npm run dev     # Servidor de desarrollo
npm run build   # Build de producción
npm run lint    # Linter
```
