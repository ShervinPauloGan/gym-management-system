import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/shared/stores/auth.store";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/modules/Auth/pages/Auth/page";
import { DashboardPage } from "@/modules/Dashboard/pages/Dashboard/page";
import { MembersPage } from "@/modules/Members/pages/Members/page";
import { RegistrationPage } from "@/modules/Registration/pages/Registration/page";
import { PlanShopPage } from "@/modules/PlanShop/pages/PlanShop/page";
import { RedeemShopPage } from "@/modules/RedeemShop/pages/RedeemShop/page";
import { CheckInPage } from "@/modules/CheckIn/pages/CheckIn/page";
import { AnalyticsPage } from "@/modules/Analytics/pages/Analytics/page";
import { SettingsPage } from "@/modules/Settings/pages/Settings/page";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="registration" element={<RegistrationPage />} />
        <Route path="plans" element={<PlanShopPage />} />
        <Route path="redeem" element={<RedeemShopPage />} />
        <Route path="check-in" element={<CheckInPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
