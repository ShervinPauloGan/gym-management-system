import { api } from "@/shared/lib/api";

export const planShopService = {
  getAll() {
    return api.get("/plans");
  },
  create(data: { planName: string; durationDays: number; price: number; tier: string; description?: string }) {
    return api.post("/plans", data);
  },
  update(id: string, data: Record<string, unknown>) {
    return api.put(`/plans/${id}`, data);
  },
  remove(id: string) {
    return api.delete(`/plans/${id}`);
  },
};
