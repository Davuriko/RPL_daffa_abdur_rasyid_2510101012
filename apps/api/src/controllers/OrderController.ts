import { OrderStatus as PrismaOrderStatus, Prisma } from "@prisma/client";
import {
  BuildWhatsappUrl,
  CreateOrderRequest,
  CreateOrderResponse,
  FormatRupiah,
  NormalizeWhatsapp,
  Order,
  OrderStatus,
  UpdateOrderStatusRequest,
} from "@kampus-bite/shared";
import { AsyncHandler } from "../middleware/AsyncHandler.js";
import { HttpError } from "../utils/HttpError.js";
import { prisma } from "../prisma.js";

type OrderWithDetails = Prisma.OrderGetPayload<{
  include: { Items: { include: { Product: true } }; Store: true };
}>;

function BuildOrderMessage(order: OrderWithDetails): string {
  const itemLines = order.Items.map(
    (item) =>
      `- ${item.Quantity}x ${item.Product.Name} (${FormatRupiah(item.UnitPrice)}) = ${FormatRupiah(item.Subtotal)}`,
  );

  const lines = [
    `Halo *${order.Store.Name}*, saya ingin memesan:`,
    "",
    ...itemLines,
    "",
    `*Total: ${FormatRupiah(order.TotalPrice)}*`,
    "",
    `Nama: ${order.CustomerName}`,
    `WhatsApp: ${order.CustomerWhatsapp}`,
    `Lokasi Antar: ${order.DeliveryLocation}`,
  ];

  if (order.Notes) lines.push(`Catatan: ${order.Notes}`);
  lines.push(
    "",
    "Pembayaran: Bayar di Tempat (COD) / Transfer Langsung ke Penjual",
  );
  return lines.join("\n");
}

export const CreateOrder = AsyncHandler(async (req, res) => {
  const body = req.body as CreateOrderRequest;
  if (
    !body.StoreId ||
    !body.CustomerName ||
    !body.CustomerWhatsapp ||
    !body.DeliveryLocation
  ) {
    throw new HttpError(400, "Data pesanan tidak lengkap.");
  }
  if (!Array.isArray(body.Items) || body.Items.length === 0) {
    throw new HttpError(400, "Keranjang belanja masih kosong.");
  }

  const store = await prisma.store.findUnique({ where: { Id: body.StoreId } });
  if (!store) throw new HttpError(404, "Toko tidak ditemukan.");
  if (!store.IsOpen)
    throw new HttpError(
      400,
      "Toko sedang tutup, tidak dapat menerima pesanan.",
    );

  const productIds = body.Items.map((item) => item.ProductId);
  const products = await prisma.product.findMany({
    where: { Id: { in: productIds }, StoreId: body.StoreId },
  });
  const productMap = new Map(products.map((product) => [product.Id, product]));

  let totalPrice = 0;
  const itemsData = body.Items.map((item) => {
    const product = productMap.get(item.ProductId);
    if (!product)
      throw new HttpError(400, "Produk pada keranjang tidak valid.");
    if (!product.IsAvailable)
      throw new HttpError(
        400,
        `Produk "${product.Name}" sedang tidak tersedia.`,
      );

    const quantity = Math.max(1, Math.floor(item.Quantity));
    const subtotal = product.Price * quantity;
    totalPrice += subtotal;
    return {
      ProductId: product.Id,
      Quantity: quantity,
      UnitPrice: product.Price,
      Subtotal: subtotal,
    };
  });

  const order = await prisma.order.create({
    data: {
      StoreId: body.StoreId,
      CustomerName: body.CustomerName,
      CustomerWhatsapp: body.CustomerWhatsapp,
      DeliveryLocation: body.DeliveryLocation,
      Notes: body.Notes ?? "",
      TotalPrice: totalPrice,
      Items: { create: itemsData },
    },
    include: { Items: { include: { Product: true } }, Store: true },
  });

  const whatsappUrl = BuildWhatsappUrl(
    store.WhatsappNumber,
    BuildOrderMessage(order),
  );
  const response: CreateOrderResponse = {
    Order: order as unknown as Order,
    WhatsappUrl: whatsappUrl,
  };
  res.status(201).json(response);
});

export const GetStoreOrders = AsyncHandler(async (req, res) => {
  const store = await prisma.store.findUnique({
    where: { Id: req.params.StoreId },
  });
  if (!store) throw new HttpError(404, "Toko tidak ditemukan.");

  const orders = await prisma.order.findMany({
    where: { StoreId: req.params.StoreId },
    include: { Items: { include: { Product: true } }, Store: true },
    orderBy: { CreatedAt: "desc" },
  });
  res.json(orders);
});

export const GetCustomerOrders = AsyncHandler(async (req, res) => {
  const raw = req.query.CustomerWhatsapp;
  if (typeof raw !== "string" || raw.trim() === "") {
    throw new HttpError(400, "Nomor WhatsApp wajib diisi.");
  }

  const normalized = NormalizeWhatsapp(raw);
  const core = normalized.slice(-9);

  const candidates = await prisma.order.findMany({
    where: { CustomerWhatsapp: { contains: core } },
    include: { Items: { include: { Product: true } }, Store: true },
    orderBy: { CreatedAt: "desc" },
  });

  const orders = candidates.filter(
    (order) => NormalizeWhatsapp(order.CustomerWhatsapp) === normalized,
  );
  res.json(orders);
});

export const UpdateOrderStatus = AsyncHandler(async (req, res) => {
  const body = req.body as UpdateOrderStatusRequest;
  const validStatuses = Object.values(OrderStatus);
  if (!body.Status || !validStatuses.includes(body.Status)) {
    throw new HttpError(400, "Status pesanan tidak valid.");
  }

  const existing = await prisma.order.findUnique({
    where: { Id: req.params.Id },
  });
  if (!existing) throw new HttpError(404, "Pesanan tidak ditemukan.");

  const order = await prisma.order.update({
    where: { Id: req.params.Id },
    data: { Status: body.Status as unknown as PrismaOrderStatus },
    include: { Items: { include: { Product: true } }, Store: true },
  });
  res.json(order);
});
