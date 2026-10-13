import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureComplianceSeeded, generateSha256, getSafeComplianceDataGovernance } from "@/lib/compliance-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classificationType = searchParams.get("type") || undefined;
    const security = searchParams.get("security") || undefined;
    const search = searchParams.get("search") || "";

    const { assets, dataGaps, traceabilitySamples } = await getSafeComplianceDataGovernance({
      classificationType,
      security,
      search,
    });

    return NextResponse.json({
      assets,
      dataGaps,
      traceabilitySamples,
    });
  } catch (error: unknown) {
    console.error("[Data Governance API] GET error:", error);
    const { assets, dataGaps, traceabilitySamples } = await getSafeComplianceDataGovernance({});
    return NextResponse.json({
      assets,
      dataGaps,
      traceabilitySamples,
    });
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
