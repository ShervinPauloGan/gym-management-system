export const MEMBER_TIERS = [
  { value: "walk-in", label: "Walk-in", discount: 0, pointsPerCheckIn: 0 },
  { value: "silver", label: "Silver", discount: 0.2, pointsPerCheckIn: 3 },
  { value: "gold", label: "Gold", discount: 0.25, pointsPerCheckIn: 5 },
] as const;
