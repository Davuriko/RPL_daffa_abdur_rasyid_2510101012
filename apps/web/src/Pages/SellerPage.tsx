import { useEffect, useState } from "react";
import { Store } from "@kampus-bite/shared";
import { ApiClient } from "../Api/Client";
import { SellerDashboardPage } from "./SellerDashboardPage";
import { ManageMenuPage } from "./ManageMenuPage";

type SellerTab = "Dashboard" | "Menu";

export function SellerPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [tab, setTab] = useState<SellerTab>("Dashboard");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function Load(): Promise<void> {
      try {
        const storeList = await ApiClient.GetStores();
        setStores(storeList);
        if (storeList.length > 0) setSelectedStoreId(storeList[0].Id);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Gagal memuat toko.",
        );
      }
    }
    void Load();
  }, []);

  if (error)
    return <p className="py-10 text-center text-sm text-red-600">{error}</p>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            Pilih Toko
          </label>
          <select
            value={selectedStoreId}
            onChange={(event) => setSelectedStoreId(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
          >
            {stores.map((store) => (
              <option key={store.Id} value={store.Id}>
                {store.Name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1">
          <TabButton
            label="Dashboard"
            active={tab === "Dashboard"}
            onClick={() => setTab("Dashboard")}
          />
          <TabButton
            label="Kelola Menu"
            active={tab === "Menu"}
            onClick={() => setTab("Menu")}
          />
        </div>
      </div>

      {selectedStoreId && tab === "Dashboard" && (
        <SellerDashboardPage key={selectedStoreId} storeId={selectedStoreId} />
      )}
      {selectedStoreId && tab === "Menu" && (
        <ManageMenuPage key={selectedStoreId} storeId={selectedStoreId} />
      )}
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
        active
          ? "bg-white text-slate-800 shadow-sm"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {label}
    </button>
  );
}
