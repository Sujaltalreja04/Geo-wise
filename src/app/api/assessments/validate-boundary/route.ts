import { NextResponse } from "next/server";
import { validateBoundary } from "@/lib/spatial-assessment-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const geoJson = body.geometry || body.boundaryGeoJson || body;

    const validation = validateBoundary(geoJson);

    return NextResponse.json({
      success: true,
      validation,
    });
  } catch (error: any) {
    console.error("POST /api/assessments/validate-boundary error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
