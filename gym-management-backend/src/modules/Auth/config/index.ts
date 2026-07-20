import { BCRYPT_SALT_ROUNDS, JWT_EXPIRES_IN } from "../../../constants";

export const authConfig = {
  bcryptSaltRounds: BCRYPT_SALT_ROUNDS,
  jwtExpiresIn: JWT_EXPIRES_IN,
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
};
