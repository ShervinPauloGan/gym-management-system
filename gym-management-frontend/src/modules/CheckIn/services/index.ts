import { api } from "@/shared/lib/api";

export const checkInService = {
  scan(qrCodeToken: string) { return api.post("/check-in", { qrCodeToken }); },
};
