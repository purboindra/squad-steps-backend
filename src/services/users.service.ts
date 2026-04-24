import { ObjectId } from "mongodb";
import config from "../config/config";
import db from "../db/conn";
import { generateTokens } from "../lib/token";
import { logger } from "../logger";
import type { CreateUserPayload } from "../schemas/user.schema";
import type { UserInterface } from "../types/user.interface";
import { AppError } from "../utils/appError";

const dbName = config.dbName;
const usersCollection = config.usersCollection;

export const registerUser = async (params: CreateUserPayload) => {
  try {
    const { email, username, passkeys } = params;
    const firstPasskey = passkeys[0];

    const response = await db.client
      .db(dbName)
      .collection(usersCollection)
      .findOneAndUpdate(
        { email },
        {
          $setOnInsert: {
            username,
            email,
            createdAt: new Date(),
            currentSteps: 0,
          },
          $set: { updatedAt: new Date(), deletedAt: null },
          $push: { passkeys: firstPasskey as any },
        },
        { upsert: true, returnDocument: "after" },
      );

    if (!response) {
      throw new AppError("Failed to register user", 500);
    }

    await db.client.db(dbName).collection(usersCollection).createIndex({ "passkeys.credentialID": 1 });

    const tokens = await generateTokens({ email: email, username: email.split("@")[0] ?? "" });

    logger.info({ tokens }, "Tokens generated");

    await saveRefreshToken(email, tokens.refreshToken);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  } catch (error) {
    logger.error({ error }, "Error while register user users.service");
    throw error;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const response = await db.client.db(dbName).collection<CreateUserPayload>(usersCollection).findOne({ email });

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
      .db(dbName)
      .collection(usersCollection)
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
      .db(dbName)
      .collection(usersCollection)
      .updateOne({ email, "passkeys.credentialID": credentialID }, { $set: { "passkeys.$.counter": newCounter } });

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
      .db(dbName)
      .collection<UserInterface>(usersCollection)
      .updateOne(
        { email },
        {
          $push: {
            refreshTokens: {
              $each: [refreshToken],
              $slice: -5,
            },
          },
        },
      );
    return response;
  } catch (error) {
    logger.error({ error }, "Error while saving refresh token");
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  try {
    const response = await db.client
      .db(dbName)
      .collection(usersCollection)
      .updateOne({ _id: new ObjectId(id), deletedAt: null }, { $set: { deletedAt: new Date() } });

    if (response.matchedCount === 0) {
      throw new AppError("User not found or already deleted", 404);
    }

    return response;
  } catch (error) {
    logger.error({ error }, "Error while delete user");
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const users = await db.client
      .db(dbName)
      .collection<UserInterface>(usersCollection)
      .find({
        deletedAt: null,
      })
      .project({
        _id: 1,
        email: 1,
        username: 1,
        updatedAt: 1,
        deletedAt: 1,
        createdAt: 1,
        currentSteps: 1,
        refreshTokens: 1,
      })
      .toArray();

    return users;
  } catch (error) {
    logger.error({ error }, "Error while get all users");
    throw error;
  }
};

export const getUserById = async (id: string) => {
  try {
    const response = await db.client
      .db(dbName)
      .collection(usersCollection)
      .findOne({ _id: new ObjectId(id), deletedAt: null });

    if (!response) {
      throw new AppError("User not found", 404);
    }

    return response.refreshTokens;
  } catch (error) {
    logger.error({ error }, "Error while get user by id");
    throw error;
  }
};
