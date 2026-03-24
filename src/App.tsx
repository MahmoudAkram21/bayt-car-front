/** @format */
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./lib/i18n";
import { Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./components/layout/AdminLayout";
import { ThemeProvider } from "./components/theme-provider";
import { LoginPage } from "./pages/auth/LoginPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { UsersPage } from "./pages/users/UsersPage";
import { UserDetailPage } from "./pages/users/UserDetailPage";
import { AdminsPage } from "./pages/admins/AdminsPage";
import { ProvidersPage } from "./pages/providers/ProvidersPage";
import { ProviderDetailPage } from "./pages/providers/ProviderDetailPage";
import { ProviderEditPage } from "./pages/providers/ProviderEditPage";
import { ServicesPage } from "./pages/services/ServicesPage";
import { ServiceDetailPage } from "./pages/services/ServiceDetailPage";
import { BookingsPage } from "./pages/bookings/BookingsPage";
import { CommissionsPage } from "./pages/commissions/CommissionsPage";
import { WalletsPage } from "./pages/wallets/WalletsPage";
import { LoyaltyPage } from "./pages/loyalty/LoyaltyPage";
import { CommissionRulesPage } from "./pages/commission-rules/CommissionRulesPage";
import { TaxPage } from "./pages/tax/TaxPage";
import { PromoPage } from "./pages/promo/PromoPage";
import { PromoDetailPage } from "./pages/promo/PromoDetailPage";
import { BannersPage } from "./pages/banners/BannersPage";
import { SplashPage } from "./pages/splash/SplashPage";
import { InvoicesPage } from "./pages/invoices/InvoicesPage";
import { DeliveryPage } from "./pages/delivery/DeliveryPage";
import { FurnitureDeliveryPage } from "./pages/furniture-delivery/FurnitureDeliveryPage";
import { ReportsPage } from "./pages/reports/ReportsPage";
import { SupportTicketsPage } from "./pages/support-tickets/SupportTicketsPage";
import { AdminSupportChatsPage } from "./pages/admins/support-chats/AdminSupportChatsPage";
import { AdminSupportChatDetailPage } from "./pages/admins/support-chats/AdminSupportChatDetailPage";
import { SettingsPage } from "./pages/settings/Settings";
import { Err400Page } from "./pages/errors/Err400Page";
import { Err403Page } from "./pages/errors/Err403Page";
import { Err404Page } from "./pages/errors/Err404Page";
import { Err500Page } from "./pages/errors/Err500Page";
import "./App.css";

function App() {
  const hydrate = useAuthStore((state) => state.hydrate);

  const { i18n } = useTranslation();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n, i18n.language]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
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
                  <Route path="/users/:id" element={<UserDetailPage />} />
                  <Route path="/admins" element={<AdminsPage />} />
                  <Route path="/providers" element={<ProvidersPage />} />
                  <Route path="/providers/:id/edit" element={<ProviderEditPage />} />
                  <Route path="/providers/:id" element={<ProviderDetailPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/services/:id" element={<ServiceDetailPage />} />
                  <Route path="/delivery" element={<DeliveryPage />} />
                  <Route path="/furniture-delivery" element={<FurnitureDeliveryPage />} />
                  <Route path="/bookings" element={<BookingsPage />} />
                  <Route path="/commissions" element={<CommissionsPage />} />
                  <Route path="/wallets" element={<WalletsPage />} />
                  <Route path="/loyalty" element={<LoyaltyPage />} />
                  <Route path="/commission-rules" element={<CommissionRulesPage />} />
                  <Route path="/tax" element={<TaxPage />} />
                  <Route path="/promo" element={<PromoPage />} />
                  <Route path="/promo/:id" element={<PromoDetailPage />} />
                  <Route path="/banners" element={<BannersPage />} />
                  <Route path="/splash" element={<SplashPage />} />
                  <Route path="/invoices" element={<InvoicesPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/support-tickets" element={<SupportTicketsPage />} />
                  <Route path="/admin/support-chats" element={<AdminSupportChatsPage />} />
                  <Route path="/admin/support-chats/:ticketId" element={<AdminSupportChatDetailPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Err404Page />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;

