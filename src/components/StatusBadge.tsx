const STYLES: Record<string, string> = {
  posted: "bg-slate-100 text-slate-700",
  submitted: "bg-blue-100 text-blue-800",
  acknowledged: "bg-indigo-100 text-indigo-800",
  in_progress: "bg-amber-100 text-amber-800",
  resolved: "bg-green-100 text-green-800",
  reopened: "bg-red-100 text-red-800",
  accepted: "bg-indigo-100 text-indigo-800",
  receipted: "bg-green-100 text-green-800",
  available: "bg-green-100 text-green-800",
  taken: "bg-slate-200 text-slate-600",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STYLES[status] ?? "bg-slate-100 text-slate-700"}`}>
      {status.replace("_", " ")}
    </span>
  );
}
