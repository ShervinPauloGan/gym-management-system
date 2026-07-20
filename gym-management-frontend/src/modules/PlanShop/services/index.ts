import { api } from "@/shared/lib/api";

export const planShopService = {
  getAll() { return api.get("/plans"); },
};
