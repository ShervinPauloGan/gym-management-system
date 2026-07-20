import { api } from "@/shared/lib/api";

export const authService = {
  login(data: { email: string; password: string }) {
    return api.post("/auth/login", data);
  },
};
