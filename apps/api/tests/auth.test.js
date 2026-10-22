import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { app, AuthHeader } from "./helpers/app.js";
import { prismaMock, resetPrisma } from "./helpers/prisma.js";

beforeEach(() => resetPrisma());

describe("POST /api/auth/register", () => {
  it("menolak jika data tidak lengkap", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ Email: "a@b.com" });
    expect(res.status).toBe(400);
  });

  it("menolak format email tidak valid", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ Name: "A", Email: "bukan-email", Password: "rahasia" });
    expect(res.status).toBe(400);
  });

  it("menolak password kurang dari 6 karakter", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ Name: "A", Email: "a@b.com", Password: "123" });
    expect(res.status).toBe(400);
  });

  it("menolak email yang sudah terdaftar", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ Id: "u1" });
    const res = await request(app)
      .post("/api/auth/register")
      .send({ Name: "A", Email: "a@b.com", Password: "rahasia" });
    expect(res.status).toBe(409);
  });

  it("mendaftarkan pengguna baru dan mengembalikan token", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      Id: "u1",
      Name: "Rina",
      Email: "rina@b.com",
      Role: "BUYER",
      CreatedAt: new Date(),
    });
    const res = await request(app)
      .post("/api/auth/register")
      .send({ Name: "Rina", Email: "rina@b.com", Password: "rahasia" });
    expect(res.status).toBe(201);
    expect(res.body.Token).toBeTruthy();
    expect(res.body.User.Email).toBe("rina@b.com");
    expect(res.body.User).not.toHaveProperty("PasswordHash");
  });

  it("memaksa role menjadi BUYER jika role tidak diizinkan", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(async ({ data }) => ({
      Id: "u1",
      ...data,
      CreatedAt: new Date(),
    }));
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        Name: "X",
        Email: "x@b.com",
        Password: "rahasia",
        Role: "ADMIN",
      });
    expect(res.status).toBe(201);
    expect(res.body.User.Role).toBe("BUYER");
  });
});

describe("POST /api/auth/login", () => {
  it("menolak jika kredensial kosong", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });

  it("menolak jika pengguna tidak ditemukan", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ Email: "a@b.com", Password: "rahasia" });
    expect(res.status).toBe(401);
  });

  it("menolak jika password salah", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      Id: "u1",
      PasswordHash: await bcrypt.hash("benar", 10),
    });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ Email: "a@b.com", Password: "salah" });
    expect(res.status).toBe(401);
  });

  it("berhasil login dengan kredensial benar", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      Id: "u1",
      Name: "Rina",
      Email: "a@b.com",
      Role: "BUYER",
      PasswordHash: await bcrypt.hash("rahasia", 10),
      CreatedAt: new Date(),
    });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ Email: "a@b.com", Password: "rahasia" });
    expect(res.status).toBe(200);
    expect(res.body.Token).toBeTruthy();
    expect(res.body.User.Id).toBe("u1");
  });
});

describe("GET /api/auth/me", () => {
  it("menolak tanpa token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("menolak token tidak valid", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer token-palsu");
    expect(res.status).toBe(401);
  });

  it("mengembalikan profil pengguna terautentikasi", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      Id: "u1",
      Name: "Rina",
      Email: "a@b.com",
      Role: "BUYER",
      CreatedAt: new Date(),
    });
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", AuthHeader({ Id: "u1" }));
    expect(res.status).toBe(200);
    expect(res.body.Id).toBe("u1");
  });

  it("mengembalikan 404 jika pengguna tidak ada", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", AuthHeader({ Id: "hilang" }));
    expect(res.status).toBe(404);
  });
});
