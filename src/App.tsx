/** @format */
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./lib/i18n";
import { Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PermissionRoute } from "./components/PermissionRoute";
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
                  <Route path="/users" element={<PermissionRoute module="USERS"><UsersPage /></PermissionRoute>} />
                  <Route path="/users/:id" element={<PermissionRoute module="USERS"><UserDetailPage /></PermissionRoute>} />
                  <Route path="/admins" element={<PermissionRoute module="SYSTEM_USERS"><AdminsPage /></PermissionRoute>} />
                  <Route path="/providers" element={<PermissionRoute module="PROVIDERS"><ProvidersPage /></PermissionRoute>} />
                  <Route path="/providers/:id/edit" element={<PermissionRoute module="PROVIDERS"><ProviderEditPage /></PermissionRoute>} />
                  <Route path="/providers/:id" element={<PermissionRoute module="PROVIDERS"><ProviderDetailPage /></PermissionRoute>} />
                  <Route path="/services" element={<PermissionRoute module="SERVICES"><ServicesPage /></PermissionRoute>} />
                  <Route path="/services/:id" element={<PermissionRoute module="SERVICES"><ServiceDetailPage /></PermissionRoute>} />
                  <Route path="/delivery" element={<PermissionRoute module="ORDERS"><DeliveryPage /></PermissionRoute>} />
                  <Route path="/furniture-delivery" element={<PermissionRoute module="ORDERS"><FurnitureDeliveryPage /></PermissionRoute>} />
                  <Route path="/bookings" element={<PermissionRoute module="SERVICE_REQUESTS"><BookingsPage /></PermissionRoute>} />
                  <Route path="/commissions" element={<PermissionRoute module="COMMISSIONS"><CommissionsPage /></PermissionRoute>} />
                  <Route path="/wallets" element={<PermissionRoute module="WALLETS"><WalletsPage /></PermissionRoute>} />
                  <Route path="/loyalty" element={<PermissionRoute module="LOYALTY"><LoyaltyPage /></PermissionRoute>} />
                  <Route path="/commission-rules" element={<PermissionRoute module="COMMISSION_RULES"><CommissionRulesPage /></PermissionRoute>} />
                  <Route path="/tax" element={<PermissionRoute module="TAX"><TaxPage /></PermissionRoute>} />
                  <Route path="/promo" element={<PermissionRoute module="PROMOS"><PromoPage /></PermissionRoute>} />
                  <Route path="/promo/:id" element={<PermissionRoute module="PROMOS"><PromoDetailPage /></PermissionRoute>} />
                  <Route path="/banners" element={<PermissionRoute module="BANNERS"><BannersPage /></PermissionRoute>} />
                  <Route path="/splash" element={<PermissionRoute module="SPLASH"><SplashPage /></PermissionRoute>} />
                  <Route path="/invoices" element={<PermissionRoute module="INVOICES"><InvoicesPage /></PermissionRoute>} />
                  <Route path="/reports" element={<PermissionRoute module="REPORTS"><ReportsPage /></PermissionRoute>} />
                  <Route path="/support-tickets" element={<PermissionRoute module="SUPPORT_TICKETS"><SupportTicketsPage /></PermissionRoute>} />
                  <Route path="/admin/support-chats" element={<PermissionRoute module="SUPPORT_TICKETS"><AdminSupportChatsPage /></PermissionRoute>} />
                  <Route path="/admin/support-chats/:ticketId" element={<PermissionRoute module="SUPPORT_TICKETS"><AdminSupportChatDetailPage /></PermissionRoute>} />
                  <Route path="/settings" element={<PermissionRoute module="SETTINGS"><SettingsPage /></PermissionRoute>} />
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
///test commit