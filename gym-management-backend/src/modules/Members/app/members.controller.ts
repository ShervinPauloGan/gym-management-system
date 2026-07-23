import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../../middleware/auth.middleware";
import { MembersService } from "./members.service";

const listSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  q: z.string().optional(),
  tier: z.string().optional(),
});

const createSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  tier: z.enum(["walk-in", "silver", "gold"]),
});

const updateSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")),
  tier: z.enum(["walk-in", "silver", "gold"]).optional(),
});

const service = new MembersService();

export class MembersController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = listSchema.parse(req.query);
      const result = await service.findAll(filters);
      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: "Invalid query parameters" });
      next(err);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const member = await service.findById(String(req.params.id));
      res.json(member);
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createSchema.parse(req.body);
      const member = await service.create(data);
      res.status(201).json(member);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors });
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateSchema.parse(req.body);
      const member = await service.update(String(req.params.id), data);
      res.json(member);
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

export const membersController = new MembersController();
