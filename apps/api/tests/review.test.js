import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "./helpers/app.js";
import { prismaMock, resetPrisma } from "./helpers/prisma.js";

beforeEach(() => resetPrisma());

describe("POST /api/reviews", () => {
  const payload = {
    ProductId: "p1",
    CustomerWhatsapp: "08123456789",
    Rating: 5,
  };

  it("menolak jika produk atau nomor WhatsApp kosong", async () => {
    const res = await request(app).post("/api/reviews").send({ Rating: 5 });
    expect(res.status).toBe(400);
  });

  it("menolak rating di luar rentang 1-5", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .send({ ...payload, Rating: 7 });
    expect(res.status).toBe(400);
  });

  it("mengembalikan 404 jika produk tidak ditemukan", async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);
    const res = await request(app).post("/api/reviews").send(payload);
    expect(res.status).toBe(404);
  });

  it("menolak jika pembeli belum pernah memesan produk", async () => {
    prismaMock.product.findUnique.mockResolvedValue({ Id: "p1" });
    prismaMock.order.findFirst.mockResolvedValue(null);
    const res = await request(app).post("/api/reviews").send(payload);
    expect(res.status).toBe(403);
  });

  it("menyimpan rating dan mengembalikan ringkasan", async () => {
    prismaMock.product.findUnique.mockResolvedValue({ Id: "p1" });
    prismaMock.order.findFirst.mockResolvedValue({ Id: "o1" });
    prismaMock.review.upsert.mockResolvedValue({});
    prismaMock.review.aggregate.mockResolvedValue({
      _avg: { Rating: 4.5 },
      _count: { Rating: 2 },
    });
    const res = await request(app).post("/api/reviews").send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      ProductId: "p1",
      MyRating: 5,
      RatingAverage: 4.5,
      RatingCount: 2,
    });
  });
});
