import { NextResponse } from "next/server";
import { updateCaseStatus } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { status } = body as { status?: string };

  const valid = ["new", "investigating", "inspection", "review", "closed"];
  if (!status || !valid.includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const c = updateCaseStatus(id, status as never);
  if (!c) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  return NextResponse.json({ case: c });
}
