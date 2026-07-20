import { Router } from "express";
import { prisma } from "../../../database";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const members = await prisma.user.findMany({
      where: { role: "member" },
      select: { id: true, fullName: true, email: true, tier: true, pointsBalance: true, qrCodeToken: true, createdAt: true },
    });
    res.json(members);
  } catch (err) {
    next(err);
  }
});

export { router as membersRouter };
