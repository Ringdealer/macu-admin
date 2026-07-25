// frontend-admin/src/services/api.js

import { API_BASE } from "./config";

/**
 * Universal authenticated fetch for Django token auth
 */
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("token");

  const isFormData = options.body instanceof FormData;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  return response;
}

/* =========================
   API BASES
========================= */

const API_V1 = `${API_BASE}/en/api/v1`;
const ADMIN_API_V1 = `${API_BASE}/en/api/v1/admin`;

/* =========================
   PRODUCTS (PUBLIC API)
========================= */

export async function getProducts(page = 1, ordering = "name", search = "") {
  const response = await fetchWithAuth(
    `${ADMIN_API_V1}/products/?page=${page}&ordering=${ordering}&search=${search}`,
  );

  if (!response.ok) {
    const text = await response.text();
    console.error(text);
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export async function getProductById(id) {
  const response = await fetchWithAuth(`${API_V1}/products/${id}/`);
  if (!response.ok) throw new Error("Failed to fetch product");
  return response.json();
}

export async function createProduct(data) {
  const isFormData = data instanceof FormData;

  const response = await fetchWithAuth(`${API_V1}/products/`, {
    method: "POST",
    body: isFormData ? data : JSON.stringify(data),
  });

  const text = await response.text();

  if (!response.ok) {
    console.error("Create product error:", text);
    try {
      throw JSON.parse(text);
    } catch {
      throw new Error("Unknown error");
    }
  }

  return JSON.parse(text);
}

export async function updateProduct(id, data) {
  const isFormData = data instanceof FormData;

  const response = await fetchWithAuth(`${API_V1}/products/${id}/`, {
    method: "PATCH",
    body: isFormData ? data : JSON.stringify(data),
  });

  const text = await response.text();

  if (!response.ok) {
    console.error("Update product error:", text);
    throw new Error("Failed to update product");
  }

  return JSON.parse(text);
}

export async function deleteProduct(id) {
  const response = await fetchWithAuth(`${API_V1}/products/${id}/`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete product");
  return true;
}

/* =========================
   ORDERS (PUBLIC/USER SCOPED)
========================= */

export async function getOrders(page = 1) {
  const response = await fetchWithAuth(`${API_V1}/orders/?page=${page}`);
  const text = await response.text();

  if (!response.ok) {
    console.error(text);
    throw new Error("Failed to fetch orders");
  }

  return JSON.parse(text);
}

export async function getOrderById(id) {
  const response = await fetchWithAuth(`${API_V1}/orders/${id}/`);
  if (!response.ok) throw new Error("Failed to fetch order");
  return response.json();
}

export async function updateOrderStatus(id, data) {
  const response = await fetchWithAuth(`${API_V1}/orders/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  const text = await response.text();

  if (!response.ok) {
    console.error(text);
    throw new Error("Failed to update order");
  }

  return JSON.parse(text);
}

/* =========================
   ADMIN API (ISOLATED)
========================= */

export async function getLowStockProducts() {
  const response = await fetchWithAuth(`${ADMIN_API_V1}/low-stock/`);
  if (!response.ok) throw new Error("Failed to fetch low stock products");
  return response.json();
}

export async function getCustomers(
  page = 1,
  ordering = "-customer_name",
  search = "",
) {
  const params = new URLSearchParams({
    page,
    ordering,
  });

  if (search) {
    params.append("search", search);
  }

  const response = await fetchWithAuth(
    `${ADMIN_API_V1}/customers/?${params.toString()}`,
  );

  if (!response.ok) {
    const text = await response.text();
    console.error(text);
    throw new Error("Failed to fetch customers");
  }

  return response.json();
}

export async function getCustomerById(id) {
  const response = await fetchWithAuth(`${ADMIN_API_V1}/customers/${id}/`);
  if (!response.ok) throw new Error("Failed customer");
  return response.json();
}

export async function updateCustomer(id, data) {
  const response = await fetchWithAuth(`${ADMIN_API_V1}/customers/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  const text = await response.text();

  if (!response.ok) {
    console.error(text);
    throw new Error("Failed to update customer");
  }

  return JSON.parse(text);
}

export async function deleteCustomer(id) {
  const response = await fetchWithAuth(`${ADMIN_API_V1}/customers/${id}/`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete customer");
  return true;
}

export async function createCustomer(data) {
  const response = await fetchWithAuth(`${ADMIN_API_V1}/customers/`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  const json = await response.json();

  return {
    data: json,
    status: response.status,
  };
}

/* =========================
   STOCK
========================= */

export async function getStockMovements(productId) {
  const response = await fetchWithAuth(
    `${ADMIN_API_V1}/stock-movements/?product=${productId}`,
  );

  if (!response.ok) throw new Error("Failed stock movements");
  return response.json();
}

/* =========================
   NOTIFICATIONS
========================= */

export const getNotifications = async () => {
  const response = await fetchWithAuth(`${ADMIN_API_V1}/notifications/`);
  if (!response.ok) throw new Error("Failed notifications");
  return response.json();
};

export const getOrderNotifications = async (orderId) => {
  const response = await fetchWithAuth(
    `${ADMIN_API_V1}/notifications/?order=${orderId}`,
  );

  if (!response.ok) throw new Error("Failed notifications");
  return response.json();
};

export const retryNotification = async (id) => {
  const response = await fetchWithAuth(
    `${ADMIN_API_V1}/notifications/${id}/retry/`,
    { method: "POST" },
  );

  if (!response.ok) throw new Error("Retry failed");
  return response.json();
};

/* =========================
   ADMIN NOTES
========================= */

export const getOrderNotes = async (orderId) => {
  const response = await fetchWithAuth(
    `${ADMIN_API_V1}/notes/?order=${orderId}`,
  );

  if (!response.ok) throw new Error("Failed notes");
  return response.json();
};

export const createOrderNote = async (data) => {
  const response = await fetchWithAuth(`${ADMIN_API_V1}/notes/`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Failed note");
  return response.json();
};

export const updateOrderNote = async (id, data) => {
  const response = await fetchWithAuth(
    `${API_BASE}/en/api/v1/admin/notes/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );

  const text = await response.text();

  if (!response.ok) {
    console.error("Update note error:", text);
    throw new Error("Failed to update note");
  }

  return JSON.parse(text);
};

export const deleteOrderNote = async (id) => {
  const response = await fetchWithAuth(
    `${API_BASE}/en/api/v1/admin/notes/${id}/`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("Delete note error:", text);
    throw new Error("Failed to delete note");
  }

  return true;
};

/* =========================
   ACTIVITY LOGS (ADMIN ONLY)
========================= */

export async function getActivityLogs(params = "") {
  const response = await fetchWithAuth(
    `${ADMIN_API_V1}/activity-logs/${params ? `?${params}` : ""}`,
  );

  if (!response.ok) throw new Error("Failed activity logs");
  return response.json();
}

/* =========================
   ADMIN ORDERS (NEW SOURCE OF TRUTH)
========================= */

export async function getAdminOrders(
  page = 1,
  ordering = "-created_at",
  search = "",
) {
  const params = new URLSearchParams({
    page,
    ordering,
  });

  if (search) {
    params.append("search", search);
  }

  const response = await fetchWithAuth(
    `${ADMIN_API_V1}/orders/?${params.toString()}`,
  );

  if (!response.ok) {
    const text = await response.text();
    console.error(text);
    throw new Error("Failed to fetch admin orders");
  }

  return response.json();
}

export async function updateAdminOrder(id, data) {
  const response = await fetchWithAuth(`${ADMIN_API_V1}/orders/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  const text = await response.text(); // ONLY ONCE

  if (!response.ok) {
    console.error("ADMIN ORDER ERROR:", text);
    throw new Error(text);
  }

  return JSON.parse(text);
}

/* =========================
   PERIODS
========================= */

export async function getDashboardAnalytics(period = "year") {
  const response = await fetchWithAuth(
    `${ADMIN_API_V1}/analytics/?period=${period}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard analytics");
  }

  return response.json();
}

/* =========================
   CATEGORIES (PUBLIC)
========================= */
export async function getCategories(page = 1) {
  const response = await fetchWithAuth(
    `${ADMIN_API_V1}/categories/?page=${page}`,
  );

  if (!response.ok) throw new Error("Failed categories");
  return response.json();
}

export async function createCategory(data) {
  const response = await fetchWithAuth(`${ADMIN_API_V1}/categories/`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  const text = await response.text();

  if (!response.ok) {
    console.error("Create category error:", text);
    throw new Error("Failed to create category");
  }

  return JSON.parse(text);
}

export async function updateCategory(id, data) {
  const response = await fetchWithAuth(`${ADMIN_API_V1}/categories/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  const text = await response.text();

  if (!response.ok) {
    console.error("Update category error:", text);
    throw new Error("Failed to update category");
  }

  return JSON.parse(text);
}

export async function deleteCategory(id) {
  const response = await fetchWithAuth(`${ADMIN_API_V1}/categories/${id}/`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete category");
  return true;
}
