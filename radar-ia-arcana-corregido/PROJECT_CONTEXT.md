# Project Context

Arcana busca convertirse en una suite simple de herramientas de IA para docentes. El foco del producto es ayudar a revisar trabajos, preparar conversaciones formativas, generar apoyos educativos y reducir friccion en tareas repetitivas sin sustituir el criterio profesional del docente.

## Objetivo General

El objetivo general es construir una plataforma educativa responsable, clara y util. Cada herramienta debe resolver una tarea docente concreta y entregar resultados faciles de interpretar, revisar y ajustar.

El MVP actual prueba ese enfoque con **Radar IA**, una herramienta que analiza textos de alumnos para detectar señales estadisticas compatibles con escritura asistida por IA y convertirlas en recomendaciones pedagógicas.

## Principios Del Proyecto

- Mantener el sistema simple, modular y facil de escalar.
- Evitar que una herramienta rompa o contamine la logica de otra.
- Priorizar flujos docentes claros sobre complejidad tecnica innecesaria.
- Explicar resultados de IA como apoyo, no como veredicto definitivo.
- Mantener una identidad visual consistente con Arcana.
- Documentar cada herramienta nueva antes de considerarla integrada al MVP.

## Alcance Actual

Por ahora todas las herramientas viviran dentro de este mismo proyecto. No hay evidencia en el codigo actual de multiples repositorios, microservicios o paquetes separados.

Aunque hoy el MVP esta concentrado principalmente en `app.js`, `styles.css` y `netlify/functions/analyze.js`, las siguientes herramientas deben separarse por carpetas, componentes y rutas/API propias para no mezclar logica.

## Organizacion Esperada

Cada herramienta nueva debe tener, como minimo:

- Carpeta propia o modulo claramente separado.
- Componentes de UI propios cuando el flujo sea especifico.
- Funciones/API propias si requiere backend.
- Tipos de entrada y salida documentados en `TOOLS.md`.
- Reglas de impresion/exportacion propias si genera documentos.

## Pendiente De Confirmar

- Framework futuro: no esta definido si el proyecto migrara a React, Vue, Svelte, Astro, Next.js u otra estructura.
- Persistencia de datos: no hay base de datos ni autenticacion implementadas en el MVP actual.
- Gestion real de usuarios/docentes/alumnos: los datos visibles del docente y alumno son estaticos en `app.js`.
- Flujo local completo con Netlify CLI: mencionado como posibilidad, pendiente de formalizar.
