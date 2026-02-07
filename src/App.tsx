/** @format */
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./components/layout/AdminLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { UsersPage } from "./pages/users/UsersPage";
import { ProvidersPage } from "./pages/providers/ProvidersPage";
import { CategoriesPage } from "./pages/services/CategoriesPage";
import { ServicesPage } from "./pages/services/ServicesPage";
import { ServiceDetailPage } from "./pages/services/ServiceDetailPage";
import { BookingsPage } from "./pages/bookings/BookingsPage";
import { CommissionsPage } from "./pages/commissions/CommissionsPage";
import { Err400Page } from "./pages/errors/Err400Page";
import { Err403Page } from "./pages/errors/Err403Page";
import { Err404Page } from "./pages/errors/Err404Page";
import { Err500Page } from "./pages/errors/Err500Page";
import "./App.css";

function App() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/400" element={<Err400Page />} />
      <Route path="/403" element={<Err403Page />} />
      <Route path="/404" element={<Err404Page />} />
      <Route path="/500" element={<Err500Page />} />
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
                <Route path="/services/:id" element={<ServiceDetailPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/commissions" element={<CommissionsPage />} />
                <Route path="/settings" element={
                  <div className="animate-fade-in flex flex-col items-center justify-center py-16">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                      <svg className="h-12 w-12 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <p className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Settings</p>
                    <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">Settings page coming soon.</p>
                  </div>
                } />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<Err404Page />} />
    </Routes>
  );
}

export default App;

