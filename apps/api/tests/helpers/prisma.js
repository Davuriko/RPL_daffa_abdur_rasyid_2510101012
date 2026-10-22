import { vi } from "vitest";

function Model(methods) {
  return Object.fromEntries(methods.map((name) => [name, vi.fn()]));
}

// Mock Prisma client that mirrors every method used by the controllers.
export const prismaMock = {
  user: Model(["findUnique", "create", "count", "findMany"]),
  store: Model([
    "findMany",
    "findFirst",
    "findUnique",
    "create",
    "update",
    "count",
  ]),
  product: Model([
    "findMany",
    "findUnique",
    "create",
    "update",
    "delete",
    "count",
    "groupBy",
  ]),
  order: Model([
    "create",
    "findMany",
    "findFirst",
    "findUnique",
    "update",
    "count",
    "aggregate",
  ]),
  review: Model(["groupBy", "findMany", "upsert", "aggregate"]),
  category: Model(["findMany"]),
};

export function resetPrisma() {
  for (const model of Object.values(prismaMock)) {
    for (const fn of Object.values(model)) fn.mockReset();
  }
}
