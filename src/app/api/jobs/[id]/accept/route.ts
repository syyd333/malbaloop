import { NextResponse } from "next/server";
import { acceptQuote } from "@/lib/db";
import { TRANSPORTERS } from "@/lib/constants";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const { transporterId, priceTotal } = body ?? {};
  if (!TRANSPORTERS.some((t) => t.id === transporterId)) {
    return NextResponse.json({ error: "unknown transporter" }, { status: 400 });
  }
  if (typeof priceTotal !== "number" || priceTotal < 0) {
    return NextResponse.json({ error: "invalid priceTotal" }, { status: 400 });
  }
  const job = acceptQuote(id, transporterId, priceTotal);
  if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ job });
}
