import db from "../db/conn";
import { logger } from "../logger";
import type { CreateUserPayload } from "../schemas/user.schema";
import { AppError } from "../utils/appError";

export const registerUser = async (params: CreateUserPayload) => {
  try {
    const { email, username, passkeys } = params;
    const firstPasskey = passkeys[0];

    const response = await db.client
      .db("squadsteps")
      .collection("users")
      .findOneAndUpdate(
        { email },
        {
          $setOnInsert: {
            username,
            email,
            createdAt: new Date(),
            currentSteps: 0,
          },
          $set: { updatedAt: new Date() },
          $push: { passkeys: firstPasskey as any },
        },
        { upsert: true, returnDocument: "after" },
      );

    if (!response) {
      throw new AppError("Failed to register user", 500);
    }

    await db.client.db("squadsteps").collection("users").createIndex({ "passkeys.credentialID": 1 });

    return response;
  } catch (error) {
    logger.error({ error }, "Error while register user users.service");
    throw error;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const response = await db.client.db("squadsteps").collection<CreateUserPayload>("users").findOne({ email });

    if (!response) {
      return null;
    }

    return response;
  } catch (error) {
    logger.error({ error }, "Error fetch user by email");
    throw error;
  }
};

export const updateCurrentSteps = async (email: string, steps: number) => {
  try {
    const response = await db.client
      .db("squadsteps")
      .collection("users")
      .findOneAndUpdate({ email }, { $set: { currentSteps: steps } }, { returnDocument: "after" });

    if (!response) {
      throw new AppError("Failed to update current steps", 500);
    }

    return response;
  } catch (error) {
    logger.error({ error }, "Error while update current steps");
    throw error;
  }
};

export const updatePasskeyCounter = async (email: string, credentialID: string, newCounter: number) => {
  try {
    const response = await db.client
      .db("squadsteps")
      .collection("users")
      .updateOne(
        { email, "passkeys.credentialID": credentialID },
        { $set: { "passkeys.$.counter": newCounter } }
      );

    if (response.modifiedCount === 0) {
      logger.warn({ email, credentialID }, "Passkey counter not updated (perhaps already up to date or not found)");
    }

    return response;
  } catch (error) {
    logger.error({ error }, "Error while updating passkey counter");
    throw error;
  }
};

export const saveRefreshToken = async (email: string, refreshToken: string) => {
  try {
    const response = await db.client
      .db("squadsteps")
      .collection("users")
      .updateOne(
        { email },
        { $push: { refreshTokens: refreshToken } as any }
      );

    return response;
  } catch (error) {
    logger.error({ error }, "Error while saving refresh token");
    throw error;
  }
};
