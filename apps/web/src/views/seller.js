import { ApiClient } from "../api.js";
import { escapeHtml } from "../dom.js";
import { renderSellerDashboard } from "./sellerDashboard.js";
import { renderManageMenu } from "./manageMenu.js";

export async function renderSeller(container) {
  let stores = [];
  try {
    stores = await ApiClient.GetStores();
  } catch (loadError) {
    container.innerHTML = `<p class="error center pad-y">${escapeHtml(
      loadError instanceof Error ? loadError.message : "Gagal memuat toko.",
    )}</p>`;
    return;
  }

  let selectedStoreId = stores.length > 0 ? stores[0].Id : "";
  let tab = "dashboard";

  container.innerHTML = `
    <div class="seller-wrap">
      <div class="seller-top">
        <div>
          <label class="field-label">Pilih Toko</label>
          <select class="select" id="store-select" style="width:auto">
            ${stores
              .map(
                (store) =>
                  `<option value="${escapeHtml(store.Id)}">${escapeHtml(
                    store.Name,
                  )}</option>`,
              )
              .join("")}
          </select>
        </div>
        <div class="seg">
          <button type="button" class="seg-btn active" data-tab="dashboard">Dashboard</button>
          <button type="button" class="seg-btn" data-tab="menu">Kelola Menu</button>
        </div>
      </div>
      <div id="seller-content"></div>
    </div>`;

  const select = container.querySelector("#store-select");
  const content = container.querySelector("#seller-content");
  const tabButtons = container.querySelectorAll("[data-tab]");

  function paint() {
    if (!selectedStoreId) {
      content.innerHTML = "";
      return;
    }
    if (tab === "dashboard") renderSellerDashboard(content, selectedStoreId);
    else renderManageMenu(content, selectedStoreId);
  }

  select.addEventListener("change", () => {
    selectedStoreId = select.value;
    paint();
  });

  tabButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      tab = btn.dataset.tab;
      tabButtons.forEach((b) => b.classList.toggle("active", b === btn));
      paint();
    }),
  );

  paint();
}
