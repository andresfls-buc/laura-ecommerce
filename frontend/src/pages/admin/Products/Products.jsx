import { useEffect, useState, useRef } from "react";
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
  (process.env.REACT_APP_API_URL || "http://localhost:3000/api").replace("/api", "");

const MAX_IMAGES = 3;

// Each variant row in the create/edit modal
const emptyVariant = () => ({
  _key: Math.random().toString(36).slice(2),
  size: "",
  color: "",
  price: "",
  stock: "",
  // Up to 3 pending image files (only used before save)
  imageFiles: [], // File[]
  imagePreviews: [], // blob URL[]
});

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDesc] = useState("");
  const [variants, setVariants] = useState([emptyVariant()]);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(""); // progress message
  const [error, setError] = useState("");

  // Variants viewer modal
  const [variantProduct, setVariantProduct] = useState(null);
  const [variantList, setVariantList] = useState([]);
  const [variantLoading, setVariantLoading] = useState(false);
  const [uploadingFor, setUploadingFor] = useState(null);
  const [deletingFor, setDeletingFor] = useState(null);

  // One hidden file input for the viewer modal uploads
  const viewerFileRef = useRef(null);
  const pendingVariantId = useRef(null);
  // One hidden file input per variant slot in the create modal
  // We use a single ref + a pending slot tracker instead
  const createFileRef = useRef(null);
  const pendingCreateKey = useRef(null);

  // ── data ──────────────────────────────────────────────────────
  const load = () =>
    getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const refreshVariants = async (productId) => {
    const v = await getProductVariants(productId);
    setVariantList(v);
  };

  // ── open create modal ──────────────────────────────────────────
  const openCreate = () => {
    setEditing(null);
    setName("");
    setDesc("");
    setVariants([emptyVariant()]);
    setError("");
    setSaveStatus("");
    setShowModal(true);
  };

  // ── open edit modal ────────────────────────────────────────────
  const openEdit = (p) => {
    setEditing(p);
    setName(p.name);
    setDesc(p.description || "");
    const rows =
      p.variants?.length > 0
        ? p.variants.map((v) => ({
            _key: v.id.toString(),
            id: v.id,
            size: v.size || "",
            color: v.color || "",
            price: v.price ?? "",
            stock: v.stock ?? "",
            imageFiles: [],
            imagePreviews: [],
          }))
        : [emptyVariant()];
    setVariants(rows);
    setError("");
    setSaveStatus("");
    setShowModal(true);
  };

  // ── variant field helpers ──────────────────────────────────────
  const addVariant = () => setVariants((r) => [...r, emptyVariant()]);
  const removeVariant = (key) =>
    setVariants((r) => r.filter((v) => v._key !== key));
  const updateVariant = (key, field, value) =>
    setVariants((r) =>
      r.map((v) => (v._key === key ? { ...v, [field]: value } : v))
    );

  // ── image picker in create modal ───────────────────────────────
  const triggerCreateImagePick = (key) => {
    pendingCreateKey.current = key;
    createFileRef.current.value = "";
    createFileRef.current.click();
  };

  const handleCreateFilePick = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !pendingCreateKey.current) return;
    const key = pendingCreateKey.current;

    setVariants((rows) =>
      rows.map((v) => {
        if (v._key !== key) return v;
        const remaining = MAX_IMAGES - v.imageFiles.length;
        if (remaining <= 0) return v;
        const toAdd = files.slice(0, remaining);
        return {
          ...v,
          imageFiles: [...v.imageFiles, ...toAdd],
          imagePreviews: [
            ...v.imagePreviews,
            ...toAdd.map((f) => URL.createObjectURL(f)),
          ],
        };
      })
    );
    pendingCreateKey.current = null;
  };

  const removeCreateImage = (key, idx) => {
    setVariants((rows) =>
      rows.map((v) => {
        if (v._key !== key) return v;
        const imageFiles = v.imageFiles.filter((_, i) => i !== idx);
        const imagePreviews = v.imagePreviews.filter((_, i) => i !== idx);
        return { ...v, imageFiles, imagePreviews };
      })
    );
  };

  // ── save (create or edit) ──────────────────────────────────────
  const handleSave = async () => {
    if (!name.trim()) {
      setError("Product name is required");
      return;
    }
    for (const v of variants) {
      if (
        !v.size.trim() ||
        !v.color.trim() ||
        v.price === "" ||
        v.stock === ""
      ) {
        setError("All variant fields (size, color, price, stock) are required");
        return;
      }
    }

    setSaving(true);
    setError("");
    setSaveStatus("Saving product…");

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        variants: variants.map((v) => ({
          ...(v.id ? { id: v.id } : {}),
          size: v.size.trim(),
          color: v.color.trim(),
          price: Number(v.price),
          stock: Number(v.stock),
        })),
      };

      const saved = editing
        ? await updateProduct(editing.id, payload)
        : await createProduct(payload);

      // Now upload images variant by variant
      // Match saved variants by position (create) or by id (edit)
      const savedVariants = saved?.variants ?? [];

      const variantsWithFiles = variants.filter((v) => v.imageFiles.length > 0);

      if (variantsWithFiles.length > 0) {
        setSaveStatus("Uploading images…");

        for (const localVariant of variantsWithFiles) {
          // Find the matching saved variant
          let savedVariant;
          if (localVariant.id) {
            // edit mode — match by id
            savedVariant = savedVariants.find(
              (sv) => sv.id === localVariant.id
            );
          } else {
            // create mode — match by position in the variants array
            const idx = variants.indexOf(localVariant);
            savedVariant = savedVariants[idx];
          }

          if (!savedVariant) continue;

          for (const file of localVariant.imageFiles) {
            await uploadVariantImage(savedVariant.id, file);
          }
        }
      }

      setSaveStatus("");
      setShowModal(false);
      load();
    } catch (e) {
      setError(e.message);
      setSaveStatus("");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteProduct(id).catch(console.error);
    load();
  };

  // ── variants viewer modal ──────────────────────────────────────
  const openVariants = async (product) => {
    setVariantProduct(product);
    setVariantLoading(true);
    try {
      const v = await getProductVariants(product.id);
      setVariantList(v);
    } catch {
      setVariantList([]);
    } finally {
      setVariantLoading(false);
    }
  };

  const closeVariants = () => {
    setVariantProduct(null);
    setVariantList([]);
  };

  const handleStockChange = async (variantId, qty) => {
    try {
      await adjustStock(variantId, qty);
      await refreshVariants(variantProduct.id);
    } catch (e) {
      alert(e.message);
    }
  };

  // Viewer modal — upload image to existing variant
  const triggerViewerUpload = (variantId) => {
    pendingVariantId.current = variantId;
    viewerFileRef.current.value = "";
    viewerFileRef.current.click();
  };

  const handleViewerFilePick = async (e) => {
    const file = e.target.files[0];
    if (!file || !pendingVariantId.current) return;
    const variantId = pendingVariantId.current;
    setUploadingFor(variantId);
    try {
      await uploadVariantImage(variantId, file);
      await refreshVariants(variantProduct.id);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingFor(null);
      pendingVariantId.current = null;
    }
  };

  const handleDeleteImage = async (variantId, imageId) => {
    if (!window.confirm("Remove this image?")) return;
    setDeletingFor(imageId);
    try {
      await deleteVariantImage(variantId, imageId);
      await refreshVariants(variantProduct.id);
    } catch (err) {
      alert("Delete failed: " + err.message);
    } finally {
      setDeletingFor(null);
    }
  };

  // ── render ─────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="admin-shell">
        <div className="loading-state">Loading products…</div>
      </div>
    );

  return (
    <div className="admin-shell prod-page">
      {/* Hidden file inputs */}
      <input
        ref={createFileRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleCreateFilePick}
      />
      <input
        ref={viewerFileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleViewerFilePick}
      />

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} items in catalog</p>
        </div>
        <button className="stock-btn prod-add-btn" onClick={openCreate}>
          + Add Product
        </button>
      </div>

      {/* ── PRODUCTS TABLE ── */}
      <div className="card">
        <div className="prod-table-wrap">
          <table className="prod-table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="prod-desc-th">Description</th>
                <th className="prod-actions-th">Actions</th>
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
                products.map((p) => {
                  const thumb = p.variants?.[0]?.images?.[0]?.imageUrl ?? null;
                  return (
                    <tr key={p.id} className="prod-row">
                      <td className="prod-name-cell">
                        <div className="prod-name-inner">
                          {thumb ? (
                            <img
                              src={
                                thumb.startsWith("http")
                                  ? thumb
                                  : `${BASE_URL}${thumb}`
                              }
                              className="prod-thumb"
                              alt={p.name}
                            />
                          ) : (
                            <div className="prod-thumb prod-thumb-placeholder">
                              📷
                            </div>
                          )}
                          <div>
                            <div className="prod-name-text">{p.name}</div>
                            <div className="prod-id-text">
                              ID: #{p.id} · {p.variants?.length || 0} variants
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="prod-desc-cell">
                        {p.description || "No description provided."}
                      </td>

                      <td className="prod-actions-cell">
                        <div className="prod-btn-group">
                          <button
                            className="stock-btn prod-action-btn"
                            onClick={() => openVariants(p)}
                          >
                            Variants
                          </button>
                          <button
                            className="stock-btn prod-action-btn"
                            onClick={() => openEdit(p)}
                          >
                            Edit
                          </button>
                          <button
                            className="stock-btn prod-action-btn prod-action-danger"
                            onClick={() => handleDelete(p.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          CREATE / EDIT MODAL
      ══════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal prod-create-modal">
            <h2 className="page-title prod-modal-title">
              {editing ? "Edit Product" : "New Product"}
            </h2>

            {error && <div className="prod-modal-error">{error}</div>}

            {/* ── PRODUCT INFO ── */}
            <div className="prod-modal-section-label">Product Info</div>

            <div className="form-field">
              <label>Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Net Uniform"
              />
            </div>

            <div className="form-field">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Enter description..."
              />
            </div>

            {/* ── VARIANTS ── */}
            <div className="prod-modal-section-label prod-modal-section-label--mt">
              Variants
              <span className="prod-modal-section-hint">
                up to {MAX_IMAGES} images per variant
              </span>
            </div>

            <div className="prod-variants-form-list">
              {variants.map((v, idx) => (
                <div key={v._key} className="prod-variant-form-card">
                  {/* Card header */}
                  <div className="prod-variant-form-card-header">
                    <span className="prod-variant-form-card-num">
                      Variant {idx + 1}
                    </span>
                    <button
                      type="button"
                      className="stock-btn prod-action-btn prod-action-danger prod-variant-remove"
                      onClick={() => removeVariant(v._key)}
                      disabled={variants.length === 1}
                    >
                      Remove
                    </button>
                  </div>

                  {/* Fields grid: Size | Color | Price | Stock */}
                  <div className="prod-variant-form-grid">
                    <div className="prod-variant-field">
                      <label className="prod-variant-label">Size</label>
                      <input
                        type="text"
                        className="prod-variant-input"
                        placeholder="e.g. 4, M, XL"
                        value={v.size}
                        onChange={(e) =>
                          updateVariant(v._key, "size", e.target.value)
                        }
                      />
                    </div>
                    <div className="prod-variant-field">
                      <label className="prod-variant-label">Color</label>
                      <input
                        type="text"
                        className="prod-variant-input"
                        placeholder="e.g. Grey, Blue"
                        value={v.color}
                        onChange={(e) =>
                          updateVariant(v._key, "color", e.target.value)
                        }
                      />
                    </div>
                    <div className="prod-variant-field">
                      <label className="prod-variant-label">Price</label>
                      <input
                        type="number"
                        className="prod-variant-input"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={v.price}
                        onChange={(e) =>
                          updateVariant(v._key, "price", e.target.value)
                        }
                      />
                    </div>
                    <div className="prod-variant-field">
                      <label className="prod-variant-label">Stock</label>
                      <input
                        type="number"
                        className="prod-variant-input"
                        placeholder="0"
                        min="0"
                        step="1"
                        value={v.stock}
                        onChange={(e) =>
                          updateVariant(v._key, "stock", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Image slots */}
                  <div className="prod-variant-img-row">
                    {/* Existing previews */}
                    {v.imagePreviews.map((src, i) => (
                      <div key={i} className="prod-variant-img-slot-sm">
                        <img
                          src={src}
                          className="prod-variant-img-sm"
                          alt={`img ${i + 1}`}
                        />
                        <button
                          type="button"
                          className="prod-variant-img-remove"
                          onClick={() => removeCreateImage(v._key, i)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Add slot — only show if under limit */}
                    {v.imageFiles.length < MAX_IMAGES && (
                      <button
                        type="button"
                        className="prod-variant-img-add"
                        onClick={() => triggerCreateImagePick(v._key)}
                        title="Add image"
                      >
                        <span>+</span>
                        <span className="prod-variant-img-add-label">
                          {v.imageFiles.length === 0 ? "Add Photo" : "Add More"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="stock-btn prod-action-btn prod-variant-add-btn"
              onClick={addVariant}
            >
              + Add Variant
            </button>

            {/* Save status */}
            {saveStatus && <div className="prod-save-status">{saveStatus}</div>}

            {/* Actions */}
            <div className="prod-modal-actions">
              <button
                className="stock-btn prod-modal-save"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? saveStatus || "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Create Product"}
              </button>
              <button
                className="stock-btn prod-modal-cancel"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          VARIANTS VIEWER MODAL
      ══════════════════════════════════════════════════════ */}
      {variantProduct && (
        <div className="modal-overlay" onClick={closeVariants}>
          <div
            className="modal prod-variants-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="page-title prod-modal-title prod-modal-title--sm">
              {variantProduct.name}
              <span className="prod-modal-subtitle"> — Variants</span>
            </h2>

            {variantLoading ? (
              <div className="loading-state">Loading variants...</div>
            ) : variantList.length === 0 ? (
              <div className="empty-state">No variants found.</div>
            ) : (
              <div className="prod-variants-list">
                {variantList.map((v) => {
                  const images = v.images ?? [];
                  const canUpload = images.length < MAX_IMAGES;
                  const isUploading = uploadingFor === v.id;

                  return (
                    <div key={v.id} className="prod-variant-card">
                      {/* VARIANT INFO + STOCK */}
                      <div className="prod-variant-body">
                        <div className="prod-variant-info">
                          <span className="prod-variant-color-chip">
                            {v.color || "Standard"}
                          </span>
                          <span className="prod-variant-sep">/</span>
                          <span className="prod-variant-size-label">
                            {v.size || "Universal"}
                          </span>
                          {v.price != null && (
                            <span className="prod-variant-price">
                              ${Number(v.price).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="stock-control prod-stock-control">
                          <button
                            className="stock-btn stock-control-btn"
                            onClick={() => handleStockChange(v.id, -1)}
                            disabled={v.stock <= 0}
                          >
                            −
                          </button>
                          <span className="prod-stock-count">{v.stock}</span>
                          <button
                            className="stock-btn stock-control-btn"
                            onClick={() => handleStockChange(v.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* IMAGES ROW */}
                      <div className="prod-variant-viewer-imgs">
                        {images.map((img) => (
                          <div
                            key={img.id}
                            className="prod-variant-img-slot-sm"
                          >
                            <img
                              src={
                                img.imageUrl?.startsWith("http")
                                  ? img.imageUrl
                                  : `${BASE_URL}${img.imageUrl}`
                              }
                              className="prod-variant-img-sm"
                              alt="variant"
                            />
                            <button
                              type="button"
                              className="prod-variant-img-remove"
                              onClick={() => handleDeleteImage(v.id, img.id)}
                              disabled={deletingFor === img.id}
                              title="Remove"
                            >
                              {deletingFor === img.id ? "…" : "✕"}
                            </button>
                          </div>
                        ))}

                        {canUpload && (
                          <button
                            type="button"
                            className="prod-variant-img-add"
                            onClick={() => triggerViewerUpload(v.id)}
                            disabled={isUploading}
                            title="Upload image"
                          >
                            <span>{isUploading ? "…" : "+"}</span>
                            <span className="prod-variant-img-add-label">
                              {isUploading ? "Uploading" : "Add Photo"}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              className="stock-btn prod-modal-cancel prod-modal-close"
              onClick={closeVariants}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
