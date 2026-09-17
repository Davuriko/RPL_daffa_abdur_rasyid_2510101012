import { useState } from "react";
import { CatalogPage } from "./CatalogPage";
import { TrackOrderPage } from "./TrackOrderPage";

type CustomerTab = "Catalog" | "Track";

export function CustomerPage() {
  const [tab, setTab] = useState<CustomerTab>("Catalog");

  return (
    <div>
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-5xl gap-1 px-4">
          <SubTab
            label="Katalog"
            active={tab === "Catalog"}
            onClick={() => setTab("Catalog")}
          />
          <SubTab
            label="Lacak Pesanan"
            active={tab === "Track"}
            onClick={() => setTab("Track")}
          />
        </div>
      </div>

      {tab === "Catalog" ? <CatalogPage /> : <TrackOrderPage />}
    </div>
  );
}

function SubTab({
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
      className={`border-b-2 px-3 py-2.5 text-sm font-semibold transition ${
        active
          ? "border-brand-500 text-brand-600"
          : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      {label}
    </button>
  );
}
