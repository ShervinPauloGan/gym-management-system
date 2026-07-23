import { Router } from "express";
import { prisma } from "../../../database";

const router = Router();

router.get("/stats", async (_req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalMembers, todayCheckIns, monthCheckIns, activeMemberships, totalRevenue] = await Promise.all([
      prisma.user.count({ where: { role: "member" } }),
      prisma.checkInLog.count({ where: { checkInTime: { gte: todayStart } } }),
      prisma.checkInLog.count({ where: { checkInTime: { gte: monthStart } } }),
      prisma.membership.count({ where: { status: "active", expirationDate: { gte: now } } }),
      prisma.membership.count(),
    ]);

    res.json({ totalMembers, todayCheckIns, monthCheckIns, activeMemberships, totalRevenue });
  } catch (err) {
    next(err);
  }
});

router.get("/trends", async (_req, res, next) => {
  try {
    const days = 30;
    const data: { date: string; checkIns: number; registrations: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(start.getTime() + 86400000);

      const [checkIns, registrations] = await Promise.all([
        prisma.checkInLog.count({ where: { checkInTime: { gte: start, lt: end } } }),
        prisma.user.count({ where: { role: "member", createdAt: { gte: start, lt: end } } }),
      ]);

      data.push({ date: start.toISOString().slice(0, 10), checkIns, registrations });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/leaderboard", async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "member" },
      include: { _count: { select: { checkInLogs: true } } },
      orderBy: { checkInLogs: { _count: "desc" } },
      take: 10,
    });

    res.json(users.map((u) => ({ id: u.id, fullName: u.fullName, tier: u.tier, checkIns: u._count.checkInLogs })));
  } catch (err) {
    next(err);
  }
});

router.get("/recent", async (_req, res, next) => {
  try {
    const members = await prisma.user.findMany({
      where: { role: "member" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, fullName: true, email: true, tier: true, createdAt: true },
    });

    res.json(members);
  } catch (err) {
    next(err);
  }
});

export { router as analyticsRouter };
