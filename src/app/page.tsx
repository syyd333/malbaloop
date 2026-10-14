import Link from "next/link";

const pillars = [
  {
    href: "/post",
    icon: "🧱",
    title: "Post debris",
    body: "Upload photos, pick the type (concrete & brick, soil, tiles, metal) — the app shows a rough tonnage range.",
  },
  {
    href: "/post",
    icon: "⚖️",
    title: "Compare options",
    body: "Authorised transporter quotes next to the plant disposal fee — and next to the fine you risk when dumping.",
  },
  {
    href: "/post",
    icon: "🧾",
    title: "Disposal receipt",
    body: "The plant's weighbridge slip becomes a digital receipt per load. Physical proof, not a paper promise.",
  },
  {
    href: "/listings",
    icon: "♻️",
    title: "Reuse listings",
    body: "List salvageable bricks, doors, tiles, steel and fill soil so takers collect them before they become debris. Optional in v1.",
  },
  {
    href: "/official",
    icon: "📊",
    title: "Municipal dashboard",
    body: "Receipts by ward beside dumping hotspots, so enforcement can target the worst nalas first.",
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
          Construction &amp; demolition waste · Hyderabad (GHMC / Cyberabad / Malkajgiri)
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Malba in. Malba out. <span className="text-green-700">With proof.</span>
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          June 2026: Telangana banned open C&amp;D dumping within GHMC, Cyberabad and Malkajgiri limits, citing
          debris blocking drains and nalas and raising flood risk. Hyderabad has four C&amp;D recycling plants.
          2025 reporting shows low awareness and the ₹405–435/tonne disposal fee pushing people toward
          illegal dumping — 1,158 sites were flagged by January 2025, and fines collected after the fact
          (₹42.21 lakh in three months) punish but do not prevent.
        </p>
        <p className="mt-2 max-w-3xl text-slate-600">
          The gap: big builders can handle disposal, but small renovators and contractors have no easy,
          legal, <em>provable</em> way to move debris. MalbaLoop closes that loop.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/post" className="rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-800">
            Post debris now →
          </Link>
          <Link href="/complaints" className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold hover:bg-slate-100">
            Report a dumping site
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">How it works</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <Link
              key={p.title}
              href={p.href}
              className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-green-600 hover:shadow-sm"
            >
              <div className="text-2xl">{p.icon}</div>
              <h3 className="mt-2 font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{p.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <h2 className="font-bold">Policy angle (Track B — proposal)</h2>
        <p className="mt-1 max-w-3xl">
          Link renovation permits / contractor registration to disposal receipts: no receipt, no completion
          sign-off. This only works if the municipal body adopts it, so it is framed as a proposal — the
          dashboard shows what ward-level receipt data would look like if adopted.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        <h2 className="font-bold text-slate-900">Bonus module: reactive complaints</h2>
        <p className="mt-1 max-w-3xl">
          Modeled on civic complaint apps: citizens file geo-tagged photo complaints, get status updates, and
          can reopen complaints they consider unresolved; officials upload a photo of the fix. Useful — but
          reactive: it reports dumping after it happens. MalbaLoop&apos;s receipt loop is the preventive half.
        </p>
      </section>
    </div>
  );
}
