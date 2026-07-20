export const POINTS_PER_CHECKIN: Record<string, number> = {
  "walk-in": 0,
  silver: 3,
  gold: 5,
};

export const TIER_DISCOUNTS: Record<string, number> = {
  "walk-in": 0,
  silver: 0.2,
  gold: 0.25,
};

export const TIER_VISIT_PRICES: Record<string, number> = {
  "walk-in": 80,
  silver: 64,
  gold: 60,
};

export const PLAN_DURATION_MAP: Record<string, number> = {
  monthly: 30,
  "semi-annual": 180,
  annual: 365,
};

export const PLAN_PRICES: Record<string, number> = {
  monthly: 1500,
  "semi-annual": 7500,
  annual: 13500,
};

export const EXPIRY_WARNING_DAYS = 7;
export const EXPIRY_CRITICAL_DAYS = 1;
export const QR_CODE_LENGTH = 32;
export const BCRYPT_SALT_ROUNDS = 10;
export const JWT_EXPIRES_IN = "7d";
export const PAGINATION_DEFAULT_PAGE = 1;
export const PAGINATION_DEFAULT_LIMIT = 20;
