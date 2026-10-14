// MalbaLoop domain types (prototype, no auth)
export type DebrisType = "concrete_brick" | "soil" | "tiles" | "metal";

export type JobStatus = "posted" | "accepted" | "receipted";

export interface GeoPoint {
  lat: number;
  lng: number;
  label?: string; // free-text address the user typed
}

export interface Plant {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
}

export interface Transporter {
  id: string;
  name: string;
  ratePerTonne: number; // ₹ per tonne carrying
  perKm: number; // ₹ per km one-way trip
  minCharge: number;
  capacityTonne: number;
}

export interface Ward {
  id: string;
  name: string;
  circle: string;
  lat: number;
  lng: number;
}

export interface Hotspot {
  name: string;
  wardId: string;
  lat: number;
  lng: number;
  reports: number; // demo count of past dumping reports
}

export interface DisposalReceipt {
  id: string;
  jobId: string;
  plantId: string;
  slipNo: string;
  netTonnes: number;
  plantFee: number;
  issuedAt: string;
  verifiedByPlant: boolean;
}

export interface DebrisJob {
  id: string;
  createdAt: string;
  photos: string[]; // data URLs
  type: DebrisType;
  volumeM3: number; // user's rough volume estimate
  location: GeoPoint;
  wardId: string;
  status: JobStatus;
  acceptedQuote?: {
    transporterId: string;
    priceTotal: number;
    acceptedAt: string;
  } | null;
  receipt?: DisposalReceipt | null;
}

export interface Quote {
  transporterId: string;
  name: string;
  priceTotal: number; // incl. plant fee share/pickup breakdown below
  breakdown: { carry: number; plantFee: number };
  etaHours: number;
  capacityOk: boolean;
}

export interface JobEstimate {
  tonnesMin: number;
  tonnesMax: number;
  feeMin: number;
  feeMax: number;
  plant: Plant;
  distanceKm: number;
  quotes: Quote[];
  fineIfCaught: number;
}

export interface Listing {
  id: string;
  title: string;
  material: DebrisType;
  description: string;
  quantity: string; // free-form, e.g. "about 400 bricks"
  photo?: string; // data URL
  location: GeoPoint;
  wardId: string;
  postedAt: string;
  status: "available" | "taken";
}

export type ComplaintStatus =
  | "submitted"
  | "acknowledged"
  | "in_progress"
  | "resolved"
  | "reopened";

export interface TimelineEntry {
  at: string;
  by: "citizen" | "official";
  kind: "created" | "status" | "resolution" | "reopen";
  text?: string;
  photo?: string;
}

export interface Complaint {
  id: string;
  createdAt: string;
  description: string;
  photo?: string; // data URL (geo-tagged)
  location: GeoPoint;
  wardId: string;
  status: ComplaintStatus;
  reopenCount: number;
  timeline: TimelineEntry[];
  resolutionPhoto?: string;
  resolutionNote?: string;
  resolvedAt?: string;
}
