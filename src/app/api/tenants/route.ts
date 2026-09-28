import { NextResponse } from "next/server";
import { getStore } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ tenants: getStore().tenants });
}
