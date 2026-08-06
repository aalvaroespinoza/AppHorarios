# Infraestructura de Supabase

Este documento define la estructura y filosofía de uso de Supabase dentro del ecosistema de LifeOS. 
De acuerdo con la filosofía **Local First**, el cliente nunca lee la base de datos de la nube directamente para renderizar la UI, y la nube solo se usa como backend de sincronización asíncrono y almacenamiento centralizado.

## Estructura de Carpetas (`src/lib/supabase/`)

El código de integración se encuentra aislado en `src/lib/supabase/` y consta de los siguientes archivos:

- **`client.ts`**: Expone el cliente `createClient()` de Supabase exclusivo para Client Components. Mantiene un singleton (una sola instancia compartida en el navegador).
- **`server.ts`**: Expone el cliente `createClient()` preparado específicamente para Server Components, Server Actions o API Routes. Inyecta asíncronamente las `cookies()` de Next.js.
- **`types.ts`**: Define los contratos de TypeScript que envolverán todas las respuestas de Supabase (`SupabaseResponse<T>`) para estandarizar el flujo de datos.
- **`errors.ts`**: Centraliza el mapeo de errores de PostgREST y arroja mensajes limpios e interpretables para la capa de servicios.
- **`helpers.ts`**: Provee abstracciones (como `SupabaseHelpers.fetchAll`) para reducir el boilerplate al mínimo cuando un Server Action necesita hacer un CRUD directo.

## Reglas de Implementación (Local First)

1. **No Autenticación Prematura**: La configuración actual provee los cimientos para conexión a base de datos. La autenticación o middlewares que bloqueen rutas quedan delegados para fases futuras.
2. **Uso Exclusivo en Background**: Los helpers y clientes no deben conectarse a Hooks de React de la UI principal (`SWR` o `React Query`). Todo sincronismo ocurre mediante los Web Workers (Background Sync) comunicándose con las API Routes que implementan estos helpers.
