import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "MalbaLoop — construction debris, with proof",
  description:
    "Post debris, compare authorised disposal options, and get a weighbridge-verified disposal receipt. Plus geo-tagged dumping complaints and a ward dashboard.",
};

const nav = [
  { href: "/", label: "Home" },
  { href: "/post", label: "Post Debris" },
  { href: "/jobs", label: "My Jobs" },
  { href: "/listings", label: "Reuse Listings" },
  { href: "/complaints", label: "Complaints" },
  { href: "/official", label: "Official Dashboard" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="border-b border-slate-200 bg-white no-print">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              Malba<span className="text-green-700">Loop</span>
            </Link>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
              Prototype · demo data
            </span>
            <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="text-slate-600 hover:text-slate-900">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-8 text-xs text-slate-400 no-print">
          Prototype. Plant names, transporters, wards and hotspot figures are demo data; fees reflect
          2025 reporting (₹405–435/tonne) and current official figures should be confirmed before use.
        </footer>
      </body>
    </html>
  );
}
