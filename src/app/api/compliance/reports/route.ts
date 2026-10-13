import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureComplianceSeeded, generateSha256 } from "@/lib/compliance-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await ensureComplianceSeeded();
    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("type") || "framework_register";
    const format = searchParams.get("format") || "json"; // "json" | "csv"
    const actor = searchParams.get("actor") || "Khalid Al-Otaibi";

    const timestamp = new Date().toISOString();
    let title = "";
    let csvData = "";
    let reportPayload: Record<string, unknown> = {};

    if (reportType === "framework_register") {
      title = "Official Framework Register Report (سجل الأطر التنظيمية)";
      const frameworks = await db.complianceFramework.findMany({
        include: { controls: true },
        orderBy: { id: "asc" },
      });

      const rows = [
        ["Framework ID", "Name", "Version", "Applicability", "Assessment Status", "Controls Count", "Owner", "Review Date"],
        ...frameworks.map((f) => [
          f.id,
          `"${f.name}"`,
          f.version,
          `"${f.applicabilityStatus}"`,
          `"${f.assessmentStatus}"`,
          f.controls.length.toString(),
          `"${f.responsibleOwner}"`,
          f.reviewDate,
        ]),
      ];
      csvData = rows.map((r) => r.join(",")).join("\n");
      reportPayload = { frameworks, total: frameworks.length };
    } else if (reportType === "compliance_assessment") {
      title = "Compliance Assessment & Gap Report (تقرير تقييم الامتثال والفجوات)";
      const assessments = await db.complianceAssessment.findMany({
        include: {
          framework: true,
          results: { include: { control: true } },
          findings: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const rows = [
        ["Assessment ID", "Framework", "Scope", "Assessor", "Reviewer", "Status", "Total Evaluated Controls"],
        ...assessments.map((a) => [
          a.id,
          `"${a.framework.name}"`,
          `"${a.scope}"`,
          `"${a.assessor}"`,
          `"${a.reviewer}"`,
          `"${a.status}"`,
          a.results.length.toString(),
        ]),
      ];
      csvData = rows.map((r) => r.join(",")).join("\n");
      reportPayload = { assessments, total: assessments.length };
    } else if (reportType === "control_status") {
      title = "Control Register Status Report (تقرير سجل الضوابط التفصيلي)";
      const controls = await db.complianceControl.findMany({
        include: { framework: true },
        orderBy: { id: "asc" },
      });

      const rows = [
        ["Control ID", "Framework", "Title", "Category", "Implementation Status", "Risk Rating", "Owner"],
        ...controls.map((c) => [
          c.id,
          `"${c.framework.abbreviation}"`,
          `"${c.title}"`,
          `"${c.category}"`,
          `"${c.implementationStatus}"`,
          c.riskRating,
          `"${c.controlOwner}"`,
        ]),
      ];
      csvData = rows.map((r) => r.join(",")).join("\n");
      reportPayload = { controls, total: controls.length };
    } else if (reportType === "findings_remediation") {
      title = "Findings & Remediation Tracking Report (تقرير الملاحظات وخطة المعالجة)";
      const findings = await db.complianceFinding.findMany({
        include: { control: true, remediationActions: true },
        orderBy: { severity: "asc" },
      });

      const rows = [
        ["Finding ID", "Control ID", "Title", "Severity", "Status", "Owner", "Target Resolution Date"],
        ...findings.map((f) => [
          f.id,
          f.controlId,
          `"${f.title.replace(/"/g, '""')}"`,
          f.severity,
          f.status,
          `"${f.assignedOwner}"`,
          f.targetResolutionDate,
        ]),
      ];
      csvData = rows.map((r) => r.join(",")).join("\n");
      reportPayload = { findings, total: findings.length };
    } else if (reportType === "evidence_index") {
      title = "Evidence Repository Master Index (فهرس الأدلة والوثائق الثبوتية)";
      const evidences = await db.complianceEvidence.findMany({
        where: { isArchived: false },
        orderBy: { createdAt: "desc" },
      });

      const rows = [
        ["Evidence ID", "Original Filename", "MIME Type", "Size KB", "Control ID", "Review Status", "SHA-256 Checksum", "Owner"],
        ...evidences.map((e) => [
          e.id,
          `"${e.originalFilename}"`,
          e.mimeType,
          Math.round(e.fileSize / 1024).toString(),
          e.controlId || "N/A",
          e.reviewStatus,
          `"${e.checksumSha256}"`,
          `"${e.owner}"`,
        ]),
      ];
      csvData = rows.map((r) => r.join(",")).join("\n");
      reportPayload = { evidences, total: evidences.length };
    } else if (reportType === "data_governance") {
      title = "Spatial Data Governance & Provenance Report (تقرير حوكمة البيانات المكانية)";
      const assets = await db.dataAsset.findMany({
        include: { gaps: true },
        orderBy: { importDate: "desc" },
      });

      const rows = [
        ["Asset ID", "Dataset Name", "Authority", "Classification Type", "Security Tier", "CRS", "Last Updated", "Quality Status"],
        ...assets.map((a) => [
          a.id,
          `"${a.datasetName}"`,
          `"${a.sourceAuthority}"`,
          a.classificationType,
          a.securityClassification,
          a.crs,
          a.lastUpdatedDate,
          a.qualityValidationStatus,
        ]),
      ];
      csvData = rows.map((r) => r.join(",")).join("\n");
      reportPayload = { assets, total: assets.length };
    } else if (reportType === "data_gap") {
      title = "Geospatial Data-Gap Register Report (سجل فجوات البيانات المكانية)";
      const dataGaps = await db.dataGap.findMany({
        include: { dataAsset: true },
        orderBy: { severity: "asc" },
      });

      const rows = [
        ["Gap ID", "Affected Request / Dataset", "Gap Type", "Severity", "Status", "Owner"],
        ...dataGaps.map((g) => [
          g.id,
          `"${g.affectedRequest}"`,
          `"${g.gapType}"`,
          g.severity,
          g.status,
          `"${g.owner}"`,
        ]),
      ];
      csvData = rows.map((r) => r.join(",")).join("\n");
      reportPayload = { dataGaps, total: dataGaps.length };
    } else if (reportType === "audit_trail") {
      title = "Tamper-Evident Audit Ledger Report (سجل العمليات والتدقيق غير القابل للتعديل)";
      const events = await db.auditEvent.findMany({
        orderBy: { timestamp: "desc" },
        take: 200,
      });

      const rows = [
        ["Event ID", "Timestamp UTC", "Actor", "Action", "Resource Type", "Resource ID", "Outcome", "Tamper SHA-256 Hash"],
        ...events.map((e) => [
          e.id,
          e.timestamp.toISOString(),
          `"${e.actorName}"`,
          `"${e.action}"`,
          e.resourceType,
          e.resourceId,
          e.outcome,
          `"${e.tamperProofHash}"`,
        ]),
      ];
      csvData = rows.map((r) => r.join(",")).join("\n");
      reportPayload = { events, total: events.length };
    } else {
      return NextResponse.json({ error: "Invalid report type." }, { status: 400 });
    }

    // Log the report generation
    const auditId = `AUD-${Date.now()}`;
    await db.auditEvent.create({
      data: {
        id: auditId,
        actorId: "u-001",
        actorName: actor,
        action: "Compliance Report Generated",
        resourceType: "ComplianceReport",
        resourceId: reportType,
        outcome: "success",
        details: `Generated official report: ${title} (${format.toUpperCase()}) by ${actor}.`,
        tamperProofHash: generateSha256(`${auditId}-${reportType}-${format}`),
        timestamp: new Date(),
      },
    });

    if (format === "csv") {
      return new NextResponse(csvData, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${reportType}-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      title,
      reportType,
      generatedAt: timestamp,
      generatedBy: actor,
      legalDisclaimer:
        "CONFIDENTIAL & ADVISORY: Generated from the GeoWise Platform for the Aseer's Supervisory Committee (SVC) and Fast Track Office. This document is for governance review and internal oversight; it does not constitute a formal certificate of regulatory compliance.",
      data: reportPayload,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
