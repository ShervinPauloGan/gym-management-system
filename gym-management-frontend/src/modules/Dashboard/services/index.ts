import { api } from "@/shared/lib/api";

export const dashboardService = {
  getStats() {
    return api.get("/analytics");
  },
};
