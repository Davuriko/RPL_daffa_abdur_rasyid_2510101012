import { NormalizeWhatsapp } from "@kampus-bite/shared";
import { AsyncHandler } from "../middleware/AsyncHandler.js";
import { HttpError } from "../utils/HttpError.js";
import { prisma } from "../prisma.js";

export const CreateReview = AsyncHandler(async (req, res) => {
  const { ProductId, CustomerWhatsapp, Rating } = req.body;

  if (!ProductId || !CustomerWhatsapp) {
    throw new HttpError(400, "Produk dan nomor WhatsApp wajib diisi.");
  }

  const rating = Math.round(Number(Rating));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new HttpError(400, "Rating harus di antara 1 sampai 5 bintang.");
  }

  const product = await prisma.product.findUnique({ where: { Id: ProductId } });
  if (!product) throw new HttpError(404, "Produk tidak ditemukan.");

  const normalized = NormalizeWhatsapp(CustomerWhatsapp);
  const hasOrder = await prisma.order.findFirst({
    where: {
      Items: { some: { ProductId } },
      CustomerWhatsapp: { contains: normalized.slice(-9) },
    },
  });
  if (!hasOrder) {
    throw new HttpError(
      403,
      "Hanya pembeli yang pernah memesan menu ini yang dapat memberi rating.",
    );
  }

  await prisma.review.upsert({
    where: {
      ProductId_CustomerWhatsapp: {
        ProductId,
        CustomerWhatsapp: normalized,
      },
    },
    update: { Rating: rating },
    create: { ProductId, CustomerWhatsapp: normalized, Rating: rating },
  });

  const summary = await prisma.review.aggregate({
    where: { ProductId },
    _avg: { Rating: true },
    _count: { Rating: true },
  });

  res.status(201).json({
    ProductId,
    MyRating: rating,
    RatingAverage: summary._avg.Rating ?? 0,
    RatingCount: summary._count.Rating ?? 0,
  });
});
