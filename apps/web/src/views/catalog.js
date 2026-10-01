import { FormatRupiah } from "@kampus-bite/shared";
import { ApiClient } from "../api.js";
import { Cart } from "../cart.js";
import { escapeHtml } from "../dom.js";
import { openCheckoutModal } from "./checkoutModal.js";

export async function renderCatalog(container) {
  container.innerHTML = `<p class="muted center pad-y">Memuat menu...</p>`;

  let stores = [];
  let categories = [];
  let products = [];
  try {
    [stores, categories, products] = await Promise.all([
      ApiClient.GetStores(),
      ApiClient.GetCategories(),
      ApiClient.GetProducts(),
    ]);
  } catch (loadError) {
    container.innerHTML = `<p class="error center pad-y">${escapeHtml(
      loadError instanceof Error ? loadError.message : "Gagal memuat data.",
    )}</p>`;
    return;
  }

  let search = "";
  let selectedCategoryId = null;
  let selectedStoreId = null;

  container.innerHTML = `
    <div class="catalog-wrap">
      <div class="app-header">
        <div class="app-header-inner">
          <div class="app-header-logo">
            <span>🍱</span>
            <span class="name">KampusBite</span>
          </div>
          <div class="search-wrap">
            <input class="input input-soft" type="search" id="catalog-search" placeholder="Cari makanan, minuman, camilan..." />
          </div>
          <button type="button" class="cart-button" id="cart-open" aria-label="Buka keranjang">
            🛒<span class="cart-badge hidden" id="cart-badge">0</span>
          </button>
        </div>
      </div>

      <div class="container">
        <div class="filter-row" id="category-row"></div>
        <div class="filter-row" id="store-row"></div>
        <div id="catalog-status"></div>
        <div class="product-grid" id="product-grid"></div>
      </div>
    </div>`;

  const searchInput = container.querySelector("#catalog-search");
  const categoryRow = container.querySelector("#category-row");
  const storeRow = container.querySelector("#store-row");
  const statusEl = container.querySelector("#catalog-status");
  const grid = container.querySelector("#product-grid");
  const badge = container.querySelector("#cart-badge");

  function updateCartBadge() {
    const count = Cart.TotalQuantity;
    badge.textContent = String(count);
    badge.classList.toggle("hidden", count === 0);
  }

  function paintCategories() {
    const tabs = [
      `<button type="button" class="chip ${
        selectedCategoryId === null ? "active" : ""
      }" data-category="">Semua</button>`,
      ...categories.map(
        (category) =>
          `<button type="button" class="chip ${
            selectedCategoryId === category.Id ? "active" : ""
          }" data-category="${escapeHtml(category.Id)}">${escapeHtml(
            category.Name,
          )}</button>`,
      ),
    ];
    categoryRow.innerHTML = tabs.join("");
    categoryRow.querySelectorAll("[data-category]").forEach((btn) =>
      btn.addEventListener("click", () => {
        selectedCategoryId = btn.dataset.category || null;
        paintCategories();
        paintGrid();
      }),
    );
  }

  function paintStores() {
    const chips = [
      `<button type="button" class="store-chip ${
        selectedStoreId === null ? "active" : ""
      }" data-store="">Semua Toko</button>`,
      ...stores.map(
        (store) =>
          `<button type="button" class="store-chip ${
            selectedStoreId === store.Id ? "active" : ""
          }" data-store="${escapeHtml(store.Id)}">
            <span>${escapeHtml(store.Name)}</span>
            <span class="store-state ${store.IsOpen ? "open" : "closed"}">${
              store.IsOpen ? "Buka" : "Tutup"
            }</span>
          </button>`,
      ),
    ];
    storeRow.innerHTML = chips.join("");
    storeRow.querySelectorAll("[data-store]").forEach((btn) =>
      btn.addEventListener("click", () => {
        selectedStoreId = btn.dataset.store || null;
        paintStores();
        paintGrid();
      }),
    );
  }

  function filteredProducts() {
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
  }

  function paintGrid() {
    const list = filteredProducts();
    if (list.length === 0) {
      statusEl.innerHTML = `<p class="muted center pad-y">Belum ada menu yang cocok.</p>`;
      grid.innerHTML = "";
      return;
    }
    statusEl.innerHTML = "";
    grid.innerHTML = list
      .map((product) => {
        const available = product.IsAvailable;
        return `
        <div class="product-card">
          <div class="product-media">
            <img src="${escapeHtml(product.ImageUrl)}" alt="${escapeHtml(
              product.Name,
            )}" loading="lazy" />
            ${!available ? `<span class="sold-out">Habis</span>` : ""}
          </div>
          <div class="product-body">
            <h3 class="product-title">${escapeHtml(product.Name)}</h3>
            ${
              product.Store
                ? `<p class="product-store">${escapeHtml(
                    product.Store.Name,
                  )}</p>`
                : ""
            }
            <p class="product-price">${FormatRupiah(product.Price)}</p>
            <button type="button" class="btn btn-block" style="margin-top:0.75rem" data-add="${escapeHtml(
              product.Id,
            )}" ${available ? "" : "disabled"}>${
              available ? "Tambah ke Keranjang" : "Tidak Tersedia"
            }</button>
          </div>
        </div>`;
      })
      .join("");

    grid.querySelectorAll("[data-add]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const product = products.find((p) => p.Id === btn.dataset.add);
        if (!product) return;
        Cart.AddItem(product);
        updateCartBadge();
      }),
    );
  }

  searchInput.addEventListener("input", () => {
    search = searchInput.value;
    paintGrid();
  });

  container.querySelector("#cart-open").addEventListener("click", () => {
    openCheckoutModal(updateCartBadge);
  });

  paintCategories();
  paintStores();
  paintGrid();
  updateCartBadge();
}
