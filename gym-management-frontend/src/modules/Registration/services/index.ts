import { api } from "@/shared/lib/api";

export const registrationService = {
  create(data: { fullName: string; email?: string; tier: string }) {
    return api.post("/registration", data);
  },
};
