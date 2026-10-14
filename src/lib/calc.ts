import {
  DENSITY_RANGE,
  DUMPING_FINE,
  PLANT_FEE_MAX,
  PLANT_FEE_MID,
  PLANT_FEE_MIN,
  PLANTS,
  TRANSPORTERS,
} from "./constants";
import type { DebrisType, JobEstimate, Plant, Quote } from "./types";

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

export function tonnageRange(type: DebrisType, volumeM3: number) {
  const d = DENSITY_RANGE[type];
  const round = (x: number) => Math.round(x * 10) / 10;
  return { min: round(volumeM3 * d.min), max: round(volumeM3 * d.max) };
}

export function plantFeeRange(tonnes: number) {
  const round = Math.round.bind(Math);
  return {
    min: round(tonnes * PLANT_FEE_MIN),
    max: round(tonnes * PLANT_FEE_MAX),
  };
}

export function nearestPlant(p: { lat: number; lng: number }): {
  plant: Plant;
  distanceKm: number;
} {
  let best = PLANTS[0];
  let bestKm = Infinity;
  for (const pl of PLANTS) {
    const km = haversineKm(p, pl);
    if (km < bestKm) {
      best = pl;
      bestKm = km;
    }
  }
  return { plant: best, distanceKm: bestKm };
}

export function estimate(job: {
  type: DebrisType;
  volumeM3: number;
  location: { lat: number; lng: number };
}): JobEstimate {
  const t = tonnageRange(job.type, job.volumeM3);
  const mid = (t.min + t.max) / 2;
  const fee = plantFeeRange(mid);
  const { plant, distanceKm } = nearestPlant(job.location);

  const quotes: Quote[] = TRANSPORTERS.map((tr) => {
    const carry = Math.max(
      tr.minCharge,
      Math.round(tr.ratePerTonne * mid + tr.perKm * distanceKm * 2)
    );
    return {
      transporterId: tr.id,
      name: tr.name,
      priceTotal: carry, // plant fee billed separately at the plant
      breakdown: { carry, plantFee: Math.round(mid * PLANT_FEE_MID) },
      etaHours: 4 + (distanceKm > 15 ? 6 : 2) + (tr.id === "t2" ? 3 : 0),
      capacityOk: tr.capacityTonne >= t.max,
    };
  }).sort((a, b) => a.priceTotal - b.priceTotal);

  return {
    tonnesMin: t.min,
    tonnesMax: t.max,
    feeMin: fee.min,
    feeMax: fee.max,
    plant,
    distanceKm,
    quotes,
    fineIfCaught: DUMPING_FINE,
  };
}
