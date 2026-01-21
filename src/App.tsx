/** @format */
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./components/layout/AdminLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { UsersPage } from "./pages/users/UsersPage";
import { ProvidersPage } from "./pages/providers/ProvidersPage";
import { CategoriesPage } from "./pages/services/CategoriesPage";
import { ServicesPage } from "./pages/services/ServicesPage";
import { BookingsPage } from "./pages/bookings/BookingsPage";
import { CommissionsPage } from "./pages/commissions/CommissionsPage";
import "./App.css";

function App() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/providers" element={<ProvidersPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/commissions" element={<CommissionsPage />} />
                <Route path="/settings" element={<div className="text-center py-12 text-gray-500">Settings page coming soon...</div>} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

