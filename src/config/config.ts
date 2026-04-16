import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongoDbUri: string;
  redisUri: string;
  ngrokAuthToken: string;
  ngrokDomain: string;
  rpId: string;
  rpName: string;
  rpOrigin: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoDbUri: process.env.MONGO_DB_URI || "",
  redisUri: process.env.REDIS_URI || "",
  ngrokAuthToken: process.env.NGROK_AUTHTOKEN || "",
  ngrokDomain: process.env.NGROK_DOMAIN || "",
  // rpId: process.env.RP_ID || "squad-steps-backend.netlify.app",
  // rpName: process.env.RP_NAME || "Squad Steps",
  // rpOrigin: process.env.RP_ORIGIN || "https://squad-steps-backend.netlify.app",
  rpOrigin: "https://ba445f89--squad-steps-backend.netlify.live",
  rpId: "ba445f89--squad-steps-backend.netlify.live",
  rpName: "Squad Steps",
};

export default config;
