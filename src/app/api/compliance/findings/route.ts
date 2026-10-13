import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureComplianceSeeded, generateSha256 } from "@/lib/compliance-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await ensureComplianceSeeded();
    const { searchParams } = new URL(req.url);
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    const frameworkId = searchParams.get("frameworkId");
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};
    if (severity && severity !== "all") where.severity = severity;
    if (status && status !== "all") where.status = status;
    if (frameworkId && frameworkId !== "all") where.frameworkId = frameworkId;

    let findings = await db.complianceFinding.findMany({
      where,
      include: {
        control: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
        remediationActions: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (search) {
      const q = search.toLowerCase();
      findings = findings.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.assignedOwner.toLowerCase().includes(q) ||
          f.controlId.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ findings });
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
      action = "create", // "create" | "update_status" | "accept_risk" | "add_remediation"
      id,
      frameworkId,
      controlId,
      assessmentId,
      title,
      description,
      severity = "Medium",
      businessImpact,
      rootCause,
      recommendedAction,
      assignedOwner,
      targetResolutionDate,
      status = "Open",
      riskAcceptanceJustification,
      riskAcceptedBy,
      riskExpiryDate,
      reviewerComments,
      closureApprover,
      actionTitle,
      dueDate,
      actor = "Khalid Al-Otaibi",
    } = body;

    if (action === "create") {
      if (!controlId || !title) {
        return NextResponse.json({ error: "Missing required finding parameters." }, { status: 400 });
      }

      const findingId = id || `FND-${Date.now()}`;
      const finding = await db.complianceFinding.create({
        data: {
          id: findingId,
          frameworkId: frameworkId || "FW-NCA-ECC",
          controlId,
          assessmentId,
          title,
          description: description || "",
          severity,
          businessImpact: businessImpact || "Operational and regulatory compliance impact.",
          rootCause: rootCause || "Identified during control review.",
          recommendedAction: recommendedAction || "Implement remediation measures.",
          assignedOwner: assignedOwner || actor,
          targetResolutionDate: targetResolutionDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          status: "Open",
          reviewerComments,
        },
      });

      const auditId = `AUD-${Date.now()}`;
      await db.auditEvent.create({
        data: {
          id: auditId,
          actorId: "u-001",
          actorName: actor,
          action: "Finding Created",
          resourceType: "ComplianceFinding",
          resourceId: findingId,
          outcome: "success",
          details: `Created finding ${findingId} (${title}) for control ${controlId}. Severity: ${severity}.`,
          tamperProofHash: generateSha256(`${auditId}-${findingId}-Open`),
          timestamp: new Date(),
        },
      });

      return NextResponse.json({ finding }, { status: 201 });
    }

    if (action === "update_status") {
      const finding = await db.complianceFinding.findUnique({ where: { id } });
      if (!finding) return NextResponse.json({ error: "Finding not found." }, { status: 404 });

      const dataToUpdate: Record<string, unknown> = {
        status,
        reviewerComments: reviewerComments || finding.reviewerComments,
      };

      if (status === "Closed" || status === "Resolved") {
        dataToUpdate.closureApprover = actor;
        dataToUpdate.closureTimestamp = new Date();
      }

      const updated = await db.complianceFinding.update({
        where: { id },
        data: dataToUpdate,
      });

      const auditId = `AUD-${Date.now()}`;
      await db.auditEvent.create({
        data: {
          id: auditId,
          actorId: "u-001",
          actorName: actor,
          action: `Finding Status: ${status}`,
          resourceType: "ComplianceFinding",
          resourceId: id,
          outcome: "success",
          details: `Finding ${id} transitioned from ${finding.status} to ${status}.`,
          tamperProofHash: generateSha256(`${auditId}-${id}-${status}`),
          timestamp: new Date(),
        },
      });

      return NextResponse.json({ finding: updated });
    }

    if (action === "accept_risk") {
      if (!riskAcceptanceJustification || !riskAcceptedBy || !riskExpiryDate) {
        return NextResponse.json(
          {
            error:
              "Policy requirement: Documented risk justification, authorized approver name, and expiry date are required to accept risk.",
          },
          { status: 400 }
        );
      }

      const updated = await db.complianceFinding.update({
        where: { id },
        data: {
          status: "Accepted Risk",
          riskAcceptanceJustification,
          riskAcceptedBy,
          riskExpiryDate,
          closureApprover: riskAcceptedBy,
          closureTimestamp: new Date(),
          reviewerComments: `Risk formally accepted until ${riskExpiryDate} by ${riskAcceptedBy}.`,
        },
      });

      const auditId = `AUD-${Date.now()}`;
      await db.auditEvent.create({
        data: {
          id: auditId,
          actorId: "u-001",
          actorName: actor,
          action: "Risk Accepted",
          resourceType: "ComplianceFinding",
          resourceId: id,
          outcome: "success",
          details: `Risk formally accepted for Finding ${id} by ${riskAcceptedBy}. Expiry: ${riskExpiryDate}. Rationale: ${riskAcceptanceJustification}`,
          tamperProofHash: generateSha256(`${auditId}-${id}-AcceptedRisk`),
          timestamp: new Date(),
        },
      });

      return NextResponse.json({ finding: updated });
    }

    if (action === "add_remediation") {
      const rem = await db.remediationAction.create({
        data: {
          findingId: id,
          actionTitle: actionTitle || "Corrective Remediation Action",
          description: description || "",
          owner: assignedOwner || actor,
          dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
          status: "In Progress",
        },
      });

      return NextResponse.json({ remediationAction: rem }, { status: 201 });
    }

    return NextResponse.json({ error: "Unknown finding action." }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
