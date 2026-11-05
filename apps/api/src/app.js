import cors from "cors";
import express from "express";
import { ApiRouter } from "./routes/index.js";
import { ErrorHandler } from "./middleware/ErrorHandler.js";

export function CreateApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });

  app.use(cors({ origin: process.env.CLIENT_URL ?? "*" }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ Status: "ok" });
  });

  app.use("/api", ApiRouter);
  app.use(ErrorHandler);

  return app;
}
