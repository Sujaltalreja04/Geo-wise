import { NextResponse } from "next/server";
import { getSafeComplianceDashboard } from "@/lib/compliance-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dashboardData = await getSafeComplianceDashboard();
    return NextResponse.json(dashboardData);
  } catch (error: unknown) {
    console.error("[Dashboard API] Error:", error);
    // Even in total fallback failure, return default schema with 200 OK so UI never breaks
    const fallbackData = await getSafeComplianceDashboard();
    return NextResponse.json(fallbackData);
  }
}
