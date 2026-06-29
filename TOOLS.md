# Tools

Este archivo documenta las herramientas de Arcana. No se deben agregar herramientas nuevas sin actualizar esta lista.

## Radar IA

**Estado:** MVP

**Objetivo:**  
Analizar trabajos de alumnos para detectar señales estadisticas asociadas al uso de IA y ofrecer una lectura responsable para docentes. El resultado debe servir como punto de partida para revisar, conversar y pedir evidencia del proceso, no como prueba definitiva.

**Inputs Del Usuario:**

- Texto pegado en el textarea.
- Archivo `.txt`, `.md` o `.csv`.
- PDF con texto seleccionable.
- DOCX.

**Output Esperado:**

- Porcentaje de presencia de patrones asociados al uso de IA.
- Nivel textual del resultado.
- Descripcion del analisis.
- Confianza del analisis.
- Riesgo de falso positivo.
- Resumen de Ly.
- Recomendacion de Ly.
- Cinco señales detectadas.
- Cinco recomendaciones para el docente.
- Reporte imprimible/exportable como PDF desde el navegador.

**Archivos Principales Relacionados:**

- `index.html`
- `app.js`
- `styles.css`
- `netlify/functions/analyze.js`
- `netlify.toml`
- `public/assets/ly-current-cutout.png`

**Notas:**

- El frontend tiene validacion defensiva para limpiar recomendaciones contaminadas con artefactos tecnicos.
- El backend tambien filtra recomendaciones antes de responder.
- El PDF se genera por impresion del navegador, no por un servicio de backend.
- PDF escaneado e imagenes requieren OCR y estan pendientes.

## Preparar Conversacion Con El Alumno

**Estado:** En progreso

**Objetivo:**  
Mostrar preguntas guia para tener una conversacion formativa con el alumno despues del analisis.

**Inputs Del Usuario:**

- Click en el boton `Preparar conversacion con el alumno`.

**Output Esperado:**

- Modal con preguntas sugeridas para revisar proceso, fuentes, borradores y decisiones del texto.

**Archivos Principales Relacionados:**

- `app.js`
- `styles.css`

**Notas:**

- Es parte del flujo de Radar IA.
- No llama al backend.
- No genera contenido dinamico con IA en el estado actual.

## Herramientas Visibles En Navegacion Pero No Implementadas

Estas entradas aparecen como opciones de navegacion en `app.js`, pero no tienen flujo funcional confirmado en el codigo actual. Se documentan como pendientes para evitar confundir UI visible con herramienta terminada.

### Examenes Y Rubricas

**Estado:** Pendiente

**Objetivo:** Pendiente de confirmar.

**Inputs Del Usuario:** Pendiente de confirmar.

**Output Esperado:** Pendiente de confirmar.

**Archivos Principales Relacionados:**

- `app.js` (solo etiqueta de navegacion)

### Biblioteca De Prompts

**Estado:** Pendiente

**Objetivo:** Pendiente de confirmar.

**Inputs Del Usuario:** Pendiente de confirmar.

**Output Esperado:** Pendiente de confirmar.

**Archivos Principales Relacionados:**

- `app.js` (solo etiqueta de navegacion)

### Comentarios Para Boletas

**Estado:** Pendiente

**Objetivo:** Pendiente de confirmar.

**Inputs Del Usuario:** Pendiente de confirmar.

**Output Esperado:** Pendiente de confirmar.

**Archivos Principales Relacionados:**

- `app.js` (solo etiqueta de navegacion)

### Historial, Favoritos, Guia De Uso Etico Y Configuracion

**Estado:** Pendiente

**Objetivo:** Pendiente de confirmar.

**Inputs Del Usuario:** Pendiente de confirmar.

**Output Esperado:** Pendiente de confirmar.

**Archivos Principales Relacionados:**

- `app.js` (solo etiquetas de navegacion)
