import { NextResponse } from "next/server";
import { getAssessmentById } from "@/lib/assessment-db-service";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assessment = await getAssessmentById(id);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: `Assessment '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, assessment });
  } catch (error: any) {
    console.error("GET /api/assessments/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.siteAssessment.delete({ where: { id } });
    return NextResponse.json({ success: true, message: `Assessment '${id}' deleted successfully.` });
  } catch (error: any) {
    console.error("DELETE /api/assessments/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
