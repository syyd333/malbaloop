import { NextResponse } from "next/server";
import { createJob, listJobs } from "@/lib/db";
import type { DebrisType } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ jobs: listJobs() });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { photos, type, volumeM3, location, wardId } = body ?? {};
    const types: DebrisType[] = ["concrete_brick", "soil", "tiles", "metal"];
    if (!types.includes(type)) {
      return NextResponse.json({ error: "invalid type" }, { status: 400 });
    }
    if (typeof volumeM3 !== "number" || volumeM3 <= 0 || volumeM3 > 200) {
      return NextResponse.json({ error: "invalid volumeM3" }, { status: 400 });
    }
    if (
      !location ||
      typeof location.lat !== "number" ||
      typeof location.lng !== "number" ||
      !wardId
    ) {
      return NextResponse.json({ error: "invalid location/wardId" }, { status: 400 });
    }
    const job = createJob({
      photos: Array.isArray(photos) ? photos.slice(0, 3) : [],
      type: type as DebrisType,
      volumeM3,
      location,
      wardId,
    });
    return NextResponse.json({ job }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
