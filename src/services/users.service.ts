import db from "../db/conn";
import { logger } from "../logger";
import type { CreateUserPayload } from "../schemas/user.schema";

export const registerUser = async (params: CreateUserPayload) => {
  try {
    const response = await db.client
      .db("squadsteps")
      .collection("users")
      .insertOne({
        ...params,
        created_at: new Date(),
        updated_at: new Date(),
        passkeys: [],
      });

    return {
      _id: response.insertedId,
      ...params,
    };
  } catch (error) {
    logger.error({ error }, "Error while register user users.service");
    throw error;
  }
};
