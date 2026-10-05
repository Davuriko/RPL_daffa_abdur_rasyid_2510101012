import bcrypt from "bcryptjs";
import { Role } from "@kampus-bite/shared";
import { AsyncHandler } from "../middleware/AsyncHandler.js";
import { HttpError } from "../utils/HttpError.js";
import { SignToken } from "../utils/Jwt.js";
import { prisma } from "../prisma.js";

const AllowedRoles = [Role.Seller, Role.Buyer];
const EmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function PublicUser(user) {
  return {
    Id: user.Id,
    Name: user.Name,
    Email: user.Email,
    Role: user.Role,
    CreatedAt: user.CreatedAt,
  };
}

export const Register = AsyncHandler(async (req, res) => {
  const { Name, Email, Password, Role: requestedRole } = req.body;

  if (!Name || !Email || !Password) {
    throw new HttpError(400, "Nama, email, dan password wajib diisi.");
  }
  if (!EmailPattern.test(Email)) {
    throw new HttpError(400, "Format email tidak valid.");
  }
  if (Password.length < 6) {
    throw new HttpError(400, "Password minimal 6 karakter.");
  }

  const role = AllowedRoles.includes(requestedRole) ? requestedRole : Role.Buyer;

  const existing = await prisma.user.findUnique({ where: { Email } });
  if (existing) throw new HttpError(409, "Email sudah terdaftar.");

  const PasswordHash = await bcrypt.hash(Password, 10);
  const user = await prisma.user.create({
    data: { Name, Email, PasswordHash, Role: role },
  });

  const Token = SignToken({ Id: user.Id, Role: user.Role, Name: user.Name });
  res.status(201).json({ Token, User: PublicUser(user) });
});

export const Login = AsyncHandler(async (req, res) => {
  const { Email, Password } = req.body;
  if (!Email || !Password) {
    throw new HttpError(400, "Email dan password wajib diisi.");
  }

  const user = await prisma.user.findUnique({ where: { Email } });
  if (!user) throw new HttpError(401, "Email atau password salah.");

  const valid = await bcrypt.compare(Password, user.PasswordHash);
  if (!valid) throw new HttpError(401, "Email atau password salah.");

  const Token = SignToken({ Id: user.Id, Role: user.Role, Name: user.Name });
  res.json({ Token, User: PublicUser(user) });
});

export const Me = AsyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { Id: req.User.Id } });
  if (!user) throw new HttpError(404, "Pengguna tidak ditemukan.");
  res.json(PublicUser(user));
});
