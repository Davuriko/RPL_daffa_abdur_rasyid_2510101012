import { HttpError } from "../utils/HttpError.js";

export function ErrorHandler(error, _req, res, _next) {
  if (error instanceof HttpError) {
    res.status(error.StatusCode).json({ Message: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ Message: "Terjadi kesalahan pada server." });
}
