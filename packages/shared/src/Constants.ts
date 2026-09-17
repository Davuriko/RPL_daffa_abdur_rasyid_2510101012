import { OrderStatus } from "./Enums.js";

export const CurrencyLocale = "id-ID";

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: "Menunggu Konfirmasi",
  [OrderStatus.Preparing]: "Sedang Dimasak/Disiapkan",
  [OrderStatus.Ready]: "Siap Diambil/Diantar",
  [OrderStatus.Completed]: "Selesai",
  [OrderStatus.Cancelled]: "Dibatalkan",
};

export const ActiveOrderStatuses: OrderStatus[] = [
  OrderStatus.Pending,
  OrderStatus.Preparing,
  OrderStatus.Ready,
];

export function FormatRupiah(value: number): string {
  return "Rp " + value.toLocaleString(CurrencyLocale);
}

export function NormalizeWhatsapp(value: string): string {
  let digits = value.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  else if (digits.startsWith("8")) digits = "62" + digits;
  return digits;
}

export function BuildWhatsappUrl(
  whatsappNumber: string,
  message: string,
): string {
  const normalized = NormalizeWhatsapp(whatsappNumber);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
