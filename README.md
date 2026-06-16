# Radar IA | ARCANA

Prototipo responsive y funcional de Radar IA con Netlify Function para conectar GPT sin exponer la API key en el navegador.

## Ejecutar

Desde esta carpeta:

```bash
python3 -m http.server 4173
```

Después abre `http://127.0.0.1:4173`.

Con `python3 -m http.server` verás la interfaz, pero el análisis GPT solo funcionará desplegado en Netlify o usando Netlify CLI.

## Subir a Netlify

1. Crea un sitio nuevo en Netlify.
2. Sube esta carpeta o conecta el repo.
3. En Site configuration > Environment variables agrega:
   - `OPENAI_API_KEY`: tu API key de OpenAI.
   - `OPENAI_MODEL`: opcional. Por defecto usa `gpt-5.5-mini`.
4. Deploy.

La ruta `/api/analyze` queda conectada a `netlify/functions/analyze.js`.

## MVP actual

Analiza texto pegado o archivos `.txt`. PDF/DOCX requieren una capa extra de extracción de texto antes de enviarlos a GPT.
