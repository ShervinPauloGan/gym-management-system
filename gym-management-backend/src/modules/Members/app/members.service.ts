import { prisma } from "../../../database";
import { AppError } from "../../../middleware/error.middleware";

export interface MemberFilters {
  page?: number;
  limit?: number;
  q?: string;
  tier?: string;
}

export class MembersService {
  async findAll(filters: MemberFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { role: "member" };

    if (filters.q) {
      where.OR = [
        { fullName: { contains: filters.q, mode: "insensitive" } },
        { email: { contains: filters.q, mode: "insensitive" } },
        { qrCodeToken: { contains: filters.q, mode: "insensitive" } },
      ];
    }

    if (filters.tier) {
      where.tier = filters.tier;
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          tier: true,
          pointsBalance: true,
          qrCodeToken: true,
          role: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        memberships: { include: { plan: true }, orderBy: { createdAt: "desc" } },
        checkInLogs: { orderBy: { checkInTime: "desc" }, take: 10 },
      },
    });

    if (!user || user.role !== "member") {
      throw new AppError(404, "Member not found");
    }

    return user;
  }

  async create(data: { fullName: string; email?: string; tier: string }) {
    const qrCodeToken = `qr_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

    return prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email || null,
        tier: data.tier,
        qrCodeToken,
        role: "member",
      },
      select: { id: true, fullName: true, email: true, tier: true, qrCodeToken: true, createdAt: true },
    });
  }

  async update(id: string, data: { fullName?: string; email?: string; tier?: string }) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== "member") {
      throw new AppError(404, "Member not found");
    }

    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, fullName: true, email: true, tier: true, qrCodeToken: true },
    });
  }

  async remove(id: string) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== "member") {
      throw new AppError(404, "Member not found");
    }

    await prisma.user.delete({ where: { id } });
  }
}
