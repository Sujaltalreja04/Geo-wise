import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { getStore } from "@/lib/data-store";

export const dynamic = "force-dynamic";

/**
 * GeoWise bilingual AI assistant.
 *
 * The assistant is constrained (per FRD M12):
 *   - It may only reference data the calling user is authorized to see.
 *   - It explains methods and cites sources/dates.
 *   - It never executes arbitrary DB queries; it answers from a structured
 *     context snapshot built server-side.
 *   - It is decision-support only and must say so.
 */
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

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { messages, lang } = body as {
    messages?: { role: string; content: string }[];
    lang?: "ar" | "en";
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "messages[] is required" },
      { status: 400 }
    );
  }

  try {
    const zai = await ZAI.create();
    const system = SYSTEM_PROMPT.replace(
      "{{CONTEXT}}",
      buildContextSnapshot()
    );

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: system },
        ...(lang === "ar"
          ? [
              {
                role: "assistant",
                content:
                  "From now on, respond in Modern Standard Arabic unless the user explicitly writes in English.",
              },
            ]
          : []),
        ...messages.map((m) => ({
          role: (m.role === "assistant" ? "assistant" : "user") as
            | "user"
            | "assistant",
          content: m.content,
        })),
      ],
      thinking: { type: "disabled" },
    });

    const content = completion.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({
      reply: content,
      sources: extractCitations(content),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Assistant unavailable", detail: message },
      { status: 502 }
    );
  }
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
