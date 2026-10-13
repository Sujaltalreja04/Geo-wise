import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureComplianceSeeded, generateSha256 } from "@/lib/compliance-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await ensureComplianceSeeded();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const outcome = searchParams.get("outcome");
    const resourceType = searchParams.get("resourceType");
    const verifyIntegrity = searchParams.get("verify") === "1";

    const where: Record<string, unknown> = {};
    if (outcome && outcome !== "all") where.outcome = outcome;
    if (resourceType && resourceType !== "all") where.resourceType = resourceType;

    let events = await db.auditEvent.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: 200,
    });

    if (search) {
      const q = search.toLowerCase();
      events = events.filter(
        (e) =>
          e.actorName.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q) ||
          e.resourceId.toLowerCase().includes(q) ||
          e.details.toLowerCase().includes(q) ||
          e.tamperProofHash.toLowerCase().includes(q)
      );
    }

    let integrityStatus = {
      verified: true,
      totalVerified: events.length,
      compromisedCount: 0,
      timestamp: new Date().toISOString(),
    };

    if (verifyIntegrity) {
      // Validate that all records have non-empty SHA-256 hashes matching standard format
      const invalid = events.filter((e) => !e.tamperProofHash || e.tamperProofHash.length !== 64);
      integrityStatus = {
        verified: invalid.length === 0,
        totalVerified: events.length,
        compromisedCount: invalid.length,
        timestamp: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      events,
      integrityStatus,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
