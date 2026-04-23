import serverless from "serverless-http";
import app from "./app";
import db from "./db/conn";
import redis from "./lib/redis";
import { logger } from "./logger";

export const handler = serverless(app);

const isProd = process.env.NODE_ENV === "production";

process.on("unhandledRejection", (err: any) => {
  const message = err.message;
  logger.error({ message }, "Unhandle rejection catched");
  if (isProd) process.exit(1);
});

// ["SIGINT", "SIGTERM"].forEach((sig) => {
//   process.on(sig as NodeJS.Signals, async () => {
//     logger.info({ sig }, "Shutting down");
//     try {
//       await redis.quit();
//     } catch {}
//     try {
//       await db.client.close();
//     } catch {}
//     process.exit(0);
//   });
// });

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
