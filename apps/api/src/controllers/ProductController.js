import { AsyncHandler } from "../middleware/AsyncHandler.js";
import { HttpError } from "../utils/HttpError.js";
import { prisma } from "../prisma.js";

async function AttachRatings(products) {
  const list = Array.isArray(products) ? products : [products];
  const ids = list.map((product) => product.Id);
  if (ids.length === 0) return products;

  const grouped = await prisma.review.groupBy({
    by: ["ProductId"],
    where: { ProductId: { in: ids } },
    _avg: { Rating: true },
    _count: { Rating: true },
  });
  const map = new Map(grouped.map((row) => [row.ProductId, row]));

  for (const product of list) {
    const row = map.get(product.Id);
    product.RatingAverage = row?._avg.Rating ?? 0;
    product.RatingCount = row?._count.Rating ?? 0;
  }
  return products;
}

export const GetProducts = AsyncHandler(async (req, res) => {
  const { StoreId, CategoryId, IsAvailable } = req.query;
  const where = {};

  if (typeof StoreId === "string") where.StoreId = StoreId;
  if (typeof CategoryId === "string") where.CategoryId = CategoryId;
  if (IsAvailable === "true") where.IsAvailable = true;
  if (IsAvailable === "false") where.IsAvailable = false;

  const products = await prisma.product.findMany({
    where,
    include: { Store: true, Category: true },
    orderBy: { CreatedAt: "desc" },
  });
  await AttachRatings(products);
  res.json(products);
});

export const GetProduct = AsyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { Id: req.params.Id },
    include: { Store: true, Category: true },
  });
  if (!product) throw new HttpError(404, "Produk tidak ditemukan.");
  await AttachRatings(product);
  res.json(product);
});

export const CreateProduct = AsyncHandler(async (req, res) => {
  const body = req.body;
  if (
    !body.StoreId ||
    !body.CategoryId ||
    !body.Name ||
    body.Price === undefined
  ) {
    throw new HttpError(400, "Data produk tidak lengkap.");
  }
  if (body.Price < 0) throw new HttpError(400, "Harga tidak boleh negatif.");

  const product = await prisma.product.create({
    data: {
      StoreId: body.StoreId,
      CategoryId: body.CategoryId,
      Name: body.Name,
      Description: body.Description ?? "",
      Price: Math.round(body.Price),
      ImageUrl: body.ImageUrl ?? "",
      IsAvailable: body.IsAvailable ?? true,
    },
    include: { Store: true, Category: true },
  });
  res.status(201).json(product);
});

export const UpdateProduct = AsyncHandler(async (req, res) => {
  const body = req.body;
  const existing = await prisma.product.findUnique({
    where: { Id: req.params.Id },
  });
  if (!existing) throw new HttpError(404, "Produk tidak ditemukan.");
  if (body.Price !== undefined && body.Price < 0)
    throw new HttpError(400, "Harga tidak boleh negatif.");

  const product = await prisma.product.update({
    where: { Id: req.params.Id },
    data: {
      CategoryId: body.CategoryId,
      Name: body.Name,
      Description: body.Description,
      Price: body.Price === undefined ? undefined : Math.round(body.Price),
      ImageUrl: body.ImageUrl,
      IsAvailable: body.IsAvailable,
    },
    include: { Store: true, Category: true },
  });
  res.json(product);
});

export const DeleteProduct = AsyncHandler(async (req, res) => {
  const existing = await prisma.product.findUnique({
    where: { Id: req.params.Id },
  });
  if (!existing) throw new HttpError(404, "Produk tidak ditemukan.");

  await prisma.product.delete({ where: { Id: req.params.Id } });
  res.status(204).send();
});
