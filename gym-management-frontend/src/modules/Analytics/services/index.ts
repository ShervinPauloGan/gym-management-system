import { api } from "@/shared/lib/api";

export const analyticsService = {
  getStats() { return api.get("/analytics"); },
};
