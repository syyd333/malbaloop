"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { wardName } from "@/lib/constants";
import type { Complaint } from "@/lib/types";

const KIND_LABEL: Record<string, string> = {
  created: "Filed",
  status: "Update",
  resolution: "Resolved",
  reopen: "Reopened",
};

export default function ComplaintDetail({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (id) load(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load(cid: string) {
    const res = await fetch(`/api/complaints/${cid}`);
    if (res.ok) setComplaint((await res.json()).complaint);
    else setError("Complaint not found (or server restarted — demo data is in-memory).");
  }

  async function reopen() {
    if (!id) return;
    setBusy(true);
    const res = await fetch(`/api/complaints/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ by: "citizen", text: reason || "Reopened: site not actually cleared." }),
    });
    setBusy(false);
    setReopenOpen(false);
    setReason("");
    if (res.ok) load(id);
    else setError("Could not reopen complaint.");
  }

  if (!complaint) {
    return error ? <p className="mx-auto max-w-2xl rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</p> : <p className="text-slate-500">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/complaints" className="text-sm text-slate-500 hover:underline">← All complaints</Link>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{complaint.id}</h1>
          <p className="text-sm text-slate-500">
            {wardName(complaint.wardId)} · {complaint.location.label || `${complaint.location.lat.toFixed(4)}, ${complaint.location.lng.toFixed(4)}`}
            {" · "}geo-tag {complaint.location.lat.toFixed(5)}, {complaint.location.lng.toFixed(5)}
          </p>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      {complaint.photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={complaint.photo} alt="complaint site" className="max-h-96 rounded-xl border object-cover" />
      )}
      <p className="text-slate-700">{complaint.description}</p>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 font-semibold">Timeline &amp; status updates</h2>
        <ol className="space-y-4">
          {complaint.timeline.map((t, i) => (
            <li key={i} className="border-l-2 border-slate-200 pl-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold">{KIND_LABEL[t.kind] ?? t.kind}</span>
                <span className="text-xs text-slate-400">
                  {t.by === "citizen" ? "by citizen" : "by official"} · {new Date(t.at).toLocaleString()}
                </span>
              </div>
              {t.text && <p className="mt-0.5 text-sm text-slate-600">{t.text}</p>}
              {t.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.photo} alt="photo of the fix" className="mt-2 max-h-64 rounded-lg border object-cover" />
              )}
            </li>
          ))}
        </ol>
      </section>

      {complaint.status === "resolved" && (
        <section className="rounded-xl border border-amber-300 bg-amber-50 p-5">
          <h2 className="font-semibold">Is it actually fixed?</h2>
          <p className="mt-1 mb-3 text-sm text-amber-900">
            If the site still looks wrong, reopen the complaint — it goes back to the officials with your reason.
          </p>
          {reopenOpen ? (
            <div className="space-y-2">
              <textarea
                className="w-full rounded-md border border-amber-300 px-3 py-2 text-sm"
                rows={2}
                placeholder="Why are you reopening this?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <button onClick={reopen} disabled={busy} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {busy ? "Reopening…" : "Reopen complaint"}
              </button>
              <button onClick={() => setReopenOpen(false)} className="ml-2 text-sm text-slate-500 underline">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setReopenOpen(true)} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
              Reopen complaint
            </button>
          )}
        </section>
      )}
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
