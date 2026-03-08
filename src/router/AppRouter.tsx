import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute } from "@/router/PrivateRoute";

// Carga diferida de páginas
const LoginPage = lazy(() => import("@/pages/LoginPage").then(module => ({ default: module.LoginPage })));
const PanelPage = lazy(() => import("@/pages/PanelPage").then(module => ({ default: module.PanelPage })));
const ProgramsPage = lazy(() => import("@/pages/ProgramsPage").then(module => ({ default: module.ProgramsPage })));
const SchedulePage = lazy(() => import("@/pages/SchedulePage").then(module => ({ default: module.SchedulePage })));
const NotifyPage = lazy(() => import("@/pages/NotifyPage").then(module => ({ default: module.NotifyPage })));
const PasswordPage = lazy(() => import("@/pages/PasswordPage").then(module => ({ default: module.PasswordPage })));

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
  </div>
);

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} />

          {/* Private routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/panel" element={<PanelPage />} />
            <Route path="/panel/programs" element={<ProgramsPage />} />
            <Route path="/panel/schedule" element={<SchedulePage />} />
            <Route path="/panel/notify" element={<NotifyPage />} />
            <Route path="/panel/password" element={<PasswordPage />} />
            <Route path="/panel/*" element={<PanelPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
