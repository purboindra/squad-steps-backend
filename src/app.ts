import express from "express";
import path from "path";
import { errorHandler } from "./middlewares/error.middleware";
import authRoute from "./routes/auth.route";

const app = express();

app.use(express.json());

app.use("/api/auth/passkeys", authRoute);

// Use a more robust path for public assets, or rely on Netlify's static serving
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
