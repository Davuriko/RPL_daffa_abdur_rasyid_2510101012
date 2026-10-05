import { HttpError } from "../utils/HttpError.js";
import { VerifyToken } from "../utils/Jwt.js";

export function RequireAuth(req, _res, next) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new HttpError(401, "Token tidak ditemukan. Silakan login.");

  try {
    req.User = VerifyToken(token);
  } catch {
    throw new HttpError(401, "Token tidak valid atau sudah kedaluwarsa.");
  }
  next();
}

export function RequireRole(...roles) {
  return (req, _res, next) => {
    if (!req.User) throw new HttpError(401, "Belum terautentikasi.");
    if (!roles.includes(req.User.Role)) {
      throw new HttpError(403, "Anda tidak memiliki akses untuk aksi ini.");
    }
    next();
  };
}
