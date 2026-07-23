import { Router } from "express";
import { redeemShopController } from "../app/redeemShop.controller";

const router = Router();

router.get("/", redeemShopController.list);
router.get("/:id", redeemShopController.getById);
router.post("/", redeemShopController.create);
router.put("/:id", redeemShopController.update);
router.delete("/:id", redeemShopController.remove);
router.post("/redeem", redeemShopController.redeem);

export { router as redeemShopRouter };
