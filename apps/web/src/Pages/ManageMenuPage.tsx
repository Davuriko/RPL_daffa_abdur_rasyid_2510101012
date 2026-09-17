import { useCallback, useEffect, useState } from "react";
import { Category, FormatRupiah, Product } from "@kampus-bite/shared";
import { ApiClient } from "../Api/Client";
import { ProductFormModal } from "../Components/ProductFormModal";

interface ManageMenuPageProps {
  storeId: string;
}

export function ManageMenuPage({ storeId }: ManageMenuPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [productList, categoryList] = await Promise.all([
        ApiClient.GetProducts({ StoreId: storeId }),
        ApiClient.GetCategories(),
      ]);
      setProducts(productList);
      setCategories(categoryList);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Gagal memuat menu.",
      );
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const openCreate = (): void => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product): void => {
    setEditing(product);
    setFormOpen(true);
  };

  const handleDelete = async (product: Product): Promise<void> => {
    const confirmed = window.confirm(
      `Hapus menu "${product.Name}"? Tindakan ini tidak bisa dibatalkan.`,
    );
    if (!confirmed) return;
    await ApiClient.DeleteProduct(product.Id);
    void load();
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800">Kelola Menu</h3>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-brand-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-brand-600"
        >
          + Tambah Menu
        </button>
      </div>

      {loading && (
        <p className="py-8 text-center text-sm text-slate-500">
          Memuat menu...
        </p>
      )}
      {error && (
        <p className="py-8 text-center text-sm text-red-600">{error}</p>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-3">Menu</th>
                <th className="py-2 pr-3">Kategori</th>
                <th className="py-2 pr-3">Harga</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Belum ada menu. Tambahkan menu pertama Anda.
                  </td>
                </tr>
              )}
              {products.map((product) => (
                <tr key={product.Id} className="border-b border-slate-50">
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={product.ImageUrl}
                        alt={product.Name}
                        className="h-9 w-9 rounded-lg object-cover"
                      />
                      <span className="font-medium text-slate-700">
                        {product.Name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 pr-3 text-slate-600">
                    {product.Category?.Name ?? "-"}
                  </td>
                  <td className="py-2 pr-3 font-semibold text-brand-600">
                    {FormatRupiah(product.Price)}
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        product.IsAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {product.IsAvailable ? "Tersedia" : "Habis"}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-200"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormModal
        isOpen={formOpen}
        storeId={storeId}
        categories={categories}
        product={editing}
        onClose={() => setFormOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
