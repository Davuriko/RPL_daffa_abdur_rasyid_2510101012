export function MaskSensitive(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const result = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key of Object.keys(result)) {
    if (/password|token|secret|authorization/i.test(key)) {
      result[key] = "[REDACTED]";
    } else if (typeof result[key] === "object") {
      result[key] = MaskSensitive(result[key]);
    }
  }
  return result;
}

export function SafeLog(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const sanitizedMeta = MaskSensitive(meta);
  const metaStr =
    Object.keys(sanitizedMeta).length > 0
      ? ` | ${JSON.stringify(sanitizedMeta)}`
      : "";
  const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;

  if (level === "error") {
    console.error(logLine);
  } else if (level === "warn") {
    console.warn(logLine);
  } else {
    console.log(logLine);
  }
  return logLine;
}
