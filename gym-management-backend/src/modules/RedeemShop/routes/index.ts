import { Router } from "express";
import { prisma } from "../../../database";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const items = await prisma.redeemShop.findMany({
      where: { isAvailable: true },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

export { router as redeemShopRouter };
