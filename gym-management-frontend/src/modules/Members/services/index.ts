import { api } from "@/shared/lib/api";

export const membersService = {
  getAll(params?: { page?: number; limit?: number; q?: string; tier?: string }) {
    return api.get("/members", { params });
  },
  getById(id: string) {
    return api.get(`/members/${id}`);
  },
  create(data: { fullName: string; email?: string; tier: string }) {
    return api.post("/members", data);
  },
  update(id: string, data: { fullName?: string; email?: string; tier?: string }) {
    return api.put(`/members/${id}`, data);
  },
  remove(id: string) {
    return api.delete(`/members/${id}`);
  },
};
