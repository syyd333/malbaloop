"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhotoInput from "@/components/PhotoInput";
import GeoPicker from "@/components/GeoPicker";
import { WARDS } from "@/lib/constants";
import type { GeoPoint } from "@/lib/types";

export default function NewComplaintPage() {
  const router = useRouter();
  const [photo, setPhoto] = useState<string[]>([]);
  const [geo, setGeo] = useState<GeoPoint | null>(null);
  const [wardId, setWardId] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    if (description.trim().length < 10) return setError("Describe the dumping site (at least 10 characters).");
    if (!geo) return setError("Set the location — a geo-tag is required.");
    if (!wardId) return setError("Pick the nearest ward.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, location: geo, wardId, photo: photo[0] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to file complaint");
      router.push(`/complaints/${data.complaint.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to file complaint");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold">Report a dumping site</h1>
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <PhotoInput photos={photo} onChange={setPhoto} max={1} label="Photo of the site" />
        <textarea
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          rows={3}
          placeholder="What do you see? Debris type, whether a nala/drain is blocked, since when…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <GeoPicker value={geo} onChange={setGeo} />
        <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={wardId} onChange={(e) => setWardId(e.target.value)}>
          <option value="">Nearest ward</option>
          {WARDS.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
        </select>
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button onClick={submit} disabled={submitting} className="rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-800 disabled:opacity-50">
          {submitting ? "Filing…" : "File complaint"}
        </button>
      </section>
      <p className="text-xs text-slate-400 -mt-3">
        Your complaint gets a tracking ID; officials acknowledge it, mark progress, and upload a photo of the fix.
        If it still looks wrong when resolved, you can reopen it.
      </p>
    </div>
  );
}
