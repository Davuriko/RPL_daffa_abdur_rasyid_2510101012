import { useCallback, useEffect, useState } from "react";
import {
  DashboardResponse,
  FormatRupiah,
  Order,
  OrderStatus,
} from "@kampus-bite/shared";
import { ApiClient } from "../Api/Client";
import { OrderStatusBadge } from "../Components/OrderStatusBadge";

interface SellerDashboardPageProps {
  storeId: string;
}

const NextActions: Record<
  OrderStatus,
  { Label: string; Status: OrderStatus; Style: string }[]
> = {
  [OrderStatus.Pending]: [
    {
      Label: "Terima & Masak",
      Status: OrderStatus.Preparing,
      Style: "bg-blue-500 hover:bg-blue-600",
    },
    {
      Label: "Tolak",
      Status: OrderStatus.Cancelled,
      Style: "bg-red-500 hover:bg-red-600",
    },
  ],
  [OrderStatus.Preparing]: [
    {
      Label: "Tandai Siap",
      Status: OrderStatus.Ready,
      Style: "bg-purple-500 hover:bg-purple-600",
    },
  ],
  [OrderStatus.Ready]: [
    {
      Label: "Selesaikan",
      Status: OrderStatus.Completed,
      Style: "bg-green-500 hover:bg-green-600",
    },
  ],
  [OrderStatus.Completed]: [],
  [OrderStatus.Cancelled]: [],
};

export function SellerDashboardPage({ storeId }: SellerDashboardPageProps) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const dashboard = await ApiClient.GetDashboard(storeId);
      setData(dashboard);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const toggleStore = async (): Promise<void> => {
    await ApiClient.ToggleStore(storeId);
    void load();
  };

  const updateStatus = async (
    order: Order,
    status: OrderStatus,
  ): Promise<void> => {
    await ApiClient.UpdateOrderStatus(order.Id, status);
    void load();
  };

  if (loading)
    return (
      <p className="py-10 text-center text-sm text-slate-500">
        Memuat dashboard...
      </p>
    );
  if (error)
    return <p className="py-10 text-center text-sm text-red-600">{error}</p>;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {data.Store.Name}
          </h2>
          <p className="text-sm text-slate-500">{data.Store.CampusLocation}</p>
        </div>
        <button
          type="button"
          onClick={toggleStore}
          className={`rounded-xl px-4 py-2 text-sm font-bold text-white transition ${
            data.Store.IsOpen
              ? "bg-green-500 hover:bg-green-600"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {data.Store.IsOpen ? "Toko Buka" : "Toko Tutup"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard
          label="Total Penjualan"
          value={FormatRupiah(data.TotalSales)}
          accent="text-green-600"
        />
        <MetricCard
          label="Pesanan Aktif"
          value={String(data.ActiveOrders)}
          accent="text-blue-600"
        />
        <MetricCard
          label="Total Menu"
          value={String(data.TotalMenu)}
          accent="text-brand-600"
        />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h3 className="mb-3 text-base font-bold text-slate-800">
          Pesanan Terbaru
        </h3>
        {data.RecentOrders.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Belum ada pesanan masuk.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {data.RecentOrders.map((order) => (
              <div
                key={order.Id}
                className="rounded-xl border border-slate-100 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {order.CustomerName}
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

                {order.Notes && (
                  <p className="mt-1 text-xs italic text-slate-500">
                    Catatan: {order.Notes}
                  </p>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-brand-600">
                    {FormatRupiah(order.TotalPrice)}
                  </span>
                  <div className="flex gap-2">
                    {NextActions[order.Status].map((action) => (
                      <button
                        key={action.Status}
                        type="button"
                        onClick={() => updateStatus(order, action.Status)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition ${action.Style}`}
                      >
                        {action.Label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-xl font-extrabold ${accent}`}>{value}</p>
    </div>
  );
}
