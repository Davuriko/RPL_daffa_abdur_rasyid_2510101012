import { FormatRupiah, OrderStatus } from "@kampus-bite/shared";
import { ApiClient } from "../api.js";
import { escapeHtml, OrderStatusBadge } from "../dom.js";

const NextActions = {
  [OrderStatus.Pending]: [
    {
      Label: "Terima & Masak",
      Status: OrderStatus.Preparing,
      Class: "btn-blue",
    },
    { Label: "Tolak", Status: OrderStatus.Cancelled, Class: "btn-red" },
  ],
  [OrderStatus.Preparing]: [
    { Label: "Tandai Siap", Status: OrderStatus.Ready, Class: "btn-purple" },
  ],
  [OrderStatus.Ready]: [
    { Label: "Selesaikan", Status: OrderStatus.Completed, Class: "btn-green" },
  ],
  [OrderStatus.Completed]: [],
  [OrderStatus.Cancelled]: [],
};

export function renderSellerDashboard(container, storeId) {
  let data = null;
  let loading = true;
  let error = null;

  async function load() {
    error = null;
    try {
      data = await ApiClient.GetDashboard(storeId);
    } catch (loadError) {
      error =
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat dashboard.";
    } finally {
      loading = false;
      render();
    }
  }

  async function toggleStore() {
    await ApiClient.ToggleStore(storeId);
    await load();
  }

  async function updateStatus(orderId, status) {
    await ApiClient.UpdateOrderStatus(orderId, status);
    await load();
  }

  function orderCard(order) {
    const items = (order.Items ?? [])
      .map(
        (item) =>
          `<li>${item.Quantity}x ${escapeHtml(
            item.Product?.Name ?? "Produk",
          )} — ${FormatRupiah(item.Subtotal)}</li>`,
      )
      .join("");

    const actions = (NextActions[order.Status] ?? [])
      .map(
        (action) =>
          `<button type="button" class="btn btn-sm ${action.Class}" data-order="${escapeHtml(
            order.Id,
          )}" data-status="${escapeHtml(action.Status)}">${escapeHtml(
            action.Label,
          )}</button>`,
      )
      .join("");

    return `
      <div class="order-card">
        <div class="order-head">
          <div>
            <p class="order-name">${escapeHtml(order.CustomerName)}</p>
            <p class="order-sub">${escapeHtml(order.DeliveryLocation)}</p>
          </div>
          ${OrderStatusBadge(order.Status)}
        </div>
        <ul class="order-items">${items}</ul>
        ${
          order.Notes
            ? `<p class="order-note">Catatan: ${escapeHtml(order.Notes)}</p>`
            : ""
        }
        <div class="order-foot">
          <span class="order-total">${FormatRupiah(order.TotalPrice)}</span>
          <div class="order-actions">${actions}</div>
        </div>
      </div>`;
  }

  function render() {
    if (loading) {
      container.innerHTML = `<p class="muted center pad-y">Memuat dashboard...</p>`;
      return;
    }
    if (error) {
      container.innerHTML = `<p class="error center pad-y">${escapeHtml(error)}</p>`;
      return;
    }
    if (!data) {
      container.innerHTML = "";
      return;
    }

    const recent =
      data.RecentOrders.length === 0
        ? `<p class="muted center" style="padding:1.5rem 0">Belum ada pesanan masuk.</p>`
        : `<div class="stack-sm">${data.RecentOrders.map(orderCard).join("")}</div>`;

    container.innerHTML = `
      <div class="stack">
        <div class="card row-between">
          <div>
            <h2 class="section-title" style="margin:0">${escapeHtml(
              data.Store.Name,
            )}</h2>
            <p class="muted">${escapeHtml(data.Store.CampusLocation)}</p>
          </div>
          <button type="button" class="btn btn-lg ${
            data.Store.IsOpen ? "btn-green" : "btn-red"
          }" data-toggle>${data.Store.IsOpen ? "Toko Buka" : "Toko Tutup"}</button>
        </div>

        <div class="metrics">
          <div class="card">
            <p class="metric-label">Total Penjualan</p>
            <p class="metric-value accent-green">${FormatRupiah(
              data.TotalSales,
            )}</p>
          </div>
          <div class="card">
            <p class="metric-label">Pesanan Aktif</p>
            <p class="metric-value accent-blue">${data.ActiveOrders}</p>
          </div>
          <div class="card">
            <p class="metric-label">Total Menu</p>
            <p class="metric-value accent-brand">${data.TotalMenu}</p>
          </div>
        </div>

        <div class="card">
          <h3 class="section-title">Pesanan Terbaru</h3>
          ${recent}
        </div>
      </div>`;

    const toggleBtn = container.querySelector("[data-toggle]");
    if (toggleBtn) toggleBtn.addEventListener("click", toggleStore);

    container
      .querySelectorAll("[data-order]")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          updateStatus(btn.dataset.order, btn.dataset.status),
        ),
      );
  }

  render();
  void load();
}
