import { Role, RoleLabels } from "@kampus-bite/shared";
import { Auth } from "../auth.js";
import { escapeHtml } from "../dom.js";

export function renderAuth(container, onSuccess) {
  let mode = "login";
  let error = "";
  let loading = false;

  function paint() {
    const isLogin = mode === "login";
    container.innerHTML = `
      <div class="container pad-y">
        <div class="card stack" style="max-width:26rem;margin:0 auto">
          <div>
            <h2 class="section-title" style="margin:0">
              ${isLogin ? "Masuk ke KampusBite" : "Daftar Akun KampusBite"}
            </h2>
            <p class="muted">
              ${
                isLogin
                  ? "Masuk sebagai Admin, Penjual, atau Pembeli."
                  : "Buat akun sebagai Penjual atau Pembeli."
              }
            </p>
          </div>

          <div class="seg">
            <button type="button" class="seg-btn ${
              isLogin ? "active" : ""
            }" data-mode="login">Masuk</button>
            <button type="button" class="seg-btn ${
              !isLogin ? "active" : ""
            }" data-mode="register">Daftar</button>
          </div>

          <form class="stack-sm" id="auth-form">
            ${
              isLogin
                ? ""
                : `<div class="field">
                    <label class="field-label">Nama Lengkap</label>
                    <input class="input" name="Name" required placeholder="Nama kamu" />
                  </div>`
            }
            <div class="field">
              <label class="field-label">Email</label>
              <input class="input" type="email" name="Email" required placeholder="nama@kampusbite.id" />
            </div>
            <div class="field">
              <label class="field-label">Password</label>
              <input class="input" type="password" name="Password" required minlength="6" placeholder="Minimal 6 karakter" />
            </div>
            ${
              isLogin
                ? ""
                : `<div class="field">
                    <label class="field-label">Daftar sebagai</label>
                    <select class="select" name="Role">
                      <option value="${Role.Buyer}">${RoleLabels[Role.Buyer]}</option>
                      <option value="${Role.Seller}">${RoleLabels[Role.Seller]}</option>
                    </select>
                  </div>`
            }
            ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
            <button type="submit" class="btn btn-block btn-lg" ${
              loading ? "disabled" : ""
            }>
              ${loading ? "Memproses..." : isLogin ? "Masuk" : "Daftar"}
            </button>
          </form>

          ${
            isLogin
              ? `<p class="muted" style="margin:0">Akun demo admin: <b>admin@kampusbite.id</b> / <b>admin123</b></p>`
              : ""
          }
          <a href="?view=customer" class="btn btn-ghost btn-block" style="text-align:center;text-decoration:none;margin-top:0.5rem">← Kembali ke Katalog</a>
        </div>
      </div>`;

    container.querySelectorAll("[data-mode]").forEach((btn) =>
      btn.addEventListener("click", () => {
        mode = btn.dataset.mode;
        error = "";
        paint();
      }),
    );

    const form = container.querySelector("#auth-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (loading) return;
      error = "";
      loading = true;
      paint();

      const data = new FormData(form);
      try {
        if (isLogin) {
          await Auth.Login(data.get("Email"), data.get("Password"));
        } else {
          await Auth.Register(
            data.get("Name"),
            data.get("Email"),
            data.get("Password"),
            data.get("Role"),
          );
        }
        onSuccess();
      } catch (submitError) {
        error =
          submitError instanceof Error
            ? submitError.message
            : "Gagal memproses permintaan.";
        loading = false;
        paint();
      }
    });
  }

  paint();
}
