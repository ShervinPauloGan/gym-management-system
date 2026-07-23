import { api } from "@/shared/lib/api";

export const redeemShopService = {
  getAll() {
    return api.get("/redeem");
  },
  create(data: { itemName: string; pointsCost: number; stockQuantity: number; description?: string }) {
    return api.post("/redeem", data);
  },
  update(id: string, data: Record<string, unknown>) {
    return api.put(`/redeem/${id}`, data);
  },
  remove(id: string) {
    return api.delete(`/redeem/${id}`);
  },
  redeem(itemId: string) {
    return api.post("/redeem/redeem", { itemId });
  },
};
