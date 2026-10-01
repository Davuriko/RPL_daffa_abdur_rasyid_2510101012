import { FormatRupiah } from "@kampus-bite/shared";
import { ApiClient } from "../api.js";
import { Cart } from "../cart.js";
import { escapeHtml } from "../dom.js";

export function openCheckoutModal(onClose) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  document.body.appendChild(overlay);

  const form = {
    customerName: "",
    customerWhatsapp: "",
    deliveryLocation: "",
    notes: "",
  };
  let error = null;
  let result = null;
  let submitting = false;

  function close() {
    overlay.remove();
    if (onClose) onClose();
  }

  function startNewOrder() {
    Cart.ClearCart();
    close();
  }

  function cartItemsHtml() {
    if (Cart.Items.length === 0) {
      return `<p class="muted center" style="padding:2rem 0">Keranjang masih kosong.</p>`;
    }
    const rows = Cart.Items.map(
      (item) => `
      <div class="cart-item">
        <img src="${escapeHtml(item.Product.ImageUrl)}" alt="${escapeHtml(
          item.Product.Name,
        )}" />
        <div class="cart-item-info">
          <p class="cart-item-name">${escapeHtml(item.Product.Name)}</p>
          <p class="cart-item-price">${FormatRupiah(item.Product.Price)}</p>
        </div>
        <div class="qty">
          <button type="button" class="qty-btn" data-dec="${escapeHtml(
            item.Product.Id,
          )}">−</button>
          <span class="qty-val">${item.Quantity}</span>
          <button type="button" class="qty-btn" data-inc="${escapeHtml(
            item.Product.Id,
          )}">+</button>
        </div>
      </div>`,
    ).join("");

    return `
      <div class="stack-sm">
        ${rows}
        <div class="subtotal-row">
          <span>Subtotal</span>
          <span>${FormatRupiah(Cart.TotalPrice)}</span>
        </div>
      </div>`;
  }

  function render() {
    if (result) {
      overlay.innerHTML = `
        <div class="modal wide">
          <div class="modal-header">
            <h2 class="modal-title">Pesanan Dibuat 🎉</h2>
            <button type="button" class="modal-close" data-close>✕</button>
          </div>
          <div class="modal-body">
            <p class="muted">Pesanan berhasil dicatat. Lanjutkan dengan mengirim detail pesanan ke penjual via WhatsApp.</p>
            <p class="note-box note-blue">Pantau status pesanan (diterima, dimasak, siap) kapan saja lewat menu "Lacak Pesanan" memakai nomor WhatsApp ini.</p>
            <div class="success-summary">
              <div class="row">
                <span>Total Pesanan</span>
                <span style="color:var(--brand-600)">${FormatRupiah(
                  result.Order.TotalPrice,
                )}</span>
              </div>
              <p class="code">Kode Pesanan: ${escapeHtml(result.Order.Id)}</p>
            </div>
            <a class="link-btn" href="${escapeHtml(
              result.WhatsappUrl,
            )}" target="_blank" rel="noreferrer">Kirim Pesanan ke WhatsApp Penjual</a>
            <button type="button" class="btn btn-ghost btn-block" data-new>Selesai & Pesan Lagi</button>
          </div>
        </div>`;

      overlay.querySelector("[data-close]").addEventListener("click", close);
      overlay
        .querySelector("[data-new]")
        .addEventListener("click", startNewOrder);
      return;
    }

    overlay.innerHTML = `
      <div class="modal wide">
        <div class="modal-header">
          <h2 class="modal-title">Keranjang & Checkout</h2>
          <button type="button" class="modal-close" data-close>✕</button>
        </div>
        <form class="modal-body" data-form>
          ${cartItemsHtml()}
          <div class="form-grid">
            <input class="input" name="customerName" placeholder="Nama Lengkap" value="${escapeHtml(
              form.customerName,
            )}" />
            <input class="input" name="customerWhatsapp" placeholder="Nomor WhatsApp (contoh: 08123456789)" value="${escapeHtml(
              form.customerWhatsapp,
            )}" />
            <input class="input" name="deliveryLocation" placeholder="Lokasi Antar (contoh: Perpustakaan Lt. 1)" value="${escapeHtml(
              form.deliveryLocation,
            )}" />
            <textarea class="textarea" name="notes" rows="2" placeholder="Catatan (opsional)">${escapeHtml(
              form.notes,
            )}</textarea>
          </div>
          <p class="note-box note-amber">Metode Pembayaran: Bayar di Tempat (COD) / Transfer Langsung ke Penjual.</p>
          ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
          <button type="submit" class="btn btn-lg btn-block" ${
            submitting || Cart.Items.length === 0 ? "disabled" : ""
          }>${submitting ? "Memproses..." : "Buat Pesanan"}</button>
        </form>
      </div>`;

    overlay.querySelector("[data-close]").addEventListener("click", close);

    overlay.querySelectorAll("[data-dec]").forEach((btn) =>
      btn.addEventListener("click", () => {
        Cart.DecrementItem(btn.dataset.dec);
        render();
      }),
    );
    overlay.querySelectorAll("[data-inc]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const item = Cart.Items.find((it) => it.Product.Id === btn.dataset.inc);
        if (item) Cart.AddItem(item.Product);
        render();
      }),
    );

    const formEl = overlay.querySelector("[data-form]");
    formEl.querySelectorAll("input, textarea").forEach((field) => {
      field.addEventListener("input", () => {
        form[field.name] = field.value;
      });
    });
    formEl.addEventListener("submit", handleSubmit);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    error = null;

    if (!Cart.StoreId || Cart.Items.length === 0) {
      error = "Keranjang masih kosong.";
      render();
      return;
    }
    if (
      !form.customerName.trim() ||
      !form.customerWhatsapp.trim() ||
      !form.deliveryLocation.trim()
    ) {
      error = "Nama, nomor WhatsApp, dan lokasi antar wajib diisi.";
      render();
      return;
    }

    submitting = true;
    render();
    try {
      result = await ApiClient.CreateOrder({
        StoreId: Cart.StoreId,
        CustomerName: form.customerName.trim(),
        CustomerWhatsapp: form.customerWhatsapp.trim(),
        DeliveryLocation: form.deliveryLocation.trim(),
        Notes: form.notes.trim(),
        Items: Cart.Items.map((item) => ({
          ProductId: item.Product.Id,
          Quantity: item.Quantity,
        })),
      });
      localStorage.setItem("KampusBiteWhatsapp", form.customerWhatsapp.trim());
    } catch (submitError) {
      error =
        submitError instanceof Error
          ? submitError.message
          : "Gagal membuat pesanan.";
    } finally {
      submitting = false;
      render();
    }
  }

  render();
}
