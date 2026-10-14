"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { wardName } from "@/lib/constants";
import type { Complaint } from "@/lib/types";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);

  useEffect(() => {
    fetch("/api/complaints")
      .then((r) => r.json())
      .then((d) => setComplaints(d.complaints));
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dumping complaints</h1>
          <p className="text-sm text-slate-600">
            Geo-tagged photo complaints. Citizens can reopen anything marked resolved but still dirty.
            Reactive by design — MalbaLoop&apos;s receipt loop is the preventive half.
          </p>
        </div>
        <Link href="/complaints/new" className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800">
          + File a complaint
        </Link>
      </div>

      {!complaints && <p className="text-slate-500">Loading…</p>}
      {complaints?.map((c) => (
        <Link
          key={c.id}
          href={`/complaints/${c.id}`}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4 hover:border-green-600"
        >
          <div>
            <div className="line-clamp-2 max-w-xl font-medium">{c.description}</div>
            <div className="text-xs text-slate-400">
              {wardName(c.wardId)} · {c.location.label || `${c.location.lat.toFixed(4)}, ${c.location.lng.toFixed(4)}`} · {" "}
              {new Date(c.createdAt).toLocaleString()}
              {c.reopenCount > 0 && ` · reopened ×${c.reopenCount}`}
            </div>
          </div>
          <StatusBadge status={c.status} />
        </Link>
      ))}
    </div>
  );
}
