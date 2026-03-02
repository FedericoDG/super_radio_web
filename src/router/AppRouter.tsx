import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "@/pages/LoginPage";
import { PanelPage } from "@/pages/PanelPage";
import { ProgramsPage } from "@/pages/ProgramsPage";
import { SchedulePage } from "@/pages/SchedulePage";
import { NotifyPage } from "@/pages/NotifyPage";
import { PrivateRoute } from "@/router/PrivateRoute";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />

        {/* Private routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/panel" element={<PanelPage />} />
          <Route path="/panel/programs" element={<ProgramsPage />} />
          <Route path="/panel/schedule" element={<SchedulePage />} />
          <Route path="/panel/notify" element={<NotifyPage />} />
          <Route path="/panel/*" element={<PanelPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
