import type { DebrisType, Hotspot, Plant, Transporter, Ward } from "./types";

// 2025 Telangana reporting: ₹405–435 per tonne plant disposal fee.
export const PLANT_FEE_MIN = 405;
export const PLANT_FEE_MAX = 435;
export const PLANT_FEE_MID = 420;

// Tier fine used by GHMC dumping drives (demo constant).
export const DUMPING_FINE = 5000;

export const DEBRIS_TYPES: { value: DebrisType; label: string; icon: string }[] = [
  { value: "concrete_brick", label: "Concrete & brick", icon: "🧱" },
  { value: "soil", label: "Soil / earth fill", icon: "🪨" },
  { value: "tiles", label: "Tiles & mortar", icon: "🏚️" },
  { value: "metal", label: "Metal scrap", icon: "🔩" },
];

export const DEBRIS_TYPE_LABEL: Record<DebrisType, string> = {
  concrete_brick: "Concrete & brick",
  soil: "Soil / earth fill",
  tiles: "Tiles & mortar",
  metal: "Metal scrap",
};

// Loose-mix bulk densities (t per m³) used for the rough tonnage range.
export const DENSITY_RANGE: Record<DebrisType, { min: number; max: number }> = {
  concrete_brick: { min: 1.2, max: 1.6 },
  soil: { min: 1.25, max: 1.5 },
  tiles: { min: 1.3, max: 1.7 },
  metal: { min: 0.15, max: 0.3 },
};

// Four C&D recycling plants in GHMC limits (demo coordinates).
export const PLANTS: Plant[] = [
  { id: "plant-jeedimetla", name: "Jeedimetla C&D Plant", area: "Jeedimetla / North-west", lat: 17.511, lng: 78.487 },
  { id: "plant-fathullaguda", name: "Fathullaguda C&D Plant", area: "Nagole / South-east", lat: 17.361, lng: 78.554 },
  { id: "plant-borabanda", name: "Borabanda C&D Plant", area: "Borabanda / Central-west", lat: 17.449, lng: 78.433 },
  { id: "plant-shastripuram", name: "Shastripuram C&D Plant", area: "Shastripuram / South-west", lat: 17.284, lng: 78.52 },
];

export const TRANSPORTERS: Transporter[] = [
  { id: "t1", name: "Debris Dash Logistics", ratePerTonne: 310, perKm: 28, minCharge: 900, capacityTonne: 12 },
  { id: "t2", name: "Hyd Haulage Co-op", ratePerTonne: 275, perKm: 34, minCharge: 1200, capacityTonne: 16 },
  { id: "t3", name: "GreenRake Transport", ratePerTonne: 360, perKm: 24, minCharge: 750, capacityTonne: 9 },
];

// A handful of demo wards (GHMC numbering approximated).
export const WARDS: Ward[] = [
  { id: "w1", name: "Jubilee Hills", circle: "Khairatabad", lat: 17.43, lng: 78.41 },
  { id: "w2", name: "Kukatpally", circle: "Kukatpally", lat: 17.485, lng: 78.407 },
  { id: "w3", name: "Gachibowli", circle: "Serilingampally", lat: 17.44, lng: 78.35 },
  { id: "w4", name: "Balanagar", circle: "Balanagar", lat: 17.52, lng: 78.47 },
  { id: "w5", name: "LB Nagar", circle: "LB Nagar", lat: 17.33, lng: 78.56 },
  { id: "w6", name: "Uppal", circle: "Uppal", lat: 17.395, lng: 78.55 },
];

export function wardName(id: string): string {
  return WARDS.find((w) => w.id === id)?.name ?? id;
}

// Demo dumping hotspots (from the 1,158-site stream, standalone coords).
export const HOTSPOTS: Hotspot[] = [
  { name: "Nala bend near Road No. 12", wardId: "w1", lat: 17.432, lng: 78.419, reports: 27 },
  { name: "Open plot behind KPHB Phase 3", wardId: "w2", lat: 17.488, lng: 78.402, reports: 41 },
  { name: "Stormwater drain at Khajaguda", wardId: "w3", lat: 17.411, lng: 78.318, reports: 33 },
  { name: "Railside vacant land, Balanagar", wardId: "w4", lat: 17.516, lng: 78.465, reports: 52 },
  { name: "Nala near LB Nagar metro pillars", wardId: "w5", lat: 17.328, lng: 78.565, reports: 19 },
  { name: "Layout perimeter, Uppal Junction", wardId: "w6", lat: 17.391, lng: 78.549, reports: 38 },
];
