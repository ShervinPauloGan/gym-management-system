import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../../middleware/auth.middleware";
import { PlanShopService } from "./planShop.service";

const createSchema = z.object({
  planName: z.string().min(1, "Plan name is required"),
  durationDays: z.number().int().positive(),
  price: z.number().positive(),
  tier: z.string().min(1),
  description: z.string().optional(),
});

const updateSchema = z.object({
  planName: z.string().min(1).optional(),
  durationDays: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
  tier: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

const service = new PlanShopService();

export class PlanShopController {
  async list(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const plans = await service.findAll();
      res.json(plans);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const plan = await service.findById(String(req.params.id));
      res.json(plan);
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createSchema.parse(req.body);
      const plan = await service.create(data);
      res.status(201).json(plan);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors });
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateSchema.parse(req.body);
      const plan = await service.update(String(req.params.id), data);
      res.json(plan);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors });
      next(err);
    }
  }

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await service.remove(String(req.params.id));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}

export const planShopController = new PlanShopController();
