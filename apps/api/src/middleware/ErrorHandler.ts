import { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "@kampus-bite/shared";
import { HttpError } from "../utils/HttpError.js";

export function ErrorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof HttpError) {
    const body: ErrorResponse = { Message: error.message };
    res.status(error.StatusCode).json(body);
    return;
  }

  console.error(error);
  const body: ErrorResponse = { Message: "Terjadi kesalahan pada server." };
  res.status(500).json(body);
}
