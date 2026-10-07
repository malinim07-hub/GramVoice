import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

import Home from "./pages/Home";
import LanguageSelection from "./pages/LanguageSelection";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/ReportIssue";
import GovernmentPortal from "./pages/GovernmentPortal";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Translation from "./pages/Translation";
import NotFound from "./pages/NotFound";

const HomeRoute = () => {
  const language = localStorage.getItem("gv_language");

  if (!language) {
    return <Navigate to="/language" replace />;
  }

  return <Home />;
};

const AppRoutes = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>

            {/* LANGUAGE SELECTION */}
            <Route
              path="/language"
              element={<LanguageSelection />}
            />

            {/* HOME */}
            <Route
              path="/"
              element={<HomeRoute />}
            />

            {/* AUTH */}
            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/signup"
              element={<Signup />}
            />

            {/* DASHBOARD */}
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* REPORT ISSUE */}
            <Route
              path="/report"
              element={<ReportIssue />}
            />

            {/* GOVERNMENT PORTAL */}
            <Route
              path="/gov"
              element={<GovernmentPortal />}
            />

            {/* HISTORY */}
            <Route
              path="/history"
              element={<History />}
            />

            {/* PROFILE */}
            <Route
              path="/profile"
              element={<Profile />}
            />

            {/* TRANSLATION */}
            <Route
              path="/translation"
              element={<Translation />}
            />

            {/* LEGACY REDIRECTS */}
            <Route
              path="/grammar"
              element={
                <Navigate
                  to="/report"
                  replace
                />
              }
            />

            <Route
              path="/voice"
              element={
                <Navigate
                  to="/report"
                  replace
                />
              }
            />

            {/* NOT FOUND */}
            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default AppRoutes;