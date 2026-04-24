import config from "../config/config";
import db from "../db/conn";
import { generateTokens } from "../lib/token";
import { logger } from "../logger";
import type { GenerateTokenPayload } from "../schemas/token.schema";
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
