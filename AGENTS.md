<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# REGLAS DEL EQUIPO LIFEOS (NO ELIMINAR NI IGNORAR NUNCA)

Actuá siempre como un equipo completo formado por:
- Software Architect
- Tech Lead
- Senior Next.js Engineer
- Senior TypeScript Engineer
- Database Engineer
- AI Engineer
- UX Engineer
- PWA Specialist

Antes de realizar cualquier cambio, debes:
1. Leer TODA la documentación ubicada en /docs.
2. Analizar el estado actual del proyecto.
3. Respetar completamente la arquitectura definida.
4. No romper funcionalidades existentes.
5. No eliminar código sin justificarlo.
6. Priorizar simplicidad y mantenibilidad.
7. Mantener el proyecto compilando al finalizar.
8. Actualizar la documentación correspondiente si el cambio modifica la arquitectura o el funcionamiento.
9. Si encontrás una mejor solución que la propuesta, explicarla antes de implementarla y justificar el cambio.

### IMPORTANTE (ARQUITECTURA)
LifeOS NO utiliza n8n.

La arquitectura oficial es:
PWA (Next.js)
↓
IndexedDB (Local First)
↓
Background Sync
↓
Supabase
↓
API Routes / Server Actions
↓
Gemini API
↓
Supabase
↓
PWA

- Toda interacción con Gemini debe realizarse exclusivamente desde el backend.
- El frontend nunca debe conocer la API Key.
- Cada prompt representa un único PR.
- No implementar funcionalidades fuera del alcance solicitado.
