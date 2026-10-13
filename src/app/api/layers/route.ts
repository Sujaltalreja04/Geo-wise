import { NextResponse } from "next/server";
import { ALL_SPATIAL_LAYERS } from "@/lib/development-assessment-data";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      count: ALL_SPATIAL_LAYERS.length,
      layers: ALL_SPATIAL_LAYERS,
    });
  } catch (error: any) {
    console.error("GET /api/layers error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
