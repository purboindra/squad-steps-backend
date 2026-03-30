import { MongoClient, ServerApiVersion } from "mongodb";

import config from "../config/config";
import { logger } from "../logger";

const connectionString = config.mongoDbUri;

const client = new MongoClient(connectionString, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let conn: MongoClient;

async function connectClient() {
  try {
    conn = await client.connect();
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error({ error }, "Failed to connect with MongoDB");
  }
  return conn;
}

export default { client, connectClient };
