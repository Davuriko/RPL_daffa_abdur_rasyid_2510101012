import { ApiClient } from "../api.js";
import { Auth } from "../auth.js";
import { escapeHtml } from "../dom.js";
import { renderSellerDashboard } from "./sellerDashboard.js";
import { renderManageMenu } from "./manageMenu.js";

export async function renderSeller(container) {
  let stores = [];
  try {
    stores = await ApiClient.GetMyStores();
  } catch (loadError) {
    container.innerHTML = `<p class="error center pad-y">${escapeHtml(
      loadError instanceof Error ? loadError.message : "Gagal memuat toko.",
    )}</p>`;
    return;
  }

  if (stores.length === 0) {
    renderCreateStoreForm(container);
    return;
  }

  const store = stores[0];
  const selectedStoreId = store.Id;
  let tab = "dashboard";

  container.innerHTML = `
    <div class="seller-wrap">
      <div class="seller-top">
        <div>
          <label class="field-label">Toko Anda</label>
          <p class="seller-store-name">${escapeHtml(store.Name)}</p>
        </div>
        <div class="seg">
          <button type="button" class="seg-btn active" data-tab="dashboard">Dashboard</button>
          <button type="button" class="seg-btn" data-tab="menu">Kelola Menu</button>
        </div>
      </div>
      <div id="seller-content"></div>
    </div>`;

  const content = container.querySelector("#seller-content");
  const tabButtons = container.querySelectorAll("[data-tab]");

  function paint() {
    if (tab === "dashboard") renderSellerDashboard(content, selectedStoreId);
    else renderManageMenu(content, selectedStoreId);
  }

  tabButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      tab = btn.dataset.tab;
      tabButtons.forEach((b) => b.classList.toggle("active", b === btn));
      paint();
    }),
  );

  paint();
}

function renderCreateStoreForm(container) {
  let error = "";
  let loading = false;

  function paint() {
    container.innerHTML = `
      <div class="container pad-y">
        <div class="card stack" style="max-width:30rem;margin:0 auto">
          <div>
            <h2 class="section-title" style="margin:0">Buat Toko Anda</h2>
            <p class="muted">Setiap penjual memiliki satu toko. Lengkapi data berikut untuk mulai berjualan.</p>
          </div>
          <form class="stack-sm" id="store-form">
            <div class="field">
              <label class="field-label">Nama Toko</label>
              <input class="input" name="Name" required placeholder="Contoh: Dapur Kost Melati" />
            </div>
            <div class="field">
              <label class="field-label">Nama Pemilik</label>
              <input class="input" name="OwnerName" required placeholder="Nama kamu" value="${escapeHtml(
                Auth.User?.Name ?? "",
              )}" />
            </div>
            <div class="field">
              <label class="field-label">Nomor WhatsApp</label>
              <input class="input" name="WhatsappNumber" required placeholder="Contoh: 6281234567890" />
            </div>
            <div class="field">
              <label class="field-label">Lokasi di Kampus</label>
              <input class="input" name="CampusLocation" required placeholder="Contoh: Gedung Fasilkom lt. 2" />
            </div>
            ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
            <button type="submit" class="btn btn-block btn-lg" ${
              loading ? "disabled" : ""
            }>
              ${loading ? "Menyimpan..." : "Buat Toko"}
            </button>
          </form>
        </div>
      </div>`;

    const form = container.querySelector("#store-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (loading) return;
      error = "";
      loading = true;
      paint();

      const data = new FormData(form);
      try {
        await ApiClient.CreateStore({
          Name: data.get("Name"),
          OwnerName: data.get("OwnerName"),
          WhatsappNumber: data.get("WhatsappNumber"),
          CampusLocation: data.get("CampusLocation"),
        });
        await renderSeller(container);
      } catch (submitError) {
        error =
          submitError instanceof Error
            ? submitError.message
            : "Gagal membuat toko.";
        loading = false;
        paint();
      }
    });
  }

  paint();
}
