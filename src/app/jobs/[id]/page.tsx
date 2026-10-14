"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import type { DebrisJob, DisposalReceipt, JobEstimate, Quote } from "@/lib/types";
import { DEBRIS_TYPE_LABEL, wardName } from "@/lib/constants";

interface Load {
  job: DebrisJob;
  estimate: JobEstimate;
}

const isNum = (x: unknown): x is number => typeof x === "number";

export default function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [data, setData] = useState<Load | null>(null);
  const [busy, setBusy] = useState(false);
  const [netInput, setNetInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const load = useCallback(async (jobId: string) => {
    const res = await fetch(`/api/jobs/${jobId}`);
    if (res.ok) {
      const d = (await res.json()) as Load;
      setData(d);
      setNetInput(((d.estimate.tonnesMin + d.estimate.tonnesMax) / 2).toFixed(1));
    } else {
      setError("Job not found or server restarted (demo data is in-memory).");
    }
  }, []);

  useEffect(() => {
    if (id && !data) load(id);
  }, [id, data, load]);

  async function accept(q: Quote) {
    if (!id) return;
    setBusy(true);
    const res = await fetch(`/api/jobs/${id}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transporterId: q.transporterId, priceTotal: q.priceTotal }),
    });
    setBusy(false);
    if (res.ok) load(id);
    else setError("Could not accept quote.");
  }

  async function weigh() {
    if (!id) return;
    const net = parseFloat(netInput);
    if (!isNum(net) || net <= 0) {
      setError("Enter the net weighbridge reading in tonnes.");
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/jobs/${id}/weighbridge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ netTonnes: net }),
    });
    setBusy(false);
    if (res.ok) load(id);
    else setError("Could not record weighbridge reading.");
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl space-y-3">
        {error ? (
          <>
            <p className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</p>
            <Link href="/jobs" className="underline">← Back to jobs</Link>
          </>
        ) : (
          <p className="text-slate-500">Loading job…</p>
        )}
      </div>
    );
  }

  const { job, estimate: est } = data;

  if (job.receipt) {
    return (
      <ReceiptView receipt={job.receipt} job={job} est={est} />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/jobs" className="text-sm text-slate-500 hover:underline">← My jobs</Link>
        <StatusBadge status={job.status} />
      </div>
      <h1 className="text-2xl font-bold">
        {DEBRIS_TYPE_LABEL[job.type]} · {job.volumeM3} m³
      </h1>
      <p className="text-sm text-slate-500 -mt-4">
        {job.location.label || `${job.location.lat.toFixed(4)}, ${job.location.lng.toFixed(4)}`} · {wardName(job.wardId)}
      </p>

      {job.photos.length > 0 && (
        <div className="flex gap-2">
          {job.photos.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={p} alt="debris" className="h-32 w-32 rounded-lg border object-cover" />
          ))}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm">
        <h2 className="mb-2 font-semibold">Estimate</h2>
        <ul className="space-y-1 text-slate-700">
          <li>Tonnage range: <strong>{est.tonnesMin}–{est.tonnesMax} t</strong></li>
          <li>Nearest plant: <strong>{est.plant.name}</strong> · {est.distanceKm} km away</li>
          <li>Plant disposal fee: <strong>₹{est.feeMin}–₹{est.feeMax}</strong> (₹405–435/t on net weight)</li>
          <li className="text-red-700">Illegal dumping: ₹{est.fineIfCaught} fine if caught — after the fact, and slush-risk.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 font-semibold">Authorised transporters (demo quotes)</h2>
        <div className="space-y-3">
          {est.quotes.map((q) => {
            const accepted = job.acceptedQuote?.transporterId === q.transporterId;
            return (
              <div key={q.transporterId} className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 ${accepted ? "border-green-600 bg-green-50" : "border-slate-200"}`}>
                <div className="text-sm">
                  <div className="font-semibold">{q.name} {!q.capacityOk && <span className="text-xs text-amber-600">(may need 2 trips at your tonnage)</span>}</div>
                  <div className="text-slate-500">
                    Total ₹{q.priceTotal} (carry) + plant fee at gate ₹{q.breakdown.plantFee} · ETA ~{q.etaHours}h
                  </div>
                </div>
                {job.status === "accepted" ? (
                  accepted ? <span className="text-sm font-semibold text-green-700">✓ Accepted</span> : null
                ) : (
                  <button onClick={() => accept(q)} disabled={busy} className="rounded-md bg-green-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50">
                    Accept quote
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {job.status === "accepted" && (
        <section className="rounded-xl border border-amber-300 bg-amber-50 p-5">
          <h2 className="mb-1 font-semibold">At the plant weighbridge</h2>
          <p className="mb-3 text-sm text-amber-900">
            Demo mode: in production the plant&apos;s weighbridge API posts the net weight when your load
            crosses the ramp. Here you enter the slip reading manually.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={netInput}
              onChange={(e) => setNetInput(e.target.value)}
              className="w-32 rounded-md border border-amber-300 px-3 py-2 text-sm"
            />
            <span className="text-sm">tonnes (net)</span>
            <button onClick={weigh} disabled={busy} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">
              {busy ? "Recording…" : "Record slip → generate receipt"}
            </button>
          </div>
        </section>
      )}

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}

function ReceiptView({
  receipt,
  job,
  est,
}: {
  receipt: DisposalReceipt;
  job: DebrisJob;
  est: JobEstimate;
}) {
  const ts = isNum(receipt.netTonnes) ? receipt.netTonnes : 0;
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between no-print">
        <Link href="/jobs" className="text-sm text-slate-500 hover:underline">← My jobs</Link>
        <button onClick={() => window.print()} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100">
          🖨 Print / save PDF
        </button>
      </div>

      <div className="rounded-2xl border-2 border-green-700 bg-white p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-green-700 pb-3">
          <div>
            <h1 className="text-2xl font-bold">Disposal receipt</h1>
            <p className="text-sm text-slate-500">MalbaLoop · weighbridge-verified</p>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-slate-400">Weighbridge slip</div>
            <div className="font-mono text-lg font-bold">{receipt.slipNo}</div>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <Dt label="Job" value={job.id} />
          <Dt label="Issued" value={new Date(receipt.issuedAt).toLocaleString()} />
          <Dt label="Material" value={DEBRIS_TYPE_LABEL[job.type]} />
          <Dt label="Ward" value={wardName(job.wardId)} />
          <Dt label="Plant" value={est.plant.name} />
          <Dt label="Transporter" value={job.acceptedQuote?.transporterId ?? "—"} />
          <Dt label="Net weight (tared)" value={`${ts} t`} bold />
          <Dt label="Plant fee charged" value={`₹${receipt.plantFee}`} bold />
        </dl>

        <div className="mt-4 border-t border-dashed border-slate-300 pt-3 text-xs text-slate-500">
          Plant-verified: {receipt.verifiedByPlant ? "✓ recorded at weighbridge — the printed slip is the physical proof" : "pending"}. This receipt is the digital counterpart of the weighbridge slip and satisfies disposal proof for the load above.
        </div>
      </div>

      <p className="no-print text-xs text-slate-400">
        Track B (proposal): with municipal adoption, this receipt could count toward renovation permit
        sign-off or contractor registration renewal.
      </p>
    </div>
  );
}

function Dt({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className={bold ? "font-bold text-green-800" : "font-medium"}>{value}</dd>
    </div>
  );
}
