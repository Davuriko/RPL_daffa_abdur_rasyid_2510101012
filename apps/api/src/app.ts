import cors from "cors";
import express, { Application, Request, Response } from "express";
import { ApiRouter } from "./routes/index.js";
import { ErrorHandler } from "./middleware/ErrorHandler.js";

export function CreateApp(): Application {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_URL ?? "*" }));
  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ Status: "ok" });
  });

  app.use("/api", ApiRouter);
  app.use(ErrorHandler);

  return app;
}
