import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureComplianceSeeded, generateSha256 } from "@/lib/compliance-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await ensureComplianceSeeded();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const frameworkId = searchParams.get("frameworkId");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const riskRating = searchParams.get("riskRating");

    const where: Record<string, unknown> = {};
    if (frameworkId && frameworkId !== "all") {
      where.frameworkId = frameworkId;
    }
    if (category && category !== "all") {
      where.category = category;
    }
    if (status && status !== "all") {
      where.implementationStatus = status;
    }
    if (riskRating && riskRating !== "all") {
      where.riskRating = riskRating;
    }

    let controls = await db.complianceControl.findMany({
      where,
      include: {
        framework: {
          select: {
            name: true,
            abbreviation: true,
          },
        },
        findings: {
          select: {
            id: true,
            title: true,
            severity: true,
            status: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    if (search) {
      const q = search.toLowerCase();
      controls = controls.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.titleAr.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.requirementText.toLowerCase().includes(q) ||
          c.controlOwner.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ controls });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureComplianceSeeded();
    const body = await req.json();
    const {
      id,
      frameworkId,
      title,
      titleAr,
      description,
      requirementText,
      sourceReference,
      category,
      applicabilityStatus = "Applicable",
      implementationStatus = "Not Assessed",
      controlOwner = "Security Team",
      reviewer = "SVC Lead",
      riskRating = "Medium",
      remediationNotes,
      isDraft = false,
      actor = "Khalid Al-Otaibi",
    } = body;

    if (!id || !frameworkId || !title) {
      return NextResponse.json({ error: "Missing required control parameters." }, { status: 400 });
    }

    const existing = await db.complianceControl.findUnique({ where: { id } });

    const saved = await db.complianceControl.upsert({
      where: { id },
      update: {
        title,
        titleAr: titleAr || title,
        description: description || "",
        requirementText: requirementText || "",
        sourceReference: sourceReference || "",
        category: category || "Access Control",
        applicabilityStatus,
        implementationStatus,
        controlOwner,
        reviewer,
        riskRating,
        assessmentDate: new Date().toISOString().split("T")[0],
        remediationNotes,
        isDraft,
      },
      create: {
        id,
        frameworkId,
        title,
        titleAr: titleAr || title,
        description: description || "",
        requirementText: requirementText || "",
        sourceReference: sourceReference || "",
        category: category || "Access Control",
        applicabilityStatus,
        implementationStatus,
        controlOwner,
        reviewer,
        riskRating,
        assessmentDate: new Date().toISOString().split("T")[0],
        remediationNotes,
        isDraft,
      },
    });

    const auditId = `AUD-${Date.now()}`;
    await db.auditEvent.create({
      data: {
        id: auditId,
        actorId: "u-001",
        actorName: actor,
        action: existing ? "Control Status Transition" : "Control Created",
        resourceType: "ComplianceControl",
        resourceId: id,
        outcome: "success",
        details: `Control ${id} (${title}) set to status: ${implementationStatus}, Risk: ${riskRating}.`,
        tamperProofHash: generateSha256(`${auditId}-${id}-${implementationStatus}`),
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ control: saved });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
