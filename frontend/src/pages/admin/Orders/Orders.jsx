import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../../../services/api";

/* Ensure this points to your shared admin CSS */
import "../styles/admin-ui.css";

const STATUSES = ["pending", "paid", "shipped", "completed", "cancelled"];

const formatCOP = (value) =>
  parseFloat(value || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });

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

  const handleStatusUpdate = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((o) => ({ ...o, status }));
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setUpdating(null);
    }
  };

  const filtered =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  if (loading) {
    return (
      <div className="admin-shell">
        <div
          style={{
            padding: "4rem",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          Loading orders…
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell ord-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
      </div>

      {/* FILTER TABS - Uses .filter-container and .tab-btn from CSS */}
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

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>City</th>
              <th>Amount</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    color: "var(--text-muted)",
                  }}
                >
                  No orders found
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className="order-row-hover"
                >
                  <td style={{ fontWeight: 800 }}>#{o.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                    <div
                      style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
                    >
                      {o.customerEmail}
                    </div>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>
                    {o.shippingCity}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {formatCOP(o.totalAmount)}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        o.status === "completed" || o.status === "paid"
                          ? "badge-green"
                          : o.status === "cancelled"
                            ? "badge-red"
                            : "badge-yellow"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="stock-btn"
                      style={{ fontSize: "0.7rem" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(o);
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2
              className="page-title"
              style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}
            >
              Order #{selectedOrder.id}
            </h2>

            <div style={{ display: "grid", gap: "15px", marginBottom: "2rem" }}>
              <div
                style={{
                  background: "rgba(0,0,0,0.2)",
                  padding: "15px",
                  borderRadius: "10px",
                }}
              >
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    marginBottom: "5px",
                    margin: 0,
                  }}
                >
                  Customer
                </p>
                <p style={{ margin: 0 }}>
                  <strong>{selectedOrder.customerName}</strong>
                </p>
                <p style={{ margin: 0, fontSize: "0.85rem" }}>
                  {selectedOrder.customerEmail}
                </p>
              </div>
              <div
                style={{
                  background: "rgba(0,0,0,0.2)",
                  padding: "15px",
                  borderRadius: "10px",
                }}
              >
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    marginBottom: "5px",
                    margin: 0,
                  }}
                >
                  Shipping Address
                </p>
                <p style={{ margin: 0 }}>{selectedOrder.shippingAddress}</p>
                <p style={{ margin: 0 }}>{selectedOrder.shippingCity}</p>
              </div>
            </div>

            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                marginBottom: "10px",
                textTransform: "uppercase",
              }}
            >
              Update Status
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  className={`tab-btn ${selectedOrder.status === s ? "active" : ""}`}
                  onClick={() => handleStatusUpdate(selectedOrder.id, s)}
                  disabled={
                    updating === selectedOrder.id || selectedOrder.status === s
                  }
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              className="stock-btn"
              style={{
                width: "100%",
                marginTop: "2rem",
                background: "transparent",
              }}
              onClick={() => setSelectedOrder(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
