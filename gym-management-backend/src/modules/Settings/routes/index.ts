import { Router } from "express";
import { prisma } from "../../../database";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const settings = await prisma.user.findMany({
      where: { role: "admin" },
      select: { fullName: true, email: true },
      take: 1,
    });
    res.json({ gymName: "GYM ENGINE", timezone: "Asia/Manila", admin: settings[0] || null });
  } catch (err) {
    next(err);
  }
});

export { router as settingsRouter };
