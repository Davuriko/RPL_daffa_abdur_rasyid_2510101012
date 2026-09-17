import { AsyncHandler } from "../middleware/AsyncHandler.js";
import { prisma } from "../prisma.js";

export const GetCategories = AsyncHandler(async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { CreatedAt: "asc" },
  });
  res.json(categories);
});
