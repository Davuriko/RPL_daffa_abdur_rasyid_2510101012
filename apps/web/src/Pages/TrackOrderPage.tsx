import { FormEvent, useState } from "react";
import { FormatRupiah, Order } from "@kampus-bite/shared";
import { ApiClient } from "../Api/Client";
import { OrderStatusBadge } from "../Components/OrderStatusBadge";

export function TrackOrderPage() {
  const [whatsapp, setWhatsapp] = useState(
    () => localStorage.getItem("KampusBiteWhatsapp") ?? "",
  );
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);
    if (!whatsapp.trim()) {
      setError("Masukkan nomor WhatsApp yang dipakai saat memesan.");
      return;
    }

    setLoading(true);
    try {
      const result = await ApiClient.GetCustomerOrders(whatsapp.trim());
      localStorage.setItem("KampusBiteWhatsapp", whatsapp.trim());
      setOrders(result);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat pesanan.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-5">
      <h1 className="text-lg font-bold text-slate-800">Lacak Pesanan</h1>
      <p className="mt-1 text-sm text-slate-500">
        Masukkan nomor WhatsApp yang kamu gunakan saat checkout untuk melihat
        status pesanan.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={whatsapp}
          onChange={(event) => setWhatsapp(event.target.value)}
          placeholder="contoh: 08123456789"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-600 disabled:bg-slate-200"
        >
          {loading ? "Mencari..." : "Cek Status"}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
      )}

      {orders && orders.length === 0 && (
        <p className="mt-6 text-center text-sm text-slate-500">
          Tidak ada pesanan untuk nomor tersebut.
        </p>
      )}

      {orders && orders.length > 0 && (
        <div className="mt-5 flex flex-col gap-3">
          {orders.map((order) => (
            <div
              key={order.Id}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {order.Store?.Name ?? "Toko"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {order.DeliveryLocation}
                  </p>
                </div>
                <OrderStatusBadge status={order.Status} />
              </div>

              <ul className="mt-2 space-y-0.5 text-xs text-slate-600">
                {order.Items?.map((item) => (
                  <li key={item.Id}>
                    {item.Quantity}x {item.Product?.Name ?? "Produk"} —{" "}
                    {FormatRupiah(item.Subtotal)}
                  </li>
                ))}
              </ul>

              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-xs text-slate-400">
                  {new Date(order.CreatedAt).toLocaleString("id-ID")}
                </span>
                <span className="text-sm font-bold text-brand-600">
                  {FormatRupiah(order.TotalPrice)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
