import { ActiveOrderStatuses, OrderStatus } from "@kampus-bite/shared";
import { AsyncHandler } from "../middleware/AsyncHandler.js";
import { HttpError } from "../utils/HttpError.js";
import { prisma } from "../prisma.js";

export const GetDashboard = AsyncHandler(async (req, res) => {
  const storeId = req.params.StoreId;
  const store = await prisma.store.findUnique({ where: { Id: storeId } });
  if (!store) throw new HttpError(404, "Toko tidak ditemukan.");

  const activeStatuses = ActiveOrderStatuses;
  const completedStatus = OrderStatus.Completed;

  const [salesAggregate, activeOrders, totalMenu, recentOrders] =
    await Promise.all([
      prisma.order.aggregate({
        where: { StoreId: storeId, Status: completedStatus },
        _sum: { TotalPrice: true },
      }),
      prisma.order.count({
        where: { StoreId: storeId, Status: { in: activeStatuses } },
      }),
      prisma.product.count({ where: { StoreId: storeId } }),
      prisma.order.findMany({
        where: { StoreId: storeId },
        include: { Items: { include: { Product: true } }, Store: true },
        orderBy: { CreatedAt: "desc" },
        take: 10,
      }),
    ]);

  res.json({
    Store: store,
    TotalSales: salesAggregate._sum.TotalPrice ?? 0,
    ActiveOrders: activeOrders,
    TotalMenu: totalMenu,
    RecentOrders: recentOrders,
  });
});
