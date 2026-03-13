import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#22c55e",
          fontFamily: "sans-serif",
          gap: "0.75rem",
        }}
      >
        <span
          style={{
            width: 24,
            height: 24,
            border: "3px solid rgba(34,197,94,0.2)",
            borderTopColor: "#22c55e",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 0.7s linear infinite",
          }}
        />
        Loading…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}
