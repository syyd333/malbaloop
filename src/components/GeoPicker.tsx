"use client";

import { useState } from "react";
import type { GeoPoint } from "@/lib/types";

export default function GeoPicker({
  value,
  onChange,
}: {
  value: GeoPoint | null;
  onChange: (p: GeoPoint | null) => void;
}) {
  const [status, setStatus] = useState<"idle" | "locating" | "error">("idle");
  const [manual, setManual] = useState({ lat: "", lng: "", label: "" });

  function locate() {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus("idle");
        onChange({
          lat: Math.round(pos.coords.latitude * 1e5) / 1e5,
          lng: Math.round(pos.coords.longitude * 1e5) / 1e5,
          label: value?.label ?? "Detected by device",
        });
      },
      () => setStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={locate}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          📍 {status === "locating" ? "Locating…" : "Use my location"}
        </button>
        {value && (
          <span className="text-sm text-green-700">
            Geo-tag set: {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
          </span>
        )}
        {status === "error" && (
          <span className="text-sm text-red-600">Could not get GPS — enter coordinates manually below.</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <input
          className="w-28 rounded-md border border-slate-300 px-2 py-1.5"
          placeholder="lat (17.43)"
          inputMode="decimal"
          value={manual.lat}
          onChange={(e) => setManual({ ...manual, lat: e.target.value })}
        />
        <input
          className="w-28 rounded-md border border-slate-300 px-2 py-1.5"
          placeholder="lng (78.41)"
          inputMode="decimal"
          value={manual.lng}
          onChange={(e) => setManual({ ...manual, lng: e.target.value })}
        />
        <input
          className="w-64 flex-1 rounded-md border border-slate-300 px-2 py-1.5"
          placeholder="Landmark / address (optional)"
          value={manual.label}
          onChange={(e) => setManual({ ...manual, label: e.target.value })}
        />
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-100"
          onClick={() => {
            const lat = parseFloat(manual.lat);
            const lng = parseFloat(manual.lng);
            if (Number.isFinite(lat) && Number.isFinite(lng)) {
              onChange({ lat, lng, label: manual.label || "Manual pin" });
            }
          }}
        >
          Set manually
        </button>
      </div>
    </div>
  );
}
