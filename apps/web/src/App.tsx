import { useState } from "react";
import { CartProvider } from "./Context/CartContext";
import { CustomerPage } from "./Pages/CustomerPage";
import { SellerPage } from "./Pages/SellerPage";

type AppView = "Customer" | "Seller";

function ReadInitialView(): AppView {
  const params = new URLSearchParams(window.location.search);
  return params.get("view") === "seller" ? "Seller" : "Customer";
}

export function App() {
  const [view, setView] = useState<AppView>(ReadInitialView);

  const changeView = (next: AppView): void => {
    setView(next);
    const params = new URLSearchParams(window.location.search);
    params.set("view", next === "Seller" ? "seller" : "customer");
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  return (
    <CartProvider>
      <div className="min-h-screen">
        <div className="bg-brand-600 text-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
            <span className="text-sm font-bold">🍱 KampusBite</span>
            <div className="flex rounded-xl bg-white/15 p-1 text-sm">
              <ViewButton
                label="Pelanggan"
                active={view === "Customer"}
                onClick={() => changeView("Customer")}
              />
              <ViewButton
                label="Dashboard Penjual"
                active={view === "Seller"}
                onClick={() => changeView("Seller")}
              />
            </div>
          </div>
        </div>

        {view === "Customer" ? <CustomerPage /> : <SellerPage />}
      </div>
    </CartProvider>
  );
}

function ViewButton({
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
      className={`rounded-lg px-3 py-1 font-semibold transition ${
        active ? "bg-white text-brand-600" : "text-white/90 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
