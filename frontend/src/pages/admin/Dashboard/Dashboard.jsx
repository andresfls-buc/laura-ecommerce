import { useEffect, useState } from "react";
import { getOrders, getProducts } from "../../../services/api";
import {
  HiBanknotes,
  HiArchiveBox,
  HiClock,
  HiCheckCircle,
  HiTag,
} from "react-icons/hi2";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
        setOrders(o.orders || o.data || o || []);
        setProducts(p.products || p.data || p || []);
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

  // Build last-30-days sales chart data
  const salesChartData = (() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" }),
        isoDate: d.toISOString().slice(0, 10),
        ventas: 0,
      });
    }
    orders
      .filter((o) => ["paid", "completed"].includes(o.status))
      .forEach((o) => {
        const orderDate = (o.createdAt || o.updatedAt || "").slice(0, 10);
        const day = days.find((d) => d.isoDate === orderDate);
        if (day) day.ventas += parseFloat(o.totalAmount || 0);
      });
    return days.map(({ date, ventas }) => ({ date, ventas }));
  })();

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

      {/* ── Sales Chart ── */}
      <div className="card" style={{ padding: "1.2rem" }}>
        <h2 style={{ margin: "0 0 1.2rem 0", fontSize: "1.1rem" }}>
          Ventas últimos 30 días
        </h2>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={salesChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e5e7eb)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--text-muted, #9ca3af)" }}
              interval={4}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(v) =>
                v >= 1000000
                  ? `$${(v / 1000000).toFixed(1)}M`
                  : v >= 1000
                  ? `$${(v / 1000).toFixed(0)}K`
                  : `$${v}`
              }
              tick={{ fontSize: 11, fill: "var(--text-muted, #9ca3af)" }}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip
              formatter={(value) => [formatCOP(value), "Ventas"]}
              contentStyle={{
                background: "var(--card, #1e1e2e)",
                border: "1px solid var(--border, #e5e7eb)",
                borderRadius: "8px",
                fontSize: "0.8rem",
              }}
            />
            <Area
              type="monotone"
              dataKey="ventas"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#colorVentas)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
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
