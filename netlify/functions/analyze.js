const JSON_HEADERS = {
  "Content-Type": "application/json",
};

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

  const text = String(body.text || "").trim();
  if (text.length < 120) {
    return json(400, { error: "El texto es muy corto. Pega al menos 120 caracteres para analizar." });
  }

  const clippedText = text.slice(0, 18000);
  const sourceName = String(body.sourceName || "Trabajo del alumno").slice(0, 140);
  const model = process.env.OPENAI_MODEL || "gpt-5.5-mini";

  const requestBody = {
    model,
    input: [
      {
        role: "system",
        content:
          "Eres Radar IA de ARCANA. Analizas señales estadísticas y lingüísticas asociadas a posible escritura asistida por IA en trabajos escolares. No acusas, no emites veredictos, no afirmas que el alumno usó IA. Respondes solo con JSON válido en español.",
      },
      {
        role: "user",
        content: [
          `Fuente: ${sourceName}`,
          "",
          "Analiza este texto como señal orientativa para un docente. Devuelve una puntuación de 0 a 100 de presencia de patrones asociados al uso de IA, no de autoría definitiva.",
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
    max_output_tokens: 1800,
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

    const outputText = extractOutputText(data);
    const analysis = normalizeAnalysis(JSON.parse(outputText));
    return json(200, { analysis });
  } catch (error) {
    return json(500, { error: error.message || "Error inesperado al analizar el texto." });
  }
};

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
