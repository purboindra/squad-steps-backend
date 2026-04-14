import serverless from "serverless-http";
import app from "../../src/app";
import db from "../../src/db/conn";
import redis from "../../src/lib/redis";
import { logger } from "../../src/logger";

let isConnected = false;

async function connect() {
  if (isConnected) return;
  
  try {
    await db.connectClient();
    if (!redis.isOpen) {
      await redis.connect();
    }
    isConnected = true;
    logger.info("Database and Redis connected for serverless function");
  } catch (error) {
    logger.error({ error }, "Failed to connect to data stores");
    throw error;
  }
}

const serverlessHandler = serverless(app);

export const handler: any = async (event: any, context: any) => {
  await connect();
  return await serverlessHandler(event, context);
};

