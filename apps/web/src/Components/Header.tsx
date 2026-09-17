interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  cartCount: number;
  onCartClick: () => void;
}

export function Header({
  search,
  onSearchChange,
  cartCount,
  onCartClick,
}: HeaderProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍱</span>
          <span className="hidden text-lg font-extrabold text-brand-600 sm:block">
            KampusBite
          </span>
        </div>

        <div className="relative flex-1">
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari makanan, minuman, camilan..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-brand-400 focus:bg-white"
          />
        </div>

        <button
          type="button"
          onClick={onCartClick}
          className="relative rounded-xl bg-brand-500 px-3 py-2 text-white transition hover:bg-brand-600"
          aria-label="Buka keranjang"
        >
          <span className="text-lg">🛒</span>
          {cartCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
