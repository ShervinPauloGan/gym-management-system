import { Router } from "express";
import { planShopController } from "../app/planShop.controller";

const router = Router();

router.get("/", planShopController.list);
router.get("/:id", planShopController.getById);
router.post("/", planShopController.create);
router.put("/:id", planShopController.update);
router.delete("/:id", planShopController.remove);

export { router as planShopRouter };
