import { FormEvent, useState } from "react";
import { CreateOrderResponse, FormatRupiah } from "@kampus-bite/shared";
import { ApiClient } from "../Api/Client";
import { UseCart } from "../Context/CartContext";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const cart = UseCart();
  const [customerName, setCustomerName] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateOrderResponse | null>(null);

  if (!isOpen) return null;

  const closeAndReset = (): void => {
    setError(null);
    setResult(null);
    onClose();
  };

  const startNewOrder = (): void => {
    cart.ClearCart();
    setCustomerName("");
    setCustomerWhatsapp("");
    setDeliveryLocation("");
    setNotes("");
    closeAndReset();
  };

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (!cart.StoreId || cart.Items.length === 0) {
      setError("Keranjang masih kosong.");
      return;
    }
    if (
      !customerName.trim() ||
      !customerWhatsapp.trim() ||
      !deliveryLocation.trim()
    ) {
      setError("Nama, nomor WhatsApp, dan lokasi antar wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await ApiClient.CreateOrder({
        StoreId: cart.StoreId,
        CustomerName: customerName.trim(),
        CustomerWhatsapp: customerWhatsapp.trim(),
        DeliveryLocation: deliveryLocation.trim(),
        Notes: notes.trim(),
        Items: cart.Items.map((item) => ({
          ProductId: item.Product.Id,
          Quantity: item.Quantity,
        })),
      });
      localStorage.setItem("KampusBiteWhatsapp", customerWhatsapp.trim());
      setResult(response);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Gagal membuat pesanan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-bold text-slate-800">
            {result ? "Pesanan Dibuat 🎉" : "Keranjang & Checkout"}
          </h2>
          <button
            type="button"
            onClick={closeAndReset}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {result ? (
          <div className="flex flex-col gap-4 overflow-y-auto p-4">
            <p className="text-sm text-slate-600">
              Pesanan berhasil dicatat. Lanjutkan dengan mengirim detail pesanan
              ke penjual via WhatsApp.
            </p>
            <p className="rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">
              Pantau status pesanan (diterima, dimasak, siap) kapan saja lewat
              menu "Lacak Pesanan" memakai nomor WhatsApp ini.
            </p>
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <div className="flex justify-between font-semibold">
                <span>Total Pesanan</span>
                <span className="text-brand-600">
                  {FormatRupiah(result.Order.TotalPrice)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Kode Pesanan: {result.Order.Id}
              </p>
            </div>
            <a
              href={result.WhatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full rounded-xl bg-green-500 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-green-600"
            >
              Kirim Pesanan ke WhatsApp Penjual
            </a>
            <button
              type="button"
              onClick={startNewOrder}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Selesai & Pesan Lagi
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 overflow-y-auto p-4"
          >
            {cart.Items.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Keranjang masih kosong.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {cart.Items.map((item) => (
                  <div
                    key={item.Product.Id}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-2"
                  >
                    <img
                      src={item.Product.ImageUrl}
                      alt={item.Product.Name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">
                        {item.Product.Name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {FormatRupiah(item.Product.Price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => cart.DecrementItem(item.Product.Id)}
                        className="h-7 w-7 rounded-lg bg-white text-slate-600 ring-1 ring-slate-200"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-semibold">
                        {item.Quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => cart.AddItem(item.Product)}
                        className="h-7 w-7 rounded-lg bg-white text-slate-600 ring-1 ring-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between px-1 pt-1 text-sm font-bold">
                  <span>Subtotal</span>
                  <span className="text-brand-600">
                    {FormatRupiah(cart.TotalPrice)}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2">
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Nama Lengkap"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
              <input
                value={customerWhatsapp}
                onChange={(event) => setCustomerWhatsapp(event.target.value)}
                placeholder="Nomor WhatsApp (contoh: 08123456789)"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
              <input
                value={deliveryLocation}
                onChange={(event) => setDeliveryLocation(event.target.value)}
                placeholder="Lokasi Antar (contoh: Perpustakaan Lt. 1)"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Catatan (opsional)"
                rows={2}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
            </div>

            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Metode Pembayaran: Bayar di Tempat (COD) / Transfer Langsung ke
              Penjual.
            </p>

            {error && (
              <p className="text-sm font-medium text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || cart.Items.length === 0}
              className="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:bg-slate-200 disabled:text-slate-400"
            >
              {submitting ? "Memproses..." : "Buat Pesanan"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
