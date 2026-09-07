# LifeOS Glass

La interfaz prioriza una consulta rápida de viajes, horarios y aulas. Sustituye el lenguaje visual industrial por superficies translúcidas, tipografía del sistema y reflejos tenues azul, violeta, cian y rosa.

## Principios

- La información decisiva conserva fondos sólidos y contraste legible.
- Las acciones táctiles tienen una altura mínima cómoda y una respuesta breve.
- El tema claro y oscuro comparten tokens semánticos; los componentes no deben introducir colores fijos para el acento anterior.
- Las animaciones respetan `prefers-reduced-motion` y el vidrio se vuelve opaco cuando el sistema pide menos transparencia o más contraste.

## PWA y datos locales

El manifiesto y los iconos representan la nueva identidad. El service worker conserva el shell público de Viajes, Horarios, Aulas y Configuración para navegar sin conexión tras una visita online. Los datos del usuario permanecen en IndexedDB y no forman parte de Git.

## Restauración segura

El estado anterior al rediseño está marcado con `backup/pre-glass-2026-09-07`. Para revisar o restaurar sin reescribir historial, crear una rama desde la etiqueta y abrir un PR de reversión o seleccionar los archivos necesarios con `git revert`/`git cherry-pick`. No borrar IndexedDB del navegador durante esa operación: sus datos son independientes del repositorio.
