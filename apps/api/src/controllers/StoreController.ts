import { CreateStoreRequest, UpdateStoreRequest } from "@kampus-bite/shared";
import { AsyncHandler } from "../middleware/AsyncHandler.js";
import { HttpError } from "../utils/HttpError.js";
import { prisma } from "../prisma.js";

export const GetStores = AsyncHandler(async (_req, res) => {
  const stores = await prisma.store.findMany({ orderBy: { CreatedAt: "asc" } });
  res.json(stores);
});

export const GetStore = AsyncHandler(async (req, res) => {
  const store = await prisma.store.findUnique({ where: { Id: req.params.Id } });
  if (!store) throw new HttpError(404, "Toko tidak ditemukan.");
  res.json(store);
});

export const CreateStore = AsyncHandler(async (req, res) => {
  const body = req.body as CreateStoreRequest;
  if (
    !body.Name ||
    !body.OwnerName ||
    !body.WhatsappNumber ||
    !body.CampusLocation
  ) {
    throw new HttpError(400, "Data toko tidak lengkap.");
  }

  const store = await prisma.store.create({
    data: {
      Name: body.Name,
      OwnerName: body.OwnerName,
      WhatsappNumber: body.WhatsappNumber,
      CampusLocation: body.CampusLocation,
      IsOpen: body.IsOpen ?? true,
    },
  });
  res.status(201).json(store);
});

export const UpdateStore = AsyncHandler(async (req, res) => {
  const body = req.body as UpdateStoreRequest;
  const existing = await prisma.store.findUnique({
    where: { Id: req.params.Id },
  });
  if (!existing) throw new HttpError(404, "Toko tidak ditemukan.");

  const store = await prisma.store.update({
    where: { Id: req.params.Id },
    data: {
      Name: body.Name,
      OwnerName: body.OwnerName,
      WhatsappNumber: body.WhatsappNumber,
      CampusLocation: body.CampusLocation,
      IsOpen: body.IsOpen,
    },
  });
  res.json(store);
});

export const ToggleStoreStatus = AsyncHandler(async (req, res) => {
  const existing = await prisma.store.findUnique({
    where: { Id: req.params.Id },
  });
  if (!existing) throw new HttpError(404, "Toko tidak ditemukan.");

  const store = await prisma.store.update({
    where: { Id: req.params.Id },
    data: { IsOpen: !existing.IsOpen },
  });
  res.json(store);
});
