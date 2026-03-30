import express from "express";
import db from "./db/conn";
import redis from "./lib/redis";
import { logger } from "./logger";

const app = express();

app.use(express.json());

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

start();
