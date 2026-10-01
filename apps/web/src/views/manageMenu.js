import { FormatRupiah } from "@kampus-bite/shared";
import { ApiClient } from "../api.js";
import { escapeHtml } from "../dom.js";
import { openProductFormModal } from "./productFormModal.js";

export function renderManageMenu(container, storeId) {
  let products = [];
  let categories = [];
  let loading = true;
  let error = null;

  async function load() {
    error = null;
    try {
      [products, categories] = await Promise.all([
        ApiClient.GetProducts({ StoreId: storeId }),
        ApiClient.GetCategories(),
      ]);
    } catch (loadError) {
      error =
        loadError instanceof Error ? loadError.message : "Gagal memuat menu.";
    } finally {
      loading = false;
      render();
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Hapus menu "${product.Name}"? Tindakan ini tidak bisa dibatalkan.`,
    );
    if (!confirmed) return;
    await ApiClient.DeleteProduct(product.Id);
    await load();
  }

  function rowHtml(product) {
    return `
      <tr>
        <td>
          <div class="menu-cell">
            <img src="${escapeHtml(product.ImageUrl)}" alt="${escapeHtml(
              product.Name,
            )}" />
            <span>${escapeHtml(product.Name)}</span>
          </div>
        </td>
        <td style="color:var(--slate-600)">${escapeHtml(
          product.Category?.Name ?? "-",
        )}</td>
        <td class="price-cell">${FormatRupiah(product.Price)}</td>
        <td>
          <span class="status-pill ${product.IsAvailable ? "yes" : "no"}">${
            product.IsAvailable ? "Tersedia" : "Habis"
          }</span>
        </td>
        <td class="text-right">
          <div class="cell-actions">
            <button type="button" class="btn btn-sm btn-chip-edit" data-edit="${escapeHtml(
              product.Id,
            )}">Edit</button>
            <button type="button" class="btn btn-sm btn-chip-del" data-del="${escapeHtml(
              product.Id,
            )}">Hapus</button>
          </div>
        </td>
      </tr>`;
  }

  function render() {
    let body;
    if (loading) {
      body = `<p class="muted center" style="padding:2rem 0">Memuat menu...</p>`;
    } else if (error) {
      body = `<p class="error center" style="padding:2rem 0">${escapeHtml(
        error,
      )}</p>`;
    } else {
      const rows =
        products.length === 0
          ? `<tr><td colspan="5" class="center" style="padding:2rem 0;color:var(--slate-500)">Belum ada menu. Tambahkan menu pertama Anda.</td></tr>`
          : products.map(rowHtml).join("");
      body = `
        <div class="table-scroll">
          <table class="menu-table">
            <thead>
              <tr>
                <th>Menu</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Status</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }

    container.innerHTML = `
      <div class="card">
        <div class="row-between" style="margin-bottom:0.75rem">
          <h3 class="section-title" style="margin:0">Kelola Menu</h3>
          <button type="button" class="btn" data-create>+ Tambah Menu</button>
        </div>
        ${body}
      </div>`;

    container.querySelector("[data-create]").addEventListener("click", () =>
      openProductFormModal({
        storeId,
        categories,
        product: null,
        onSaved: load,
      }),
    );

    container.querySelectorAll("[data-edit]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const product = products.find((p) => p.Id === btn.dataset.edit);
        if (!product) return;
        openProductFormModal({ storeId, categories, product, onSaved: load });
      }),
    );

    container.querySelectorAll("[data-del]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const product = products.find((p) => p.Id === btn.dataset.del);
        if (product) void handleDelete(product);
      }),
    );
  }

  render();
  void load();
}
