import { Router } from "express";
import { membersController } from "../app/members.controller";

const router = Router();

router.get("/", membersController.list);
router.get("/:id", membersController.getById);
router.post("/", membersController.create);
router.put("/:id", membersController.update);
router.delete("/:id", membersController.remove);

export { router as membersRouter };
