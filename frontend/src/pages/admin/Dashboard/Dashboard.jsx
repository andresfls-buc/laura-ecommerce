import { useEffect, useState } from "react";
import { getOrders, getProducts } from "../../../services/api";
import {
  HiBanknotes,
  HiArchiveBox,
  HiClock,
  HiCheckCircle,
  HiTag,
} from "react-icons/hi2";
import "../styles/admin-ui.css";

const formatCOP = (value) =>
  parseFloat(value || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOrders(), getProducts()])
      .then(([o, p]) => {
        setOrders(o.orders || o.data || []);
        setProducts(p.products || p.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="admin-shell">
        <div className="loading-state">Loading dashboard...</div>
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o) => ["paid", "completed"].includes(o.status))
    .reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0);

  const KPI_CARDS = [
    { icon: <HiBanknotes />, label: "Revenue", value: formatCOP(totalRevenue) },
    { icon: <HiArchiveBox />, label: "Orders", value: orders.length },
    {
      icon: <HiClock />,
      label: "Pending",
      value: orders.filter((o) => o.status === "pending").length,
    },
    {
      icon: <HiCheckCircle />,
      label: "Completed",
      value: orders.filter((o) => o.status === "completed").length,
    },
    { icon: <HiTag />, label: "Products", value: products.length },
  ];

  return (
    /* CRITICAL: We added 'dash-page' here. 
       This matches your CSS: .dash-page .kpi-grid 
    */
    <div className="admin-shell dash-page">
      <header className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </header>

      <div className="kpi-grid">
        {KPI_CARDS.map(({ icon, label, value }) => (
          <div className="kpi-card" key={label}>
            <div className="kpi-icon">{icon}</div>
            <div className="kpi-info">
              <span
                className="kpi-label"
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                }}
              >
                {label}
              </span>
              <span
                className="kpi-value"
                style={{
                  display: "block",
                  fontSize: "1.2rem",
                  fontWeight: 800,
                }}
              >
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ padding: "1.2rem", margin: 0, fontSize: "1.1rem" }}>
          Recent Orders
        </h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 6).map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.customerName}</td>
                <td>{formatCOP(o.totalAmount)}</td>
                <td>
                  {/* Reusing your badge logic if needed, or simple text for now */}
                  <span
                    style={{
                      textTransform: "uppercase",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                    }}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
