import { renderCatalog } from "./views/catalog.js";
import { renderTrack } from "./views/track.js";
import { renderSeller } from "./views/seller.js";

const app = document.getElementById("app");
if (!app) throw new Error("Elemen #app tidak ditemukan.");

function readInitialView() {
  const params = new URLSearchParams(window.location.search);
  return params.get("view") === "seller" ? "seller" : "customer";
}

let view = readInitialView();

function setView(next) {
  view = next;
  const params = new URLSearchParams(window.location.search);
  params.set("view", next);
  window.history.replaceState(null, "", `?${params.toString()}`);
  render();
}

function renderCustomer(root) {
  let tab = "catalog";

  function paint() {
    root.innerHTML = `
      <div class="subtabs-bar">
        <div class="container subtabs">
          <button type="button" class="subtab ${
            tab === "catalog" ? "active" : ""
          }" data-tab="catalog">Katalog</button>
          <button type="button" class="subtab ${
            tab === "track" ? "active" : ""
          }" data-tab="track">Lacak Pesanan</button>
        </div>
      </div>
      <div id="customer-content"></div>`;

    root.querySelectorAll("[data-tab]").forEach((btn) =>
      btn.addEventListener("click", () => {
        tab = btn.dataset.tab;
        paint();
      }),
    );

    const content = root.querySelector("#customer-content");
    if (tab === "catalog") void renderCatalog(content);
    else renderTrack(content);
  }

  paint();
}

function render() {
  app.innerHTML = `
    <div class="topbar">
      <div class="topbar-inner">
        <span class="brand-mini">🍱 KampusBite</span>
        <div class="view-switch">
          <button type="button" class="view-btn ${
            view === "customer" ? "active" : ""
          }" data-view="customer">Pelanggan</button>
          <button type="button" class="view-btn ${
            view === "seller" ? "active" : ""
          }" data-view="seller">Dashboard Penjual</button>
        </div>
      </div>
    </div>
    <div id="view-root"></div>`;

  app
    .querySelectorAll("[data-view]")
    .forEach((btn) =>
      btn.addEventListener("click", () => setView(btn.dataset.view)),
    );

  const root = app.querySelector("#view-root");
  if (view === "customer") renderCustomer(root);
  else void renderSeller(root);
}

render();
