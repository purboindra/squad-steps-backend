import ngrok from "@ngrok/ngrok";
import serverless from "serverless-http";
import app from "./app";
import config from "./config/config";
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

async function startNgrok() {
  const token = config.ngrokAuthToken;
  if (!token) {
    logger.warn("NGROK_AUTHTOKEN not found in environment variables");
    return;
  }

  logger.info(`Starting ngrok with token: ${token.slice(0, 5)}...${token.slice(-5)}`);

  try {
    const tunnel = await ngrok.connect({
      addr: 3000,
      authtoken: token,
      domain: config.ngrokDomain,
    });
    logger.info(`ngrok tunnel: ${tunnel.url()}`);
  } catch (error) {
    logger.error({ error }, "Failed to start ngrok");
  }
}

async function bootstrap() {
  await start();
  await startNgrok();
}

bootstrap();
