import {
  Category,
  CreateOrderRequest,
  CreateOrderResponse,
  CreateProductRequest,
  DashboardResponse,
  Order,
  OrderStatus,
  Product,
  ProductFilterQuery,
  Store,
  UpdateProductRequest,
} from "@kampus-bite/shared";

const BaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

async function Request<TResponse>(
  path: string,
  options?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(`${BaseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const fallback = { Message: "Terjadi kesalahan pada server." };
    const error = await response.json().catch(() => fallback);
    throw new Error(error.Message ?? fallback.Message);
  }

  if (response.status === 204) return undefined as TResponse;
  return (await response.json()) as TResponse;
}

function BuildProductQuery(filter?: ProductFilterQuery): string {
  if (!filter) return "";
  const params = new URLSearchParams();
  if (filter.StoreId) params.set("StoreId", filter.StoreId);
  if (filter.CategoryId) params.set("CategoryId", filter.CategoryId);
  if (filter.IsAvailable !== undefined)
    params.set("IsAvailable", String(filter.IsAvailable));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const ApiClient = {
  GetStores: () => Request<Store[]>("/stores"),
  GetStore: (id: string) => Request<Store>(`/stores/${id}`),
  ToggleStore: (id: string) =>
    Request<Store>(`/stores/${id}/toggle-status`, { method: "PATCH" }),

  GetCategories: () => Request<Category[]>("/categories"),

  GetProducts: (filter?: ProductFilterQuery) =>
    Request<Product[]>(`/products${BuildProductQuery(filter)}`),
  CreateProduct: (body: CreateProductRequest) =>
    Request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  UpdateProduct: (id: string, body: UpdateProductRequest) =>
    Request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  DeleteProduct: (id: string) =>
    Request<void>(`/products/${id}`, { method: "DELETE" }),

  CreateOrder: (body: CreateOrderRequest) =>
    Request<CreateOrderResponse>("/orders", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  GetStoreOrders: (storeId: string) =>
    Request<Order[]>(`/stores/${storeId}/orders`),
  GetCustomerOrders: (customerWhatsapp: string) =>
    Request<Order[]>(
      `/orders?CustomerWhatsapp=${encodeURIComponent(customerWhatsapp)}`,
    ),
  UpdateOrderStatus: (id: string, status: OrderStatus) =>
    Request<Order>(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ Status: status }),
    }),

  GetDashboard: (storeId: string) =>
    Request<DashboardResponse>(`/stores/${storeId}/dashboard`),
};
