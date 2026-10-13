import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureComplianceSeeded } from "@/lib/compliance-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureComplianceSeeded();

    const [
      frameworks,
      controls,
      assessments,
      findings,
      evidences,
      dataAssets,
      dataGaps,
      auditEvents,
      settings,
    ] = await Promise.all([
      db.complianceFramework.findMany(),
      db.complianceControl.findMany(),
      db.complianceAssessment.findMany({ include: { results: true } }),
      db.complianceFinding.findMany({ include: { remediationActions: true } }),
      db.complianceEvidence.findMany(),
      db.dataAsset.findMany(),
      db.dataGap.findMany(),
      db.auditEvent.findMany({ orderBy: { timestamp: "desc" }, take: 10 }),
      db.complianceSettings.findFirst({ where: { id: "default" } }),
    ]);

    // KPI computations
    const totalFrameworks = frameworks.length;
    const applicableFrameworks = frameworks.filter(
      (f) => f.applicabilityStatus === "Applicable" || f.applicabilityStatus === "Partially Applicable"
    ).length;

    const assessedControls = controls.filter(
      (c) => c.implementationStatus === "Implemented" || c.implementationStatus === "Partially Implemented"
    ).length;

    const remediationRequiredControls = controls.filter(
      (c) => c.implementationStatus === "Not Implemented" || c.implementationStatus === "Partially Implemented"
    ).length;

    const unverifiedEvidenceCount = evidences.filter(
      (e) => e.reviewStatus === "Pending" || e.reviewStatus === "Rejected"
    ).length;

    const openFindings = findings.filter(
      (f) => f.status === "Open" || f.status === "In Progress"
    ).length;

    const todayStr = new Date().toISOString().split("T")[0];
    const overdueRemediations = findings.filter((f) => {
      if (f.status === "Closed" || f.status === "Resolved" || f.status === "Accepted Risk") return false;
      return f.targetResolutionDate < todayStr;
    }).length;

    const upcomingReviews = frameworks.filter((f) => {
      return f.reviewDate >= todayStr;
    }).length;

    // Findings by severity
    const findingsBySeverity = {
      Critical: findings.filter((f) => f.severity === "Critical").length,
      High: findings.filter((f) => f.severity === "High").length,
      Medium: findings.filter((f) => f.severity === "Medium").length,
      Low: findings.filter((f) => f.severity === "Low").length,
      Informational: findings.filter((f) => f.severity === "Informational").length,
    };

    // Findings by status
    const findingsByStatus = {
      Open: findings.filter((f) => f.status === "Open").length,
      "In Progress": findings.filter((f) => f.status === "In Progress").length,
      "Pending Verification": findings.filter((f) => f.status === "Pending Verification").length,
      Resolved: findings.filter((f) => f.status === "Resolved").length,
      Closed: findings.filter((f) => f.status === "Closed").length,
      "Accepted Risk": findings.filter((f) => f.status === "Accepted Risk").length,
    };

    // Implementation Status distribution
    const controlsByStatus = {
      Implemented: controls.filter((c) => c.implementationStatus === "Implemented").length,
      "Partially Implemented": controls.filter((c) => c.implementationStatus === "Partially Implemented").length,
      "Not Implemented": controls.filter((c) => c.implementationStatus === "Not Implemented").length,
      "Pending Verification": controls.filter((c) => c.implementationStatus === "Pending Verification").length,
      "Not Assessed": controls.filter((c) => c.implementationStatus === "Not Assessed").length,
      "Not Applicable": controls.filter((c) => c.implementationStatus === "Not Applicable").length,
    };

    // Framework summary cards
    const frameworkSummary = frameworks.map((fw) => {
      const fwControls = controls.filter((c) => c.frameworkId === fw.id);
      const implemented = fwControls.filter((c) => c.implementationStatus === "Implemented").length;
      const partial = fwControls.filter((c) => c.implementationStatus === "Partially Implemented").length;
      const total = fwControls.length;
      const rate = total > 0 ? Math.round(((implemented + partial * 0.5) / total) * 100) : 0;
      return {
        id: fw.id,
        name: fw.name,
        nameAr: fw.nameAr,
        abbreviation: fw.abbreviation,
        applicabilityStatus: fw.applicabilityStatus,
        assessmentStatus: fw.assessmentStatus,
        controlsCount: total,
        implementedCount: implemented,
        complianceRate: rate,
        reviewDate: fw.reviewDate,
        owner: fw.responsibleOwner,
      };
    });

    // High priority actions
    const highPriorityActions = findings
      .filter((f) => (f.severity === "Critical" || f.severity === "High") && f.status !== "Closed")
      .map((f) => ({
        id: f.id,
        title: f.title,
        severity: f.severity,
        assignedOwner: f.assignedOwner,
        targetResolutionDate: f.targetResolutionDate,
        controlId: f.controlId,
        status: f.status,
      }));

    // Data governance alerts
    const staleAssets = dataAssets.filter((a) => a.isStale || a.qualityValidationStatus === "Flagged");
    const unresolvedGaps = dataGaps.filter((g) => g.status !== "Resolved");

    return NextResponse.json({
      kpis: {
        totalFrameworks,
        applicableFrameworks,
        assessedControls,
        totalControls: controls.length,
        remediationRequiredControls,
        unverifiedEvidenceCount,
        openFindings,
        overdueRemediations,
        upcomingReviews,
        staleDataAssetsCount: staleAssets.length,
        unresolvedGapsCount: unresolvedGaps.length,
      },
      charts: {
        findingsBySeverity,
        findingsByStatus,
        controlsByStatus,
      },
      frameworkSummary,
      highPriorityActions,
      recentActivity: auditEvents,
      dataGovernanceAlerts: {
        staleAssets: staleAssets.map((a) => ({
          id: a.id,
          name: a.datasetName,
          nameAr: a.datasetNameAr,
          classificationType: a.classificationType,
          lastUpdatedDate: a.lastUpdatedDate,
          qualityValidationStatus: a.qualityValidationStatus,
        })),
        unresolvedGaps: unresolvedGaps.map((g) => ({
          id: g.id,
          affectedRequest: g.affectedRequest,
          gapType: g.gapType,
          severity: g.severity,
          status: g.status,
          owner: g.owner,
        })),
      },
      settings,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
