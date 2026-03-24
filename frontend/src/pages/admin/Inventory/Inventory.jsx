import { useEffect, useState } from "react";
import {
  getProducts,
  getProductVariants,
  adjustStock,
} from "../../../services/api";
import "../styles/admin-ui.css";

const LOW_STOCK = 5;

function StockBar({ stock, max = 50 }) {
  const pct = Math.min(100, Math.round((stock / max) * 100));
  const color =
    stock === 0 ? "#f87171" : stock <= LOW_STOCK ? "#fde047" : "#4ade80";
  return (
    <div className="inv-stock-bar-track">
      <div
        className="inv-stock-bar-fill"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function VariantRow({ variant, productId, onAdjust, updating }) {
  const isUpdating = updating === `${productId}-${variant.id}`;
  const isOut = (variant.stock || 0) === 0;
  const isLow = !isOut && (variant.stock || 0) <= LOW_STOCK;

  return (
    <div className="inv-variant-row">
      <div className="inv-variant-info">
        {variant.color && (
          <span className="inv-variant-chip inv-chip-color">
            {variant.color}
          </span>
        )}
        {variant.size && (
          <span className="inv-variant-chip inv-chip-size">{variant.size}</span>
        )}
      </div>

      <div className="inv-variant-stock-wrap">
        <StockBar stock={variant.stock || 0} />
        <span
          className="inv-stock-number"
          style={{
            color: isOut ? "#f87171" : isLow ? "#fde047" : "var(--text)",
          }}
        >
          {variant.stock ?? 0}
        </span>
        {isOut && <span className="inv-badge inv-badge-out">Out</span>}
        {isLow && !isOut && (
          <span className="inv-badge inv-badge-low">Low</span>
        )}
      </div>

      <div className="inv-variant-controls">
        <button
          className="stock-btn inv-ctrl-btn"
          onClick={() => onAdjust(variant.id, -1)}
          disabled={isUpdating || isOut}
          aria-label="Decrease stock"
        >
          −
        </button>
        <button
          className="stock-btn inv-ctrl-btn"
          onClick={() => onAdjust(variant.id, 1)}
          disabled={isUpdating}
          aria-label="Increase stock"
        >
          {isUpdating ? "…" : "+"}
        </button>
      </div>
    </div>
  );
}

function ProductRow({ item }) {
  const [expanded, setExpanded] = useState(false);
  const [variants, setVariants] = useState([]);
  const [varLoading, setVarLoading] = useState(false);
  const [varLoaded, setVarLoaded] = useState(false);
  const [updating, setUpdating] = useState(null);

  const totalVariantStock = variants.reduce(
    (acc, v) => acc + (v.stock || 0),
    0
  );
  const hasOut = variants.some((v) => (v.stock || 0) === 0);
  const hasLow = variants.some(
    (v) => (v.stock || 0) > 0 && (v.stock || 0) <= LOW_STOCK
  );

  const toggle = async () => {
    if (!expanded && !varLoaded) {
      setVarLoading(true);
      try {
        const v = await getProductVariants(item.id);
        setVariants(Array.isArray(v) ? v : []);
        setVarLoaded(true);
      } catch {
        setVariants([]);
      } finally {
        setVarLoading(false);
      }
    }
    setExpanded((e) => !e);
  };

  const handleAdjust = async (variantId, delta) => {
    const key = `${item.id}-${variantId}`;
    setUpdating(key);
    try {
      await adjustStock(variantId, delta);
      setVariants((prev) =>
        prev.map((v) =>
          v.id === variantId
            ? { ...v, stock: Math.max(0, (v.stock || 0) + delta) }
            : v
        )
      );
    } catch (e) {
      alert("Failed to update stock: " + e.message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className={`inv-product-block ${expanded ? "is-expanded" : ""}`}>
      {/* ── Product header row ── */}
      <div className="inv-product-row" onClick={toggle}>
        <div className="inv-product-left">
          <span className={`inv-chevron ${expanded ? "open" : ""}`}>›</span>
          <div className="inv-product-name-wrap">
            <span className="inv-product-name">{item.name}</span>
            <span className="inv-product-meta">
              #{item.id}
              {item.category && (
                <span className="inv-category-chip">{item.category}</span>
              )}
            </span>
          </div>
        </div>

        <div className="inv-product-right">
          {varLoaded && (
            <span className="inv-total-stock">
              {totalVariantStock} units across {variants.length} variants
            </span>
          )}
          {hasOut && (
            <span className="inv-badge inv-badge-out">Out of stock</span>
          )}
          {hasLow && !hasOut && (
            <span className="inv-badge inv-badge-low">Low stock</span>
          )}
        </div>
      </div>

      {/* ── Variants panel ── */}
      {expanded && (
        <div className="inv-variants-panel">
          {varLoading ? (
            <div className="inv-variants-loading">Loading variants…</div>
          ) : variants.length === 0 ? (
            <div className="inv-variants-empty">
              No variants found for this product.
            </div>
          ) : (
            <>
              <div className="inv-variants-header">
                <span>Variant</span>
                <span>Stock level</span>
                <span>Adjust</span>
              </div>
              {variants.map((v) => (
                <VariantRow
                  key={v.id}
                  variant={v}
                  productId={item.id}
                  onAdjust={handleAdjust}
                  updating={updating}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getProducts()
      .then((data) => {
        const list = data.products || data.data || data || [];
        setItems(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((i) =>
    i.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-shell inv-page">
        <div className="loading-state">Loading inventory…</div>
      </div>
    );
  }

  return (
    <div className="admin-shell inv-page">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">
            {items.length} products · click a product to manage its variants
          </p>
        </div>
      </div>

      {/* ── Summary stats ── */}
      {(() => {
        const outOfStockCount = items.filter((i) =>
          (i.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) ?? 0) === 0
        ).length;
        return (
          <div className="inv-summary">
            <div className="card inv-stat-card">
              <div className="inv-stat-value">{items.length}</div>
              <div className="inv-stat-label">Products</div>
            </div>
            <div className="card inv-stat-card">
              <div
                className="inv-stat-value"
                style={{ color: outOfStockCount > 0 ? "#f87171" : "var(--text)" }}
              >
                {outOfStockCount}
              </div>
              <div className="inv-stat-label">Out of Stock</div>
            </div>
          </div>
        );
      })()}

      {/* ── Search ── */}
      <div className="inv-search-wrap">
        <input
          className="inv-search"
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Product list ── */}
      <div className="inv-list">
        {filtered.length === 0 ? (
          <div className="empty-state">No products match your search.</div>
        ) : (
          filtered.map((item) => <ProductRow key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
