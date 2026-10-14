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

const ViewLabels = Object.freeze({
  customer: "Pelanggan",
  seller: "Dashboard Penjual",
  admin: "Dashboard Admin",
});

function defaultViewForRole(role) {
  if (role === Role.Admin) return "admin";
  if (role === Role.Seller) return "seller";
  return "customer";
}

function allowedViewsForRole(role) {
  if (role === Role.Admin) return ["admin"];
  if (role === Role.Seller) return ["seller"];
  return ["customer"];
}

function readInitialView() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("view");
  if (requested === "auth") return "auth";
  const allowed = allowedViewsForRole(Auth.Role);
  if (requested && allowed.includes(requested)) return requested;
  return defaultViewForRole(Auth.Role);
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
  const role = Auth.Role;
  const user = Auth.User;
  const allowed = allowedViewsForRole(role);

  if (view !== "auth" && !allowed.includes(view)) {
    view = defaultViewForRole(role);
  }

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

  const viewSwitch =
    allowed.length > 1
      ? `<div class="view-switch">
          ${allowed
            .map(
              (name) =>
                `<button type="button" class="view-btn ${
                  view === name ? "active" : ""
                }" data-view="${name}">${ViewLabels[name]}</button>`,
            )
            .join("")}
        </div>`
      : "";

  app.innerHTML = `
    <div class="topbar">
      <div class="topbar-inner">
        <span class="brand-mini">🍱 KampusBite</span>
        ${viewSwitch}
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
      setView(defaultViewForRole(Auth.Role));
      return;
    }
    renderAuth(root, () => {
      setView(defaultViewForRole(Auth.Role));
    });
    return;
  }

  if (view === "admin") {
    if (Auth.Role !== Role.Admin) {
      renderAuth(root, () => {
        setView(defaultViewForRole(Auth.Role));
      });
      return;
    }
    renderAdmin(root);
    return;
  }

  if (view === "seller") {
    if (Auth.Role !== Role.Seller) {
      renderAuth(root, () => {
        setView(defaultViewForRole(Auth.Role));
      });
      return;
    }
    void renderSeller(root);
    return;
  }

  renderCustomer(root);
}

render();
