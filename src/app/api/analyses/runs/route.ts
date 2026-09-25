import { NextResponse } from "next/server";
import { createAnalysisRun } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { analysisId, params } = body as {
    analysisId?: string;
    params?: Record<string, unknown>;
  };

  if (!analysisId)
    return NextResponse.json({ error: "analysisId required" }, { status: 400 });

  const run = createAnalysisRun(analysisId, params ?? {});
  if (!run)
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });

  return NextResponse.json({ run });
}
