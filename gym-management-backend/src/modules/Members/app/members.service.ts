import { prisma } from "../../../database";

export class MembersService {
  async findAll() {
    return prisma.user.findMany({
      where: { role: "member" },
      orderBy: { createdAt: "desc" },
    });
  }
}
