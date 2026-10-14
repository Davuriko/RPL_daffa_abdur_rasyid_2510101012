import { OrderStatusLabels } from "@kampus-bite/shared";

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const StatusClass = {
  PENDING: "badge-pending",
  PREPARING: "badge-preparing",
  READY: "badge-ready",
  COMPLETED: "badge-completed",
  CANCELLED: "badge-cancelled",
};

export function OrderStatusBadge(status) {
  const label = OrderStatusLabels[status] ?? status;
  return `<span class="badge ${StatusClass[status] ?? ""}">${escapeHtml(
    label,
  )}</span>`;
}

export function StarRatingDisplay(average, count) {
  const value = Number(average) || 0;
  const rounded = Math.round(value);
  const stars = Array.from({ length: 5 }, (_, i) =>
    `<span class="star ${i < rounded ? "filled" : ""}">★</span>`,
  ).join("");
  const label =
    count > 0
      ? `${value.toFixed(1)} (${count})`
      : "Belum ada rating";
  return `<span class="star-rating"><span class="star-row">${stars}</span><span class="star-label">${escapeHtml(
    label,
  )}</span></span>`;
}

export function StarRatingInput(productId, current) {
  const value = Number(current) || 0;
  const stars = Array.from({ length: 5 }, (_, i) => {
    const score = i + 1;
    return `<button type="button" class="star-btn ${
      score <= value ? "filled" : ""
    }" data-rate="${escapeHtml(productId)}" data-score="${score}" aria-label="${score} bintang">★</button>`;
  }).join("");
  return `<span class="star-input" data-rate-group="${escapeHtml(
    productId,
  )}">${stars}</span>`;
}

