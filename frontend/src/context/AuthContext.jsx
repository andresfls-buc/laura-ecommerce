import { createContext, useContext, useState, useEffect } from "react";
import { loginAdmin, getToken } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 > Date.now() && payload.role === "admin") {
          setAdmin({ email: payload.email, role: payload.role });
        } else {
          localStorage.removeItem("adminToken");
        }
      } catch {
        localStorage.removeItem("adminToken");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginAdmin(email, password);
    localStorage.setItem("adminToken", data.token);
    const payload = JSON.parse(atob(data.token.split(".")[1]));
    if (payload.role !== "admin") throw new Error("Not authorized as admin");
    setAdmin({ email: payload.email, role: payload.role });
    return data;
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
