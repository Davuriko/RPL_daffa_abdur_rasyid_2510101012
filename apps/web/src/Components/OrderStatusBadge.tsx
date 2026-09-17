import { OrderStatus, OrderStatusLabels } from "@kampus-bite/shared";

const StatusStyles: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: "bg-yellow-100 text-yellow-800 ring-yellow-200",
  [OrderStatus.Preparing]: "bg-blue-100 text-blue-800 ring-blue-200",
  [OrderStatus.Ready]: "bg-purple-100 text-purple-800 ring-purple-200",
  [OrderStatus.Completed]: "bg-green-100 text-green-800 ring-green-200",
  [OrderStatus.Cancelled]: "bg-red-100 text-red-800 ring-red-200",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${StatusStyles[status]}`}
    >
      {OrderStatusLabels[status]}
    </span>
  );
}
