import { NextResponse } from "next/server";
import { getAllAssessments, saveAssessmentResult } from "@/lib/assessment-db-service";
import { runSpatialAssessment, type ProposalInput } from "@/lib/spatial-assessment-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    let assessments = await getAllAssessments();

    if (search) {
      assessments = assessments.filter(
        (a) =>
          a.siteName.toLowerCase().includes(search) ||
          (a.siteNameAr && a.siteNameAr.toLowerCase().includes(search)) ||
          a.id.toLowerCase().includes(search) ||
          a.applicantName.toLowerCase().includes(search) ||
          a.district.toLowerCase().includes(search)
      );
    }

    if (type && type !== "all") {
      assessments = assessments.filter((a) => a.assessmentType === type);
    }

    if (status && status !== "all") {
      assessments = assessments.filter(
        (a) => a.status === status || a.overallSpatialVerdict === status
      );
    }

    return NextResponse.json({ success: true, count: assessments.length, assessments });
  } catch (error: any) {
    console.error("GET /api/assessments error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: ProposalInput = await request.json();

    if (!body.siteName || !body.boundaryGeoJson) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: siteName and boundaryGeoJson are mandatory." },
        { status: 400 }
      );
    }

    // Run deterministic spatial assessment engine
    const executionResult = runSpatialAssessment(body);

    // Save result to SQLite
    const saved = await saveAssessmentResult(executionResult);

    return NextResponse.json({
      success: true,
      message: "Spatial assessment completed successfully.",
      assessmentId: saved.id,
      assessment: executionResult,
    });
  } catch (error: any) {
    console.error("POST /api/assessments error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
