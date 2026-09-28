import { NextResponse } from "next/server";
import { acknowledgeAlert } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { id } = body as { id?: string };
  if (!id)
    return NextResponse.json({ error: "id required" }, { status: 400 });

  const a = acknowledgeAlert(id);
  if (!a)
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  return NextResponse.json({ alert: a });
}
