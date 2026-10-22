import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "./helpers/app.js";
import { prismaMock, resetPrisma } from "./helpers/prisma.js";

beforeEach(() => resetPrisma());

describe("GET /api/stores/:StoreId/dashboard", () => {
  it("mengembalikan 404 jika toko tidak ada", async () => {
    prismaMock.store.findUnique.mockResolvedValue(null);
    const res = await request(app).get("/api/stores/x/dashboard");
    expect(res.status).toBe(404);
  });

  it("mengembalikan ringkasan dashboard penjual", async () => {
    prismaMock.store.findUnique.mockResolvedValue({ Id: "s1", Name: "Toko A" });
    prismaMock.order.aggregate.mockResolvedValue({
      _sum: { TotalPrice: 50000 },
    });
    prismaMock.order.count.mockResolvedValue(3);
    prismaMock.product.count.mockResolvedValue(8);
    prismaMock.order.findMany.mockResolvedValue([{ Id: "o1" }]);
    const res = await request(app).get("/api/stores/s1/dashboard");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      TotalSales: 50000,
      ActiveOrders: 3,
      TotalMenu: 8,
    });
    expect(res.body.RecentOrders).toHaveLength(1);
  });

  it("mengembalikan total penjualan 0 jika belum ada pesanan selesai", async () => {
    prismaMock.store.findUnique.mockResolvedValue({ Id: "s1" });
    prismaMock.order.aggregate.mockResolvedValue({
      _sum: { TotalPrice: null },
    });
    prismaMock.order.count.mockResolvedValue(0);
    prismaMock.product.count.mockResolvedValue(0);
    prismaMock.order.findMany.mockResolvedValue([]);
    const res = await request(app).get("/api/stores/s1/dashboard");
    expect(res.status).toBe(200);
    expect(res.body.TotalSales).toBe(0);
  });
});
