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

    console.log("Default admin created: admin@gym.com / admin123");
  }
}
