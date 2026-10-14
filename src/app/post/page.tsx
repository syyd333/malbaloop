"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PhotoInput from "@/components/PhotoInput";
import GeoPicker from "@/components/GeoPicker";
import { DEBRIS_TYPES, WARDS } from "@/lib/constants";
import { tonnageRange, plantFeeRange } from "@/lib/calc";
import type { GeoPoint } from "@/lib/types";
import type { DebrisType } from "@/lib/types";

export default function PostPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [type, setType] = useState<DebrisType>("concrete_brick");
  const [volume, setVolume] = useState(4);
  const [geo, setGeo] = useState<GeoPoint | null>(null);
  const [wardId, setWardId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const t = useMemo(() => tonnageRange(type, volume), [type, volume]);
  const fee = useMemo(() => plantFeeRange((t.min + t.max) / 2), [t]);
  const isMetal = type === "metal";

  async function submit() {
    setError("");
    if (!geo) return setError("Set the pickup location (GPS or manual).");
    if (!wardId) return setError("Pick the nearest ward.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos, type, volumeM3: volume, location: geo, wardId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to post");
      router.push(`/jobs/${data.job.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Post debris for pickup</h1>
      <p className="text-sm text-slate-600 -mt-4">
        Three quick inputs. You&apos;ll see authorised transporter quotes and the plant fee before committing.
      </p>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">1 · Photos &amp; type</h2>
        <PhotoInput photos={photos} onChange={setPhotos} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DEBRIS_TYPES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setType(d.value)}
              className={`rounded-lg border p-3 text-left text-sm transition ${
                type === d.value ? "border-green-600 bg-green-50 font-semibold" : "border-slate-200 hover:border-slate-400"
              }`}
            >
              <span className="text-xl">{d.icon}</span>
              <div>{d.label}</div>
            </button>
          ))}
        </div>
        {isMetal && (
          <p className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
            Metal scrap has resale value — also consider a <a href="/listings" className="underline">reuse listing</a> instead of disposal.
          </p>
        )}
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">2 · Rough volume</h2>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0.5}
            max={40}
            step={0.5}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="w-24 text-right font-semibold">{volume} m³</span>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-sm">
          Rough tonnage range: <strong>{t.min}–{t.max} tonnes</strong> (loose-mix density band for this type).
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">3 · Pickup location</h2>
        <GeoPicker value={geo} onChange={setGeo} />
        <select
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={wardId}
          onChange={(e) => setWardId(e.target.value)}
        >
          <option value="">Nearest ward (demo list)</option>
          {WARDS.map((w) => (
            <option key={w.id} value={w.id}>{w.name} — {w.circle}</option>
          ))}
        </select>
      </section>

      <section className="rounded-xl border border-green-200 bg-green-50 p-5 text-sm">
        Estimated plant disposal fee around <strong>₹{fee.min}–₹{fee.max}</strong> (₹405–435/tonne at the plant
        weighbridge, billed on net weight). You&apos;ll compare transporter quotes next.
      </section>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button
        onClick={submit}
        disabled={submitting}
        className="w-full rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50"
      >
        {submitting ? "Posting…" : "Post debris → see options"}
      </button>
    </div>
  );
}
