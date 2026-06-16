const JSON_HEADERS = {
  "Content-Type": "application/json",
};

const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const SIGNAL_TONES = {
  alta: "high",
  alto: "high",
  media: "medium",
  medio: "medium",
  moderada: "moderate",
  moderado: "moderate",
  baja: "moderate",
  bajo: "moderate",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: JSON_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Método no permitido." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return json(500, { error: "Falta configurar OPENAI_API_KEY en Netlify." });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Solicitud inválida." });
  }

  let text;
  try {
    text = await resolveInputText(body);
  } catch (error) {
    return json(400, { error: error.message });
  }

  if (text.length < 120) {
    return json(400, { error: "El texto es muy corto. Pega al menos 120 caracteres para analizar." });
  }

  const clippedText = text.slice(0, 18000);
  const sourceName = String(body.sourceName || "Trabajo del alumno").slice(0, 140);
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const requestBody = {
    model,
    input: [
      {
        role: "system",
        content: [
          "Eres Radar IA de ARCANA, una herramienta educativa para docentes. Tu tarea es estimar el NIVEL DE SEÑALES lingüísticas compatibles con escritura asistida por IA en trabajos escolares.",
          "No eres un detector forense. No acusas, no emites veredictos, no afirmas que el alumno usó IA, no usas lenguaje disciplinario. Siempre presentas el resultado como señal de revisión y punto de partida para conversar.",
          "Debes ser analítico y sensible: si un texto acumula varias señales de estilo generado/asistido, no lo clasifiques bajo solo porque sea coherente, correcto o factual.",
          "Evalúa señales que AUMENTAN el puntaje: tono enciclopédico o genérico; estructura demasiado ordenada y uniforme; introducción-desarrollo-cierre muy predecible; falta de voz personal, experiencia, postura o ejemplos propios; frases amplias sin detalle concreto; transiciones muy pulidas; baja variación sintáctica; ausencia de errores esperables para el nivel; vocabulario consistentemente neutro y académico; equilibrio artificial entre párrafos; explicaciones correctas pero poco situadas en el contexto del alumno.",
          "Evalúa señales que BAJAN el puntaje: anécdotas personales verificables; detalles específicos del aula, proceso, fuentes o borradores; voz irregular pero auténtica; errores naturales de nivel; opiniones propias; cambios de ritmo; ejemplos concretos no genéricos; referencias locales o decisiones de escritura explicadas.",
          "Calibra el porcentaje así: 0-20 = pocas señales y fuerte voz personal; 21-40 = señales leves o texto mixto con rasgos humanos claros; 41-60 = señales moderadas, varias partes genéricas o uniformes; 61-80 = señales altas, estilo muy pulido/impersonal y poca huella personal; 81-100 = señales muy altas, texto altamente uniforme, genérico, pulido y sin evidencias de proceso personal.",
          "Para textos informativos o históricos, no penalices solo por ser factual; pero si además son impersonales, enciclopédicos, homogéneos y sin voz del estudiante, ubícalos normalmente en rango moderado o alto.",
          "Si no hay suficiente evidencia, baja la confianza y explica el riesgo de falso positivo. Aun con porcentaje alto, recuerda que no constituye prueba definitiva.",
          "Responde exclusivamente con JSON válido que cumpla el esquema. No agregues markdown ni texto fuera del JSON.",
        ].join(" "),
      },
      {
        role: "user",
        content: [
          `Fuente: ${sourceName}`,
          "",
          "Analiza este trabajo como señal orientativa para un docente. Devuelve una puntuación de 0 a 100 de presencia de patrones asociados al uso de IA, no de autoría definitiva.",
          "Primero identifica señales concretas del texto. Después decide el porcentaje usando la rúbrica. Evita porcentajes bajos cuando haya acumulación de tono genérico, uniformidad, falta de voz personal y estilo enciclopédico.",
          "En level usa una frase breve como: 'Patrones bajos asociados al uso de IA', 'Patrones moderados asociados al uso de IA' o 'Patrones altos asociados al uso de IA'.",
          "En lySummary y description explica señales, no culpas. En recommendations sugiere conversar, comparar con entregas previas y pedir evidencia del proceso.",
          "",
          clippedText,
        ].join("\n"),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "radar_ia_analysis",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: [
            "percentage",
            "level",
            "severity",
            "description",
            "confidence",
            "falsePositiveRisk",
            "lySummary",
            "lyRecommendation",
            "signals",
            "recommendations",
          ],
          properties: {
            percentage: { type: "number", minimum: 0, maximum: 100 },
            level: { type: "string" },
            severity: { type: "string" },
            description: { type: "string" },
            confidence: { type: "string" },
            falsePositiveRisk: { type: "string" },
            lySummary: { type: "string" },
            lyRecommendation: { type: "string" },
            signals: {
              type: "array",
              minItems: 5,
              maxItems: 5,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["title", "description", "level", "tone", "icon"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  level: { type: "string" },
                  tone: { type: "string", enum: ["high", "medium", "moderate"] },
                  icon: { type: "string", enum: ["spark", "align", "user", "route", "braces"] },
                },
              },
            },
            recommendations: {
              type: "array",
              minItems: 5,
              maxItems: 5,
              items: { type: "string" },
            },
          },
        },
      },
    },
    max_output_tokens: 3200,
  };

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    if (!response.ok) {
      return json(response.status, { error: data.error?.message || "OpenAI no pudo completar el análisis." });
    }

    const analysis = normalizeAnalysis(parseAnalysisOutput(data));
    return json(200, { analysis });
  } catch (error) {
    return json(500, { error: error.message || "Error inesperado al analizar el texto." });
  }
};

async function resolveInputText(body) {
  const pastedText = String(body.text || "").trim();
  if (pastedText) return pastedText;

  if (!body.file || !body.file.base64) {
    throw new Error("Pega texto o sube un archivo PDF, DOCX o .txt.");
  }

  const fileName = String(body.file.name || "").toLowerCase();
  const buffer = Buffer.from(String(body.file.base64), "base64");

  if (buffer.length > 4 * 1024 * 1024) {
    throw new Error("Para este MVP usa archivos de máximo 4 MB.");
  }

  if (fileName.endsWith(".pdf")) {
    const parsed = await pdfParse(buffer);
    const text = String(parsed.text || "").trim();
    if (!text) {
      throw new Error("No pude extraer texto del PDF. Si es escaneado como imagen, necesitará OCR.");
    }
    return text;
  }

  if (fileName.endsWith(".docx")) {
    const parsed = await mammoth.extractRawText({ buffer });
    const text = String(parsed.value || "").trim();
    if (!text) {
      throw new Error("No pude extraer texto del DOCX.");
    }
    return text;
  }

  if (/\.(txt|md|csv)$/i.test(fileName)) {
    return buffer.toString("utf8").trim();
  }

  throw new Error("Formato no soportado todavía. Usa PDF, DOCX, .txt o texto pegado.");
}

function extractOutputText(data) {
  if (data.output_text) return data.output_text;
  const chunks = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.text) chunks.push(content.text);
    }
  }
  return chunks.join("");
}

function parseAnalysisOutput(data) {
  const outputText = extractOutputText(data).trim();
  if (!outputText) {
    throw new Error("OpenAI no devolvió contenido para analizar.");
  }

  try {
    return JSON.parse(outputText);
  } catch {
    const jsonText = extractBalancedJson(outputText);
    if (jsonText) {
      return JSON.parse(jsonText);
    }
  }

  throw new Error("OpenAI devolvió una respuesta incompleta. Intenta de nuevo o usa un archivo más corto.");
}

function extractBalancedJson(text) {
  const start = text.indexOf("{");
  if (start === -1) return "";

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) {
      return text.slice(start, index + 1);
    }
  }

  return "";
}

function normalizeAnalysis(analysis) {
  const percentage = Math.max(0, Math.min(100, Number(analysis.percentage) || 0));
  return {
    percentage,
    level: safeText(analysis.level, "Patrones asociados al uso de IA"),
    severity: safeText(analysis.severity, "moderados"),
    description: safeText(
      analysis.description,
      "Este resultado debe tomarse como una señal de revisión, no como una conclusión definitiva.",
    ),
    confidence: safeText(analysis.confidence, "Media"),
    falsePositiveRisk: safeText(analysis.falsePositiveRisk, "Posible"),
    lySummary: safeText(analysis.lySummary, "Encontré señales que vale la pena revisar con calma."),
    lyRecommendation: safeText(
      analysis.lyRecommendation,
      "Conversa con el alumno y solicita evidencia del proceso antes de tomar una decisión.",
    ),
    signals: normalizeSignals(analysis.signals),
    recommendations: normalizeList(analysis.recommendations),
  };
}

function normalizeSignals(signals = []) {
  const fallbackIcons = ["spark", "align", "user", "route", "braces"];
  return signals.slice(0, 5).map((signal, index) => ({
    title: safeText(signal.title, "Señal detectada"),
    description: safeText(signal.description, "Se encontró un patrón que conviene revisar."),
    level: safeText(signal.level, "Media"),
    tone: ["high", "medium", "moderate"].includes(signal.tone) ? signal.tone : SIGNAL_TONES[String(signal.level || "").toLowerCase()] || "medium",
    icon: ["spark", "align", "user", "route", "braces"].includes(signal.icon) ? signal.icon : fallbackIcons[index] || "spark",
  }));
}

function normalizeList(items = []) {
  const list = items.map((item) => safeText(item, "")).filter(Boolean).slice(0, 5);
  while (list.length < 5) {
    list.push("Usa este análisis como punto de partida para una conversación formativa.");
  }
  return list;
}

function safeText(value, fallback) {
  return String(value || fallback).replace(/\s+/g, " ").trim();
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  };
}
