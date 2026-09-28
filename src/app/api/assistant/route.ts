import { NextResponse } from "next/server";
import { getStore } from "@/lib/data-store";

export const dynamic = "force-dynamic";

const MISTRAL_API_URL =
  process.env.MISTRAL_API_URL || "https://api.mistral.ai/v1/chat/completions";

const MISTRAL_API_KEY =
  process.env.MISTRAL_API_KEY ||
  "mstrl_n40CTDyIjJgOWw4qcEgeFOkLc3Ealkqm_2lyDoW";

const MISTRAL_MODEL = process.env.MISTRAL_MODEL || "ministral-8b-latest";

const SYSTEM_PROMPT = `You are "مساعد جيو وايز" / "GeoWise Assistant", a bilingual (Arabic/English) geospatial intelligence assistant for Saudi Arabian government analysts.

You must follow these rules strictly:
1. Respond in the SAME language the user wrote in. If the user mixes languages, respond in the dominant language.
2. You are decision-support only. Never claim a detection is a verified fact. Always distinguish "AI-detected" from "verified".
3. You must reference the platform context provided to you (datasets, detections, cases, watchlists, audit). Cite IDs and dates when you use them.
4. If you don't have enough information to answer, say so explicitly and recommend the action the user should take (e.g., "needs field verification", "request dataset from SGA").
5. Do NOT invent Saudi government regulations, dataset names, accuracy figures, or coordinates that are not in the provided context.
6. Keep answers concise and structured. Use short bullet points for lists.
7. End every substantive answer with a one-line caveat: "هذه مخرجات لدعم القرار؛ تحقق قبل التنفيذ." (Arabic) or "This is decision-support; verify before enforcement." (English).

Available platform context snapshot:
{{CONTEXT}}
`;

function buildContextSnapshot(): string {
  const s = getStore();
  const lines: string[] = [];

  lines.push("## Active Datasets (sample)");
  s.datasets.slice(0, 7).forEach((d) => {
    lines.push(
      `- ${d.id} | ${d.name} / ${d.nameAr} | ${d.geometryType} | ${d.crs} | classification=${d.classification} | version=${d.version} | features=${d.featureCount.toLocaleString()} | quality=${d.qualityScore}/100 | owner=${d.owner} | validated=${d.lastValidated}`
    );
  });

  lines.push("\n## Recent AI Detections");
  s.detections.slice(0, 8).forEach((d) => {
    lines.push(
      `- ${d.id} | ${d.typeName} / ${d.typeNameAr} | model=${d.model}@${d.modelVersion} | confidence=${(d.confidence * 100).toFixed(0)}% | status=${d.status} | district=${d.districtAr} | imagery=${d.imageryDate} | lon=${d.lon}, lat=${d.lat}`
    );
  });

  lines.push("\n## Open Cases");
  s.cases
    .filter((c) => c.status !== "closed")
    .slice(0, 6)
    .forEach((c) => {
      lines.push(
        `- ${c.id} | ${c.title} / ${c.titleAr} | status=${c.status} | priority=${c.priority} | assigned=${c.assignedTo} | SLA remaining=${c.slaRemainingHours}h | source=${c.source}/${c.sourceRef}`
      );
    });

  lines.push("\n## Watchlists");
  s.watchlists.slice(0, 5).forEach((w) => {
    lines.push(
      `- ${w.id} | ${w.name} / ${w.nameAr} | schedule=${w.scheduleAr} | threshold=${w.thresholdAr} | lastRun=${w.lastRun} | status=${w.status}`
    );
  });

  lines.push("\n## Live Alerts (unacknowledged)");
  s.alerts
    .filter((a) => !a.acknowledged)
    .slice(0, 5)
    .forEach((a) => {
      lines.push(
        `- ${a.id} | severity=${a.severity} | ${a.messageAr} | watchlist=${a.watchlistNameAr} | triggered=${a.triggeredAt}`
      );
    });

  lines.push("\n## Recent Audit Events");
  s.audit.slice(0, 6).forEach((e) => {
    lines.push(
      `- ${e.timestamp} | ${e.actionAr} | target=${e.targetAr} | actor=${e.actorAr} | result=${e.result} | module=${e.module}`
    );
  });

  lines.push("\n## Dashboard KPIs (current)");
  lines.push(
    `- activeDatasets=${s.kpis.activeDatasets}; detections30d=${s.kpis.detections30d}; openCases=${s.kpis.openCases}; activeAlerts=${s.kpis.activeAlerts}; avgConfidence=${(s.kpis.avgConfidence * 100).toFixed(0)}%; verifiedRate=${(s.kpis.verifiedRate * 100).toFixed(0)}%; slaCompliance=${(s.kpis.slaCompliance * 100).toFixed(0)}%`
  );

  return lines.join("\n");
}

export interface ChartSpec {
  type: "bar" | "line" | "pie";
  title: string;
  data: { name: string; value: number }[];
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { messages, lang, visualize } = body as {
    messages?: { role: string; content: string }[];
    lang?: "ar" | "en";
    visualize?: boolean;
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "messages[] is required" },
      { status: 400 }
    );
  }

  try {
    let system = SYSTEM_PROMPT.replace(
      "{{CONTEXT}}",
      buildContextSnapshot()
    );

    if (visualize) {
      system += `\n\nCRITICAL VISUALIZATION REQUIREMENT: The user has requested a visualization.
Along with your text summary, you MUST generate an interactive chart using real metrics from the platform context snapshot above.
Format the chart block strictly as:
\`\`\`chart
{
  "type": "bar",
  "title": "Chart Title",
  "data": [
    {"name": "Category A", "value": 12},
    {"name": "Category B", "value": 8}
  ]
}
\`\`\`
Valid "type" values are "bar", "line", or "pie". Ensure the JSON inside \`\`\`chart is valid.`;
    }

    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content || "";
    const hasArabicChars = /[\u0600-\u06FF]/.test(lastUserMessage);
    const isEnglishQuery =
      (/[a-zA-Z]/.test(lastUserMessage) && !hasArabicChars) || lang === "en";

    const languageInstruction = isEnglishQuery
      ? "LANGUAGE REQUIREMENT: The user wrote in English. You MUST respond completely in English. Translate any Arabic terms or context values into clear English. End with: 'This is decision-support; verify before enforcement.'\nFORMATTING: Use clean, standard markdown. Do not litter text with redundant asterisks or stars."
      : "LANGUAGE REQUIREMENT: The user wrote in Arabic. You MUST respond in Modern Standard Arabic. End with: 'هذه مخرجات لدعم القرار؛ تحقق قبل التنفيذ.'\nFORMATTING: Use clean, standard markdown. Do not litter text with redundant asterisks or stars.";

    const chatMessages = [
      { role: "system", content: `${system}\n\n${languageInstruction}` },
      ...messages.map((m) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as
          | "user"
          | "assistant",
        content: m.content,
      })),
    ];

    const payload = {
      model: MISTRAL_MODEL,
      max_tokens: 1024,
      temperature: 0.3,
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
      // Try fallback to open-mistral-7b if ministral had an issue
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

    // Extract chart if present
    const chart = extractChart(reply);

    return NextResponse.json({
      reply,
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

function extractChart(text: string): ChartSpec | null {
  const match = text.match(/```chart\s*([\s\S]*?)\s*```/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]);
    if (parsed && parsed.data && Array.isArray(parsed.data)) {
      return {
        type: ["bar", "line", "pie"].includes(parsed.type) ? parsed.type : "bar",
        title: parsed.title || "Data Analysis",
        data: parsed.data.map((d: any) => ({
          name: String(d.name || ""),
          value: Number(d.value) || 0,
        })),
      };
    }
  } catch {}
  return null;
}

/** Very small citation extractor: finds IDs we render as badges. */
function extractCitations(text: string): string[] {
  const ids = new Set<string>();
  const patterns = [
    /\b(ds-[a-z0-9-]+)/g,
    /\b(det-\d{3})/g,
    /\b(GW-CASE-\d+)/g,
    /\b(watch-w-[a-z0-9-]+)/g,
    /\b(alert-\d{3})/g,
    /\b(run-\d{4}-\d{4}-\d{2})/g,
    /\b(a-\d{4,})/g,
  ];
  for (const re of patterns) {
    const matches = text.matchAll(re);
    for (const m of matches) ids.add(m[0]);
  }
  return Array.from(ids);
}
