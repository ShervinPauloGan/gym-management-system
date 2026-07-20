import { Router } from "express";
import { prisma } from "../../../database";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const [totalMembers, activeCheckIns, totalRevenue] = await Promise.all([
      prisma.user.count({ where: { role: "member" } }),
      prisma.checkInLog.count({ where: { checkInTime: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
      prisma.membership.count({ where: { status: "active" } }),
    ]);

    res.json({ totalMembers, activeCheckIns, totalRevenue });
  } catch (err) {
    next(err);
  }
});

export { router as analyticsRouter };
