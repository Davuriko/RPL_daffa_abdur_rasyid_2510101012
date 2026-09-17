import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function Main(): Promise<void> {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.store.deleteMany();

  const melati = await prisma.store.create({
    data: {
      Name: "Dapur Kost Melati",
      OwnerName: "Melati Andini",
      WhatsappNumber: "6281234567890",
      CampusLocation: "Gedung Fasilkom lt. 2",
      IsOpen: true,
    },
  });

  const risol = await prisma.store.create({
    data: {
      Name: "Risol Mayo Kampus",
      OwnerName: "Bagus Pratama",
      WhatsappNumber: "6289876543210",
      CampusLocation: "Kantin Teknik",
      IsOpen: true,
    },
  });

  const makananBerat = await prisma.category.create({
    data: { Name: "Makanan Berat" },
  });
  const camilan = await prisma.category.create({ data: { Name: "Camilan" } });
  const minuman = await prisma.category.create({ data: { Name: "Minuman" } });
  const dessert = await prisma.category.create({ data: { Name: "Dessert" } });

  const nasiGeprek = await prisma.product.create({
    data: {
      StoreId: melati.Id,
      CategoryId: makananBerat.Id,
      Name: "Nasi Ayam Geprek Sambal Bawang",
      Description:
        "Nasi hangat dengan ayam geprek renyah dan sambal bawang pedas.",
      Price: 15000,
      ImageUrl: "https://placehold.co/400x300?text=Nasi+Ayam+Geprek",
      IsAvailable: true,
    },
  });

  const nasiTelur = await prisma.product.create({
    data: {
      StoreId: melati.Id,
      CategoryId: makananBerat.Id,
      Name: "Nasi Telur Balado",
      Description: "Nasi dengan telur balado dan lalapan segar.",
      Price: 12000,
      ImageUrl: "https://placehold.co/400x300?text=Nasi+Telur+Balado",
      IsAvailable: true,
    },
  });

  const esTeh = await prisma.product.create({
    data: {
      StoreId: melati.Id,
      CategoryId: minuman.Id,
      Name: "Es Teh Manis Jumbo",
      Description: "Es teh manis segar ukuran jumbo.",
      Price: 5000,
      ImageUrl: "https://placehold.co/400x300?text=Es+Teh+Manis",
      IsAvailable: true,
    },
  });

  const pudingCoklat = await prisma.product.create({
    data: {
      StoreId: melati.Id,
      CategoryId: dessert.Id,
      Name: "Puding Coklat Vla",
      Description: "Puding coklat lembut dengan saus vla manis.",
      Price: 8000,
      ImageUrl: "https://placehold.co/400x300?text=Puding+Coklat",
      IsAvailable: true,
    },
  });

  const risolMayo = await prisma.product.create({
    data: {
      StoreId: risol.Id,
      CategoryId: camilan.Id,
      Name: "Risol Mayo Isi 5",
      Description: "Risol mayo isi telur, sosis, dan saus mayo, isi 5 pcs.",
      Price: 10000,
      ImageUrl: "https://placehold.co/400x300?text=Risol+Mayo",
      IsAvailable: true,
    },
  });

  const esKopi = await prisma.product.create({
    data: {
      StoreId: risol.Id,
      CategoryId: minuman.Id,
      Name: "Es Kopi Susu Gula Aren",
      Description: "Kopi susu dengan gula aren, cocok teman ngampus.",
      Price: 13000,
      ImageUrl: "https://placehold.co/400x300?text=Es+Kopi+Susu",
      IsAvailable: true,
    },
  });

  await prisma.order.create({
    data: {
      StoreId: melati.Id,
      CustomerName: "Rina Kusuma",
      CustomerWhatsapp: "6281100002222",
      DeliveryLocation: "Perpustakaan Lt. 1",
      Notes: "Sambalnya pisah ya kak.",
      TotalPrice: 20000,
      Status: "PREPARING",
      Items: {
        create: [
          {
            ProductId: nasiGeprek.Id,
            Quantity: 1,
            UnitPrice: 15000,
            Subtotal: 15000,
          },
          { ProductId: esTeh.Id, Quantity: 1, UnitPrice: 5000, Subtotal: 5000 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      StoreId: risol.Id,
      CustomerName: "Dimas Prakoso",
      CustomerWhatsapp: "6281233334444",
      DeliveryLocation: "Gedung Teknik Lt. 3",
      Notes: "",
      TotalPrice: 33000,
      Status: "PENDING",
      Items: {
        create: [
          {
            ProductId: risolMayo.Id,
            Quantity: 2,
            UnitPrice: 10000,
            Subtotal: 20000,
          },
          {
            ProductId: esKopi.Id,
            Quantity: 1,
            UnitPrice: 13000,
            Subtotal: 13000,
          },
        ],
      },
    },
  });

  console.log("Seed selesai: 2 toko, 4 kategori, 6 produk, 2 pesanan.");
}

Main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
