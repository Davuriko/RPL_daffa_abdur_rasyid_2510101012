import { useEffect, useMemo, useState } from "react";
import { Category, Product, Store } from "@kampus-bite/shared";
import { ApiClient } from "../Api/Client";
import { UseCart } from "../Context/CartContext";
import { Header } from "../Components/Header";
import { ProductCard } from "../Components/ProductCard";
import { CheckoutModal } from "../Components/CheckoutModal";

export function CatalogPage() {
  const cart = UseCart();
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    let active = true;
    async function Load(): Promise<void> {
      try {
        const [storeList, categoryList, productList] = await Promise.all([
          ApiClient.GetStores(),
          ApiClient.GetCategories(),
          ApiClient.GetProducts(),
        ]);
        if (!active) return;
        setStores(storeList);
        setCategories(categoryList);
        setProducts(productList);
      } catch (loadError) {
        if (active)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat data.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void Load();
    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchKeyword =
        keyword === "" || product.Name.toLowerCase().includes(keyword);
      const matchCategory =
        !selectedCategoryId || product.CategoryId === selectedCategoryId;
      const matchStore =
        !selectedStoreId || product.StoreId === selectedStoreId;
      return matchKeyword && matchCategory && matchStore;
    });
  }, [products, search, selectedCategoryId, selectedStoreId]);

  return (
    <div className="min-h-screen pb-10">
      <Header
        search={search}
        onSearchChange={setSearch}
        cartCount={cart.TotalQuantity}
        onCartClick={() => setCartOpen(true)}
      />

      <div className="mx-auto max-w-5xl px-4">
        <div className="flex gap-2 overflow-x-auto py-3">
          <CategoryTab
            label="Semua"
            active={selectedCategoryId === null}
            onClick={() => setSelectedCategoryId(null)}
          />
          {categories.map((category) => (
            <CategoryTab
              key={category.Id}
              label={category.Name}
              active={selectedCategoryId === category.Id}
              onClick={() => setSelectedCategoryId(category.Id)}
            />
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3">
          <StoreChip
            label="Semua Toko"
            active={selectedStoreId === null}
            onClick={() => setSelectedStoreId(null)}
          />
          {stores.map((store) => (
            <StoreChip
              key={store.Id}
              label={store.Name}
              isOpen={store.IsOpen}
              active={selectedStoreId === store.Id}
              onClick={() => setSelectedStoreId(store.Id)}
            />
          ))}
        </div>

        {loading && (
          <p className="py-10 text-center text-sm text-slate-500">
            Memuat menu...
          </p>
        )}
        {error && (
          <p className="py-10 text-center text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">
            Belum ada menu yang cocok.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.Id}
              product={product}
              onAdd={cart.AddItem}
            />
          ))}
        </div>
      </div>

      <CheckoutModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

function CategoryTab({
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
      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition ${
        active
          ? "bg-brand-500 text-white"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

interface StoreChipProps {
  label: string;
  isOpen?: boolean;
  active: boolean;
  onClick: () => void;
}

function StoreChip({ label, isOpen, active, onClick }: StoreChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-slate-800 text-white"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      <span>{label}</span>
      {isOpen !== undefined && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {isOpen ? "Buka" : "Tutup"}
        </span>
      )}
    </button>
  );
}
