import { NextResponse } from "next/server";
import { issueReceipt, getJob } from "@/lib/db";
import { PLANT_FEE_MID } from "@/lib/constants";
import { nearestPlant } from "@/lib/calc";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const netTonnes = body?.netTonnes;
  if (typeof netTonnes !== "number" || netTonnes <= 0 || netTonnes > 500) {
    return NextResponse.json({ error: "invalid netTonnes" }, { status: 400 });
  }
  const job = getJob(id);
  if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (job.status === "posted") {
    return NextResponse.json({ error: "accept a transporter quote first" }, { status: 409 });
  }
  const { plant } = nearestPlant(job.location);
  const receipt = {
    slipNo: `SLIP-${String(4000 + Math.floor(Math.random() * 900)).padStart(5, "0")}`,
    netTonnes: Math.round(netTonnes * 10) / 10,
    plantFee: Math.round(netTonnes * PLANT_FEE_MID),
    issuedAt: new Date().toISOString(),
  } as const;
  const updated = issueReceipt(id, plant.id, receipt.slipNo, receipt.netTonnes, receipt.plantFee);
  return NextResponse.json({ job: updated });
}
