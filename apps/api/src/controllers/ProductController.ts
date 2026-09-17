import { Prisma } from "@prisma/client";
import {
  CreateProductRequest,
  UpdateProductRequest,
} from "@kampus-bite/shared";
import { AsyncHandler } from "../middleware/AsyncHandler.js";
import { HttpError } from "../utils/HttpError.js";
import { prisma } from "../prisma.js";

export const GetProducts = AsyncHandler(async (req, res) => {
  const { StoreId, CategoryId, IsAvailable } = req.query;
  const where: Prisma.ProductWhereInput = {};

  if (typeof StoreId === "string") where.StoreId = StoreId;
  if (typeof CategoryId === "string") where.CategoryId = CategoryId;
  if (IsAvailable === "true") where.IsAvailable = true;
  if (IsAvailable === "false") where.IsAvailable = false;

  const products = await prisma.product.findMany({
    where,
    include: { Store: true, Category: true },
    orderBy: { CreatedAt: "desc" },
  });
  res.json(products);
});

export const GetProduct = AsyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { Id: req.params.Id },
    include: { Store: true, Category: true },
  });
  if (!product) throw new HttpError(404, "Produk tidak ditemukan.");
  res.json(product);
});

export const CreateProduct = AsyncHandler(async (req, res) => {
  const body = req.body as CreateProductRequest;
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
  const body = req.body as UpdateProductRequest;
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
