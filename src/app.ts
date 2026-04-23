import express, { type NextFunction, type Request, type Response } from "express";
import path from "path";
import { errorHandler } from "./middlewares/error.middleware";
import passkeyRoute from "./routes/passkeys.route";
import userRoute from "./routes/users.route";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const isProd = process.env.NODE_ENV === "production";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
// app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests from this IP address",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Rate limit exceeded",
      message: "Too many requests from this IP address, please try again later.",
      data: null,
    });
  },
});

app.use(limiter);

app.use("/api/auth/passkeys", passkeyRoute);
app.use("/api/users", userRoute);

const publicDir = path.join(process.cwd(), "public");
app.use("/.well-known", express.static(path.join(publicDir, ".well-known")));

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Hello World from Express on Netlify!" });
});

// Main error handler
app.use(errorHandler);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: "Not Found" });
});

export default app;
