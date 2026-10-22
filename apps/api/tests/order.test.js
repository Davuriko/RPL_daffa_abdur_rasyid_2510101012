import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "./helpers/app.js";
import { prismaMock, resetPrisma } from "./helpers/prisma.js";

beforeEach(() => resetPrisma());

describe("POST /api/orders", () => {
  const payload = {
    StoreId: "s1",
    CustomerName: "Rina",
    CustomerWhatsapp: "08123456789",
    DeliveryLocation: "Gedung B",
    Items: [{ ProductId: "p1", Quantity: 2 }],
  };

  it("menolak data pesanan tidak lengkap", async () => {
    const res = await request(app).post("/api/orders").send({ StoreId: "s1" });
    expect(res.status).toBe(400);
  });

  it("menolak keranjang kosong", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ ...payload, Items: [] });
    expect(res.status).toBe(400);
  });

  it("menolak jika toko tidak ditemukan", async () => {
    prismaMock.store.findUnique.mockResolvedValue(null);
    const res = await request(app).post("/api/orders").send(payload);
    expect(res.status).toBe(404);
  });

  it("menolak jika toko tutup", async () => {
    prismaMock.store.findUnique.mockResolvedValue({ Id: "s1", IsOpen: false });
    const res = await request(app).post("/api/orders").send(payload);
    expect(res.status).toBe(400);
  });

  it("menolak jika produk tidak valid", async () => {
    prismaMock.store.findUnique.mockResolvedValue({
      Id: "s1",
      IsOpen: true,
      WhatsappNumber: "0812",
    });
    prismaMock.product.findMany.mockResolvedValue([]);
    const res = await request(app).post("/api/orders").send(payload);
    expect(res.status).toBe(400);
  });

  it("menolak jika produk tidak tersedia", async () => {
    prismaMock.store.findUnique.mockResolvedValue({
      Id: "s1",
      IsOpen: true,
      WhatsappNumber: "0812",
    });
    prismaMock.product.findMany.mockResolvedValue([
      { Id: "p1", Name: "Nasi", Price: 10000, IsAvailable: false },
    ]);
    const res = await request(app).post("/api/orders").send(payload);
    expect(res.status).toBe(400);
  });

  it("membuat pesanan, menghitung total, dan membangun URL WhatsApp", async () => {
    prismaMock.store.findUnique.mockResolvedValue({
      Id: "s1",
      Name: "Toko A",
      IsOpen: true,
      WhatsappNumber: "08123456789",
    });
    prismaMock.product.findMany.mockResolvedValue([
      { Id: "p1", Name: "Nasi", Price: 10000, IsAvailable: true },
    ]);
    prismaMock.order.create.mockResolvedValue({
      Id: "o1",
      TotalPrice: 20000,
      CustomerName: "Rina",
      CustomerWhatsapp: "08123456789",
      DeliveryLocation: "Gedung B",
      Store: { Name: "Toko A" },
      Items: [
        {
          Quantity: 2,
          UnitPrice: 10000,
          Subtotal: 20000,
          Product: { Name: "Nasi" },
        },
      ],
    });
    const res = await request(app).post("/api/orders").send(payload);
    expect(res.status).toBe(201);
    expect(res.body.WhatsappUrl).toContain("https://wa.me/628123456789");
    expect(prismaMock.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ TotalPrice: 20000 }),
      }),
    );
  });
});

describe("GET /api/stores/:StoreId/orders", () => {
  it("mengembalikan 404 jika toko tidak ada", async () => {
    prismaMock.store.findUnique.mockResolvedValue(null);
    const res = await request(app).get("/api/stores/x/orders");
    expect(res.status).toBe(404);
  });

  it("mengembalikan pesanan toko", async () => {
    prismaMock.store.findUnique.mockResolvedValue({ Id: "s1" });
    prismaMock.order.findMany.mockResolvedValue([{ Id: "o1" }]);
    const res = await request(app).get("/api/stores/s1/orders");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe("GET /api/orders (riwayat pembeli)", () => {
  it("menolak tanpa nomor WhatsApp", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(400);
  });

  it("mengembalikan pesanan yang cocok dengan nomor ternormalisasi", async () => {
    prismaMock.order.findMany.mockResolvedValue([
      {
        Id: "o1",
        CustomerWhatsapp: "08123456789",
        Items: [{ ProductId: "p1", Product: { Id: "p1" } }],
      },
      { Id: "o2", CustomerWhatsapp: "08999999999", Items: [] },
    ]);
    prismaMock.review.findMany.mockResolvedValue([]);
    prismaMock.review.groupBy.mockResolvedValue([]);
    const res = await request(app).get(
      "/api/orders?CustomerWhatsapp=08123456789",
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].Id).toBe("o1");
  });
});

describe("PATCH /api/orders/:Id/status", () => {
  it("menolak status tidak valid", async () => {
    const res = await request(app)
      .patch("/api/orders/o1/status")
      .send({ Status: "XXX" });
    expect(res.status).toBe(400);
  });

  it("mengembalikan 404 jika pesanan tidak ada", async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .patch("/api/orders/o1/status")
      .send({ Status: "COMPLETED" });
    expect(res.status).toBe(404);
  });

  it("memperbarui status pesanan", async () => {
    prismaMock.order.findUnique.mockResolvedValue({ Id: "o1" });
    prismaMock.order.update.mockResolvedValue({
      Id: "o1",
      Status: "COMPLETED",
    });
    const res = await request(app)
      .patch("/api/orders/o1/status")
      .send({ Status: "COMPLETED" });
    expect(res.status).toBe(200);
    expect(res.body.Status).toBe("COMPLETED");
  });
});
