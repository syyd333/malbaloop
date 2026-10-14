import { NextResponse } from "next/server";
import { getComplaint } from "@/lib/db";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const complaint = getComplaint(id);
  if (!complaint) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ complaint });
}
