import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../../../database";
import { authConfig } from "../config";
import { AppError } from "../../../middleware/error.middleware";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: "admin" | "manager" | "member";
  };
}

export class AuthService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.passwordHash) {
      throw new AppError(401, "Invalid email or password");
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, "Invalid email or password");
    }

    const payload = { sub: user.id, role: user.role };
    const token = jwt.sign(payload, authConfig.jwtSecret, {
      expiresIn: authConfig.jwtExpiresIn,
    } as jwt.SignOptions);

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email!,
        role: user.role as "admin" | "manager" | "member",
      },
    };
  }

  async seedAdmin() {
    const existing = await prisma.user.findFirst({
      where: { role: "admin" },
    });

    if (existing) return;

    const hash = await bcrypt.hash("admin123", authConfig.bcryptSaltRounds);

    await prisma.user.create({
      data: {
        fullName: "System Admin",
        email: "admin@gym.com",
        passwordHash: hash,
        role: "admin",
        qrCodeToken: "admin-qr-token",
        tier: "gold",
      },
    });

    await prisma.planShop.createMany({
      data: [
        { planName: "Walk-In Pass", durationDays: 1, price: 80, tier: "walk-in", description: "Single day access" },
        { planName: "Silver Monthly", durationDays: 30, price: 1500, tier: "silver", description: "Monthly membership with silver tier" },
        { planName: "Silver Annual", durationDays: 365, price: 13500, tier: "silver", description: "Annual membership with silver tier (25% off)" },
        { planName: "Gold Monthly", durationDays: 30, price: 2500, tier: "gold", description: "Monthly membership with gold tier" },
        { planName: "Gold Annual", durationDays: 365, price: 25000, tier: "gold", description: "Annual membership with gold tier" },
      ],
    });

    await prisma.redeemShop.createMany({
      data: [
        { itemName: "Protein Shake", pointsCost: 50, stockQuantity: 100, description: "Chocolate flavored whey protein shake" },
        { itemName: "Gym Towel", pointsCost: 100, stockQuantity: 50, description: "Premium microfiber gym towel" },
        { itemName: "Water Bottle", pointsCost: 75, stockQuantity: 80, description: "Stainless steel 1L water bottle" },
        { itemName: "Gym Shirt", pointsCost: 200, stockQuantity: 30, description: "GYM ENGINE branded dry-fit shirt" },
        { itemName: "Personal Training Session", pointsCost: 500, stockQuantity: 20, description: "1-hour session with a certified trainer" },
      ],
    });

    console.log("Default admin created: admin@gym.com / admin123");
  }
}
