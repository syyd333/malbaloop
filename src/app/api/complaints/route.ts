import { NextResponse } from "next/server";
import { createComplaint, listComplaints } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ complaints: listComplaints() });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description, location, wardId, photo } = body ?? {};
    if (!description || String(description).trim().length < 10) {
      return NextResponse.json({ error: "description required (10+ chars)" }, { status: 400 });
    }
    if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
      return NextResponse.json({ error: "geo-tag required" }, { status: 400 });
    }
    if (!wardId) {
      return NextResponse.json({ error: "wardId required" }, { status: 400 });
    }
    const complaint = createComplaint({
      description: String(description).slice(0, 600),
      location,
      wardId,
      photo: typeof photo === "string" ? photo : undefined,
    });
    return NextResponse.json({ complaint }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
