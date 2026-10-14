import { NextResponse } from "next/server";
import { resolveComplaint, setComplaintStatus } from "@/lib/db";
import type { ComplaintStatus } from "@/lib/types";

const OFFICIAL_FLOW: ComplaintStatus[] = ["acknowledged", "in_progress", "resolved"];

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const { status, by, text, photo } = body ?? {};

  if (by === "citizen") {
    // Citizen can only reopen an unresolved complaint.
    const updated = setComplaintStatus(id, "reopened", "citizen", String(text ?? "Reopened by citizen"));
    if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ complaint: updated });
  }

  if (by === "official") {
    const s = status as ComplaintStatus;
    if (!OFFICIAL_FLOW.includes(s)) {
      return NextResponse.json({ error: `official status must be one of ${OFFICIAL_FLOW.join(", ")}` }, { status: 400 });
    }
    if (s === "resolved") {
      const updated = resolveComplaint(id, String(text ?? "Site attended"), typeof photo === "string" ? photo : undefined);
      if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
      return NextResponse.json({ complaint: updated });
    }
    const updated = setComplaintStatus(id, s, "official", String(text ?? s));
    if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ complaint: updated });
  }

  return NextResponse.json({ error: "by must be citizen or official" }, { status: 400 });
}
