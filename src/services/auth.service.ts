import * as jose from "jose";
import config from "../config/config";
import db from "../db/conn";
import { generateTokens } from "../lib/token";
import { logger } from "../logger";
import type { GenerateTokenPayload } from "../schemas/token.schema";
import * as usersService from "../services/users.service";
import type { UserInterface } from "../types/user.interface";
import { AppError } from "../utils/appError";

const dbName = config.dbName;
const usersCollection = config.usersCollection;

export const generateToken = async (payload: GenerateTokenPayload) => {
  try {
    const user = await db.client.db(dbName).collection(usersCollection).findOne({
      email: payload.email,
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const tokens = await generateTokens(payload);

    logger.info({ tokens }, "Tokens generated");

    return tokens;
  } catch (error) {
    logger.error({ error }, "Error while generate tokens");
    throw error;
  }
};

export const rotateToken = async (refreshToken: string) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "";
    const secret = new TextEncoder().encode(JWT_SECRET);

    const { payload, protectedHeader } = await jose.jwtVerify(refreshToken, secret);

    if (!payload.exp || !payload.email) {
      throw new AppError("Invalid token", 401);
    }

    const email = String(payload.email);
    const username = String(payload.username);

    const user = await usersService.getUserByEmail(email);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const tokens = await generateTokens({
      email: user.email,
      username: user.username,
    });

    const response = await db.client
      .db(dbName)
      .collection<UserInterface>(usersCollection)
      .updateOne(
        {
          email,
          refreshTokens: refreshToken,
        },
        {
          $set: { "refreshTokens.$": tokens.refreshToken },
        },
      );

    if (response.modifiedCount === 0) {
      throw new AppError("Failed to update refresh token", 500);
    }

    logger.info({ tokens }, "Tokens generated");

    return tokens;
  } catch (error) {
    logger.error({ error }, "Error while rotating tokens");
    throw error;
  }
};
