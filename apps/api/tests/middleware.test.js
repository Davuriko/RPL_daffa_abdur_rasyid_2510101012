import { describe, expect, it } from "vitest";
import request from "supertest";
import { app, AuthHeader } from "./helpers/app.js";

describe("GET /health", () => {
  it("mengembalikan status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ Status: "ok" });
  });
});

describe("RequireAuth middleware", () => {
  it("menolak permintaan tanpa header Authorization", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.Message).toMatch(/Token tidak ditemukan/);
  });

  it("menolak token tidak valid", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer rusak");
    expect(res.status).toBe(401);
    expect(res.body.Message).toMatch(/tidak valid/);
  });
});

describe("RequireRole middleware", () => {
  it("menolak role yang tidak diizinkan dengan 403", async () => {
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", AuthHeader({ Role: "BUYER" }));
    expect(res.status).toBe(403);
    expect(res.body.Message).toMatch(/tidak memiliki akses/);
  });
});


describe("Security Headers", () => {
  it("menyertakan header proteksi keamanan dan menonaktifkan x-powered-by", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(res.headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });
});
