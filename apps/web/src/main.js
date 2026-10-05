import { Role, RoleLabels } from "@kampus-bite/shared";
import { renderCatalog } from "./views/catalog.js";
import { renderTrack } from "./views/track.js";
import { renderSeller } from "./views/seller.js";
import { renderAuth } from "./views/authView.js";
import { renderAdmin } from "./views/adminDashboard.js";
import { Auth } from "./auth.js";
import { escapeHtml } from "./dom.js";

const app = document.getElementById("app");
if (!app) throw new Error("Elemen #app tidak ditemukan.");

function readInitialView() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("view");
  if (requested === "seller" || requested === "admin" || requested === "auth") {
    return requested;
  }
  return "customer";
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
  const isAdmin = Auth.Role === Role.Admin;
  const user = Auth.User;

  const authArea = user
    ? `<div class="auth-area">
        <span class="auth-user">${escapeHtml(user.Name)} <small>(${escapeHtml(
          RoleLabels[user.Role] ?? user.Role,
        )})</small></span>
        <button type="button" class="btn-auth" data-action="logout">Keluar</button>
      </div>`
    : `<div class="auth-area">
        <button type="button" class="btn-auth" data-action="login">Masuk / Daftar</button>
      </div>`;

  const adminTab = isAdmin
    ? `<button type="button" class="view-btn ${
        view === "admin" ? "active" : ""
      }" data-view="admin">Admin</button>`
    : "";

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
          ${adminTab}
        </div>
        ${authArea}
      </div>
    </div>
    <div id="view-root"></div>`;

  app
    .querySelectorAll("[data-view]")
    .forEach((btn) =>
      btn.addEventListener("click", () => setView(btn.dataset.view)),
    );

  const loginBtn = app.querySelector('[data-action="login"]');
  if (loginBtn) loginBtn.addEventListener("click", () => setView("auth"));

  const logoutBtn = app.querySelector('[data-action="logout"]');
  if (logoutBtn)
    logoutBtn.addEventListener("click", () => {
      Auth.Logout();
      setView("customer");
    });

  const root = app.querySelector("#view-root");

  if (view === "auth") {
    if (Auth.IsAuthenticated) {
      setView(Auth.Role === Role.Admin ? "admin" : "customer");
      return;
    }
    renderAuth(root, () => {
      setView(Auth.Role === Role.Admin ? "admin" : "customer");
    });
    return;
  }

  if (view === "admin") {
    if (Auth.Role !== Role.Admin) {
      renderAuth(root, () => {
        setView(Auth.Role === Role.Admin ? "admin" : "customer");
      });
      return;
    }
    renderAdmin(root);
    return;
  }

  if (view === "customer") renderCustomer(root);
  else void renderSeller(root);
}

render();
