# Arcana

Arcana es un MVP de herramientas de IA para docentes. Su objetivo es ayudar a revisar, interpretar y preparar materiales educativos con una interfaz simple, responsable y orientada al trabajo cotidiano en el aula.

El proyecto actual contiene una primera herramienta funcional: **Radar IA**, un analizador orientativo de señales estadisticas asociadas al uso de IA en trabajos de alumnos. No emite veredictos de autoria ni reemplaza el criterio docente; entrega señales, explicaciones y recomendaciones para iniciar una revision formativa.

## Estado Del MVP

- Frontend estatico en HTML, CSS y JavaScript.
- Backend ligero con Netlify Functions.
- Integracion con OpenAI desde el backend para no exponer la API key en el navegador.
- Soporte actual para texto pegado, `.txt`, `.md`, `.csv`, PDF con texto seleccionable y DOCX.
- PDF del reporte generado mediante `window.print()` y reglas CSS de impresion.
- OCR para imagenes, audio, video y otros formatos: pendiente de implementar.

## Ejecutar Localmente

Desde esta carpeta:

```bash
python3 -m http.server 4173
```

Despues abre:

```text
http://127.0.0.1:4173
```

Con `python3 -m http.server` se puede ver la interfaz, pero el analisis con IA no funcionara porque `/api/analyze` depende de Netlify Functions.

Para probar el analisis completo, despliega el proyecto en Netlify o usa un flujo local compatible con Netlify Functions. El flujo exacto con Netlify CLI queda pendiente de confirmar para este proyecto.

## Variables De Entorno

En Netlify, configurar:

- `OPENAI_API_KEY`: obligatoria. API key usada por `netlify/functions/analyze.js`.
- `OPENAI_MODEL`: opcional. Si no se define, usa `gpt-4o-mini`.

Si se agrega otra variable de entorno, este README debe actualizarse.

## Subir A Netlify

1. Crear un sitio nuevo en Netlify.
2. Subir esta carpeta o conectar el repositorio.
3. Configurar las variables de entorno indicadas arriba.
4. Hacer deploy.

La ruta publica `/api/analyze` se redirige a `/.netlify/functions/analyze` mediante `netlify.toml`.

## Estructura Actual

```text
.
├── index.html
├── app.js
├── styles.css
├── package.json
├── netlify.toml
├── netlify/
│   └── functions/
│       └── analyze.js
├── public/
│   └── assets/
│       ├── indicador-reference.png
│       ├── ly-current-cutout.png
│       ├── ly-cutout.png
│       └── ly-tablet.png
├── README.md
├── PROJECT_CONTEXT.md
├── ARCHITECTURE.md
├── TOOLS.md
└── CODING_RULES.md
```

## Documentacion Del Proyecto

- `PROJECT_CONTEXT.md`: contexto general y direccion del producto.
- `ARCHITECTURE.md`: arquitectura actual y estructura recomendada para escalar.
- `TOOLS.md`: inventario de herramientas existentes y pendientes visibles.
- `CODING_RULES.md`: reglas para futuras modificaciones.
