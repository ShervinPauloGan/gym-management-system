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

    const user = await prisma.user.findUnique({
      where: { qrCodeToken },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const membership = await prisma.membership.findFirst({
      where: { userId: user.id, status: "active", expirationDate: { gte: new Date() } },
    });

    if (!membership) {
      throw new AppError(403, "No active membership");
    }

    const pointsEarned = POINTS_PER_CHECKIN[user.tier] || 0;

    await prisma.$transaction([
      prisma.checkInLog.create({
        data: { userId: user.id, pointsEarned },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { pointsBalance: { increment: pointsEarned } },
      }),
    ]);

    res.json({ granted: true, pointsEarned, user: { id: user.id, fullName: user.fullName, tier: user.tier } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid QR code" });
    }
    next(err);
  }
});

export { router as checkInRouter };
