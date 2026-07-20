import { api } from "@/shared/lib/api";

export const settingsService = {
  get() { return api.get("/settings"); },
};
