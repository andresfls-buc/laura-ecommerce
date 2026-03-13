const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const getToken = () => localStorage.getItem("adminToken");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
};

// ── Auth ──────────────────────────────────────────────────────
export const loginAdmin = (email, password) =>
  fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then(handleResponse);

// ── Products ──────────────────────────────────────────────────
export const getProducts = () =>
  fetch(`${BASE_URL}/products`, { headers: authHeaders() }).then(
    handleResponse
  );

export const getProductById = (id) =>
  fetch(`${BASE_URL}/products/${id}`, { headers: authHeaders() }).then(
    handleResponse
  );

export const createProduct = (data) =>
  fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const updateProduct = (id, data) =>
  fetch(`${BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteProduct = (id) =>
  fetch(`${BASE_URL}/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handleResponse);

export const getProductVariants = (productId) =>
  fetch(`${BASE_URL}/products/${productId}/variants`, {
    headers: authHeaders(),
  }).then(handleResponse);

// ── Variants ──────────────────────────────────────────────────
export const adjustStock = (variantId, quantity) =>
  fetch(`${BASE_URL}/variants/${variantId}/stock`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ quantity }),
  }).then(handleResponse);

export const uploadVariantImage = (variantId, file) => {
  const formData = new FormData();
  formData.append("image", file);
  return fetch(`${BASE_URL}/variants/${variantId}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  }).then(handleResponse);
};

export const deleteVariantImage = (variantId, imageId) =>
  fetch(`${BASE_URL}/variants/${variantId}/images/${imageId}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then(handleResponse);

// ── Orders ────────────────────────────────────────────────────
export const getOrders = () =>
  fetch(`${BASE_URL}/orders`, { headers: authHeaders() }).then(handleResponse);

export const updateOrderStatus = (id, status) =>
  fetch(`${BASE_URL}/orders/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  }).then(handleResponse);
