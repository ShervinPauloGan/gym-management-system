import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../../database";
import { AppError } from "../../../middleware/error.middleware";

const router = Router();

const createMemberSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  tier: z.enum(["walk-in", "silver", "gold"]),
});

router.post("/", async (req, res, next) => {
  try {
    const data = createMemberSchema.parse(req.body);
    const qrCodeToken = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email || null,
        tier: data.tier,
        qrCodeToken,
        role: "member",
      },
    });

    res.status(201).json(user);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed" });
    }
    next(err);
  }
});

export { router as registrationRouter };
