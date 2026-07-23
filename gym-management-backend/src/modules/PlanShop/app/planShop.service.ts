import { prisma } from "../../../database";
import { AppError } from "../../../middleware/error.middleware";

export class PlanShopService {
  async findAll() {
    return prisma.planShop.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findById(id: string) {
    const plan = await prisma.planShop.findUnique({ where: { id } });
    if (!plan) throw new AppError(404, "Plan not found");
    return plan;
  }

  async create(data: { planName: string; durationDays: number; price: number; tier: string; description?: string }) {
    return prisma.planShop.create({
      data: {
        planName: data.planName,
        durationDays: data.durationDays,
        price: data.price,
        tier: data.tier,
        description: data.description || null,
      },
    });
  }

  async update(id: string, data: Partial<{ planName: string; durationDays: number; price: number; tier: string; description: string; isActive: boolean }>) {
    const existing = await prisma.planShop.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Plan not found");

    return prisma.planShop.update({ where: { id }, data });
  }

  async remove(id: string) {
    const existing = await prisma.planShop.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Plan not found");

    await prisma.planShop.delete({ where: { id } });
  }
}
