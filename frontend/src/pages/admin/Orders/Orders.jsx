import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../../../services/api";
import "../styles/admin-ui.css";

const STATUSES = ["pending", "paid", "shipped", "completed", "cancelled"];

const formatCOP = (value) =>
  parseFloat(value || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const paymentMethodLabel = (method) => {
  const map = {
    credit_card: "Credit card",
    wompi: "Wompi",
    nequi: "Nequi",
    daviplata: "Daviplata",
    bank_transfer: "PSE / Transfer",
  };
  return map[method] || method || "—";
};

const paymentMethodDot = (method) => {
  const map = {
    credit_card: "#a5b4fc",
    wompi: "#a5b4fc",
    nequi: "#4ade80",
    daviplata: "#4ade80",
    bank_transfer: "#fde047",
  };
  return map[method] || "#94a3b8";
};

const itemCount = (order) => {
  if (order.items?.length) {
    const total = order.items.reduce((sum, i) => sum + (i.quantity || 1), 0);
    return `${total} item${total !== 1 ? "s" : ""}`;
  }
  return order.totalUnits
    ? `${order.totalUnits} item${order.totalUnits !== 1 ? "s" : ""}`
    : "—";
};

// Helper function to get status class
const getStatusClass = (status) => {
  const statusMap = {
    completed: "status-paid",
    paid: "status-paid",
    shipped: "status-shipped",
    cancelled: "status-cancelled",
    pending: "status-pending",
  };
  return statusMap[status] || "status-pending";
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [updating, setUpdating] = useState(null);

  const load = () =>
    getOrders()
      .then((data) => setOrders(data.orders || data.data || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  // Close drawer on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") setSelectedOrder(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = selectedOrder ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedOrder]);

  const handleStatusUpdate = async (orderId, status) => {
    console.log(`Updating order ${orderId} to status: ${status}`);
    setUpdating(orderId);
    try {
      const response = await updateOrderStatus(orderId, status);
      console.log("Update response:", response);

      // Update the orders list
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );

      // Update the selected order in the drawer
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((o) => ({ ...o, status }));
      }

      console.log(`✅ Order ${orderId} updated to ${status}`);
    } catch (e) {
      console.error("Status update error:", e);
      alert(`Failed to update status: ${e.message || "Unknown error"}`);
    } finally {
      setUpdating(null);
    }
  };

  const filtered =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const hasSurcharge = (order) =>
    parseFloat(order.creditCardSurcharge || 0) > 0;
  const isFreeShipping = (order) =>
    parseFloat(order.shippingCost || 0) === 0 && (order.totalUnits || 0) >= 3;

  if (loading) {
    return (
      <div className="admin-shell">
        <div className="loading-state">Loading orders…</div>
      </div>
    );
  }

  return (
    <div className="admin-shell ord-page">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="filter-container">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`tab-btn ${statusFilter === s ? "active" : ""}`}
          >
            {s} (
            {s === "all"
              ? orders.length
              : orders.filter((o) => o.status === s).length}
            )
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="card ord-table-card">
        <div className="ord-table-wrap">
          <table className="ord-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th className="ord-th-hide-sm">Date</th>
                <th className="ord-th-hide-sm">Items</th>
                <th className="ord-th-hide-md">Payment</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    No orders found
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className={`order-row-hover ${selectedOrder?.id === o.id ? "ord-row-selected" : ""}`}
                  >
                    <td>
                      <div style={{ fontWeight: 800, fontSize: "0.85rem" }}>
                        #{o.id}
                      </div>
                      <div className="ord-ref-text">{o.reference}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                        {o.customerName}
                      </div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {o.customerEmail}
                      </div>
                    </td>
                    <td
                      className="ord-td-hide-sm"
                      style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}
                    >
                      {formatDate(o.createdAt)}
                    </td>
                    <td
                      className="ord-td-hide-sm"
                      style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}
                    >
                      {itemCount(o)}
                    </td>
                    <td className="ord-td-hide-md">
                      <span className="ord-pay-badge">
                        <span
                          className="ord-pay-dot"
                          style={{
                            background: paymentMethodDot(o.paymentMethod),
                          }}
                        />
                        {paymentMethodLabel(o.paymentMethod)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-text ${getStatusClass(o.status)}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}
                    >
                      {formatCOP(o.totalAmount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER OVERLAY */}
      {selectedOrder && (
        <div
          className="ord-drawer-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div className="ord-drawer" onClick={(e) => e.stopPropagation()}>
            {/* DRAWER HEADER */}
            <div className="ord-drawer-header">
              <div>
                <div className="ord-drawer-title">
                  Order #{selectedOrder.id}
                </div>
                <div className="ord-drawer-ref">{selectedOrder.reference}</div>
              </div>
              <button
                className="ord-close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                ✕
              </button>
            </div>

            {/* DRAWER BODY */}
            <div className="ord-drawer-body">
              {/* STATUS TEXT ROW */}
              <div className="ord-status-row">
                <span
                  className={`status-text ${getStatusClass(selectedOrder.status)}`}
                >
                  {selectedOrder.status}
                </span>
                <span className="ord-pay-badge">
                  <span
                    className="ord-pay-dot"
                    style={{
                      background: paymentMethodDot(selectedOrder.paymentMethod),
                    }}
                  />
                  {paymentMethodLabel(selectedOrder.paymentMethod)}
                </span>
                <span
                  style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                >
                  {formatDate(selectedOrder.createdAt)}
                </span>
              </div>

              {/* CUSTOMER */}
              <div>
                <div className="ord-section-label">Customer</div>
                <div className="ord-info-block">
                  <div className="ord-info-grid">
                    <div className="ord-info-item">
                      <div className="ord-info-lbl">Name</div>
                      <div className="ord-info-val">
                        {selectedOrder.customerName}
                      </div>
                    </div>
                    <div className="ord-info-item">
                      <div className="ord-info-lbl">Email</div>
                      <div className="ord-info-val ord-info-accent">
                        {selectedOrder.customerEmail}
                      </div>
                    </div>
                    <div className="ord-info-item">
                      <div className="ord-info-lbl">Phone</div>
                      <div className="ord-info-val">
                        {selectedOrder.customerPhone || "Not provided"}
                      </div>
                    </div>
                    <div className="ord-info-item">
                      <div className="ord-info-lbl">Payment</div>
                      <div className="ord-info-val">
                        {paymentMethodLabel(selectedOrder.paymentMethod)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SHIPPING */}
              <div>
                <div className="ord-section-label">Shipping address</div>
                <div className="ord-info-block">
                  <div className="ord-info-grid">
                    <div
                      className="ord-info-item"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <div className="ord-info-lbl">Address</div>
                      <div className="ord-info-val">
                        {selectedOrder.shippingAddress}
                      </div>
                    </div>
                    <div className="ord-info-item">
                      <div className="ord-info-lbl">City</div>
                      <div className="ord-info-val">
                        {selectedOrder.shippingCity}
                      </div>
                    </div>
                    <div className="ord-info-item">
                      <div className="ord-info-lbl">Postal code</div>
                      <div className="ord-info-val">
                        {selectedOrder.shippingPostalCode}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ITEMS */}
              {selectedOrder.items?.length > 0 && (
                <div>
                  <div className="ord-section-label">
                    Items (
                    {selectedOrder.items.reduce(
                      (s, i) => s + (i.quantity || 1),
                      0
                    )}
                    )
                  </div>
                  <div className="ord-info-block">
                    <div className="ord-items-list">
                      {selectedOrder.items.map((item, idx) => {
                        const variant = item.productVariant || item;
                        const name =
                          variant?.product?.name ||
                          item.productName ||
                          "Product";
                        const color = variant?.color || "";
                        const size = variant?.size || "";
                        const variantInfo = [color, size]
                          .filter(Boolean)
                          .join(" / ");
                        const price = parseFloat(item.priceAtPurchase || 0);
                        const qty = item.quantity || 1;
                        return (
                          <div key={idx} className="ord-item-row">
                            <div>
                              <div className="ord-item-name">{name}</div>
                              {variantInfo && (
                                <div className="ord-item-variant">
                                  {variantInfo}
                                </div>
                              )}
                            </div>
                            <div className="ord-item-right">
                              <span className="ord-item-qty">×{qty}</span>
                              <span className="ord-item-price">
                                {formatCOP(price * qty)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ORDER SUMMARY */}
              <div>
                <div className="ord-section-label">Order summary</div>
                <div className="ord-info-block">
                  <div className="ord-totals">
                    <div className="ord-total-row">
                      <span className="ord-total-lbl">Subtotal</span>
                      <span className="ord-total-val">
                        {formatCOP(selectedOrder.subtotal)}
                      </span>
                    </div>
                    <div className="ord-total-row">
                      <span className="ord-total-lbl">Shipping</span>
                      <span
                        className="ord-total-val"
                        style={
                          isFreeShipping(selectedOrder)
                            ? { color: "var(--success)" }
                            : {}
                        }
                      >
                        {isFreeShipping(selectedOrder)
                          ? "Free 🎉"
                          : formatCOP(selectedOrder.shippingCost)}
                      </span>
                    </div>
                    {isFreeShipping(selectedOrder) && (
                      <div className="ord-free-ship-banner">
                        {selectedOrder.totalUnits} products purchased — free
                        shipping applied
                      </div>
                    )}
                    {hasSurcharge(selectedOrder) && (
                      <div className="ord-total-row ord-total-surcharge">
                        <span className="ord-total-lbl">CC surcharge (5%)</span>
                        <span className="ord-total-val">
                          {formatCOP(selectedOrder.creditCardSurcharge)}
                        </span>
                      </div>
                    )}
                    <div className="ord-total-row ord-total-grand">
                      <span className="ord-total-lbl">Total paid</span>
                      <span className="ord-total-val">
                        {formatCOP(selectedOrder.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* UPDATE STATUS */}
              <div>
                <div className="ord-section-label">Update status</div>
                <div className="ord-status-btns">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      className={`tab-btn ${selectedOrder.status === s ? "active" : ""}`}
                      onClick={() => handleStatusUpdate(selectedOrder.id, s)}
                      disabled={
                        updating === selectedOrder.id ||
                        selectedOrder.status === s
                      }
                      style={{
                        textTransform: "capitalize",
                        opacity: selectedOrder.status === s ? 1 : 0.9,
                        cursor:
                          selectedOrder.status === s
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {updating === selectedOrder.id ? "..." : s}
                    </button>
                  ))}
                </div>
                {updating === selectedOrder.id && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--accent)",
                      marginTop: "8px",
                      textAlign: "center",
                    }}
                  >
                    Updating status...
                  </div>
                )}
              </div>

              {/* WOMPI TRANSACTION ID */}
              {selectedOrder.wompiTransactionId && (
                <div>
                  <div className="ord-section-label">Wompi transaction ID</div>
                  <div className="ord-wompi-id">
                    {selectedOrder.wompiTransactionId}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
