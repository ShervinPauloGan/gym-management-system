import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "Settings module" });
});

export { router as settingsRouter };
