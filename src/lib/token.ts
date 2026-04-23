import * as jose from "jose";
import type { GenerateTokenPayload } from "../schemas/token.schema";

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_key_change_in_production";
const secret = new TextEncoder().encode(JWT_SECRET);

export const generateTokens = async (payload: GenerateTokenPayload) => {
  const accessToken = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);

  const refreshToken = await generateRefreshToken(payload);

  return { accessToken, refreshToken };
};

export const generateRefreshToken = async (payload: GenerateTokenPayload) => {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
};
