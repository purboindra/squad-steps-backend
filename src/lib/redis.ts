import { createClient } from "redis";
import config from "../config/config";
import { logger } from "../logger";

const redis = createClient({
  url: config.redisUri,
});

redis.on("error", (err) => logger.error({ err }, "Redis Client Error"));

export default redis;
