"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import PhotoInput from "@/components/PhotoInput";
import { HOTSPOTS, WARDS, wardName } from "@/lib/constants";
import type { Complaint, DebrisJob, Hotspot } from "@/lib/types";

interface ResolutionForm {
  note: string;
  photo: string[];
}

export default function OfficialDashboard() {
  const [jobs, setJobs] = useState<DebrisJob[] | null>(null);
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);
  const [forms, setForms] = useState<Record<string, ResolutionForm>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [j, c] = await Promise.all([fetch("/api/jobs").then((r) => r.json()), fetch("/api/complaints").then((r) => r.json())]);
    setJobs(j.jobs);
    setComplaints(c.complaints);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function act(id: string, body: object) {
    setBusy(id);
    await fetch(`/api/complaints/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(null);
    load();
  }

  // Receipts grouped by ward
  const byWard = new Map<string, { count: number; tonnes: number; fee: number }>();
  for (const j of jobs ?? []) {
    if (!j.receipt) continue;
    const cell = byWard.get(j.wardId) ?? { count: 0, tonnes: 0, fee: 0 };
    cell.count += 1;
    cell.tonnes += j.receipt.netTonnes;
    cell.fee += j.receipt.plantFee;
    byWard.set(j.wardId, cell);
  }
  const hotspotWard = (h: Hotspot) => byWard.get(h.wardId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Municipal dashboard</h1>
        <p className="text-sm text-slate-600">Receipts by ward next to dumping hotspots — target enforcement where receipts are thin and hotspots hot.</p>
      </div>

      <section>
        <h2 className="mb-3 font-semibold">Receipts by ward</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-2">Ward</th><th className="px-4 py-2">Receipts</th><th className="px-4 py-2">Tonnes to plant</th><th className="px-4 py-2">Plant fees (₹)</th></tr>
            </thead>
            <tbody>
              {WARDS.map((w) => {
                const cell = byWard.get(w.id);
                return (
                  <tr key={w.id} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">{w.name}</td>
                    <td className="px-4 py-2">{cell?.count ?? 0}</td>
                    <td className="px-4 py-2">{cell ? Math.round(cell.tonnes * 10) / 10 : 0}</td>
                    <td className="px-4 py-2">{cell ? cell.fee.toLocaleString("en-IN") : 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Dumping hotspots vs disposal activity</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {HOTSPOTS.map((h) => {
            const cell = hotspotWard(h);
            return (
              <div key={h.name} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
                <div className="font-semibold">{h.name}</div>
                <div className="text-xs text-slate-500">{wardName(h.wardId)} · 📍 {h.lat.toFixed(4)}, {h.lng.toFixed(4)}</div>
                <div className="mt-2 flex gap-4">
                  <span className="text-red-700">🔥 {h.reports} past dumping reports</span>
                  <span className="text-green-700">🧾 {cell ? `${cell.count} receipt(s) · ${Math.round(cell.tonnes * 10) / 10} t` : "no receipts yet — priority enforcement zone"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Complaints queue</h2>
        <div className="space-y-3">
          {complaints?.map((c) => {
            const f = forms[c.id] ?? { note: "", photo: [] };
            const setForm = (patch: Partial<ResolutionForm>) =>
              setForms({ ...forms, [c.id]: { ...f, ...patch } });
            return (
              <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link href={`/complaints/${c.id}`} className="font-semibold hover:underline">
                      {c.id} {c.reopenCount > 0 && <span className="text-xs text-red-600">reopened ×{c.reopenCount}</span>}
                    </Link>
                    <div className="max-w-xl text-sm text-slate-600">{c.description}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                {c.status === "submitted" && (
                  <button onClick={() => act(c.id, { by: "official", status: "acknowledged", text: "Acknowledged; forwarded to field team." })} disabled={busy === c.id}
                    className="mt-3 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
                    Acknowledge →
                  </button>
                )}
                {c.status === "acknowledged" && (
                  <button onClick={() => act(c.id, { by: "official", status: "in_progress", text: "Field team assigned." })} disabled={busy === c.id}
                    className="mt-3 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50">
                    Start work →
                  </button>
                )}
                {(c.status === "in_progress" || c.status === "reopened") && (
                  <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Upload a photo of the fix (required for proof), add a note, resolve.</p>
                    <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Resolution note"
                      value={f.note} onChange={(e) => setForm({ note: e.target.value })} />
                    <PhotoInput photos={f.photo} onChange={(p) => setForm({ photo: p })} max={1} label="Photo of the fix" />
                    <button onClick={() => act(c.id, { by: "official", status: "resolved", text: f.note || "Site cleared.", photo: f.photo[0] })}
                      disabled={busy === c.id}
                      className="rounded-md bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-50">
                      Mark resolved (with photo) →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
