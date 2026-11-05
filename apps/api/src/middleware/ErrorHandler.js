import { HttpError } from "../utils/HttpError.js";
import { SafeLog } from "../utils/Logger.js";

export function ErrorHandler(error, req, res, _next) {
  if (error instanceof HttpError) {
    SafeLog("warn", `HttpError ${error.StatusCode}: ${error.message}`, {
      Path: req?.originalUrl || req?.url || "unknown",
      Method: req?.method || "unknown",
      UserId: req?.User?.Id ?? "anonymous",
    });
    res.status(error.StatusCode).json({ Message: error.message });
    return;
  }

  SafeLog("error", `UnhandledException: ${error?.message ?? error}`, {
    Path: req?.originalUrl || req?.url || "unknown",
    Method: req?.method || "unknown",
    UserId: req?.User?.Id ?? "anonymous",
  });
  res.status(500).json({ Message: "Terjadi kesalahan pada server." });
}
