import { ApiClient } from "../api.js";
import { escapeHtml } from "../dom.js";

export function openProductFormModal({
  storeId,
  categories,
  product,
  onSaved,
}) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  document.body.appendChild(overlay);

  const state = {
    name: product?.Name ?? "",
    categoryId: product?.CategoryId ?? categories[0]?.Id ?? "",
    description: product?.Description ?? "",
    price: product ? String(product.Price) : "",
    imageUrl: product?.ImageUrl ?? "",
    isAvailable: product?.IsAvailable ?? true,
  };
  let error = null;
  let saving = false;

  function close() {
    overlay.remove();
  }

  function render() {
    const options = categories
      .map(
        (category) =>
          `<option value="${escapeHtml(category.Id)}" ${
            category.Id === state.categoryId ? "selected" : ""
          }>${escapeHtml(category.Name)}</option>`,
      )
      .join("");

    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">${product ? "Edit Menu" : "Tambah Menu"}</h2>
          <button type="button" class="modal-close" data-close>✕</button>
        </div>
        <form class="modal-body tight" data-form>
          <div class="field">
            <label class="field-label">Nama Menu</label>
            <input class="input" name="name" placeholder="contoh: Nasi Ayam Geprek" value="${escapeHtml(
              state.name,
            )}" />
          </div>
          <div class="field">
            <label class="field-label">Kategori</label>
            <select class="select" name="categoryId">${options}</select>
          </div>
          <div class="field">
            <label class="field-label">Harga (Rp)</label>
            <input class="input" type="number" min="0" name="price" placeholder="contoh: 15000" value="${escapeHtml(
              state.price,
            )}" />
          </div>
          <div class="field">
            <label class="field-label">URL Gambar</label>
            <input class="input" name="imageUrl" placeholder="https://..." value="${escapeHtml(
              state.imageUrl,
            )}" />
          </div>
          <div class="field">
            <label class="field-label">Deskripsi</label>
            <textarea class="textarea" name="description" rows="2" placeholder="Deskripsi singkat menu">${escapeHtml(
              state.description,
            )}</textarea>
          </div>
          <label class="checkbox-row">
            <input type="checkbox" name="isAvailable" ${
              state.isAvailable ? "checked" : ""
            } />
            Tersedia untuk dijual
          </label>
          ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
          <button type="submit" class="btn btn-lg btn-block" ${
            saving ? "disabled" : ""
          }>${saving ? "Menyimpan..." : "Simpan Menu"}</button>
        </form>
      </div>`;

    overlay.querySelector("[data-close]").addEventListener("click", close);

    const formEl = overlay.querySelector("[data-form]");
    formEl.querySelectorAll("input, select, textarea").forEach((field) => {
      field.addEventListener("input", () => {
        if (field.type === "checkbox") state.isAvailable = field.checked;
        else if (field.name === "name") state.name = field.value;
        else if (field.name === "categoryId") state.categoryId = field.value;
        else if (field.name === "price") state.price = field.value;
        else if (field.name === "imageUrl") state.imageUrl = field.value;
        else if (field.name === "description") state.description = field.value;
      });
    });
    formEl.addEventListener("submit", handleSubmit);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    error = null;

    const priceValue = Number(state.price);
    if (
      !state.name.trim() ||
      !state.categoryId ||
      Number.isNaN(priceValue) ||
      priceValue < 0
    ) {
      error = "Nama, kategori, dan harga yang valid wajib diisi.";
      render();
      return;
    }

    saving = true;
    render();
    try {
      if (product) {
        await ApiClient.UpdateProduct(product.Id, {
          CategoryId: state.categoryId,
          Name: state.name.trim(),
          Description: state.description.trim(),
          Price: priceValue,
          ImageUrl: state.imageUrl.trim(),
          IsAvailable: state.isAvailable,
        });
      } else {
        await ApiClient.CreateProduct({
          StoreId: storeId,
          CategoryId: state.categoryId,
          Name: state.name.trim(),
          Description: state.description.trim(),
          Price: priceValue,
          ImageUrl:
            state.imageUrl.trim() || "https://placehold.co/400x300?text=Menu",
          IsAvailable: state.isAvailable,
        });
      }
      if (onSaved) await onSaved();
      close();
    } catch (saveError) {
      error =
        saveError instanceof Error
          ? saveError.message
          : "Gagal menyimpan produk.";
      saving = false;
      render();
    }
  }

  render();
}
