import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongoDbUri: string;
  redisUri: string;
  ngrokAuthToken: string;
  ngrokDomain: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoDbUri: process.env.MONGO_DB_URI || "",
  redisUri: process.env.REDIS_URI || "",
  ngrokAuthToken: process.env.NGROK_AUTHTOKEN || "",
  ngrokDomain: process.env.NGROK_DOMAIN || "",
};

export default config;
