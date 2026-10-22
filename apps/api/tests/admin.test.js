import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app, AuthHeader } from "./helpers/app.js";
import { prismaMock, resetPrisma } from "./helpers/prisma.js";

const AdminAuth = AuthHeader({ Id: "admin-1", Role: "ADMIN" });

beforeEach(() => resetPrisma());

describe("proteksi role admin", () => {
  it("menolak tanpa token", async () => {
    const res = await request(app).get("/api/admin/stats");
    expect(res.status).toBe(401);
  });

  it("menolak non-admin", async () => {
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", AuthHeader({ Role: "SELLER" }));
    expect(res.status).toBe(403);
  });
});

describe("GET /api/admin/stats", () => {
  it("mengembalikan statistik agregat", async () => {
    prismaMock.user.count.mockResolvedValue(10);
    prismaMock.store.count.mockResolvedValue(3);
    prismaMock.product.count.mockResolvedValue(20);
    prismaMock.order.count.mockResolvedValue(5);
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", AdminAuth);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      TotalUsers: 10,
      TotalProducts: 20,
      TotalOrders: 5,
    });
  });
});

describe("GET /api/admin/users", () => {
  it("mengembalikan daftar pengguna", async () => {
    prismaMock.user.findMany.mockResolvedValue([{ Id: "u1", Name: "A" }]);
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", AdminAuth);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe("GET /api/admin/stores", () => {
  it("mengembalikan daftar toko beserta penjual", async () => {
    prismaMock.store.findMany.mockResolvedValue([
      { Id: "s1", Seller: { Id: "u1" } },
    ]);
    const res = await request(app)
      .get("/api/admin/stores")
      .set("Authorization", AdminAuth);
    expect(res.status).toBe(200);
    expect(res.body[0].Seller.Id).toBe("u1");
  });
});

describe("PATCH /api/admin/stores/:Id/verification", () => {
  it("menolak nilai IsVerified bukan boolean", async () => {
    const res = await request(app)
      .patch("/api/admin/stores/s1/verification")
      .set("Authorization", AdminAuth)
      .send({ IsVerified: "ya" });
    expect(res.status).toBe(400);
  });

  it("mengembalikan 404 jika toko tidak ada", async () => {
    prismaMock.store.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .patch("/api/admin/stores/s1/verification")
      .set("Authorization", AdminAuth)
      .send({ IsVerified: true });
    expect(res.status).toBe(404);
  });

  it("memperbarui status verifikasi toko", async () => {
    prismaMock.store.findUnique.mockResolvedValue({ Id: "s1" });
    prismaMock.store.update.mockResolvedValue({ Id: "s1", IsVerified: true });
    const res = await request(app)
      .patch("/api/admin/stores/s1/verification")
      .set("Authorization", AdminAuth)
      .send({ IsVerified: true });
    expect(res.status).toBe(200);
    expect(res.body.IsVerified).toBe(true);
  });
});
