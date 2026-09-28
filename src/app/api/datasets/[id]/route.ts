import { NextResponse } from "next/server";
import { getStore } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ds = getStore().datasets.find((d) => d.id === id);
  if (!ds) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ dataset: ds });
}
