# LifeOS minimalista y agenda diaria

Vigente desde el 23/09/2026. Reemplaza la estética descrita en LIFEOS_GLASS.md.

- Viajes mantiene siempre **ida → tu cursado → vuelta**, aunque cambie la hora o no haya un viaje sugerido. La vuelta se puede desplegar en su posición habitual.
- La navegación principal es **Viajes, Agenda y Aulas**. Los horarios completos conservan su ruta `/horarios`, accesible desde Viajes, y el día seleccionado se comparte entre pantallas.
- `/agenda` presenta todos los bloques del día ordenados por inicio, el rango del cursado, aulas, detalle de cada clase y exportación individual de calendario. Usa las materias locales existentes; no incorpora eventos externos ni un nuevo sistema de almacenamiento.
- El selector incluye lunes a domingo. “Hoy” corresponde al día de Córdoba, incluido el domingo. Los escenarios de Arquitectura y permanencia en Córdoba siguen disponibles.
- Paleta azul cobalto sobre gris frío en claro y azul noche en oscuro. Superficies opacas, bordes discretos, tipografía del sistema, sin gradientes ni halos. Se conservan los nombres CSS compartidos `glass-*` por compatibilidad, pero ya no aplican vidrio.
- Selección de día y navegación usan un resorte breve y pesado, inspirado en el ritmo frame a frame de Hyperframes; agenda, cambios de pantalla y detalles de viajes se asientan con expansión progresiva. Todas respetan movimiento reducido.
- El service worker incorpora Agenda al shell público y renueva la caché de recursos sin borrar IndexedDB ni preferencias.

La arquitectura y los cálculos de transporte se mantienen. La agenda representa la rutina semanal y la exportación usa la próxima ocurrencia del día elegido, igual que Viajes.
