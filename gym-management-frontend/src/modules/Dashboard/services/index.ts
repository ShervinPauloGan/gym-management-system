import { api } from "@/shared/lib/api";

export const dashboardService = {
  getStats() {
    return api.get("/analytics/stats");
  },
  getTrends() {
    return api.get("/analytics/trends");
  },
  getLeaderboard() {
    return api.get("/analytics/leaderboard");
  },
  getRecent() {
    return api.get("/analytics/recent");
  },
};
