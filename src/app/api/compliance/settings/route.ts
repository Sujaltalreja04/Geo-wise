import { NextResponse } from "next/server";
import { getSafeComplianceSettings, updateSafeComplianceSettings } from "@/lib/compliance-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSafeComplianceSettings();
    return NextResponse.json({ settings });
  } catch (error: unknown) {
    console.error("[Settings API] GET error:", error);
    const settings = await getSafeComplianceSettings();
    return NextResponse.json({ settings });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = await updateSafeComplianceSettings(body);
    return NextResponse.json({ settings: updated });
  } catch (error: unknown) {
    console.error("[Settings API] POST error:", error);
    return NextResponse.json({ error: "Could not save settings" }, { status: 500 });
  }
}
