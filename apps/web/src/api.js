const BaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

async function Request(path, options) {
  const response = await fetch(`${BaseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const fallback = { Message: "Terjadi kesalahan pada server." };
    const error = await response.json().catch(() => fallback);
    throw new Error(error.Message ?? fallback.Message);
  }

  if (response.status === 204) return undefined;
  return await response.json();
}

function BuildProductQuery(filter) {
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
  GetStores: () => Request("/stores"),
  GetStore: (id) => Request(`/stores/${id}`),
  ToggleStore: (id) =>
    Request(`/stores/${id}/toggle-status`, { method: "PATCH" }),

  GetCategories: () => Request("/categories"),

  GetProducts: (filter) => Request(`/products${BuildProductQuery(filter)}`),
  CreateProduct: (body) =>
    Request("/products", { method: "POST", body: JSON.stringify(body) }),
  UpdateProduct: (id, body) =>
    Request(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  DeleteProduct: (id) => Request(`/products/${id}`, { method: "DELETE" }),

  CreateOrder: (body) =>
    Request("/orders", { method: "POST", body: JSON.stringify(body) }),
  GetStoreOrders: (storeId) => Request(`/stores/${storeId}/orders`),
  GetCustomerOrders: (customerWhatsapp) =>
    Request(`/orders?CustomerWhatsapp=${encodeURIComponent(customerWhatsapp)}`),
  UpdateOrderStatus: (id, status) =>
    Request(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ Status: status }),
    }),

  GetDashboard: (storeId) => Request(`/stores/${storeId}/dashboard`),
};
