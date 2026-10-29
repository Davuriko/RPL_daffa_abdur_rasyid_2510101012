import { FormatRupiah } from "@kampus-bite/shared";
import { ApiClient } from "../api.js";
import { escapeHtml, OrderStatusBadge, StarRatingInput } from "../dom.js";

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

    attachRatingHandlers();
  }

  function orderCard(order) {
    const items = (order.Items ?? [])
      .map((item) => {
        const name = escapeHtml(item.Product?.Name ?? "Produk");
        const avg = Number(item.Product?.RatingAverage) || 0;
        const count = Number(item.Product?.RatingCount) || 0;
        const avgText =
          count > 0
            ? `Rata-rata ${avg.toFixed(1)} ★ (${count})`
            : "Belum ada rating";
        const rater = item.ProductId
          ? `<div class="order-item-rate">
              <span class="rate-label">Beri rating:</span>
              ${StarRatingInput(item.ProductId, item.Product?.MyRating ?? 0)}
              <span class="rate-avg">${escapeHtml(avgText)}</span>
            </div>`
          : "";
        return `
          <li class="order-item-row">
            <div class="order-item-main">
              <span>${item.Quantity}x ${name}</span>
              <span>${FormatRupiah(item.Subtotal)}</span>
            </div>
            ${rater}
          </li>`;
      })
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

  function attachRatingHandlers() {
    const el = container.querySelector("#track-results");
    if (!el) return;
    el.querySelectorAll("[data-rate]").forEach((btn) =>
      btn.addEventListener("click", () => submitRating(btn)),
    );
  }

  async function submitRating(btn) {
    const productId = btn.dataset.rate;
    const score = Number(btn.dataset.score);
    const group = btn.closest("[data-rate-group]");
    if (group) {
      group
        .querySelectorAll(".star-btn")
        .forEach((star, index) =>
          star.classList.toggle("filled", index < score),
        );
    }
    try {
      const result = await ApiClient.CreateReview({
        ProductId: productId,
        CustomerWhatsapp: whatsapp.trim(),
        Rating: score,
      });
      if (orders) {
        for (const order of orders) {
          for (const item of order.Items ?? []) {
            if (item.ProductId !== productId || !item.Product) continue;
            item.Product.MyRating = result.MyRating;
            item.Product.RatingAverage = result.RatingAverage;
            item.Product.RatingCount = result.RatingCount;
          }
        }
      }
      paintResults();
    } catch (rateError) {
      window.alert(
        rateError instanceof Error
          ? rateError.message
          : "Gagal menyimpan rating.",
      );
      paintResults();
    }
  }

  async function handleSubmit(event) {
    if (event?.preventDefault) event.preventDefault();
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
  if (whatsapp.trim()) {
    void handleSubmit();
  }
}
