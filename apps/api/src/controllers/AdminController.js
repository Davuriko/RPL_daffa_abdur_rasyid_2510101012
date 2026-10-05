import { Role } from "@kampus-bite/shared";
import { AsyncHandler } from "../middleware/AsyncHandler.js";
import { HttpError } from "../utils/HttpError.js";
import { prisma } from "../prisma.js";

export const GetStats = AsyncHandler(async (_req, res) => {
  const [
    totalUsers,
    totalSellers,
    totalBuyers,
    totalStores,
    verifiedStores,
    openStores,
    totalProducts,
    totalOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { Role: Role.Seller } }),
    prisma.user.count({ where: { Role: Role.Buyer } }),
    prisma.store.count(),
    prisma.store.count({ where: { IsVerified: true } }),
    prisma.store.count({ where: { IsOpen: true } }),
    prisma.product.count(),
    prisma.order.count(),
  ]);

  res.json({
    TotalUsers: totalUsers,
    TotalSellers: totalSellers,
    TotalBuyers: totalBuyers,
    TotalStores: totalStores,
    VerifiedStores: verifiedStores,
    OpenStores: openStores,
    TotalProducts: totalProducts,
    TotalOrders: totalOrders,
  });
});

export const GetUsers = AsyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { CreatedAt: "desc" },
    select: {
      Id: true,
      Name: true,
      Email: true,
      Role: true,
      CreatedAt: true,
    },
  });
  res.json(users);
});

export const GetStores = AsyncHandler(async (_req, res) => {
  const stores = await prisma.store.findMany({
    orderBy: { CreatedAt: "asc" },
    include: { Seller: { select: { Id: true, Name: true, Email: true } } },
  });
  res.json(stores);
});

export const SetStoreVerification = AsyncHandler(async (req, res) => {
  const { IsVerified } = req.body;
  if (typeof IsVerified !== "boolean") {
    throw new HttpError(400, "Nilai IsVerified harus berupa boolean.");
  }

  const existing = await prisma.store.findUnique({
    where: { Id: req.params.Id },
  });
  if (!existing) throw new HttpError(404, "Toko tidak ditemukan.");

  const store = await prisma.store.update({
    where: { Id: req.params.Id },
    data: { IsVerified },
  });
  res.json(store);
});
