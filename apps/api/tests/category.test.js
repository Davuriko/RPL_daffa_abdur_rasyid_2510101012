import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "./helpers/app.js";
import { prismaMock, resetPrisma } from "./helpers/prisma.js";

beforeEach(() => resetPrisma());

describe("GET /api/categories", () => {
  it("mengembalikan daftar kategori", async () => {
    prismaMock.category.findMany.mockResolvedValue([
      { Id: "c1", Name: "Makanan" },
      { Id: "c2", Name: "Minuman" },
    ]);
    const res = await request(app).get("/api/categories");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].Name).toBe("Makanan");
  });
});
