import { NextResponse } from "next/server";
import { getStore, createReport, updateReport } from "@/lib/data-store";
import type { ReportItem } from "@/lib/dummy-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ reports: getStore().reports });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === "update") {
      const updated = updateReport(body.id, {
        status: body.status,
        approver: body.approver,
        approverAr: body.approverAr,
      });
      if (!updated) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
      }
      return NextResponse.json({ report: updated });
    }

    // Create report
    const newReport: ReportItem = body.report;
    const created = createReport(newReport);
    return NextResponse.json({ report: created }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
