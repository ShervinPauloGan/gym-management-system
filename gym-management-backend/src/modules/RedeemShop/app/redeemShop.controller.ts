import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../../middleware/auth.middleware";
import { RedeemShopService } from "./redeemShop.service";

const createSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  pointsCost: z.number().int().positive(),
  stockQuantity: z.number().int().min(0),
  description: z.string().optional(),
});

const updateSchema = z.object({
  itemName: z.string().min(1).optional(),
  pointsCost: z.number().int().positive().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  description: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

const redeemSchema = z.object({
  itemId: z.string().uuid(),
});

const service = new RedeemShopService();

export class RedeemShopController {
  async list(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const items = await service.findAll();
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await service.findById(String(req.params.id));
      res.json(item);
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createSchema.parse(req.body);
      const item = await service.create(data);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors });
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateSchema.parse(req.body);
      const item = await service.update(String(req.params.id), data);
      res.json(item);
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

  async redeem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { itemId } = redeemSchema.parse(req.body);
      const result = await service.redeem(req.user!.sub, itemId);
      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: "Invalid request" });
      next(err);
    }
  }
}

export const redeemShopController = new RedeemShopController();
