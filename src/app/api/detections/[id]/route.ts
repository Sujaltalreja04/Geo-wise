import { NextResponse } from "next/server";
import { updateDetection, createCaseFromDetection } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { action } = body as { action?: "verify" | "reject" | "createCase" };

  if (action === "createCase") {
    const c = createCaseFromDetection(id);
    if (!c)
      return NextResponse.json({ error: "Detection not found" }, { status: 404 });
    return NextResponse.json({ case: c, detectionId: id });
  }

  const patch =
    action === "verify"
      ? ({ status: "verified", reviewedBy: "Khalid Al-Otaibi" } as const)
      : action === "reject"
        ? ({ status: "rejected", reviewedBy: "Khalid Al-Otaibi" } as const)
        : null;

  if (!patch)
    return NextResponse.json(
      { error: "Invalid action; expected verify | reject | createCase" },
      { status: 400 }
    );

  const det = updateDetection(id, patch);
  if (!det)
    return NextResponse.json({ error: "Detection not found" }, { status: 404 });
  return NextResponse.json({ detection: det });
}
