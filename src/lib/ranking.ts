export type Tier = "confirmed" | "gathering" | "few" | "unverified";

export interface TierInfo {
  tier: Tier;
  label: string;
  badgeClass: string;
  markerColor: string;
}

// Thresholds on TeamBarLink.verificationCount. Tunable as real usage data comes in.
const CONFIRMED_THRESHOLD = 10;
const GATHERING_THRESHOLD = 3;

export function getTierInfo(verificationCount: number): TierInfo {
  if (verificationCount >= CONFIRMED_THRESHOLD) {
    return {
      tier: "confirmed",
      label: "Confirmed Fan Spot",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
      markerColor: "#059669",
    };
  }
  if (verificationCount >= GATHERING_THRESHOLD) {
    return {
      tier: "gathering",
      label: "Fans Gather Here",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
      markerColor: "#d97706",
    };
  }
  if (verificationCount >= 1) {
    return {
      tier: "few",
      label: "A Few Fans Go Here",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
      markerColor: "#64748b",
    };
  }
  return {
    tier: "unverified",
    label: "Not Yet Verified",
    badgeClass: "bg-slate-50 text-slate-400 border-slate-200",
    markerColor: "#cbd5e1",
  };
}
