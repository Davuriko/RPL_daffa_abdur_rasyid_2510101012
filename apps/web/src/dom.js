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
