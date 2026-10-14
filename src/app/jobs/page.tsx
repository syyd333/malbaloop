"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import type { DebrisJob } from "@/lib/types";
import { DEBRIS_TYPE_LABEL, wardName } from "@/lib/constants";

export default function JobsPage() {
  const [jobs, setJobs] = useState<DebrisJob[] | null>(null);

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs));
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">My debris jobs</h1>
      {!jobs && <p className="text-slate-500">Loading…</p>}
      {jobs && jobs.length === 0 && (
        <p className="text-slate-500">
          No jobs yet. <Link href="/post" className="underline text-green-700">Post your first debris load.</Link>
        </p>
      )}
      {jobs?.map((j) => (
        <Link
          key={j.id}
          href={`/jobs/${j.id}`}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4 hover:border-green-600"
        >
          <div>
            <div className="font-semibold">
              {DEBRIS_TYPE_LABEL[j.type]} · {j.volumeM3} m³
            </div>
            <div className="text-sm text-slate-500">
              {j.location.label || `${j.location.lat.toFixed(4)}, ${j.location.lng.toFixed(4)}`} · {wardName(j.wardId)} · {" "}
              {new Date(j.createdAt).toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {j.receipt && (
              <span className="text-xs text-green-700 font-medium">🧾 {j.receipt.slipNo}</span>
            )}
            <StatusBadge status={j.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}
