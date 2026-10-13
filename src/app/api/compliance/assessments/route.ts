import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureComplianceSeeded, generateSha256, getSafeComplianceAssessments } from "@/lib/compliance-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const frameworkId = searchParams.get("frameworkId") || undefined;
    const status = searchParams.get("status") || undefined;

    const assessments = await getSafeComplianceAssessments({ frameworkId, status });
    return NextResponse.json({ assessments });
  } catch (error: unknown) {
    console.error("[Assessments API] GET error:", error);
    const assessments = await getSafeComplianceAssessments({});
    return NextResponse.json({ assessments });
  }
}

export async function POST(req: Request) {
  try {
    await ensureComplianceSeeded();
    const body = await req.json();
    const {
      action = "create", // "create" | "submit" | "approve" | "return" | "update_result"
      id,
      frameworkId,
      scope,
      period,
      assessor,
      reviewer,
      comments,
      controlResults = [],
      actor = "Khalid Al-Otaibi",
    } = body;

    const settings = await db.complianceSettings.findFirst({ where: { id: "default" } });
    const independentApprovalRequired = settings?.independentApprovalRequired ?? true;

    if (action === "create") {
      const assessmentId = id || `ASM-${Date.now()}`;
      const assessment = await db.complianceAssessment.create({
        data: {
          id: assessmentId,
          frameworkId,
          scope: scope || "Core Geospatial Platform & Fast Track Operations",
          period: period || "Current Period",
          assessor: assessor || actor,
          reviewer: reviewer || "Independent SVC Reviewer",
          status: "Draft",
          comments: comments || "",
        },
      });

      // Link applicable controls
      const controls = await db.complianceControl.findMany({
        where: { frameworkId },
      });

      for (const ctrl of controls) {
        await db.assessmentResult.create({
          data: {
            assessmentId,
            controlId: ctrl.id,
            status: ctrl.implementationStatus,
            observations: `Initial baseline evaluation for control ${ctrl.id}`,
          },
        });
      }

      const auditId = `AUD-${Date.now()}`;
      await db.auditEvent.create({
        data: {
          id: auditId,
          actorId: "u-001",
          actorName: actor,
          action: "Assessment Initialized",
          resourceType: "ComplianceAssessment",
          resourceId: assessmentId,
          outcome: "success",
          details: `Created assessment ${assessmentId} for framework ${frameworkId}. Assessor: ${assessor}, Reviewer: ${reviewer}.`,
          tamperProofHash: generateSha256(`${auditId}-${assessmentId}-Draft`),
          timestamp: new Date(),
        },
      });

      return NextResponse.json({ assessment }, { status: 201 });
    }

    if (action === "submit") {
      const assessment = await db.complianceAssessment.findUnique({ where: { id } });
      if (!assessment) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });

      const updated = await db.complianceAssessment.update({
        where: { id },
        data: {
          status: "In Review",
          submittedAt: new Date(),
          comments: comments || assessment.comments,
        },
      });

      const auditId = `AUD-${Date.now()}`;
      await db.auditEvent.create({
        data: {
          id: auditId,
          actorId: "u-001",
          actorName: actor,
          action: "Assessment Submitted for Review",
          resourceType: "ComplianceAssessment",
          resourceId: id,
          outcome: "success",
          details: `Assessment ${id} submitted for review by ${actor}.`,
          tamperProofHash: generateSha256(`${auditId}-${id}-InReview`),
          timestamp: new Date(),
        },
      });

      return NextResponse.json({ assessment: updated });
    }

    if (action === "approve") {
      const assessment = await db.complianceAssessment.findUnique({ where: { id } });
      if (!assessment) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });

      // Enforce independent approval rule
      if (independentApprovalRequired && actor.toLowerCase() === assessment.assessor.toLowerCase()) {
        return NextResponse.json(
          {
            error:
              "Policy violation: Assessor cannot approve their own assessment. Independent reviewer signoff required by Supervisory Committee policy.",
          },
          { status: 403 }
        );
      }

      const updated = await db.complianceAssessment.update({
        where: { id },
        data: {
          status: "Approved",
          approvedAt: new Date(),
          comments: comments || assessment.comments,
        },
      });

      // Update framework assessment status as well
      await db.complianceFramework.update({
        where: { id: assessment.frameworkId },
        data: {
          assessmentStatus: "Assessed",
          reviewDate: new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0],
        },
      });

      const auditId = `AUD-${Date.now()}`;
      await db.auditEvent.create({
        data: {
          id: auditId,
          actorId: "u-001",
          actorName: actor,
          action: "Assessment Approved",
          resourceType: "ComplianceAssessment",
          resourceId: id,
          outcome: "success",
          details: `Assessment ${id} approved by authorized reviewer ${actor}. Framework ${assessment.frameworkId} marked as Assessed.`,
          tamperProofHash: generateSha256(`${auditId}-${id}-Approved`),
          timestamp: new Date(),
        },
      });

      return NextResponse.json({ assessment: updated });
    }

    if (action === "return") {
      const assessment = await db.complianceAssessment.findUnique({ where: { id } });
      if (!assessment) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });

      const updated = await db.complianceAssessment.update({
        where: { id },
        data: {
          status: "Returned for Corrections",
          comments: comments || "Returned for corrections by reviewer.",
        },
      });

      const auditId = `AUD-${Date.now()}`;
      await db.auditEvent.create({
        data: {
          id: auditId,
          actorId: "u-001",
          actorName: actor,
          action: "Assessment Returned for Corrections",
          resourceType: "ComplianceAssessment",
          resourceId: id,
          outcome: "success",
          details: `Assessment ${id} returned by reviewer ${actor}. Reason: ${comments || "Corrections required"}`,
          tamperProofHash: generateSha256(`${auditId}-${id}-Returned`),
          timestamp: new Date(),
        },
      });

      return NextResponse.json({ assessment: updated });
    }

    if (action === "update_result") {
      const { resultId, status: resStatus, observations, gapsIdentified } = body;
      const res = await db.assessmentResult.update({
        where: { id: resultId },
        data: {
          status: resStatus,
          observations,
          gapsIdentified,
        },
      });

      return NextResponse.json({ result: res });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
