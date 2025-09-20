import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleShorten } from "./routes/shorten";
import { handleRedirect } from "./routes/redirect";
import { handlePreview } from "./routes/preview";
import { requestLogger } from "./middleware/logger";

export function createServer() {
  const app = express();

  // Middleware
  app.use(requestLogger);
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // URL shortener API
  app.post("/api/shorten", handleShorten);
  app.post("/api/preview", handlePreview);

  // Redirect route
  app.get("/r/:code", handleRedirect);

  return app;
}
