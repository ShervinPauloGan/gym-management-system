import { api } from "@/shared/lib/api";

export const checkInService = {
  scan(qrCodeToken: string) {
    return api.post("/check-in", { qrCodeToken });
  },
  getTodayLogs() {
    return api.get("/check-in/today");
  },
};
