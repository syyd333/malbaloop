"use client";

import { useRef } from "react";

async function fileToDataUrl(file: File): Promise<string> {
  const img = new Image();
  const url = URL.createObjectURL(file);
  try {
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("could not read image"));
      img.src = url;
    });
    const max = 1000;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.7);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function PhotoInput({
  photos,
  onChange,
  max = 3,
  label = "Add photos",
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const out = [...photos];
    for (const f of Array.from(files)) {
      if (out.length >= max) break;
      if (!f.type.startsWith("image/")) continue;
      out.push(await fileToDataUrl(f));
    }
    onChange(out);
    if (ref.current) ref.current.value = "";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        {photos.map((p, i) => (
          <div key={i} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p} alt={`photo ${i + 1}`} className="h-24 w-24 rounded-lg border border-slate-200 object-cover" />
            <button
              type="button"
              onClick={() => onChange(photos.filter((_, j) => j !== i))}
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-slate-800 text-xs text-white"
              aria-label={`remove photo ${i + 1}`}
            >
              ✕
            </button>
          </div>
        ))}
        {photos.length < max && (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-xs text-slate-500 hover:border-slate-400"
          >
            <span className="text-xl">📷</span>
            {label}
          </button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-1 text-xs text-slate-400">Resized locally before upload. Max {max}.</p>
    </div>
  );
}
