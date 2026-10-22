import { vi } from "vitest";

// Register the Prisma mock before the app (and its controllers) are imported.
vi.mock("../../src/prisma.js", async () => {
  const { prismaMock } = await import("./prisma.js");
  return { prisma: prismaMock };
});

const { CreateApp } = await import("../../src/app.js");
const { SignToken } = await import("../../src/utils/Jwt.js");

export const app = CreateApp();

export function TokenFor({
  Id = "user-1",
  Role = "BUYER",
  Name = "Tester",
} = {}) {
  return SignToken({ Id, Role, Name });
}

export function AuthHeader(payload) {
  return `Bearer ${TokenFor(payload)}`;
}
