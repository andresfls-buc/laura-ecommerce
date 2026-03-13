import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HiSquares2X2,
  HiArchiveBox,
  HiClipboardDocumentList,
  HiChartBarSquare,
  HiBolt,
  HiPower,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
import "./AdminLayout.css";
import "../../pages/admin/styles/admin-ui.css";

const NAV = [
  { to: "/admin/dashboard", icon: <HiSquares2X2 />, label: "Dashboard" },
  { to: "/admin/products", icon: <HiArchiveBox />, label: "Products" },
  { to: "/admin/orders", icon: <HiClipboardDocumentList />, label: "Orders" },
  { to: "/admin/inventory", icon: <HiChartBarSquare />, label: "Inventory" },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className={`admin-shell ${collapsed ? "collapsed" : ""}`}>
      <aside className="admin-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <HiBolt className="brand-icon" />
            {!collapsed && <span className="brand-name">Store Admin</span>}
          </div>
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <HiChevronRight /> : <HiChevronLeft />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">{icon}</span>
              {!collapsed && <span className="nav-label">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div className="admin-info">
              <div className="admin-avatar">
                {admin?.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="admin-meta">
                <span className="admin-email">{admin?.email}</span>
                <span className="admin-role">Administrator</span>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <HiPower />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
