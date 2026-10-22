import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "./helpers/app.js";
import { prismaMock, resetPrisma } from "./helpers/prisma.js";

beforeEach(() => resetPrisma());

describe("GET /api/products", () => {
  it("mengembalikan produk dengan rata-rata rating", async () => {
    prismaMock.product.findMany.mockResolvedValue([{ Id: "p1" }, { Id: "p2" }]);
    prismaMock.review.groupBy.mockResolvedValue([
      { ProductId: "p1", _avg: { Rating: 4.5 }, _count: { Rating: 2 } },
    ]);
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body[0].RatingAverage).toBe(4.5);
    expect(res.body[0].RatingCount).toBe(2);
    expect(res.body[1].RatingAverage).toBe(0);
  });

  it("memfilter berdasarkan query", async () => {
    prismaMock.product.findMany.mockResolvedValue([]);
    prismaMock.review.groupBy.mockResolvedValue([]);
    await request(app).get(
      "/api/products?StoreId=s1&CategoryId=c1&IsAvailable=true",
    );
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { StoreId: "s1", CategoryId: "c1", IsAvailable: true },
      }),
    );
  });
});

describe("GET /api/products/:Id", () => {
  it("mengembalikan 404 jika tidak ada", async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);
    const res = await request(app).get("/api/products/x");
    expect(res.status).toBe(404);
  });

  it("mengembalikan detail produk", async () => {
    prismaMock.product.findUnique.mockResolvedValue({ Id: "p1" });
    prismaMock.review.groupBy.mockResolvedValue([]);
    const res = await request(app).get("/api/products/p1");
    expect(res.status).toBe(200);
    expect(res.body.Id).toBe("p1");
    expect(res.body.RatingAverage).toBe(0);
  });
});

describe("POST /api/products", () => {
  const payload = {
    StoreId: "s1",
    CategoryId: "c1",
    Name: "Nasi",
    Price: 15000,
  };

  it("menolak data tidak lengkap", async () => {
    const res = await request(app).post("/api/products").send({ Name: "Nasi" });
    expect(res.status).toBe(400);
  });

  it("menolak harga negatif", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({ ...payload, Price: -1 });
    expect(res.status).toBe(400);
  });

  it("membuat produk dan membulatkan harga", async () => {
    prismaMock.product.create.mockImplementation(async ({ data }) => ({
      Id: "p1",
      ...data,
    }));
    const res = await request(app)
      .post("/api/products")
      .send({ ...payload, Price: 15000.7 });
    expect(res.status).toBe(201);
    expect(res.body.Price).toBe(15001);
  });
});

describe("PUT /api/products/:Id", () => {
  it("mengembalikan 404 jika tidak ada", async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .put("/api/products/x")
      .send({ Name: "Baru" });
    expect(res.status).toBe(404);
  });

  it("menolak harga negatif", async () => {
    prismaMock.product.findUnique.mockResolvedValue({ Id: "p1" });
    const res = await request(app).put("/api/products/p1").send({ Price: -5 });
    expect(res.status).toBe(400);
  });

  it("memperbarui produk", async () => {
    prismaMock.product.findUnique.mockResolvedValue({ Id: "p1" });
    prismaMock.product.update.mockResolvedValue({ Id: "p1", Name: "Baru" });
    const res = await request(app)
      .put("/api/products/p1")
      .send({ Name: "Baru" });
    expect(res.status).toBe(200);
    expect(res.body.Name).toBe("Baru");
  });
});

describe("DELETE /api/products/:Id", () => {
  it("mengembalikan 404 jika tidak ada", async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);
    const res = await request(app).delete("/api/products/x");
    expect(res.status).toBe(404);
  });

  it("menghapus produk", async () => {
    prismaMock.product.findUnique.mockResolvedValue({ Id: "p1" });
    prismaMock.product.delete.mockResolvedValue({});
    const res = await request(app).delete("/api/products/p1");
    expect(res.status).toBe(204);
  });
});
