import { NextResponse } from "next/server";
import { getStore } from "@/lib/data-store";
import { MAP_LIVE_ALERTS } from "@/lib/dummy-data";

export const dynamic = "force-dynamic";

const MISTRAL_API_URL =
  process.env.MISTRAL_API_URL || "https://api.mistral.ai/v1/chat/completions";

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

const MISTRAL_MODEL = process.env.MISTRAL_MODEL || "ministral-8b-latest";

const DYNAMIC_SYSTEM_PROMPT = `You are "GeoWise AI" ("مساعد جيو وايز الذكي"), an intelligent, perceptive, and bilingual geospatial intelligence copilot designed for Saudi municipal analytics, the Ministry of Municipalities and Housing (MOMRAH), and regional city operators (أمانة منطقة الرياض).

### CORE GUIDELINES & DYNAMIC BEHAVIOR:
1. **BE DYNAMIC, NATURAL, AND INTELLIGENT**:
   - Use your own analytical and conversational intelligence.
   - NEVER output rigid, repetitive templates or canned text blocks.
   - Listen to what the user actually said and respond directly to their specific prompt.

2. **CONVERSATIONAL ADAPTABILITY**:
   - **Greetings & Casual Questions** (e.g., "hi", "hello", "مرحبا", "سلام", "who are you?", "what can you do?"):
     - Greet the user warmly and concisely.
     - Introduce yourself as GeoWise AI, the municipal geospatial intelligence copilot.
     - Mention you have live access to Riyadh's real-time alerts, satellite AI detections, drone patrols, and weather sensor telemetry.
     - Ask how you can assist them today.
     - NEVER output an unsolicited "Executive Summary" about an unrelated alert when greeted!
   - **Analytical & Spatial Queries** (e.g., asking about Diriyah sinkhole, Airport PM10 dust, Shemaysi flood, KAFD substation, Olaya excavation, or general risk):
     - Provide a direct, sharp, and structured analysis using the live platform telemetry.
     - Reference specific locations, coordinates, severity levels, and sensor readings.
     - Recommend actionable field next steps (e.g., dispatch inspection patrol, deploy UAV drone, coordinate with Civil Defense or DGDA).
     - Conclude substantive analytical advice with a decision-support note:
       - Arabic: "هذه مخرجات لدعم القرار؛ تحقق قبل التنفيذ."
       - English: "This is decision-support; verify before enforcement."

3. **BILINGUAL EXCELLENCE**:
   - Respond in the language used by the user (Arabic or English).
   - Arabic responses should use dignified, modern administrative and geospatial phrasing (العربية الفصحى الإدارية والبلدية).
   - English responses should be professional, crisp, and authoritative.

4. **OPTIONAL DYNAMIC CHARTS**:
   - When the user asks for a chart, visualization, comparison, breakdown, or trend, you may append a strictly valid JSON chart block at the very end of your response:
\`\`\`chart
{
  "type": "bar",
  "title": "Descriptive Chart Title",
  "data": [
    {"name": "Category A", "value": 15},
    {"name": "Category B", "value": 24}
  ]
}
\`\`\`
   - Supported types: "bar", "line", "pie".
   - Do NOT include a chart block for greetings or simple conversational exchanges.

### REAL-TIME PLATFORM KNOWLEDGE BASE:
{{CONTEXT}}
`;

function buildFullContextSnapshot(mapContext?: any): string {
  const s = getStore();
  const lines: string[] = [];

  lines.push("### PLATFORM OPERATIONAL STATUS & KPIS");
  lines.push(
    `- Active Datasets: ${s.kpis.activeDatasets} | 30-Day Detections: ${s.kpis.detections30d} | Open Cases: ${s.kpis.openCases} | Active Alerts: ${s.kpis.activeAlerts}`
  );
  lines.push(
    `- Average AI Model Confidence: ${(s.kpis.avgConfidence * 100).toFixed(0)}% | Human Verification Rate: ${(s.kpis.verifiedRate * 100).toFixed(0)}% | SLA Compliance: ${(s.kpis.slaCompliance * 100).toFixed(0)}%`
  );

  lines.push("\n### 12 LIVE MUNICIPAL HAZARD ALERTS (RIYADH REAL-TIME MAP)");
  MAP_LIVE_ALERTS.forEach((a) => {
    lines.push(
      `- [${a.id}] ${a.title} / "${a.titleAr}" | Severity: ${a.severity.toUpperCase()} | District: ${a.district} (${a.districtAr}) [Lon: ${a.lon}, Lat: ${a.lat}] | Telemetry Time: ${a.time} | AI Confidence: ${(a.confidence * 100).toFixed(0)}%`
    );
    lines.push(`  Description: ${a.description} (${a.descriptionAr})`);
    lines.push(`  Field Action: ${a.recommendation} (${a.recommendationAr})`);
  });

  lines.push("\n### ENVIRONMENTAL & SENSOR NETWORKS");
  lines.push(
    "- Weather Station AP-01 (Riyadh Basin Central Node): Temp 35°C (Heat Index 37°C), Wind 18 km/h NW (gusts 24 km/h), Air Quality Index (AQI) 74 (Moderate), PM2.5: 22 µg/m³, Satellite Sentinel-2 Multispectral link ACTIVE."
  );
  lines.push(
    "- Autonomous UAV Drone Fleet: 3 Active sorties. Unit Alpha-1 (Orbiting Al Malqa/Olaya corridor), Unit Bravo-3 (Thermal FLIR sweep in South Industrial), Unit Delta-2 (Hydrological sensor tracking along Wadi Hanifa basin). 33 24h autonomous detections documented."
  );

  lines.push("\n### RECENT AI SATELLITE DETECTIONS");
  s.detections.slice(0, 8).forEach((d) => {
    lines.push(
      `- [${d.id}] Type: ${d.typeName} (${d.typeNameAr}) | Model: ${d.model}@${d.modelVersion} | Conf: ${(d.confidence * 100).toFixed(0)}% | Status: ${d.status.toUpperCase()} | District: ${d.district} [${d.lon}, ${d.lat}] | Imagery: ${d.imagerySource} (${d.imageryDate})`
    );
  });

  lines.push("\n### OPEN MUNICIPAL CASES (BALADY INTEGRATION)");
  s.cases
    .filter((c) => c.status !== "closed")
    .slice(0, 6)
    .forEach((c) => {
      lines.push(
        `- [${c.id}] Title: "${c.title}" / "${c.titleAr}" | Priority: ${c.priority.toUpperCase()} | Assigned: ${c.assignedTo} | District: ${c.districtAr} | Remaining SLA: ${c.slaRemainingHours}h`
      );
    });

  if (mapContext) {
    lines.push("\n### ACTIVE USER MAP VIEWPORT CONTEXT");
    if (mapContext.selectedAlertId) {
      lines.push(`- The user currently has alert "${mapContext.selectedAlertId}" selected on the map.`);
    }
    if (mapContext.center) {
      lines.push(`- Map center coordinates: [Lon: ${mapContext.center[0]}, Lat: ${mapContext.center[1]}], Zoom: ${mapContext.zoom}`);
    }
  }

  return lines.join("\n");
}

export interface ChartSpec {
  type: "bar" | "line" | "pie";
  title: string;
  data: { name: string; value: number }[];
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { messages, lang, visualize, mapContext } = body as {
    messages?: { role: string; content: string }[];
    lang?: "ar" | "en";
    visualize?: boolean;
    mapContext?: any;
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "messages[] is required" },
      { status: 400 }
    );
  }

  if (!MISTRAL_API_KEY) {
    return NextResponse.json(
      {
        error: "Configuration Error",
        detail:
          "MISTRAL_API_KEY is not defined in the environment. Please configure MISTRAL_API_KEY in .env or .env.local",
      },
      { status: 500 }
    );
  }

  try {
    const contextText = buildFullContextSnapshot(mapContext);
    let system = DYNAMIC_SYSTEM_PROMPT.replace("{{CONTEXT}}", contextText);

    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content || "";
    const hasArabicChars = /[\u0600-\u06FF]/.test(lastUserMessage);
    const isEnglishQuery =
      (/[a-zA-Z]/.test(lastUserMessage) && !hasArabicChars) || lang === "en";

    // Strictly prioritize the explicit site language if specified
    const targetLang = lang === "en" ? "en" : (lang === "ar" ? "ar" : (isEnglishQuery ? "en" : "ar"));

    const languageInstruction =
      targetLang === "en"
        ? `\n\n### CRITICAL MANDATE — STRICT LANGUAGE ENFORCEMENT:
- The user has set the application interface to ENGLISH (site language is currently English).
- You MUST formulate your ENTIRE response in ENGLISH.
- DO NOT use any Arabic sentences, greetings, or headers. Even when citing location names, use their standard English transliterations (e.g. "Historical Diriyah", "Ash Shemaysi", "Al Olaya", "King Khalid International Airport", "South Industrial Zone").
- Conclude substantive analytical advice with: "This is decision-support; verify before enforcement."`
        : `\n\n### CRITICAL MANDATE — STRICT LANGUAGE ENFORCEMENT:
- The user has set the application interface to ARABIC (site language is currently Arabic).
- You MUST formulate your ENTIRE response in high-level administrative ARABIC (العربية الفصحى الإدارية والبلدية).
- DO NOT reply in English.
- Conclude substantive analytical advice with: "هذه مخرجات لدعم القرار؛ تحقق قبل التنفيذ."`;

    system += languageInstruction;

    // Sanitize past messages so an old initial welcome in another language does not mislead the model
    const sanitizedHistory = messages.slice(-8).map((m) => {
      let content = m.content;
      if (m.role === "assistant") {
        if (targetLang === "en" && /مرحباً بك في \*\*مساعد جيو وايز/.test(content)) {
          content = "Welcome to GeoWise AI Copilot. Connected directly to Mistral AI with real-time access to Riyadh's geospatial intelligence.";
        } else if (targetLang === "ar" && /Welcome to \*\*GeoWise AI Copilot/.test(content)) {
          content = "مرحباً بك في مساعد جيو وايز الجيومكاني الذكي. متصل مباشرة بنموذج Mistral AI مع إمكانية الوصول إلى كافة بيانات الرصد الجيومكاني.";
        }
      }
      return {
        role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
        content,
      };
    });

    const chatMessages = [
      {
        role: "system" as const,
        content: system,
      },
      ...sanitizedHistory,
    ];

    const payload = {
      model: MISTRAL_MODEL,
      max_tokens: 1200,
      temperature: 0.45, // Dynamic, natural generation
      messages: chatMessages,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
      Accept: "application/json",
    };

    let reply = "";

    const res = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // Try fallback model if default model is busy or not found
      const fallbackRes = await fetch(MISTRAL_API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ ...payload, model: "open-mistral-7b" }),
      });
      if (!fallbackRes.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Mistral API HTTP ${res.status}: ${errText}`);
      }
      const data = await fallbackRes.json();
      reply = data.choices?.[0]?.message?.content ?? "";
    } else {
      const data = await res.json();
      reply = data.choices?.[0]?.message?.content ?? "";
    }

    // Extract dynamic chart if emitted by Mistral
    let chart = extractChart(reply);

    // Only synthesize a chart if visualization was explicitly requested by query
    const lowerQuery = lastUserMessage.toLowerCase();
    const queryRequestsChart =
      lowerQuery.includes("chart") ||
      lowerQuery.includes("رسم بياني") ||
      lowerQuery.includes("مخطط") ||
      lowerQuery.includes("trend") ||
      lowerQuery.includes("breakdown") ||
      lowerQuery.includes("distribution") ||
      lowerQuery.includes("توزيع") ||
      lowerQuery.includes("إحصاء");

    if (!chart && visualize && queryRequestsChart) {
      chart = synthesizeChartFromQuery(lastUserMessage, isEnglishQuery);
    }

    return NextResponse.json({
      reply: cleanReplyText(reply),
      chart,
      sources: extractCitations(reply),
    });
  } catch (err) {
    console.error("Assistant Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Assistant unavailable", detail: message },
      { status: 502 }
    );
  }
}

function cleanReplyText(text: string): string {
  // Strip out chart code blocks so raw JSON doesn't clutter chat text
  return text.replace(/```chart\s*[\s\S]*?```/g, "").trim();
}

function extractChart(text: string): ChartSpec | null {
  const match =
    text.match(/```chart\s*([\s\S]*?)\s*```/) ||
    text.match(/```json\s*(\{[\s\S]*?"data"\s*:[\s\S]*?\})\s*```/);

  if (!match) return null;

  try {
    const sanitized = match[1]
      .replace(/,\s*([}\]])/g, "$1")
      .trim();

    const parsed = JSON.parse(sanitized);
    if (parsed && parsed.data && Array.isArray(parsed.data) && parsed.data.length > 0) {
      return {
        type: ["bar", "line", "pie"].includes(parsed.type) ? parsed.type : "bar",
        title: parsed.title || "Telemetry Analysis",
        data: parsed.data.map((d: any) => ({
          name: String(d.name || ""),
          value: Number(d.value) || 0,
        })),
      };
    }
  } catch {}
  return null;
}

function synthesizeChartFromQuery(query: string, isEnglish: boolean): ChartSpec {
  const lower = query.toLowerCase();
  const s = getStore();

  if (lower.includes("alert") || lower.includes("تنبيه") || lower.includes("flood") || lower.includes("سيول")) {
    const critical = MAP_LIVE_ALERTS.filter((a) => a.severity === "critical").length;
    const warning = MAP_LIVE_ALERTS.filter((a) => a.severity === "warning").length;
    const info = MAP_LIVE_ALERTS.filter((a) => a.severity === "info").length;
    return {
      type: "bar",
      title: isEnglish ? "Active Alerts by Severity" : "توزيع التنبيهات حسب درجة الخطورة",
      data: [
        { name: isEnglish ? "Critical" : "حرجة", value: critical },
        { name: isEnglish ? "Warning" : "تحذيرية", value: warning },
        { name: isEnglish ? "Info" : "معلوماتية", value: info },
      ],
    };
  }

  return {
    type: "bar",
    title: isEnglish ? "Live Incidents Overview" : "المؤشرات التشغيلية للمنصة",
    data: [
      { name: isEnglish ? "Critical Hazards" : "مخاطر حرجة", value: 4 },
      { name: isEnglish ? "Regulatory Warnings" : "تحذيرات تنظيمية", value: 5 },
      { name: isEnglish ? "Infrastructure Info" : "معلومات بنية", value: 3 },
    ],
  };
}

function extractCitations(text: string): string[] {
  const ids = new Set<string>();
  const patterns = [
    /\b(alert-\d{3})\b/g,
    /\b(det-\d{3})\b/g,
    /\b(GW-CASE-\d+)\b/g,
    /\b(ds-[a-z0-9-]+)\b/g,
    /\b(watch-w-[a-z0-9-]+)\b/g,
  ];
  for (const re of patterns) {
    const matches = text.matchAll(re);
    for (const m of matches) ids.add(m[0]);
  }
  return Array.from(ids);
}
