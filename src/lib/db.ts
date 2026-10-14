// In-memory DB (module-level; survives HMR via globalThis).
// Prototype only: no persistence beyond the dev-server process.
import type { Complaint, DebrisJob, Listing } from "./types";
import { wardName } from "./constants";

let counter = 2000;
const nextId = (p: string) => `${p}-${++counter}`;

interface Store {
  jobs: DebrisJob[];
  complaints: Complaint[];
  listings: Listing[];
}

function seed(): Store {
  const now = Date.now();
  const ago = (h: number) => new Date(now - h * 36e5).toISOString();

  const receipt = (jobId: string, slipNo: string, net: number, h: number) => {
    const issuedAt = ago(h);
    return {
      id: nextId("rec"),
      jobId,
      plantId: "plant-jeedimetla",
      slipNo,
      netTonnes: net,
      plantFee: Math.round(net * 420),
      issuedAt,
      verifiedByPlant: true,
    };
  };

  const jobs: DebrisJob[] = [
    {
      id: "job-1001",
      createdAt: ago(48),
      photos: [],
      type: "concrete_brick",
      volumeM3: 6,
      location: { lat: 17.518, lng: 78.469, label: "Balanagar, near IDPL road" },
      wardId: "w4",
      status: "receipted",
      acceptedQuote: { transporterId: "t2", priceTotal: 9400, acceptedAt: ago(47) },
      receipt: receipt("job-1001", "SLIP-4471", 7.9, 40),
    },
    {
      id: "job-1002",
      createdAt: ago(30),
      photos: [],
      type: "tiles",
      volumeM3: 2.5,
      location: { lat: 17.431, lng: 78.415, label: "Jubilee Hills, Road No. 45" },
      wardId: "w1",
      status: "receipted",
      acceptedQuote: { transporterId: "t3", priceTotal: 3200, acceptedAt: ago(29) },
      receipt: receipt("job-1002", "SLIP-4482", 3.6, 18),
    },
    {
      id: "job-1003",
      createdAt: ago(6),
      photos: [],
      type: "soil",
      volumeM3: 10,
      location: { lat: 17.487, lng: 78.405, label: "Kukatpally, Phase 3 shop fit-out" },
      wardId: "w2",
      status: "accepted",
      acceptedQuote: { transporterId: "t1", priceTotal: 6150, acceptedAt: ago(5) },
      receipt: null,
    },
  ];

  const complaints: Complaint[] = [
    {
      id: "cmp-5001",
      createdAt: ago(72),
      description:
        "Two truckloads of construction debris dumped overnight at the nala bend, blocking half the stormwater channel.",
      photo: undefined,
      location: { lat: 17.432, lng: 78.419, label: "Road No. 12, near nala bend" },
      wardId: "w1",
      status: "reopened",
      reopenCount: 1,
      resolutionPhoto: undefined,
      resolutionNote: "Site cleared by tractor loader (earlier attempt).",
      resolvedAt: ago(40),
      timeline: [
        { at: ago(72), by: "citizen", kind: "created", text: "Complaint filed with geo-tagged photo." },
        { at: ago(69), by: "official", kind: "status", text: "Acknowledged; forwarded to field team." },
        { at: ago(40), by: "official", kind: "resolution", text: "Site cleared by tractor loader.", photo: undefined },
        { at: ago(20), by: "citizen", kind: "reopen", text: "Reopening: debris is back at the same spot, worse than before." },
      ],
    },
    {
      id: "cmp-5002",
      createdAt: ago(26),
      description: "Tiles and mortar waste piled on the footpath between metro pillar 118 and the school gate.",
      photo: undefined,
      location: { lat: 17.391, lng: 78.549, label: "Uppal Junction, layout perimeter" },
      wardId: "w6",
      status: "in_progress",
      reopenCount: 0,
      timeline: [
        { at: ago(26), by: "citizen", kind: "created", text: "Complaint filed." },
        { at: ago(24), by: "official", kind: "status", text: "Acknowledged." },
        { at: ago(8), by: "official", kind: "status", text: "Sanitation vehicle assigned; pickup scheduled." },
      ],
    },
    {
      id: "cmp-5003",
      createdAt: ago(4),
      description: "Fresh soil and bricks dumped on the open plot next to Khajaguda drain.",
      photo: undefined,
      location: { lat: 17.411, lng: 78.318, label: "Khajaguda stormwater drain" },
      wardId: "w3",
      status: "submitted",
      reopenCount: 0,
      timeline: [{ at: ago(4), by: "citizen", kind: "created", text: "Complaint filed." }],
    },
  ];

  const listings: Listing[] = [
    {
      id: "lst-7001",
      title: "Clean red bricks from interior demolition",
      material: "concrete_brick",
      description: "About 400 intact bricks, no mortar attached. Collect from the service lane.",
      quantity: "~400 bricks",
      location: { lat: 17.43, lng: 78.41, label: "Jubilee Hills, Road No. 36" },
      wardId: "w1",
      postedAt: ago(20),
      status: "available",
    },
    {
      id: "lst-7002",
      title: "Fill soil from basement excavation",
      material: "soil",
      description: "12 tractor loads of dry fill soil. Free to anyone who hauls it; can load with JCB.",
      quantity: "~12 tractor loads",
      location: { lat: 17.445, lng: 78.362, label: "Gachibowli, near old service road" },
      wardId: "w3",
      postedAt: ago(9),
      status: "available",
    },
    {
      id: "lst-7003",
      title: "Rebar off-cuts and old steel door frames",
      material: "metal",
      description: "About 60 kg of rebar off-cuts and 4 steel door frames. Good for scrap re-rollers.",
      quantity: "~60 kg + 4 frames",
      location: { lat: 17.522, lng: 78.471, label: "Balanagar, near depot" },
      wardId: "w4",
      postedAt: ago(52),
      status: "taken",
    },
  ];

  return { jobs, complaints, listings };
}

const g = globalThis as unknown as { __malbaStore?: Store };
export const db: Store = g.__malbaStore ?? seed();
g.__malbaStore = db;

export function listJobs(): DebrisJob[] {
  return [...db.jobs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function getJob(id: string): DebrisJob | undefined {
  return db.jobs.find((j) => j.id === id);
}
export function createJob(input: Omit<DebrisJob, "id" | "createdAt" | "status" | "acceptedQuote" | "receipt">): DebrisJob {
  const job: DebrisJob = { ...input, id: nextId("job"), createdAt: new Date().toISOString(), status: "posted", acceptedQuote: null, receipt: null };
  db.jobs.push(job);
  return job;
}
export function acceptQuote(jobId: string, transporterId: string, priceTotal: number): DebrisJob | undefined {
  const job = getJob(jobId);
  if (!job) return undefined;
  job.status = "accepted";
  job.acceptedQuote = { transporterId, priceTotal, acceptedAt: new Date().toISOString() };
  return job;
}

export function issueReceipt(jobId: string, plantId: string, slipNo: string, netTonnes: number, plantFee: number): DebrisJob | undefined {
  const job = getJob(jobId);
  if (!job) return undefined;
  const rec = {
    id: nextId("rec"),
    jobId,
    plantId,
    slipNo,
    netTonnes,
    plantFee,
    issuedAt: new Date().toISOString(),
    verifiedByPlant: true,
  };
  job.receipt = rec;
  job.status = "receipted";
  return job;
}

export function listListings(): Listing[] {
  return [...db.listings].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}
export function createListing(input: Omit<Listing, "id" | "postedAt" | "status">): Listing {
  const l: Listing = { ...input, id: nextId("lst"), postedAt: new Date().toISOString(), status: "available" };
  db.listings.unshift(l);
  return l;
}
export function takeListing(id: string): Listing | undefined {
  const l = db.listings.find((x) => x.id === id);
  if (l) l.status = "taken";
  return l;
}

export function listComplaints(): Complaint[] {
  return [...db.complaints].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function getComplaint(id: string): Complaint | undefined {
  return db.complaints.find((c) => c.id === id);
}
export function createComplaint(input: Pick<Complaint, "description" | "location" | "wardId" | "photo">): Complaint {
  const c: Complaint = {
    ...input,
    id: nextId("cmp"),
    createdAt: new Date().toISOString(),
    status: "submitted",
    reopenCount: 0,
    timeline: [
      { at: new Date().toISOString(), by: "citizen", kind: "created", text: "Complaint filed with geo-tagged photo" },
    ],
  };
  db.complaints.unshift(c);
  return c;
}
export function addTimeline(c: Complaint, entry: Complaint["timeline"][number]) {
  c.timeline.push(entry);
}
export function setComplaintStatus(id: string, status: Complaint["status"], by: "official" | "citizen", text: string) {
  const c = getComplaint(id);
  if (!c) return undefined;
  // Citizen-driven reopen
  if (status === "reopened") {
    c.status = "reopened";
    c.reopenCount += 1;
    c.resolvedAt = undefined;
    addTimeline(c, { at: new Date().toISOString(), by: "citizen", kind: "reopen", text });
    return c;
  }
  // Official cadence
  c.status = status;
  if (status === "resolved") c.resolvedAt = new Date().toISOString();
  addTimeline(c, { at: new Date().toISOString(), by, kind: "status", text });
  return c;
}
export function resolveComplaint(id: string, note: string, photo?: string) {
  const c = getComplaint(id);
  if (!c) return undefined;
  c.status = "resolved";
  c.resolutionPhoto = photo;
  c.resolutionNote = note;
  c.resolvedAt = new Date().toISOString();
  addTimeline(c, { at: c.resolvedAt, by: "official", kind: "resolution", text: note, photo });
  return c;
}

export { wardName };
