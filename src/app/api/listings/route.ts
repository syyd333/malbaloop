import { NextResponse } from "next/server";
import { createListing, listListings, takeListing } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ listings: listListings() });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, material, description, quantity, location, wardId, photo } = body ?? {};
    if (!title || !material || !["concrete_brick", "soil", "tiles", "metal"].includes(material)) {
      return NextResponse.json({ error: "title/material required" }, { status: 400 });
    }
    if (!location || typeof location.lat !== "number" || !wardId) {
      return NextResponse.json({ error: "location/wardId required" }, { status: 400 });
    }
    const listing = createListing({
      title: String(title).slice(0, 120),
      material,
      description: String(description ?? "").slice(0, 600),
      quantity: String(quantity ?? "").slice(0, 80),
      location,
      wardId,
      photo: typeof photo === "string" ? photo : undefined,
    });
    return NextResponse.json({ listing }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const listing = takeListing(body?.id);
  if (!listing) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ listing });
}
