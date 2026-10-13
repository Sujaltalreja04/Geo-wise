import { NextResponse } from "next/server";
import { getSafeComplianceReport } from "@/lib/compliance-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("type") || "framework_register";
    const format = searchParams.get("format") || "json"; // "json" | "csv"
    const actor = searchParams.get("actor") || "Khalid Al-Otaibi";

    const { title, csvData, reportPayload } = await getSafeComplianceReport(reportType, format, actor);

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
      generatedAt: new Date().toISOString(),
      generatedBy: actor,
      legalDisclaimer:
        "CONFIDENTIAL & ADVISORY: Generated from the GeoWise Platform for the Aseer's Supervisory Committee (SVC) and Fast Track Office. This document is for governance review and internal oversight; it does not constitute a formal certificate of regulatory compliance.",
      data: reportPayload,
    });
  } catch (error: unknown) {
    console.error("[Reports API] GET error:", error);
    const { title, reportPayload } = await getSafeComplianceReport("framework_register", "json", "Khalid Al-Otaibi");
    return NextResponse.json({
      title,
      reportType: "framework_register",
      generatedAt: new Date().toISOString(),
      generatedBy: "Khalid Al-Otaibi",
      data: reportPayload,
    });
  }
}
