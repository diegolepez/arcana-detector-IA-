# Coding Rules

Estas reglas guian futuras modificaciones de Arcana.

## Reglas Generales

- No romper herramientas existentes.
- Antes de modificar una herramienta, revisar su flujo completo: entrada, estado, UI, llamada al backend, normalizacion, salida y PDF si aplica.
- Mantener componentes reutilizables cuando haya patrones compartidos.
- No duplicar logica si puede abstraerse sin complicar el MVP.
- Mantener el diseño consistente con Arcana: claro, docente, responsable y facil de leer.
- No presentar resultados de IA como veredictos definitivos.
- Documentar cualquier herramienta nueva en `TOOLS.md`.
- Si se agrega una variable de entorno, actualizar `README.md`.
- Si se cambia la estructura del proyecto, actualizar `ARCHITECTURE.md`.
- Si se cambia el comportamiento de una herramienta, actualizar su entrada en `TOOLS.md`.

## Reglas Para Herramientas

- Cada herramienta debe tener una responsabilidad clara.
- Cada herramienta debe poder explicarse por:
  - Objetivo.
  - Inputs.
  - Output esperado.
  - Archivos relacionados.
  - Estado.
- Las herramientas nuevas deben vivir separadas por carpetas/componentes cuando el proyecto lo permita.
- No mezclar prompts, normalizadores, estilos especificos o API routes de herramientas distintas.

## Reglas Para Frontend

- Mantener la UI responsive.
- Probar desktop, mobile y modo impresion cuando el cambio afecte tarjetas o reportes.
- Escapar texto de usuario o texto generado por IA antes de renderizarlo.
- Mantener defensas contra contenido tecnico o contaminado proveniente del modelo.
- Evitar textos que se corten, se encimen o rompan tarjetas.
- Si un boton aparece en la UI, debe tener flujo implementado o quedar claramente marcado como pendiente.

## Reglas Para Backend Y Modelos De IA

- No exponer `OPENAI_API_KEY` en el frontend.
- Todas las llamadas a modelos deben pasar por backend/API route.
- Validar tamano y tipo de entrada antes de procesar archivos.
- Normalizar la salida del modelo antes de enviarla al frontend.
- Filtrar artefactos tecnicos, logs, UUIDs o contenido ajeno al analisis pedagogico.
- Mantener prompts con lenguaje responsable: señales, no acusaciones.

## Reglas Para PDFs

- El PDF actual depende de `window.print()` y `@media print`.
- Cualquier cambio en layout de reporte debe probarse exportando o renderizando PDF.
- Evitar tarjetas cortadas, textos comprimidos y paginas en blanco.
- No asumir que un layout correcto en pantalla se vera correcto en PDF.

## Antes De Cerrar Un Cambio

- Revisar que la herramienta afectada sigue funcionando completa.
- Revisar que no se introdujeron regresiones visuales obvias.
- Ejecutar al menos chequeos de sintaxis cuando aplique.
- Actualizar documentacion relacionada.
- Si algo no esta claro, dejarlo como `pendiente de confirmar` en lugar de inventar comportamiento.
