import { NextResponse } from "next/server";
import { getAllAssessments } from "@/lib/assessment-db-service";
import { ALL_SPATIAL_LAYERS } from "@/lib/development-assessment-data";

export async function GET() {
  try {
    const assessments = await getAllAssessments();

    const totalSites = assessments.length;
    const completed = assessments.filter((a) => a.status === "completed").length;
    const inProgress = assessments.filter((a) => a.status === "processing").length;
    const requiresStudy = assessments.filter(
      (a) => a.status === "requires_study" || a.overallSpatialVerdict === "Requires Further Study"
    ).length;
    const constrained = assessments.filter(
      (a) => a.status === "constrained" || a.overallSpatialVerdict === "Constrained"
    ).length;
    const withDataGaps = assessments.filter(
      (a) => a.dataGaps && a.dataGaps.length > 0
    ).length;

    // Freshness of available datasets
    const totalDatasets = ALL_SPATIAL_LAYERS.length;
    const freshDatasets = ALL_SPATIAL_LAYERS.filter((l) => l.freshnessStatus === "Fresh").length;
    const reviewNeededDatasets = ALL_SPATIAL_LAYERS.filter((l) => l.freshnessStatus === "Review Needed").length;

    const recentAssessments = assessments.slice(0, 5).map((a) => ({
      id: a.id,
      siteName: a.siteName,
      siteNameAr: a.siteNameAr,
      applicantName: a.applicantName,
      assessmentType: a.assessmentType,
      district: a.district,
      overallSpatialVerdict: a.overallSpatialVerdict,
      status: a.status,
      areaM2: a.areaM2,
      createdAt: a.createdAt,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalSites,
        completed,
        inProgress,
        requiresStudy,
        constrained,
        withDataGaps,
        datasets: {
          total: totalDatasets,
          fresh: freshDatasets,
          reviewNeeded: reviewNeededDatasets,
          freshnessPct: Math.round((freshDatasets / totalDatasets) * 100),
        },
        recentAssessments,
      },
    });
  } catch (error: any) {
    console.error("GET /api/assessments/stats error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
