import { prisma } from "../../../database";
import { AppError } from "../../../middleware/error.middleware";

export class RedeemShopService {
  async findAll() {
    return prisma.redeemShop.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findById(id: string) {
    const item = await prisma.redeemShop.findUnique({ where: { id } });
    if (!item) throw new AppError(404, "Item not found");
    return item;
  }

  async create(data: { itemName: string; pointsCost: number; stockQuantity: number; description?: string }) {
    return prisma.redeemShop.create({
      data: {
        itemName: data.itemName,
        pointsCost: data.pointsCost,
        stockQuantity: data.stockQuantity,
        description: data.description || null,
      },
    });
  }

  async update(id: string, data: Partial<{ itemName: string; pointsCost: number; stockQuantity: number; description: string; isAvailable: boolean }>) {
    const existing = await prisma.redeemShop.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Item not found");
    return prisma.redeemShop.update({ where: { id }, data });
  }

  async remove(id: string) {
    const existing = await prisma.redeemShop.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Item not found");
    await prisma.redeemShop.delete({ where: { id } });
  }

  async redeem(userId: string, itemId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, "User not found");

    const item = await prisma.redeemShop.findUnique({ where: { id: itemId } });
    if (!item || !item.isAvailable) throw new AppError(404, "Item not found or unavailable");
    if (item.stockQuantity < 1) throw new AppError(400, "Item out of stock");
    if (user.pointsBalance < item.pointsCost) throw new AppError(400, "Insufficient points");

    const [redemption] = await prisma.$transaction([
      prisma.redemptionHistory.create({
        data: { userId, itemId, pointsSpent: item.pointsCost },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { pointsBalance: { decrement: item.pointsCost } },
      }),
      prisma.redeemShop.update({
        where: { id: itemId },
        data: { stockQuantity: { decrement: 1 } },
      }),
    ]);

    return redemption;
  }
}
