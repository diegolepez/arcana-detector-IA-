const state = {
  theme: localStorage.getItem("arcana-theme") || "light",
  mobileStep: 1,
  modal: null,
  selectedFile: null,
  pastedText: "",
  isDragging: false,
  analysisStatus: "ready",
  analysisError: "",
  analysisResult: null,
};

const teacher = {
  name: "María Rodríguez",
  role: "Docente",
  initials: "MR",
};

const student = {
  name: "Juan Pérez",
  subject: "Historia",
  level: "Secundaria",
  type: "Ensayo",
  date: "20 mayo 2025, 10:45 a.m.",
  length: "1,248 palabras",
};

const signals = [
  {
    icon: "spark",
    title: "Frases genéricas o muy comunes",
    description: "Se detectaron expresiones frecuentes en textos generados por IA.",
    level: "Alta",
    tone: "high",
  },
  {
    icon: "align",
    title: "Estructura muy uniforme",
    description: "El texto sigue un patrón muy predecible y poco variado.",
    level: "Media",
    tone: "medium",
  },
  {
    icon: "user",
    title: "Poca voz personal o ejemplos propios",
    description: "El texto carece de experiencias, opiniones o ejemplos personales.",
    level: "Media",
    tone: "medium",
  },
  {
    icon: "route",
    title: "Transiciones demasiado perfectas",
    description: "Las transiciones entre ideas son muy fluidas y poco naturales.",
    level: "Moderada",
    tone: "moderate",
  },
  {
    icon: "braces",
    title: "Ausencia de errores esperables para el nivel",
    description: "El texto no presenta errores típicos del nivel del alumno.",
    level: "Moderada",
    tone: "moderate",
  },
];

const recommendations = [
  "Revisa el contexto y el tipo de trabajo solicitado.",
  "Compara con entregas anteriores del alumno.",
  "Conversa con el alumno sobre su proceso.",
  "Pide evidencia del proceso de investigación o borradores.",
  "Usa tu criterio docente antes de tomar decisiones.",
];

const defaultAnalysis = {
  percentage: 64,
  level: "Patrones moderados asociados al uso de IA",
  severity: "moderados",
  description:
    "El texto presenta patrones comunes en contenido generado o asistido por IA. Este resultado debe tomarse como una señal de revisión, no como una conclusión definitiva.",
  confidence: "Media",
  falsePositiveRisk:
    "La señal debe interpretarse junto con el contexto del documento, la evidencia del proceso y una conversación con el alumno.",
  lySummary:
    "Encontré señales moderadas de escritura asistida por IA, especialmente en la estructura, el tono y la falta de ejemplos personales o detalles específicos del alumno.",
  lyRecommendation:
    "Revisa las señales, conversa con el alumno y solicita evidencia del proceso de elaboración del trabajo.",
  signals,
  recommendations,
};

function currentAnalysis() {
  return state.analysisResult || defaultAnalysis;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

const fallbackRecommendations = [
  "Revisar entregas anteriores para identificar cambios en el estilo de escritura.",
  "Solicitar borradores, fuentes o apuntes que muestren el proceso de elaboración.",
  "Conversar con el alumno sobre las decisiones que tomó al organizar el texto.",
  "Pedir ejemplos personales o conexiones con el trabajo realizado en clase.",
  "Usar el análisis como punto de partida, no como prueba definitiva.",
];

const technicalArtifactPattern =
  /(MONITOR_LOG|beginSneakAssistant|endOfAssistant|computeCodeExecution|monitorEvent|popup_id|sender_return|assistant|begin code|end code|encode|decode|```|<script|function\s*\(|\{|\})/i;
const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const nonSpanishScriptPattern = /[\u0370-\u03ff\u0400-\u04ff]/;

function safePlainText(value, fallback = "", maxLength = 420) {
  const text = String(value || fallback)
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trim()}...` : text;
}

function isCleanRecommendation(item) {
  const text = safePlainText(item, "", 260);
  if (text.length < 18 || text.length > 260) return false;
  if (technicalArtifactPattern.test(text) || uuidPattern.test(text) || nonSpanishScriptPattern.test(text)) return false;
  const letters = text.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || [];
  return letters.length >= Math.max(14, text.length * 0.45);
}

function cleanRecommendationList(items = []) {
  const list = [];
  const add = (item) => {
    const text = safePlainText(item, "", 260).replace(/^[-•\d.)\s]+/, "");
    const key = text.toLowerCase();
    if (isCleanRecommendation(text) && !list.some((existing) => existing.toLowerCase() === key)) {
      list.push(text);
    }
  };
  if (Array.isArray(items)) items.forEach(add);
  fallbackRecommendations.forEach(add);
  return list.slice(0, 5);
}

const iconPaths = {
  home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
  radar: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><path d="m14 10 5-5"/>',
  file: '<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/>',
  book: '<path d="M4 5a3 3 0 0 1 3-3h5v18H7a3 3 0 0 0-3 3z"/><path d="M20 5a3 3 0 0 0-3-3h-5v18h5a3 3 0 0 1 3 3z"/>',
  message: '<path d="M4 4h16v12H8l-4 4z"/><path d="M8 8h8M8 12h5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2 2 9.3l6.9-1z"/>',
  shield: '<path d="M12 2 20 5v6c0 5-3.4 9.2-8 11-4.6-1.8-8-6-8-11V5z"/><path d="m9 12 2 2 4-5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/>',
  calendar: '<path d="M8 2v4M16 2v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/>',
  pencil: '<path d="M18 2 22 6 8 20H4v-4z"/><path d="m15 5 4 4"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 0 1 5 1.5c0 2-2.5 2.1-2.5 4"/><path d="M12 18h.01"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  upload: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 14v6h16v-6"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 15.5A9 9 0 0 1 8.5 4 9 9 0 1 0 20 15.5z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 19h16"/>',
  eye: '<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',
  spark: '<path d="m12 2 2.2 5.8L20 10l-5.8 2.2L12 18l-2.2-5.8L4 10l5.8-2.2z"/>',
  align: '<path d="M4 6h16M4 10h12M4 14h16M4 18h10"/>',
  user: '<circle cx="12" cy="8" r="3"/><path d="M6 21v-2a6 6 0 0 1 12 0v2"/>',
  route: '<path d="M5 5h3a3 3 0 0 1 3 3v8a3 3 0 0 0 3 3h5"/><path d="m16 16 3 3-3 3"/>',
  braces: '<path d="M8 3H6a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2M16 3h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M5 5l14 14M19 5 5 19"/>',
  arrowLeft: '<path d="m15 18-6-6 6-6"/>',
  chat: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8M8 13h5"/>',
  target: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
};

function Icon(name, className = "") {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.spark}</svg>`;
}

function StepBadge(number) {
  return `<span class="step-badge">${number}</span>`;
}

function Logo() {
  return `
    <div class="brand-mark">${Icon("star")}</div>
    <div class="brand-copy">
      <strong>ARCANA</strong>
      <span>Tu copiloto docente con IA</span>
    </div>
  `;
}

function Sidebar() {
  const primary = [
    ["home", "Inicio"],
    ["radar", "Radar IA"],
    ["file", "Exámenes y rúbricas"],
    ["book", "Biblioteca de prompts"],
    ["message", "Comentarios para boletas"],
    ["clock", "Historial"],
    ["star", "Favoritos"],
    ["shield", "Guía de uso ético"],
    ["calendar", "Planeador de clase"],
    ["pencil", "Generador de actividades"],
    ["help", "Banco de preguntas"],
    ["users", "Adaptador por nivel"],
    ["book", "Guía de estudio"],
    ["layers", "Secuencia didáctica"],
    ["chat", "Retroalimentación rápida"],
  ];
  const secondary = [["settings", "Configuración"]];
  const item = ([icon, label]) => `
    <button class="nav-item ${label === "Radar IA" ? "active" : ""}" type="button">
      ${Icon(icon)}
      <span>${label}</span>
    </button>
  `;
  return `
    <aside class="sidebar">
      <div class="brand">${Logo()}</div>
      <div class="sidebar-scroll">
        <nav class="primary-nav" aria-label="Navegación principal">${primary.map(item).join("")}</nav>
      </div>
      ${LyAssistantCard()}
      <nav class="secondary-nav" aria-label="Navegación secundaria">${secondary.map(item).join("")}</nav>
    </aside>
  `;
}

function ThemeToggle(compact = false) {
  const dark = state.theme === "dark";
  return `
    <button class="theme-toggle ${compact ? "compact" : ""}" type="button" data-action="toggle-theme" aria-label="Cambiar tema">
      ${Icon(dark ? "moon" : "sun")}
      ${compact ? "" : `<span>${dark ? "Modo oscuro" : "Modo claro"}</span>${Icon("down", "tiny")}`}
    </button>
  `;
}

function Header() {
  return `
    <header class="topbar">
      <button class="how-button" type="button" data-action="open-how">
        ${Icon("info")}<span>¿Cómo funciona?</span>
      </button>
      ${ThemeToggle()}
      <button class="icon-button" type="button" aria-label="Notificaciones">${Icon("bell")}</button>
      <div class="profile">
        <span class="avatar">${teacher.initials}</span>
        <span class="profile-copy"><strong>${teacher.name}</strong><small>${teacher.role}</small></span>
        ${Icon("down", "tiny")}
      </div>
    </header>
  `;
}

function ToolHeading() {
  return `
    <div class="tool-heading">
      <div class="radar-hero">${Icon("radar")}</div>
      <div>
        <h1>Radar IA</h1>
        <p>Analiza señales estadísticas asociadas al uso de IA en trabajos de tus alumnos. ${Icon("info", "inline-info")}</p>
      </div>
    </div>
  `;
}

function FileFormatIcon(format) {
  const className = format.toLowerCase();
  return `<div class="format-item"><span class="format-icon ${className}">▤</span><small>${format}</small></div>`;
}

function UploadCard(mobile = false) {
  const formats = ["PDF", "DOCX", "TXT"];
  const fileLabel = state.selectedFile ? state.selectedFile.name : "Arrastra el archivo aquí";
  const statusText =
    state.analysisStatus === "running"
      ? "Analizando..."
      : state.analysisStatus === "done"
        ? "Análisis listo"
        : "Analizar trabajo";
  return `
    <section class="card upload-card ${mobile ? "mobile-card" : ""}" aria-labelledby="upload-title">
      <div class="card-title-row">
        ${mobile ? "" : StepBadge(1)}
        <div><h2 id="upload-title">${mobile ? "Sube el trabajo del alumno" : "Sube o arrastra el trabajo del alumno"}</h2>
        <p>Extraemos el contenido del documento y lo analizamos.</p></div>
      </div>
      <div class="dropzone ${state.isDragging ? "dragging" : ""} ${state.selectedFile ? "has-file" : ""}" data-dropzone>
        <div class="upload-orb">${Icon(state.selectedFile ? "check" : "upload")}</div>
        <strong>${fileLabel}</strong>
        <span>${state.selectedFile ? "Archivo preparado para analizar" : "o selecciona uno desde tu dispositivo"}</span>
        <button class="primary-button choose-button" type="button" data-action="choose-file">
          ${state.selectedFile ? "Cambiar archivo" : "Elegir archivo"} ${Icon("down", "tiny")}
        </button>
        <input id="file-input" type="file" hidden />
      </div>
      <label class="paste-field">
        <span>O pega el texto del alumno</span>
        <textarea id="pasted-text" placeholder="Pega aquí el trabajo para analizarlo con GPT...">${escapeHTML(state.pastedText)}</textarea>
      </label>
      <div class="formats">
        <span class="section-label">Formatos compatibles</span>
        <div class="format-list">${formats.map(FileFormatIcon).join("")}</div>
      </div>
      ${
        mobile
          ? LyFloatingHint()
          : `<div class="mini-process">
              <div>${Icon("upload")}<span><b>1.</b> Extraemos<br />el contenido</span></div>
              <div>${Icon("sun")}<span><b>2.</b> Analizamos<br />patrones</span></div>
              <div>${Icon("shield")}<span><b>3.</b> Señal<br />responsable</span></div>
            </div>`
      }
      <p class="microcopy">${Icon("shield")} La precisión depende de la calidad del texto extraído y del documento original.</p>
      ${state.analysisError ? `<p class="analysis-error">${Icon("info")} ${escapeHTML(state.analysisError)}</p>` : ""}
      ${
        mobile
          ? ""
          : `<button class="analyze-button" type="button" data-action="analyze" ${state.analysisStatus === "running" ? "disabled" : ""}>${Icon(state.analysisStatus === "done" ? "check" : "radar")} ${statusText}</button>`
      }
    </section>
  `;
}

function VerticalAIMeter() {
  const analysis = currentAnalysis();
  const markerTop = Math.max(4, Math.min(92, 100 - analysis.percentage));
  return `
    <div class="meter-wrap" aria-label="Medidor: ${analysis.percentage} por ciento, presencia de patrones IA">
      <div class="meter-scale">
        <div class="meter-bar"><span class="meter-marker" style="top:${markerTop}%" title="Resultado: ${analysis.percentage}%"></span></div>
      </div>
      <div class="meter-labels">
        <div class="meter-label high"><strong>100%</strong><span>Alta presencia<br />de patrones IA</span></div>
        <div class="meter-label mid"><strong>50%</strong><span>Presencia moderada<br />de patrones IA</span></div>
        <div class="meter-label low"><strong>0%</strong><span>Baja presencia<br />de patrones IA</span></div>
      </div>
    </div>
  `;
}

function ResultCard(mobile = false) {
  const analysis = currentAnalysis();
  const levelText = escapeHTML(analysis.level).replace("Patrones ", "Patrones <b>").replace(" asociados", "</b> asociados");
  return `
    <section class="card result-card ${mobile ? "mobile-card" : ""} ${state.analysisStatus === "done" ? "result-pulse" : ""}">
      <div class="card-title-row">
        ${mobile ? "" : StepBadge(2)}
        <div><h2>Resultado del análisis</h2>${mobile ? "" : ""}</div>
      </div>
      <div class="result-content">
        <div class="result-copy">
          <div class="score-line"><div class="score-stack"><small>Nivel de señales</small><strong>${analysis.percentage}<span>%</span></strong></div><p>${levelText} ${Icon("info", "inline-info")}</p></div>
          <p class="result-description">${escapeHTML(analysis.description)}</p>
        </div>
        ${VerticalAIMeter()}
        <div class="result-metrics">
          <div><span class="metric-icon">${Icon("shield")}</span><p>Confianza del análisis<strong>${escapeHTML(analysis.confidence)}</strong></p></div>
          <div><p>Interpretación responsable<strong>${escapeHTML(analysis.falsePositiveRisk)}</strong></p>${Icon("info", "inline-info")}</div>
        </div>
      </div>
    </section>
  `;
}

function LyAssistantCard() {
  return `
    <div class="ly-assistant">
      <img src="./public/assets/ly-current-cutout.png" alt="Ly, asistente de IA de Arcana" />
      <div><strong>Ly</strong><span>Tu asistente de IA</span></div>
    </div>
  `;
}

function LyFloatingHint() {
  return `
    <div class="ly-hint">
      <img src="./public/assets/ly-current-cutout.png" alt="" />
      <p><strong>Hola, soy Ly.</strong> Estoy aquí para ayudarte a detectar señales y revisarlas con calma.</p>
    </div>
  `;
}

function LyResponsibleReminder() {
  return `<p class="ly-reminder">${Icon("shield")} El criterio final siempre es del docente.</p>`;
}

function LySummaryCard(mobile = false) {
  const analysis = currentAnalysis();
  return `
    <section class="card ly-summary ${mobile ? "mobile-card" : ""}">
      <div class="card-title-row">
        ${mobile ? "" : StepBadge(3)}
        <div><h2>Resumen de Ly</h2></div>
      </div>
      <img class="ly-summary-avatar" src="./public/assets/ly-current-cutout.png" alt="Ly" />
      <div class="ly-summary-copy">
        <p>${escapeHTML(analysis.lySummary)}</p>
        <strong>Mi recomendación:</strong>
        <p>${escapeHTML(analysis.lyRecommendation)}</p>
      </div>
      ${LyResponsibleReminder()}
      <button class="outline-button" type="button" data-action="open-conversation">${Icon("message")}<span>Preparar conversación<br class="desktop-only" /> con el alumno</span>${Icon("chevron")}</button>
    </section>
  `;
}

function DetectedSignalsCard(mobile = false) {
  const analysis = currentAnalysis();
  return `
    <section class="card signals-card ${mobile ? "mobile-card" : ""}">
      <div class="card-title-row">
        ${mobile ? "" : StepBadge(4)}
        <div><h2>Señales detectadas ${Icon("info", "inline-info")}</h2></div>
      </div>
      <div class="signal-list">
        ${analysis.signals
          .map(
            (signal) => `
              <div class="signal-item">
                <span class="signal-icon ${signal.tone || "medium"}">${Icon(signal.icon || "spark")}</span>
                <div><strong>${escapeHTML(signal.title)}</strong><p>${escapeHTML(signal.description)}</p></div>
                <span class="level ${signal.tone || "medium"}">${escapeHTML(signal.level)}</span>
              </div>
            `,
          )
          .join("")}
      </div>
      <div class="highlight-soon">${Icon("eye")}<span>Vista de resaltados próximamente</span></div>
    </section>
  `;
}

function ResponsibleUseNotice() {
  return `
    <div class="responsible-notice">
      <span>${Icon("shield")}</span>
      <div><strong>Uso responsable</strong><p>Este análisis identifica patrones estadísticos asociados al uso de IA. No constituye prueba definitiva ni debe usarse como único criterio de evaluación.</p></div>
    </div>
  `;
}

function TeacherRecommendationsCard(mobile = false) {
  const analysis = currentAnalysis();
  return `
    <section class="card recommendations-card ${mobile ? "mobile-card" : ""}">
      <div class="card-title-row green-title">
        <span class="recommend-icon">${Icon("user")}</span>
        <div><h2>Recomendaciones para el docente</h2></div>
      </div>
      <div class="recommendation-list">
        ${analysis.recommendations.map((item) => `<p><span>${Icon("check")}</span>${escapeHTML(item)}</p>`).join("")}
      </div>
      ${ResponsibleUseNotice()}
    </section>
  `;
}

function AnalysisInfoCard(mobile = false) {
  const rows = [
    ["user", "Alumno", student.name],
    ["book", "Materia", student.subject],
    ["shield", "Nivel escolar", student.level],
    ["file", "Tipo de trabajo", student.type],
    ["clock", "Fecha del análisis", student.date],
    ["align", "Longitud del texto", student.length],
  ];
  return `
    <section class="card info-card ${mobile ? "mobile-card" : ""}">
      <div class="card-title-row">
        ${Icon("info", "info-heading-icon")}
        <div><h2>Información del análisis</h2></div>
      </div>
      <div class="info-list">
        ${rows.map(([icon, label, value]) => `<div>${Icon(icon)}<span>${label}</span><strong>${value}</strong></div>`).join("")}
      </div>
      <button class="outline-button download-button" type="button" data-action="download">${Icon("download")}<span>Descargar reporte<small>PDF</small></span>${Icon("down")}</button>
    </section>
  `;
}

function BottomBanner() {
  return `
    <div class="bottom-banner">
      <span class="banner-icon">${Icon("shield")}</span>
      <p><strong>Arcana recomienda:</strong> usa esta herramienta como punto de partida para una evaluación justa y formativa.<br /><span>El criterio final siempre es del docente.</span></p>
    </div>
  `;
}

function HowItWorksModal() {
  if (!state.modal) return "";
  const conversation = state.modal === "conversation";
  const chat = state.modal === "chat";
  return `
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button class="modal-close" type="button" data-action="close-modal" aria-label="Cerrar">${Icon("close")}</button>
        <div class="modal-icon">${Icon(conversation || chat ? "chat" : "radar")}</div>
        <h2 id="modal-title">${conversation ? "Conversación formativa" : chat ? "Pregunta a Ly" : "¿Cómo funciona Radar IA?"}</h2>
        ${
          conversation
            ? `<p>Usa estas preguntas para revisar el proceso junto con el alumno:</p>
               <ul><li>¿Cómo organizaste las ideas principales?</li><li>¿Qué fuentes consultaste y por qué?</li><li>¿Puedes mostrarme un borrador o explicar una decisión del texto?</li></ul>
               <p class="modal-note">Escucha el contexto antes de tomar una decisión. El análisis es solo una señal de revisión.</p>`
            : chat
              ? `<p>Hola, soy Ly. Puedo ayudarte a interpretar las señales y a preparar una conversación respetuosa con el alumno.</p>
                 <label class="chat-field"><span>¿Qué quieres revisar?</span><textarea placeholder="Escribe una pregunta para Ly..."></textarea></label>`
              : `<p>Radar IA extrae el contenido del archivo, analiza patrones estadísticos asociados al uso de IA y entrega una señal de revisión para el docente.</p>
                 <ul><li>No presenta conclusiones definitivas.</li><li>No reemplaza el criterio docente.</li><li>Ayuda a iniciar una conversación formativa con el alumno.</li><li>La precisión depende de la calidad del contenido extraído y del contexto.</li></ul>`
        }
        <button class="primary-button modal-primary" type="button" data-action="close-modal">${chat ? "Listo" : "Entendido"}</button>
      </section>
    </div>
  `;
}

function StepIndicator() {
  return `
    <div class="step-indicator">
      <span>Paso ${state.mobileStep} / 6</span>
      <div>${Array.from({ length: 6 }, (_, i) => `<i class="${i + 1 <= state.mobileStep ? "active" : ""}"></i>`).join("")}</div>
    </div>
  `;
}

function MobileHeader() {
  return `
    <header class="mobile-header">
      <button class="mobile-icon" type="button" aria-label="Abrir menú">${Icon("menu")}</button>
      <div class="mobile-brand">${Logo()}</div>
      <div class="mobile-actions">
        ${ThemeToggle(true)}
        <button class="mobile-icon" type="button" aria-label="Notificaciones">${Icon("bell")}</button>
        <span class="avatar">${teacher.initials}</span>
      </div>
    </header>
  `;
}

function MobileBottomNav() {
  return `
    <nav class="mobile-bottom-nav" aria-label="Navegación móvil">
      <button class="active" type="button">${Icon("radar")}<span>Radar IA</span></button>
      <button type="button">${Icon("message")}<span>Comentarios</span></button>
      <button type="button">${Icon("star")}<span>Favoritos</span></button>
      <button type="button">${Icon("menu")}<span>Más</span></button>
    </nav>
  `;
}

function MobileRadarWizard() {
  const steps = [
    () => UploadCard(true),
    () => ResultCard(true),
    () => LySummaryCard(true),
    () => DetectedSignalsCard(true),
    () => TeacherRecommendationsCard(true),
    () => `${AnalysisInfoCard(true)}${BottomBanner()}`,
  ];
  const titles = ["Subir trabajo", "Resultado", "Resumen de Ly", "Señales", "Recomendaciones", "Información"];
  return `
    <div class="mobile-app">
      ${MobileHeader()}
      <main class="mobile-main">
        <div class="mobile-tool-heading">
          <div><span class="radar-mini">${Icon("radar")}</span><div><h1>Radar IA</h1><p>${titles[state.mobileStep - 1]}</p></div></div>
          <button type="button" data-action="open-how">${Icon("info")}</button>
        </div>
        ${StepIndicator()}
        <div class="wizard-panel">${steps[state.mobileStep - 1]()}</div>
        <div class="wizard-actions">
          ${state.mobileStep > 1 ? `<button class="back-button" type="button" data-action="prev-step">${Icon("arrowLeft")} Anterior</button>` : `<span></span>`}
          <button class="primary-button next-button" type="button" data-action="${state.mobileStep === 6 ? "download" : "next-step"}">
            ${state.mobileStep === 6 ? `${Icon("download")} Descargar reporte` : `Siguiente ${Icon("chevron")}`}
          </button>
        </div>
      </main>
      ${MobileBottomNav()}
    </div>
  `;
}

function RadarIAPage() {
  return `
    <div class="desktop-app">
      ${Sidebar()}
      <div class="workspace">
        ${Header()}
        <main class="dashboard">
          ${ToolHeading()}
          <div class="dashboard-grid top-grid">
            ${UploadCard()}
            ${ResultCard()}
            ${LySummaryCard()}
          </div>
          <div class="dashboard-grid bottom-grid">
            ${DetectedSignalsCard()}
            ${TeacherRecommendationsCard()}
            ${AnalysisInfoCard()}
          </div>
          ${BottomBanner()}
        </main>
      </div>
    </div>
    ${MobileRadarWizard()}
    ${HowItWorksModal()}
  `;
}

function render() {
  document.documentElement.dataset.theme = state.theme;
  document.getElementById("app").innerHTML = RadarIAPage();
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll("[data-action]").forEach((element) => {
    element.addEventListener("click", (event) => {
      const action = element.dataset.action;
      if (action === "toggle-theme") {
        state.theme = state.theme === "light" ? "dark" : "light";
        localStorage.setItem("arcana-theme", state.theme);
        render();
      }
      if (action === "open-how") {
        state.modal = "how";
        render();
      }
      if (action === "open-conversation") {
        state.modal = "conversation";
        render();
      }
      if (action === "close-modal" && (event.target === element || element.classList.contains("modal-close") || element.classList.contains("modal-primary"))) {
        state.modal = null;
        render();
      }
      if (action === "choose-file") {
        document.getElementById("file-input")?.click();
      }
      if (action === "next-step") {
        if (state.mobileStep === 1 && !state.analysisResult) {
          runAnalysis();
          return;
        }
        state.mobileStep = Math.min(6, state.mobileStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
        render();
      }
      if (action === "prev-step") {
        state.mobileStep = Math.max(1, state.mobileStep - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
        render();
      }
      if (action === "analyze") {
        runAnalysis();
      }
      if (action === "download") {
        window.print();
      }
    });
  });

  const fileInput = document.getElementById("file-input");
  fileInput?.addEventListener("change", () => {
    if (fileInput.files?.[0]) {
      state.selectedFile = fileInput.files[0];
      render();
    }
  });

  const pastedText = document.getElementById("pasted-text");
  pastedText?.addEventListener("input", () => {
    state.pastedText = pastedText.value;
  });

  document.querySelectorAll("[data-dropzone]").forEach((dropzone) => {
    dropzone.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (!state.isDragging) {
        state.isDragging = true;
        dropzone.classList.add("dragging");
      }
    });
    dropzone.addEventListener("dragleave", () => {
      state.isDragging = false;
      dropzone.classList.remove("dragging");
    });
    dropzone.addEventListener("drop", (event) => {
      event.preventDefault();
      state.isDragging = false;
      const file = event.dataTransfer?.files?.[0];
      if (file) state.selectedFile = file;
      render();
    });
  });

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && state.modal) {
        state.modal = null;
        render();
      }
    },
    { once: true },
  );
}

async function getTextForAnalysis() {
  const pasted = state.pastedText.trim();
  if (pasted) return { text: pasted, sourceName: "Texto pegado" };
  if (!state.selectedFile) {
    throw new Error("Pega el texto del alumno o sube un archivo PDF, DOCX o .txt para analizar.");
  }
  const file = state.selectedFile;
  if (file.size > 4 * 1024 * 1024) {
    throw new Error("Para este MVP usa archivos de máximo 4 MB.");
  }
  const isTextFile = file.type.startsWith("text/") || /\.(txt|md|csv)$/i.test(file.name);
  if (isTextFile) {
    const text = await file.text();
    return { text, sourceName: file.name };
  }
  const isSupportedDocument = /\.(pdf|docx)$/i.test(file.name);
  if (!isSupportedDocument) {
    throw new Error("Por ahora analiza texto pegado, .txt, PDF o DOCX. Otros formatos van en una siguiente mejora.");
  }
  const base64 = await fileToBase64(file);
  return {
    sourceName: file.name,
    file: {
      name: file.name,
      type: file.type || guessMimeType(file.name),
      base64,
    },
  };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",").pop() : result);
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}

function guessMimeType(fileName) {
  if (/\.pdf$/i.test(fileName)) return "application/pdf";
  if (/\.docx$/i.test(fileName)) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/octet-stream";
}

function normalizeAnalysis(result) {
  const merged = { ...defaultAnalysis, ...result };
  merged.percentage = Math.max(0, Math.min(100, Number(merged.percentage) || 0));
  merged.level = safePlainText(merged.level, defaultAnalysis.level, 110);
  merged.severity = safePlainText(merged.severity, defaultAnalysis.severity, 40);
  merged.description = safePlainText(merged.description, defaultAnalysis.description, 520);
  merged.confidence = safePlainText(merged.confidence, defaultAnalysis.confidence, 40);
  merged.falsePositiveRisk = safePlainText(merged.falsePositiveRisk, defaultAnalysis.falsePositiveRisk, 420);
  merged.lySummary = safePlainText(merged.lySummary, defaultAnalysis.lySummary, 420);
  merged.lyRecommendation = safePlainText(merged.lyRecommendation, defaultAnalysis.lyRecommendation, 420);
  merged.signals = Array.isArray(merged.signals) && merged.signals.length ? merged.signals.slice(0, 5) : defaultAnalysis.signals;
  merged.recommendations = cleanRecommendationList(merged.recommendations);
  return merged;
}

async function runAnalysis() {
  state.analysisStatus = "running";
  state.analysisError = "";
  render();
  try {
    const payload = await getTextForAnalysis();
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        metadata: {
          student,
          tool: "Radar IA",
        },
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "No se pudo completar el análisis.");
    }
    state.analysisResult = normalizeAnalysis(data.analysis);
    state.analysisStatus = "done";
    state.mobileStep = Math.max(state.mobileStep, 2);
  } catch (error) {
    state.analysisStatus = "ready";
    state.analysisError = error.message;
  }
  render();
}

render();
