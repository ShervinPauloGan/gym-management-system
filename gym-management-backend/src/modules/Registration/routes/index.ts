import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../../database";
import { AppError } from "../../../middleware/error.middleware";

const router = Router();

const registerSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  tier: z.enum(["walk-in", "silver", "gold"]),
  planId: z.string().uuid().optional(),
});

router.post("/", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const qrCodeToken = `qr_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: data.fullName,
          email: data.email || null,
          tier: data.tier,
          qrCodeToken,
          role: "member",
        },
      });

      if (data.planId) {
        const plan = await tx.planShop.findUnique({ where: { id: data.planId } });
        if (!plan || !plan.isActive) throw new AppError(400, "Invalid or inactive plan");

        await tx.membership.create({
          data: {
            userId: user.id,
            planId: plan.id,
            startDate: new Date(),
            expirationDate: new Date(Date.now() + plan.durationDays * 86400000),
            status: "active",
          },
        });
      }

      return user;
    });

    res.status(201).json(result);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors });
    next(err);
  }
});

export { router as registrationRouter };
