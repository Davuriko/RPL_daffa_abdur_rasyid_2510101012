import jwt from "jsonwebtoken";

const Secret = process.env.JWT_SECRET ?? "kampus-bite-dev-secret";
const ExpiresIn = process.env.JWT_EXPIRES_IN ?? "7d";

export function SignToken(payload) {
  return jwt.sign(payload, Secret, { expiresIn: ExpiresIn });
}

export function VerifyToken(token) {
  return jwt.verify(token, Secret);
}
