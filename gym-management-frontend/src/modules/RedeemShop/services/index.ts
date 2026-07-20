import { api } from "@/shared/lib/api";

export const redeemShopService = {
  getAll() { return api.get("/redeem"); },
  redeem(itemId: string) { return api.post("/redeem/purchase", { itemId }); },
};
