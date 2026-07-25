import { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminCustomers = lazy(() => import("./pages/AdminCustomers"));
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import { getCurrentUser } from "./services/authService";

function AdminGuard({ user, loading, children }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.is_staff) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-600">
        <h2 className="mb-2 text-xl font-semibold">Access denied</h2>
        <p className="text-sm">You do not have admin permissions.</p>
      </div>
    );
  }

  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const data = await getCurrentUser(token);

        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      } catch (err) {
        console.error("Auth error:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      {/* =========================
          GLOBAL TOAST SYSTEM
      ========================= */}
      <Toaster
  position="top-center"
  gutter={12}
  containerStyle={{
    top: 20,
    zIndex: 999999,
  }}
  toastOptions={{
    duration: 3000,

    style: {
      background: "#111827",
      color: "#fff",
      borderRadius: "10px",
      fontSize: "14px",
      padding: "12px 16px",
    },

    success: {
      style: {
        background: "#065f46",
        color: "#ecfdf5",
      },
    },

    error: {
      duration: 4000,
      style: {
        background: "#7f1d1d",
        color: "#fee2e2",
      },
    },
  }}
/>
<Suspense
  fallback={
    <div className="flex items-center justify-center h-40">
      <p className="text-gray-500">Loading...</p>
    </div>
  }>

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin/dashboard"
          element={
            <AdminGuard user={user} loading={loading}>
              <AdminDashboard />
            </AdminGuard>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <AdminGuard user={user} loading={loading}>
              <AdminOrders />
            </AdminGuard>
          }
        />

        <Route
          path="/admin/products"
          element={
            <AdminGuard user={user} loading={loading}>
              <AdminProducts />
            </AdminGuard>
          }
        />

        <Route
          path="/admin/customers"
          element={
            <AdminGuard user={user} loading={loading}>
              <AdminCustomers />
            </AdminGuard>
          }
        />

        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
      </Suspense>
    </>
  );
}
