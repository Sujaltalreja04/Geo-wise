import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureComplianceSeeded, generateSha256 } from "@/lib/compliance-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await ensureComplianceSeeded();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const applicability = searchParams.get("applicability");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (applicability && applicability !== "all") {
      where.applicabilityStatus = applicability;
    }
    if (status && status !== "all") {
      where.assessmentStatus = status;
    }

    let frameworks = await db.complianceFramework.findMany({
      where,
      include: {
        controls: {
          select: {
            id: true,
            title: true,
            implementationStatus: true,
            riskRating: true,
          },
        },
        assessments: {
          select: {
            id: true,
            status: true,
            period: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    if (search) {
      const q = search.toLowerCase();
      frameworks = frameworks.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.fullName.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.abbreviation.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ frameworks });
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
      name,
      fullName,
      nameAr,
      fullNameAr,
      abbreviation,
      version,
      publicationDate,
      description,
      descriptionAr,
      sourceUrl,
      applicabilityStatus,
      applicabilityRationale,
      responsibleOwner,
      internalReviewer,
      assessmentStatus,
      reviewDate,
      notes,
      actor = "Khalid Al-Otaibi",
      actionType = "update",
    } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "Missing required framework fields." }, { status: 400 });
    }

    const existing = await db.complianceFramework.findUnique({ where: { id } });

    const updated = await db.complianceFramework.upsert({
      where: { id },
      update: {
        name,
        fullName: fullName || name,
        nameAr: nameAr || name,
        fullNameAr: fullNameAr || fullName || name,
        abbreviation: abbreviation || id,
        version: version || "1.0",
        publicationDate: publicationDate || new Date().toISOString().split("T")[0],
        description: description || "",
        descriptionAr: descriptionAr || description || "",
        sourceUrl: sourceUrl || "",
        applicabilityStatus: applicabilityStatus || "Pending Confirmation",
        applicabilityRationale: applicabilityRationale || "",
        responsibleOwner: responsibleOwner || "CISO Office",
        internalReviewer: internalReviewer || "SVC Committee",
        assessmentStatus: assessmentStatus || "Not Assessed",
        reviewDate: reviewDate || new Date().toISOString().split("T")[0],
        notes: notes || null,
      },
      create: {
        id,
        name,
        fullName: fullName || name,
        nameAr: nameAr || name,
        fullNameAr: fullNameAr || fullName || name,
        abbreviation: abbreviation || id,
        version: version || "1.0",
        publicationDate: publicationDate || new Date().toISOString().split("T")[0],
        description: description || "",
        descriptionAr: descriptionAr || description || "",
        sourceUrl: sourceUrl || "",
        applicabilityStatus: applicabilityStatus || "Pending Confirmation",
        applicabilityRationale: applicabilityRationale || "",
        responsibleOwner: responsibleOwner || "CISO Office",
        internalReviewer: internalReviewer || "SVC Committee",
        assessmentStatus: assessmentStatus || "Not Assessed",
        reviewDate: reviewDate || new Date().toISOString().split("T")[0],
        notes: notes || null,
      },
    });

    // Record in immutable audit trail
    const auditId = `AUD-${Date.now()}`;
    await db.auditEvent.create({
      data: {
        id: auditId,
        actorId: "u-001",
        actorName: actor,
        action: existing ? "Framework Updated" : "Framework Created",
        resourceType: "ComplianceFramework",
        resourceId: id,
        outcome: "success",
        details: `${existing ? "Updated" : "Created"} framework ${name}. Applicability: ${applicabilityStatus}. Assessment: ${assessmentStatus}.`,
        tamperProofHash: generateSha256(`${auditId}-${id}-${applicabilityStatus}`),
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ framework: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
