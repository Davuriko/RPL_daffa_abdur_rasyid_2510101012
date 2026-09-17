import { FormatRupiah, Product } from "@kampus-bite/shared";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const available = product.IsAvailable;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <div className="relative aspect-[4/3] bg-slate-100">
        <img
          src={product.ImageUrl}
          alt={product.Name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {!available && (
          <span className="absolute left-2 top-2 rounded-full bg-slate-900/80 px-2 py-1 text-xs font-medium text-white">
            Habis
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-800">
          {product.Name}
        </h3>
        {product.Store && (
          <p className="mt-0.5 text-xs text-slate-500">{product.Store.Name}</p>
        )}
        <p className="mt-2 text-base font-bold text-brand-600">
          {FormatRupiah(product.Price)}
        </p>

        <button
          type="button"
          disabled={!available}
          onClick={() => onAdd(product)}
          className="mt-3 w-full rounded-xl bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {available ? "Tambah ke Keranjang" : "Tidak Tersedia"}
        </button>
      </div>
    </div>
  );
}
