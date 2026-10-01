import { FormatRupiah } from "@kampus-bite/shared";
import { ApiClient } from "../api.js";
import { escapeHtml, OrderStatusBadge } from "../dom.js";

export function renderTrack(container) {
  let whatsapp = localStorage.getItem("KampusBiteWhatsapp") ?? "";
  let orders = null;
  let loading = false;
  let error = null;

  function render() {
    container.innerHTML = `
      <div class="page">
        <h1>Lacak Pesanan</h1>
        <p class="muted" style="margin-top:0.25rem">Masukkan nomor WhatsApp yang kamu gunakan saat checkout untuk melihat status pesanan.</p>
        <form class="inline-form" data-form>
          <input class="input" id="track-wa" placeholder="contoh: 08123456789" value="${escapeHtml(
            whatsapp,
          )}" style="flex:1" />
          <button type="submit" class="btn btn-lg" ${loading ? "disabled" : ""}>${
            loading ? "Mencari..." : "Cek Status"
          }</button>
        </form>
        ${error ? `<p class="error" style="margin-top:0.75rem">${escapeHtml(error)}</p>` : ""}
        <div id="track-results"></div>
      </div>`;

    const input = container.querySelector("#track-wa");
    input.addEventListener("input", () => {
      whatsapp = input.value;
    });
    container
      .querySelector("[data-form]")
      .addEventListener("submit", handleSubmit);

    paintResults();
  }

  function paintResults() {
    const el = container.querySelector("#track-results");
    if (!orders) {
      el.innerHTML = "";
      return;
    }
    if (orders.length === 0) {
      el.innerHTML = `<p class="muted center" style="margin-top:1.5rem">Tidak ada pesanan untuk nomor tersebut.</p>`;
      return;
    }
    el.innerHTML = `
      <div class="stack-sm" style="margin-top:1.25rem">
        ${orders.map(orderCard).join("")}
      </div>`;
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

    return `
      <div class="order-card flat">
        <div class="order-head">
          <div>
            <p class="order-name">${escapeHtml(order.Store?.Name ?? "Toko")}</p>
            <p class="order-sub">${escapeHtml(order.DeliveryLocation)}</p>
          </div>
          ${OrderStatusBadge(order.Status)}
        </div>
        <ul class="order-items">${items}</ul>
        <div class="order-foot bordered">
          <span class="order-time">${escapeHtml(
            new Date(order.CreatedAt).toLocaleString("id-ID"),
          )}</span>
          <span class="order-total">${FormatRupiah(order.TotalPrice)}</span>
        </div>
      </div>`;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    error = null;
    if (!whatsapp.trim()) {
      error = "Masukkan nomor WhatsApp yang dipakai saat memesan.";
      render();
      return;
    }

    loading = true;
    render();
    try {
      orders = await ApiClient.GetCustomerOrders(whatsapp.trim());
      localStorage.setItem("KampusBiteWhatsapp", whatsapp.trim());
    } catch (loadError) {
      error =
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat pesanan.";
    } finally {
      loading = false;
      render();
    }
  }

  render();
}
