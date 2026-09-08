# Agregar una clase a Calendario

Desde el cursado del día en Inicio o Viajes, tocar una materia abre su detalle con **Descargar evento (.ics)**. Se muestra la fecha concreta: hoy si coincide el día seleccionado, o su próxima ocurrencia, calculada en Córdoba. La exportación incluye únicamente ese bloque, con nombre, horario y aula/edificio conocidos; no contiene recurrencia ni suscripción.

El botón envía un formulario directo a `POST /api/calendar/class`, que entrega el archivo como descarga (`Content-Disposition: attachment`). Los datos se envían en el cuerpo, no en la URL; no se persisten ni se consultan Supabase o Gemini. La respuesta usa `private, no-store`. Esta ruta requiere conexión.

El evento usa horarios de Córdoba (UTC-03:00) convertidos a UTC, valida fechas y horas, escapa texto y pliega líneas UTF-8 según iCalendar. Si faltan horarios válidos no se ofrece exportar. El catálogo semanal de Aulas no exporta un bloque arbitrario sin contexto de día.

En iPhone, abrir el archivo descargado desde Archivos o enviarlo por Mail permite importarlo en Calendario. LifeOS no puede confirmar que se guardó el evento ni evitar que el usuario lo importe varias veces. El UID permanece estable para la misma materia, fecha y hora.

Verificación: pruebas unitarias de fechas (incluido cambio de año y medianoche argentina), UTC, bloque nocturno, ausencia de recurrencia, texto especial, límites de líneas y datos inválidos; pruebas HTTP del formulario. La confirmación nativa en Calendario requiere una prueba en un iPhone real.
