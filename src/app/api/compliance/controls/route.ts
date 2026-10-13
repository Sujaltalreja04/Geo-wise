import { NextResponse } from "next/server";
import { getSafeComplianceControls, saveSafeComplianceControl } from "@/lib/compliance-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const frameworkId = searchParams.get("frameworkId") || undefined;
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || undefined;
    const riskRating = searchParams.get("riskRating") || undefined;

    const controls = await getSafeComplianceControls({
      search,
      frameworkId,
      category,
      status,
      riskRating,
    });
    return NextResponse.json({ controls });
  } catch (error: unknown) {
    console.error("[Controls API] GET error:", error);
    const controls = await getSafeComplianceControls({});
    return NextResponse.json({ controls });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.id || !body.frameworkId || !body.title) {
      return NextResponse.json({ error: "Missing required control parameters." }, { status: 400 });
    }
    const saved = await saveSafeComplianceControl(body);
    return NextResponse.json({ control: saved });
  } catch (error: unknown) {
    console.error("[Controls API] POST error:", error);
    return NextResponse.json({ error: "Could not save control" }, { status: 500 });
  }
}
