import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app, AuthHeader } from "./helpers/app.js";
import { prismaMock, resetPrisma } from "./helpers/prisma.js";

const SellerAuth = AuthHeader({ Id: "seller-1", Role: "SELLER" });

beforeEach(() => resetPrisma());

describe("GET /api/stores", () => {
  it("mengembalikan daftar toko publik", async () => {
    prismaMock.store.findMany.mockResolvedValue([{ Id: "s1", Name: "Toko A" }]);
    const res = await request(app).get("/api/stores");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe("GET /api/stores/mine", () => {
  it("menolak tanpa token", async () => {
    const res = await request(app).get("/api/stores/mine");
    expect(res.status).toBe(401);
  });

  it("menolak non-penjual", async () => {
    const res = await request(app)
      .get("/api/stores/mine")
      .set("Authorization", AuthHeader({ Role: "BUYER" }));
    expect(res.status).toBe(403);
  });

  it("mengembalikan toko milik penjual", async () => {
    prismaMock.store.findMany.mockResolvedValue([
      { Id: "s1", SellerId: "seller-1" },
    ]);
    const res = await request(app)
      .get("/api/stores/mine")
      .set("Authorization", SellerAuth);
    expect(res.status).toBe(200);
    expect(prismaMock.store.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { SellerId: "seller-1" } }),
    );
  });
});

describe("GET /api/stores/:Id", () => {
  it("mengembalikan 404 jika toko tidak ditemukan", async () => {
    prismaMock.store.findUnique.mockResolvedValue(null);
    const res = await request(app).get("/api/stores/x");
    expect(res.status).toBe(404);
  });

  it("mengembalikan detail toko", async () => {
    prismaMock.store.findUnique.mockResolvedValue({ Id: "s1", Name: "Toko A" });
    const res = await request(app).get("/api/stores/s1");
    expect(res.status).toBe(200);
    expect(res.body.Id).toBe("s1");
  });
});

describe("POST /api/stores", () => {
  const payload = {
    Name: "Toko Melati",
    OwnerName: "Melati",
    WhatsappNumber: "08123456789",
    CampusLocation: "Gedung A",
  };

  it("menolak non-penjual", async () => {
    const res = await request(app)
      .post("/api/stores")
      .set("Authorization", AuthHeader({ Role: "BUYER" }))
      .send(payload);
    expect(res.status).toBe(403);
  });

  it("menolak data tidak lengkap", async () => {
    const res = await request(app)
      .post("/api/stores")
      .set("Authorization", SellerAuth)
      .send({ Name: "Toko" });
    expect(res.status).toBe(400);
  });

  it("menolak jika penjual sudah memiliki toko", async () => {
    prismaMock.store.findFirst.mockResolvedValue({ Id: "s1" });
    const res = await request(app)
      .post("/api/stores")
      .set("Authorization", SellerAuth)
      .send(payload);
    expect(res.status).toBe(409);
  });

  it("membuat toko baru", async () => {
    prismaMock.store.findFirst.mockResolvedValue(null);
    prismaMock.store.create.mockImplementation(async ({ data }) => ({
      Id: "s1",
      ...data,
    }));
    const res = await request(app)
      .post("/api/stores")
      .set("Authorization", SellerAuth)
      .send(payload);
    expect(res.status).toBe(201);
    expect(res.body.SellerId).toBe("seller-1");
  });
});

describe("PUT /api/stores/:Id", () => {
  it("mengembalikan 404 jika toko tidak ada", async () => {
    prismaMock.store.findUnique.mockResolvedValue(null);
    const res = await request(app).put("/api/stores/x").send({ Name: "Baru" });
    expect(res.status).toBe(404);
  });

  it("memperbarui toko", async () => {
    prismaMock.store.findUnique.mockResolvedValue({ Id: "s1" });
    prismaMock.store.update.mockResolvedValue({ Id: "s1", Name: "Baru" });
    const res = await request(app).put("/api/stores/s1").send({ Name: "Baru" });
    expect(res.status).toBe(200);
    expect(res.body.Name).toBe("Baru");
  });
});

describe("PATCH /api/stores/:Id/toggle-status", () => {
  it("mengembalikan 404 jika toko tidak ada", async () => {
    prismaMock.store.findUnique.mockResolvedValue(null);
    const res = await request(app).patch("/api/stores/x/toggle-status");
    expect(res.status).toBe(404);
  });

  it("membalik status buka/tutup toko", async () => {
    prismaMock.store.findUnique.mockResolvedValue({ Id: "s1", IsOpen: true });
    prismaMock.store.update.mockResolvedValue({ Id: "s1", IsOpen: false });
    const res = await request(app).patch("/api/stores/s1/toggle-status");
    expect(res.status).toBe(200);
    expect(prismaMock.store.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { IsOpen: false } }),
    );
  });
});
