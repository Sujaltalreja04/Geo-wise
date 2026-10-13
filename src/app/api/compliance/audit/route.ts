import { NextResponse } from "next/server";
import { getSafeComplianceAuditTrail } from "@/lib/compliance-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const outcome = searchParams.get("outcome") || undefined;
    const resourceType = searchParams.get("resourceType") || undefined;
    const verifyIntegrity = searchParams.get("verify") === "1";

    const { events, integrityStatus } = await getSafeComplianceAuditTrail({
      search,
      outcome,
      resourceType,
      verify: verifyIntegrity,
    });

    return NextResponse.json({
      events,
      integrityStatus,
    });
  } catch (error: unknown) {
    console.error("[Audit API] GET error:", error);
    const { events, integrityStatus } = await getSafeComplianceAuditTrail({});
    return NextResponse.json({
      events,
      integrityStatus,
    });
  }
}
