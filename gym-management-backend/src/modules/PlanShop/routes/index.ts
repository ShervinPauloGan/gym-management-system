import { Router } from "express";
import { prisma } from "../../../database";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const plans = await prisma.planShop.findMany({
      where: { isActive: true },
    });
    res.json(plans);
  } catch (err) {
    next(err);
  }
});

export { router as planShopRouter };
