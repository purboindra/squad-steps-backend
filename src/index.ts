import ngrok from "@ngrok/ngrok";
import express from "express";
import path from "path";
import config from "./config/config";
import db from "./db/conn";
import redis from "./lib/redis";
import { logger } from "./logger";
import { errorHandler } from "./middlewares/error.middleware";
import authRoute from "./routes/auth.route";

const app = express();

app.use(express.json());

app.use(errorHandler);

app.use("/api/auth/passkeys", authRoute);

app.use("/.well-known", express.static(path.join(process.cwd(), "public", ".well-known")));
app.get("/", (_req, res) => {
  res.status(200).json({ message: "Hello World Deymmn" });
  return;
});

app.use((_req, res) => {
  res.status(404).json({ message: "Not Found" });
  return;
});

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
