import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../../database";
import { POINTS_PER_CHECKIN } from "../../../constants";
import { AppError } from "../../../middleware/error.middleware";

const router = Router();

const checkInSchema = z.object({
  qrCodeToken: z.string().min(1),
});

router.post("/", async (req, res, next) => {
  try {
    const { qrCodeToken } = checkInSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { qrCodeToken } });
    if (!user) throw new AppError(404, "User not found");

    const membership = await prisma.membership.findFirst({
      where: { userId: user.id, status: "active", expirationDate: { gte: new Date() } },
      include: { plan: { select: { planName: true } } },
    });

    if (!membership) throw new AppError(403, "No active membership");

    const pointsEarned = POINTS_PER_CHECKIN[user.tier] || 0;

    await prisma.$transaction([
      prisma.checkInLog.create({ data: { userId: user.id, pointsEarned } }),
      prisma.user.update({ where: { id: user.id }, data: { pointsBalance: { increment: pointsEarned } } }),
    ]);

    res.json({
      granted: true,
      pointsEarned,
      user: { id: user.id, fullName: user.fullName, tier: user.tier },
      membership: { planName: membership.plan.planName, expiresAt: membership.expirationDate },
    });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Invalid QR code" });
    next(err);
  }
});

router.get("/today", async (_req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await prisma.checkInLog.findMany({
      where: { checkInTime: { gte: today } },
      include: {
        user: {
          select: {
            fullName: true,
            tier: true,
            memberships: {
              where: { status: "active", expirationDate: { gte: new Date() } },
              select: { plan: { select: { planName: true } } },
              take: 1,
            },
          },
        },
      },
      orderBy: { checkInTime: "desc" },
      take: 50,
    });

    res.json(
      logs.map((log) => ({
        id: log.id,
        checkInTime: log.checkInTime,
        pointsEarned: log.pointsEarned,
        user: {
          fullName: log.user.fullName,
          tier: log.user.tier,
          planName: log.user.memberships[0]?.plan?.planName ?? "None",
        },
      })),
    );
  } catch (err) {
    next(err);
  }
});

router.get("/stats", async (_req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalToday, activeMembers] = await Promise.all([
      prisma.checkInLog.count({ where: { checkInTime: { gte: today } } }),
      prisma.membership.count({ where: { status: "active", expirationDate: { gte: new Date() } } }),
    ]);

    res.json({ totalToday, activeMembers });
  } catch (err) {
    next(err);
  }
});

export { router as checkInRouter };
