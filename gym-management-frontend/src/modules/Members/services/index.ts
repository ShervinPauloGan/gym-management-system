import { api } from "@/shared/lib/api";

export const membersService = {
  getAll() { return api.get("/members"); },
};
