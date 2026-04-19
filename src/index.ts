import serverless from "serverless-http";
import app from "./app";
import db from "./db/conn";
import redis from "./lib/redis";
import { logger } from "./logger";

export const handler = serverless(app);

async function start() {
  try {
    await redis.connect();
    logger.info("Redis connected");
    await db.connectClient();

    logger.info("Starting server...");
    app.listen(3000, () => logger.info("Server is running on port 3000"));
  } catch (error) {
    logger.error({ error }, "Error");
    process.exit(1);
  }
}

async function bootstrap() {
  await start();
}

bootstrap();
