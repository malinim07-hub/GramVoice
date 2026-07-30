import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/ReportIssue";
import GovernmentPortal from "./pages/GovernmentPortal";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Translation from "./pages/Translation";
import NotFound from "./pages/NotFound";

const AppRoutes = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Main Citizen Action */}
          <Route path="/report" element={<ReportIssue />} />
          
          {/* Government Portal */}
          <Route path="/gov" element={<GovernmentPortal />} />
          
          {/* Citizen History & Profile */}
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/translation" element={<Translation />} />

          {/* Legacy redirects for safety */}
          <Route path="/grammar" element={<Navigate to="/report" replace />} />
          <Route path="/voice" element={<Navigate to="/report" replace />} />




          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRoutes;