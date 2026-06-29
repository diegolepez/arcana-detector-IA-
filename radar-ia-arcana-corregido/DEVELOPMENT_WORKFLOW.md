# Development Workflow

Este archivo guarda el flujo recomendado para desarrollar nuevas herramientas dentro del MVP de Arcana.

## Fuente Oficial

El repo oficial del proyecto es:

```text
diegolepez/arcana-detector-IA-
```

Netlify despliega automaticamente desde la rama:

```text
main
```

La URL publica actual es:

```text
https://radar-ia-arcana.netlify.app
```

## Flujo Para Una Nueva Herramienta

1. Recibir la idea de la herramienta.
2. Revisar referencias visuales, capturas o mockups que entregue el usuario.
3. Definir objetivo, inputs y output esperado.
4. Revisar `PROJECT_CONTEXT.md`, `ARCHITECTURE.md`, `TOOLS.md` y `CODING_RULES.md`.
5. Revisar el flujo completo de herramientas existentes para no romper Radar IA.
6. Diseñar la herramienta dentro del estilo visual de Arcana.
7. Crear la pantalla o componentes necesarios en el frontend.
8. Separar la logica nueva para no mezclarla innecesariamente con Radar IA.
9. Si usa IA, crear una nueva funcion en `netlify/functions/`.
10. Crear un prompt especifico para esa herramienta.
11. Conectar una nueva ruta en `netlify.toml`.
12. Usar la misma variable `OPENAI_API_KEY` de Netlify, salvo que el usuario pida otra separacion.
13. Normalizar y validar la respuesta del modelo antes de mostrarla.
14. Agregar defensas contra contenido tecnico, logs o artefactos ajenos al resultado.
15. Si genera PDF, probar tambien el modo impresion.
16. Actualizar `TOOLS.md` con la nueva herramienta.
17. Actualizar `ARCHITECTURE.md` si cambia la estructura o se agregan rutas.
18. Actualizar `README.md` si se agregan variables de entorno o pasos de ejecucion.
19. Ejecutar validaciones de sintaxis y pruebas manuales razonables.
20. Subir los cambios al repo de GitHub.
21. Esperar el deploy automatico de Netlify.
22. Probar la herramienta en la URL publica.

## Regla De API

No hace falta crear una API key nueva para cada herramienta.

Todas las herramientas pueden usar:

```text
OPENAI_API_KEY
```

La diferencia entre herramientas debe estar en:

- su prompt,
- su funcion de Netlify,
- sus inputs,
- su output,
- su UI,
- y su documentacion.

## Estructura Recomendada Para Herramientas

Mientras el proyecto siga siendo un MVP sin framework, mantener una separacion clara:

```text
netlify/functions/
  analyze.js
  generate-rubric.js
  report-comments.js

tools/
  radar-ia/
  rubricas/
  comentarios-boletas/
```

Si todavia no existe una carpeta `tools/`, crearla cuando haya una segunda herramienta real o cuando el crecimiento del archivo `app.js` lo haga necesario.

## Checklist Antes De Commit

- La herramienta existente Radar IA sigue funcionando.
- No se subio ninguna API key ni secreto.
- La UI se ve consistente con Arcana.
- Los textos no se cortan ni se enciman.
- La respuesta de IA esta normalizada.
- `TOOLS.md` esta actualizado.
- `ARCHITECTURE.md` esta actualizado si aplica.
- `README.md` esta actualizado si aplica.
- El cambio esta listo para GitHub y Netlify.

## Como Cerrar El Trabajo

Cuando la herramienta este lista:

1. Commit en GitHub.
2. Verificar deploy en Netlify.
3. Probar la URL publica.
4. Confirmar al usuario que quedo disponible.

Si el agente no tiene credenciales para hacer push, debe entregar los archivos y guiar al usuario para hacer commit desde GitHub web.
