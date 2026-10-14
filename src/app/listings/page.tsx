"use client";

import { useEffect, useState } from "react";
import PhotoInput from "@/components/PhotoInput";
import GeoPicker from "@/components/GeoPicker";
import StatusBadge from "@/components/StatusBadge";
import { DEBRIS_TYPES, WARDS, wardName } from "@/lib/constants";
import type { GeoPoint, Listing } from "@/lib/types";
import type { DebrisType } from "@/lib/types";

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    material: "concrete_brick" as DebrisType,
    quantity: "",
    description: "",
    wardId: "",
  });
  const [geo, setGeo] = useState<GeoPoint | null>(null);
  const [photo, setPhoto] = useState<string[]>([]);
  const [error, setError] = useState("");

  const load = () => fetch("/api/listings").then((r) => r.json()).then((d) => setListings(d.listings));
  useEffect(() => {
    load();
  }, []);

  async function submit() {
    setError("");
    if (!form.title.trim()) return setError("Give the listing a short title.");
    if (!geo) return setError("Set the collection location.");
    if (!form.wardId) return setError("Pick the ward.");
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, location: geo, photo: photo[0] }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error ?? "Failed to create listing");
    setOpen(false);
    setForm({ title: "", material: "concrete_brick", quantity: "", description: "", wardId: "" });
    setGeo(null);
    setPhoto([]);
    load();
  }

  async function take(id: string) {
    await fetch("/api/listings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reuse listings</h1>
          <p className="text-sm text-slate-600">Salvageable bricks, doors, tiles, steel and fill soil — taken before they become debris.</p>
        </div>
        <button onClick={() => setOpen(!open)} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800">
          {open ? "Close form" : "+ List salvageable material"}
        </button>
      </div>

      {open && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 text-sm">
          <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Title, e.g. '200 clean bricks from interior demolition'"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DEBRIS_TYPES.map((d) => (
              <button key={d.value} type="button" onClick={() => setForm({ ...form, material: d.value })}
                className={`rounded-lg border p-2 text-left ${form.material === d.value ? "border-green-600 bg-green-50 font-semibold" : "border-slate-200"}`}>
                <span>{d.icon}</span> {d.label}
              </button>
            ))}
          </div>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Quantity, e.g. '~10 tractor loads'"
            value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <textarea className="w-full rounded-md border border-slate-300 px-3 py-2" rows={2} placeholder="Condition notes, loading help, …"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <GeoPicker value={geo} onChange={setGeo} />
          <select className="rounded-md border border-slate-300 px-3 py-2" value={form.wardId} onChange={(e) => setForm({ ...form, wardId: e.target.value })}>
            <option value="">Ward</option>
            {WARDS.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
          </select>
          <PhotoInput photos={photo} onChange={setPhoto} max={1} label="Add photo (optional)" />
          {error && <p className="rounded-md bg-red-50 p-3 text-red-700">{error}</p>}
          <button onClick={submit} className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800">Publish listing</button>
        </section>
      )}

      {!listings && <p className="text-slate-500">Loading…</p>}
      {listings?.map((l) => (
        <article key={l.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex gap-4">
              {l.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.photo} alt="listing" className="h-20 w-20 rounded-lg border object-cover" />
              )}
              <div>
                <h2 className="font-semibold">{l.title}</h2>
                <p className="text-sm text-slate-600">{l.description}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {wardName(l.wardId)} · {l.location.label || `${l.location.lat.toFixed(4)}, ${l.location.lng.toFixed(4)}`} · {new Date(l.postedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={l.status} />
              <span className="text-xs text-slate-500">{l.quantity}</span>
              {l.status === "available" && (
                <button onClick={() => take(l.id)} className="rounded-md border border-green-700 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50">
                  I&apos;ll take it
                </button>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
