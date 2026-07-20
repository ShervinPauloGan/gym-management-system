import express from "express";
import cors from "cors";
import { authRouter } from "./modules/Auth/routes";
import { membersRouter } from "./modules/Members/routes";
import { registrationRouter } from "./modules/Registration/routes";
import { planShopRouter } from "./modules/PlanShop/routes";
import { redeemShopRouter } from "./modules/RedeemShop/routes";
import { checkInRouter } from "./modules/CheckIn/routes";
import { analyticsRouter } from "./modules/Analytics/routes";
import { settingsRouter } from "./modules/Settings/routes";
import { errorHandler } from "./middleware/error.middleware";
import { verifyToken } from "./middleware/auth.middleware";
import { AuthService } from "./modules/Auth/app/auth.service";

const app = express();
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/members", verifyToken, membersRouter);
app.use("/api/registration", verifyToken, registrationRouter);
app.use("/api/plans", verifyToken, planShopRouter);
app.use("/api/redeem", verifyToken, redeemShopRouter);
app.use("/api/check-in", verifyToken, checkInRouter);
app.use("/api/analytics", verifyToken, analyticsRouter);
app.use("/api/settings", verifyToken, settingsRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

async function main() {
  const authService = new AuthService();
  await authService.seedAdmin();

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
