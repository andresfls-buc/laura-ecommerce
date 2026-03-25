const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

export const getToken = () => localStorage.getItem("adminToken");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const handleResponse = async (res) => {
  // Check content type
  const contentType = res.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  if (!res.ok) {
    // Try to parse error as JSON, fallback to text
    let errorMessage = `Server error: ${res.status} ${res.statusText}`;

    try {
      if (isJson) {
        const err = await res.json();
        errorMessage = err.message || err.error || errorMessage;
      } else {
        const text = await res.text();
        console.error("Server returned non-JSON error:", text);
        errorMessage = `Server error (${res.status}). Check console for details.`;
      }
    } catch (parseError) {
      console.error("Failed to parse error response:", parseError);
    }

    throw new Error(errorMessage);
  }

  // Success response
  if (isJson) {
    return res.json();
  }

  // Non-JSON success response (shouldn't happen, but handle it)
  return res.text();
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
