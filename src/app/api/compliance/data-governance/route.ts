import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureComplianceSeeded, generateSha256 } from "@/lib/compliance-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await ensureComplianceSeeded();
    const { searchParams } = new URL(req.url);
    const classificationType = searchParams.get("type"); // "Official" | "Reference-Only"
    const security = searchParams.get("security");
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};
    if (classificationType && classificationType !== "all") where.classificationType = classificationType;
    if (security && security !== "all") where.securityClassification = security;

    let assets = await db.dataAsset.findMany({
      where,
      include: {
        gaps: true,
      },
      orderBy: { importDate: "desc" },
    });

    if (search) {
      const q = search.toLowerCase();
      assets = assets.filter(
        (a) =>
          a.datasetName.toLowerCase().includes(q) ||
          a.datasetNameAr.toLowerCase().includes(q) ||
          a.sourceAuthority.toLowerCase().includes(q) ||
          a.geographicCoverage.toLowerCase().includes(q)
      );
    }

    const dataGaps = await db.dataGap.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Compute provenance trace records
    const traceabilitySamples = [
      {
        requestId: "REQ-FTO-2026-ABHA-089",
        analysisMethod: "Multi-Criteria Spatial Suitability Engine (M05)",
        engineVersion: "v2.1.4-Release",
        timestamp: "2026-10-12 14:22:10 UTC",
        inputs: [
          { name: "Aseer Official Cadastral Parcels", version: "2026.3-R2", type: "Official" },
          { name: "Municipal Zoning Masterplan", version: "2026.1", type: "Official (Stale > 60d)" },
          { name: "Contractor KMZ Boundary", version: "Batch-04", type: "Reference-Only" },
        ],
        dataLimitations: "Drone imagery lacks formal privacy masking certification. Parcels in northern sector rely on 2026.1 masterplan.",
        humanOversightNote: "Advisory finding only. Aseer Supervisory Committee (SVC) retains final discretionary decision authority.",
      },
      {
        requestId: "REQ-FTO-2026-SOODAH-015",
        analysisMethod: "Environmental Reserve Proximity & Encroachment Check (M07)",
        engineVersion: "v2.1.4-Release",
        timestamp: "2026-10-11 09:15:30 UTC",
        inputs: [
          { name: "Environmental Protected Reserves", version: "2025.4-Final", type: "Official" },
          { name: "Commercial Drone Orthomosaic", version: "2026.08.12", type: "Reference-Only" },
        ],
        dataLimitations: "14-meter coordinate discrepancy detected with contractor KMZ overlay. Flagged in Data-Gap Register (GAP-2026-03).",
        humanOversightNote: "Field survey dispatch required prior to any demolition or stop-work order.",
      },
    ];

    return NextResponse.json({
      assets,
      dataGaps,
      traceabilitySamples,
    });
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
      action = "create_asset", // "create_asset" | "update_asset" | "create_gap" | "resolve_gap"
      id,
      datasetName,
      datasetNameAr,
      description,
      dataOwner,
      sourceAuthority,
      sourceUrl,
      classificationType = "Official",
      securityClassification = "confidential",
      geographicCoverage,
      datasetVersion = "1.0",
      crs = "EPSG:32638",
      freshnessThresholdDays = 90,
      qualityValidationStatus = "Validated",
      accessRestrictions,
      associatedAnalyses,
      // For gaps
      dataAssetId,
      affectedRequest,
      gapType = "Missing Data",
      gapDescription,
      severity = "Medium",
      owner,
      status = "Identified",
      actor = "Khalid Al-Otaibi",
    } = body;

    if (action === "create_asset" || action === "update_asset") {
      const assetId = id || `ASSET-${Date.now()}`;
      const nowStr = new Date().toISOString().split("T")[0];

      const asset = await db.dataAsset.upsert({
        where: { id: assetId },
        update: {
          datasetName,
          datasetNameAr: datasetNameAr || datasetName,
          description: description || "",
          dataOwner: dataOwner || "MOMRAH / SVC",
          sourceAuthority: sourceAuthority || "General Survey Authority",
          sourceUrl,
          classificationType,
          securityClassification,
          geographicCoverage: geographicCoverage || "Aseer Region",
          datasetVersion,
          crs,
          lastUpdatedDate: nowStr,
          freshnessThresholdDays: Number(freshnessThresholdDays),
          qualityValidationStatus,
          accessRestrictions: accessRestrictions || "Government internal use",
          associatedAnalyses,
        },
        create: {
          id: assetId,
          datasetName,
          datasetNameAr: datasetNameAr || datasetName,
          description: description || "",
          dataOwner: dataOwner || "MOMRAH / SVC",
          sourceAuthority: sourceAuthority || "General Survey Authority",
          sourceUrl,
          classificationType,
          securityClassification,
          geographicCoverage: geographicCoverage || "Aseer Region",
          datasetVersion,
          crs,
          importDate: nowStr,
          lastUpdatedDate: nowStr,
          freshnessThresholdDays: Number(freshnessThresholdDays),
          qualityValidationStatus,
          accessRestrictions: accessRestrictions || "Government internal use",
          associatedAnalyses,
        },
      });

      const auditId = `AUD-${Date.now()}`;
      await db.auditEvent.create({
        data: {
          id: auditId,
          actorId: "u-001",
          actorName: actor,
          action: "Data Asset Registered",
          resourceType: "DataAsset",
          resourceId: assetId,
          outcome: "success",
          details: `Registered spatial asset ${datasetName} (${classificationType}, ${securityClassification}).`,
          tamperProofHash: generateSha256(`${auditId}-${assetId}-${classificationType}`),
          timestamp: new Date(),
        },
      });

      return NextResponse.json({ asset }, { status: 201 });
    }

    if (action === "create_gap") {
      const gapId = id || `GAP-${Date.now()}`;
      const gap = await db.dataGap.create({
        data: {
          id: gapId,
          dataAssetId,
          affectedRequest: affectedRequest || "General Analysis Pipeline",
          gapType,
          description: gapDescription || description || "Identified data inconsistency or missing boundary.",
          severity,
          owner: owner || actor,
          status: "Identified",
        },
      });

      const auditId = `AUD-${Date.now()}`;
      await db.auditEvent.create({
        data: {
          id: auditId,
          actorId: "u-001",
          actorName: actor,
          action: "Data Gap Logged",
          resourceType: "DataGap",
          resourceId: gapId,
          outcome: "success",
          details: `Logged data gap ${gapId} (${gapType}) for ${affectedRequest || "Spatial Analysis"}.`,
          tamperProofHash: generateSha256(`${auditId}-${gapId}-${gapType}`),
          timestamp: new Date(),
        },
      });

      return NextResponse.json({ dataGap: gap }, { status: 201 });
    }

    if (action === "resolve_gap") {
      const gap = await db.dataGap.update({
        where: { id },
        data: { status: "Resolved" },
      });

      const auditId = `AUD-${Date.now()}`;
      await db.auditEvent.create({
        data: {
          id: auditId,
          actorId: "u-001",
          actorName: actor,
          action: "Data Gap Resolved",
          resourceType: "DataGap",
          resourceId: id,
          outcome: "success",
          details: `Data gap ${id} marked as resolved by ${actor}.`,
          tamperProofHash: generateSha256(`${auditId}-${id}-Resolved`),
          timestamp: new Date(),
        },
      });

      return NextResponse.json({ dataGap: gap });
    }

    return NextResponse.json({ error: "Unknown data governance action." }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
