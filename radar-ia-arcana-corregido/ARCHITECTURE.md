# Architecture

## Arquitectura Actual

Arcana funciona actualmente como una aplicacion estatica con una funcion serverless en Netlify.

```text
Navegador
  ├─ index.html
  ├─ styles.css
  └─ app.js
       │
       └─ POST /api/analyze
             │
             └─ netlify/functions/analyze.js
                   ├─ Extrae texto de entradas soportadas
                   ├─ Llama a OpenAI Responses API
                   ├─ Normaliza la respuesta
                   └─ Devuelve JSON al frontend
```

## Frontend

El frontend vive en:

- `index.html`: punto de entrada estatico.
- `app.js`: estado de la aplicacion, render de UI, eventos, normalizacion defensiva y flujo de Radar IA.
- `styles.css`: estilos responsive, tema claro/oscuro y reglas de impresion.
- `public/assets/`: imagenes de Ly y recursos visuales.

El render actual no usa framework. La UI se construye con funciones que devuelven strings HTML y se monta en `#app`.

Componentes principales actuales en `app.js`:

- `UploadCard`
- `ResultCard`
- `LySummaryCard`
- `DetectedSignalsCard`
- `TeacherRecommendationsCard`
- `AnalysisInfoCard`
- `MobileRadarWizard`

## Backend / API Routes

El backend actual vive en:

- `netlify/functions/analyze.js`

La ruta publica se configura en:

- `netlify.toml`

```toml
[[redirects]]
  from = "/api/analyze"
  to = "/.netlify/functions/analyze"
  status = 200
```

`analyze.js` acepta solicitudes `POST`, valida entrada, extrae texto y llama al modelo de IA. Tambien filtra artefactos tecnicos en recomendaciones antes de devolver el analisis al frontend.

## Entradas Soportadas

Frontend:

- Texto pegado.
- Archivos de texto: `.txt`, `.md`, `.csv`.
- PDF y DOCX enviados como base64.

Backend:

- PDF con texto seleccionable mediante `pdf-parse`.
- DOCX mediante `mammoth`.
- `.txt`, `.md`, `.csv` mediante lectura UTF-8 del buffer.

Pendiente:

- OCR para PDF escaneado, JPG y PNG.
- Extraccion de audio/video para MP3/MP4.
- Soporte real para PPT/PPTX aunque aparezcan como formatos visuales en la UI.

## Generacion De PDFs

El reporte PDF no se genera en backend. El frontend llama a:

```js
window.print();
```

La apariencia del reporte se controla con reglas `@media print` en `styles.css`. Cualquier cambio visual en tarjetas, layout o contenido imprimible debe probarse tambien en PDF.

## Llamadas A Modelos De IA

La llamada al modelo vive en `netlify/functions/analyze.js` y usa la API de OpenAI:

- Endpoint: `https://api.openai.com/v1/responses`
- Variable obligatoria: `OPENAI_API_KEY`
- Variable opcional: `OPENAI_MODEL`
- Modelo por defecto: `gpt-4o-mini`

El backend solicita JSON estructurado con `text.format.type = "json_schema"` y despues normaliza el resultado antes de responder.

## Donde Debe Vivir Cada Nueva Herramienta

Mientras el proyecto siga sin framework, cada herramienta nueva deberia separarse de forma explicita. La estructura actual es monolitica, asi que cualquier crecimiento debe evitar seguir agregando todo a `app.js`.

Estructura recomendada:

```text
.
├── index.html
├── package.json
├── netlify.toml
├── public/
│   └── assets/
├── src/
│   ├── app.js
│   ├── styles/
│   │   ├── base.css
│   │   ├── components.css
│   │   └── print.css
│   ├── shared/
│   │   ├── icons.js
│   │   ├── layout.js
│   │   ├── sanitize.js
│   │   └── print.js
│   └── tools/
│       └── radar-ia/
│           ├── index.js
│           ├── components.js
│           ├── state.js
│           ├── normalize.js
│           └── styles.css
└── netlify/
    └── functions/
        └── radar-ia-analyze.js
```

Si se migra a un framework, esta estructura puede adaptarse, pero debe conservar la separacion por herramienta.

## Regla De Escalamiento

Cada nueva herramienta debe tener:

- UI separada.
- Estado propio.
- Normalizadores propios.
- API propia si requiere backend.
- Documentacion en `TOOLS.md`.
- Pruebas manuales o automatizadas del flujo completo.

## Pendiente De Confirmar

- Si Arcana tendra routing real por herramienta o una navegacion de una sola pagina.
- Si se usara bundler/framework.
- Si habra autenticacion, historial, favoritos o biblioteca persistente; hoy aparecen en navegacion pero no tienen flujo implementado.
