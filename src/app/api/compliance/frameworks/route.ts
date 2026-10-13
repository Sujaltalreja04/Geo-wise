import { NextResponse } from "next/server";
import { getSafeComplianceFrameworks, saveSafeComplianceFramework } from "@/lib/compliance-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const applicability = searchParams.get("applicability") || undefined;
    const status = searchParams.get("status") || undefined;

    const frameworks = await getSafeComplianceFrameworks({ search, applicability, status });
    return NextResponse.json({ frameworks });
  } catch (error: unknown) {
    console.error("[Frameworks API] GET error:", error);
    const frameworks = await getSafeComplianceFrameworks({});
    return NextResponse.json({ frameworks });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.id || !body.name) {
      return NextResponse.json({ error: "Missing required framework fields." }, { status: 400 });
    }
    const updated = await saveSafeComplianceFramework(body);
    return NextResponse.json({ framework: updated });
  } catch (error: unknown) {
    console.error("[Frameworks API] POST error:", error);
    return NextResponse.json({ error: "Could not save framework" }, { status: 500 });
  }
}
