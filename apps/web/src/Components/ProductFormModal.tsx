import { FormEvent, useEffect, useState } from "react";
import { Category, Product } from "@kampus-bite/shared";
import { ApiClient } from "../Api/Client";

interface ProductFormModalProps {
  isOpen: boolean;
  storeId: string;
  categories: Category[];
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ProductFormModal({
  isOpen,
  storeId,
  categories,
  product,
  onClose,
  onSaved,
}: ProductFormModalProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setName(product?.Name ?? "");
    setCategoryId(product?.CategoryId ?? categories[0]?.Id ?? "");
    setDescription(product?.Description ?? "");
    setPrice(product ? String(product.Price) : "");
    setImageUrl(product?.ImageUrl ?? "");
    setIsAvailable(product?.IsAvailable ?? true);
  }, [isOpen, product, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);

    const priceValue = Number(price);
    if (
      !name.trim() ||
      !categoryId ||
      Number.isNaN(priceValue) ||
      priceValue < 0
    ) {
      setError("Nama, kategori, dan harga yang valid wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      if (product) {
        await ApiClient.UpdateProduct(product.Id, {
          CategoryId: categoryId,
          Name: name.trim(),
          Description: description.trim(),
          Price: priceValue,
          ImageUrl: imageUrl.trim(),
          IsAvailable: isAvailable,
        });
      } else {
        await ApiClient.CreateProduct({
          StoreId: storeId,
          CategoryId: categoryId,
          Name: name.trim(),
          Description: description.trim(),
          Price: priceValue,
          ImageUrl: imageUrl.trim() || "https://placehold.co/400x300?text=Menu",
          IsAvailable: isAvailable,
        });
      }
      onSaved();
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Gagal menyimpan produk.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-bold text-slate-800">
            {product ? "Edit Menu" : "Tambah Menu"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 overflow-y-auto p-4"
        >
          <Field label="Nama Menu">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="contoh: Nasi Ayam Geprek"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </Field>

          <Field label="Kategori">
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            >
              {categories.map((category) => (
                <option key={category.Id} value={category.Id}>
                  {category.Name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Harga (Rp)">
            <input
              type="number"
              min={0}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="contoh: 15000"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </Field>

          <Field label="URL Gambar">
            <input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </Field>

          <Field label="Deskripsi">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              placeholder="Deskripsi singkat menu"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(event) => setIsAvailable(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-500"
            />
            Tersedia untuk dijual
          </label>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-1 w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:bg-slate-200"
          >
            {saving ? "Menyimpan..." : "Simpan Menu"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}
