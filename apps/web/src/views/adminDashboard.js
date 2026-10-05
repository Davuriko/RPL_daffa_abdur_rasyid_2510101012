import { RoleLabels } from "@kampus-bite/shared";
import { ApiClient } from "../api.js";
import { escapeHtml } from "../dom.js";

export function renderAdmin(container) {
  let stats = null;
  let stores = [];
  let users = [];
  let loading = true;
  let error = "";

  async function load() {
    error = "";
    loading = true;
    render();
    try {
      [stats, stores, users] = await Promise.all([
        ApiClient.GetAdminStats(),
        ApiClient.GetAdminStores(),
        ApiClient.GetAdminUsers(),
      ]);
    } catch (loadError) {
      error =
        loadError instanceof Error ? loadError.message : "Gagal memuat data.";
    } finally {
      loading = false;
      render();
    }
  }

  async function toggleVerification(id, next) {
    try {
      await ApiClient.SetStoreVerification(id, next);
      await load();
    } catch (toggleError) {
      error =
        toggleError instanceof Error
          ? toggleError.message
          : "Gagal memperbarui verifikasi.";
      render();
    }
  }

  function metric(label, value, accent) {
    return `
      <div class="card">
        <p class="metric-label">${label}</p>
        <p class="metric-value ${accent}">${value}</p>
      </div>`;
  }

  function storeRow(store) {
    const verified = store.IsVerified;
    const seller = store.Seller
      ? `${escapeHtml(store.Seller.Name)}`
      : "<span class=\"muted\">Tanpa penjual</span>";
    return `
      <div class="order-card">
        <div class="order-head">
          <div>
            <p class="order-name">${escapeHtml(store.Name)}</p>
            <p class="order-sub">${escapeHtml(store.CampusLocation)} · ${seller}</p>
          </div>
          <span class="store-state ${verified ? "open" : "closed"}">
            ${verified ? "Terverifikasi" : "Belum Verifikasi"}
          </span>
        </div>
        <div class="order-foot">
          <span class="muted">${escapeHtml(store.WhatsappNumber)}</span>
          <button type="button" class="btn btn-sm ${
            verified ? "btn-red" : "btn-green"
          }" data-store="${escapeHtml(store.Id)}" data-next="${verified ? "0" : "1"}">
            ${verified ? "Batalkan Verifikasi" : "Verifikasi Toko"}
          </button>
        </div>
      </div>`;
  }

  function userRow(user) {
    return `
      <tr>
        <td>${escapeHtml(user.Name)}</td>
        <td>${escapeHtml(user.Email)}</td>
        <td><span class="badge">${escapeHtml(RoleLabels[user.Role] ?? user.Role)}</span></td>
      </tr>`;
  }

  function render() {
    if (loading) {
      container.innerHTML = `<p class="muted center pad-y">Memuat dashboard admin...</p>`;
      return;
    }
    if (error && !stats) {
      container.innerHTML = `<p class="error center pad-y">${escapeHtml(error)}</p>`;
      return;
    }

    container.innerHTML = `
      <div class="container pad-y stack">
        ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
        <div>
          <h2 class="section-title" style="margin:0">Dashboard Admin</h2>
          <p class="muted">Pantau aktivitas dan verifikasi toko penjual.</p>
        </div>

        <div class="metrics">
          ${metric("Total Pengguna", stats.TotalUsers, "accent-brand")}
          ${metric("Penjual", stats.TotalSellers, "accent-blue")}
          ${metric("Pembeli", stats.TotalBuyers, "accent-green")}
          ${metric("Total Toko", stats.TotalStores, "accent-brand")}
          ${metric("Toko Terverifikasi", stats.VerifiedStores, "accent-green")}
          ${metric("Total Pesanan", stats.TotalOrders, "accent-blue")}
        </div>

        <div class="card">
          <h3 class="section-title">Verifikasi Toko</h3>
          ${
            stores.length === 0
              ? `<p class="muted center" style="padding:1.5rem 0">Belum ada toko.</p>`
              : `<div class="stack-sm">${stores.map(storeRow).join("")}</div>`
          }
        </div>

        <div class="card">
          <h3 class="section-title">Daftar Pengguna</h3>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr><th>Nama</th><th>Email</th><th>Peran</th></tr>
              </thead>
              <tbody>${users.map(userRow).join("")}</tbody>
            </table>
          </div>
        </div>
      </div>`;

    container.querySelectorAll("[data-store]").forEach((btn) =>
      btn.addEventListener("click", () =>
        toggleVerification(btn.dataset.store, btn.dataset.next === "1"),
      ),
    );
  }

  void load();
}
