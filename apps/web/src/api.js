const BaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export const TokenKey = "kampusbite_token";

function AuthHeaders() {
  const token = localStorage.getItem(TokenKey);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function Request(path, options) {
  const response = await fetch(`${BaseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...AuthHeaders() },
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
  Register: (body) =>
    Request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  Login: (body) =>
    Request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  Me: () => Request("/auth/me"),

  GetAdminStats: () => Request("/admin/stats"),
  GetAdminUsers: () => Request("/admin/users"),
  GetAdminStores: () => Request("/admin/stores"),
  SetStoreVerification: (id, isVerified) =>
    Request(`/admin/stores/${id}/verification`, {
      method: "PATCH",
      body: JSON.stringify({ IsVerified: isVerified }),
    }),

  GetStores: () => Request("/stores"),
  GetMyStores: () => Request("/stores/mine"),
  GetStore: (id) => Request(`/stores/${id}`),
  CreateStore: (body) =>
    Request("/stores", { method: "POST", body: JSON.stringify(body) }),
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

  CreateReview: (body) =>
    Request("/reviews", { method: "POST", body: JSON.stringify(body) }),

  GetDashboard: (storeId) => Request(`/stores/${storeId}/dashboard`),
};
