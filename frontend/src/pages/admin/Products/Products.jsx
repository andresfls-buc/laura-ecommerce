import { useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductVariants,
  uploadVariantImage,
  deleteVariantImage,
  adjustStock,
} from "../../../services/api";

import "../styles/admin-ui.css";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";

const emptyProduct = { name: "", description: "", image: "" };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [variantProduct, setVariantProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [variantLoading, setVariantLoading] = useState(false);
  const [uploadingFor, setUploadingFor] = useState(null);

  const load = () =>
    getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyProduct);
    setError("");
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || "",
      image: p.image || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Product name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await updateProduct(editing.id, form);
      } else {
        await createProduct(form);
      }
      setShowModal(false);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteProduct(id).catch(console.error);
    load();
  };

  const openVariants = async (product) => {
    setVariantProduct(product);
    setVariantLoading(true);
    try {
      const v = await getProductVariants(product.id);
      setVariants(v);
    } catch {
      setVariants([]);
    } finally {
      setVariantLoading(false);
    }
  };

  const handleStockChange = async (variantId, qty) => {
    try {
      await adjustStock(variantId, qty);
      const updated = await getProductVariants(variantProduct.id);
      setVariants(updated);
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading)
    return (
      <div className="admin-shell">
        <div className="loading-state">Loading products…</div>
      </div>
    );

  return (
    <div className="admin-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} items in catalog</p>
        </div>
        <button
          className="stock-btn"
          style={{ width: "auto", padding: "0 20px" }}
          onClick={openCreate}
        >
          + Add Product
        </button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Description</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty-state">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      {p.image ? (
                        <img
                          src={
                            p.image.startsWith("http")
                              ? p.image
                              : `${BASE_URL}${p.image}`
                          }
                          style={{
                            width: "45px",
                            height: "45px",
                            borderRadius: "10px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "45px",
                            height: "45px",
                            background: "var(--bg-hover)",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          📷
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700 }}>{p.name}</div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          ID: #{p.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      maxWidth: "300px",
                      color: "var(--text-muted)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {p.description || "No description provided."}
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        className="stock-btn"
                        style={{ fontSize: "0.7rem", padding: "6px 10px" }}
                        onClick={() => openVariants(p)}
                      >
                        Variants
                      </button>
                      <button
                        className="stock-btn"
                        style={{ fontSize: "0.7rem", padding: "6px 10px" }}
                        onClick={() => openEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="stock-btn"
                        style={{
                          fontSize: "0.7rem",
                          padding: "6px 10px",
                          color: "#f87171",
                        }}
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT/CREATE MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2
              className="page-title"
              style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}
            >
              {editing ? "Edit Product" : "New Product"}
            </h2>

            {error && (
              <div
                className="badge-red"
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <div className="form-field">
              <label>Product Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter name..."
              />
            </div>

            <div className="form-field">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Enter description..."
              />
            </div>

            <div className="form-field">
              <label>Image URL</label>
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "2rem" }}>
              <button
                className="stock-btn"
                style={{ flex: 1, background: "var(--accent)", border: "none" }}
                onClick={handleSave}
              >
                {saving ? "Saving..." : "Save Product"}
              </button>
              <button
                className="stock-btn"
                style={{ flex: 1, background: "transparent" }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VARIANTS MODAL */}
      {variantProduct && (
        <div className="modal-overlay" onClick={() => setVariantProduct(null)}>
          <div
            className="modal"
            style={{ maxWidth: "600px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="page-title"
              style={{ fontSize: "1.2rem", marginBottom: "1rem" }}
            >
              {variantProduct.name} Variants
            </h2>
            <div className="card" style={{ background: "rgba(0,0,0,0.2)" }}>
              {variantLoading ? (
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  Loading variants...
                </div>
              ) : variants.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  No variants tracked.
                </div>
              ) : (
                <div style={{ padding: "10px" }}>
                  {variants.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600 }}>
                          {v.color || "Standard"}
                        </span>
                        <span
                          style={{
                            margin: "0 8px",
                            color: "var(--text-muted)",
                          }}
                        >
                          /
                        </span>
                        <span>{v.size || "Universal"}</span>
                      </div>
                      <div className="stock-control">
                        <button
                          className="stock-btn"
                          onClick={() => handleStockChange(v.id, -1)}
                          disabled={v.stock <= 0}
                        >
                          −
                        </button>
                        <span
                          style={{
                            width: "30px",
                            textAlign: "center",
                            fontWeight: 700,
                          }}
                        >
                          {v.stock}
                        </span>
                        <button
                          className="stock-btn"
                          onClick={() => handleStockChange(v.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              className="stock-btn"
              style={{
                width: "100%",
                marginTop: "1.5rem",
                background: "transparent",
              }}
              onClick={() => setVariantProduct(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
