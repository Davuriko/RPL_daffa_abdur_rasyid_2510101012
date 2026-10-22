import { describe, expect, it } from "vitest";
import {
  ActiveOrderStatuses,
  BuildWhatsappUrl,
  FormatRupiah,
  NormalizeWhatsapp,
  OrderStatus,
  OrderStatusLabels,
  Role,
  RoleLabels,
} from "../src/index.js";

describe("FormatRupiah", () => {
  it("memformat angka menjadi mata uang rupiah", () => {
    expect(FormatRupiah(15000)).toBe("Rp 15.000");
    expect(FormatRupiah(0)).toBe("Rp 0");
  });
});

describe("NormalizeWhatsapp", () => {
  it("mengubah awalan 0 menjadi 62", () => {
    expect(NormalizeWhatsapp("08123456789")).toBe("628123456789");
  });

  it("menambahkan 62 pada nomor yang diawali 8", () => {
    expect(NormalizeWhatsapp("8123456789")).toBe("628123456789");
  });

  it("menghapus karakter non-digit", () => {
    expect(NormalizeWhatsapp("0812-345-6789")).toBe("628123456789");
    expect(NormalizeWhatsapp("+62 812 3456 789")).toBe("628123456789");
  });
});

describe("BuildWhatsappUrl", () => {
  it("membangun URL wa.me dengan pesan terenkode", () => {
    const url = BuildWhatsappUrl("08123456789", "Halo dunia");
    expect(url).toBe("https://wa.me/628123456789?text=Halo%20dunia");
  });
});

describe("Enums & Labels", () => {
  it("memiliki role yang benar", () => {
    expect(Role).toMatchObject({
      Admin: "ADMIN",
      Seller: "SELLER",
      Buyer: "BUYER",
    });
    expect(RoleLabels[Role.Admin]).toBe("Admin");
  });

  it("memiliki status pesanan yang benar", () => {
    expect(OrderStatus.Pending).toBe("PENDING");
    expect(OrderStatusLabels[OrderStatus.Completed]).toBe("Selesai");
  });

  it("status aktif hanya mencakup pending, preparing, dan ready", () => {
    expect(ActiveOrderStatuses).toEqual(["PENDING", "PREPARING", "READY"]);
  });
});
