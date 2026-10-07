import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import MainLayout from "../layouts/MainLayout";

const Login = () => {
  const { login } = useAuth();
  const { t } = useLanguage();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t("pleaseFillFields"));
      return;
    }

    if (!email.includes("@")) {
      setError(t("invalidEmail"));
      return;
    }

    setLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        // Get the logged-in user's role
        const storedUser = localStorage.getItem("gv_user");

        if (storedUser) {
          const loggedInUser = JSON.parse(storedUser);

          console.log("Logged in user:", loggedInUser);
          console.log("User role:", loggedInUser.role);

          // Officer and Admin → Government Portal
          if (
            loggedInUser.role === "officer" ||
            loggedInUser.role === "admin"
          ) {
            navigate("/gov");
          } else {
            // Citizen → Citizen Dashboard
            navigate("/dashboard");
          }
        } else {
          // Fallback
          navigate("/dashboard");
        }
      } else {
        setError(t("loginFailed"));
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(t("unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="relative flex items-center justify-center pt-8 pb-12">

        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="w-full max-w-md glass-panel p-8 rounded-2xl glow-shadow-cyan relative z-10 space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-white">
              {t("welcomeBack")}
            </h2>

            <p className="text-slate-400 text-sm">
              {t("signInDescription")}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {t("emailAddress")}
              </label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 pl-11 pr-4 text-white text-sm outline-none transition focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {t("password")}
              </label>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 pl-11 pr-4 text-white text-sm outline-none transition focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:opacity-95 text-white font-semibold shadow-lg shadow-cyan-950/20 transition disabled:opacity-50 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4.5 h-4.5" />
                  {t("signIn")}
                </>
              )}
            </button>
          </form>

          {/* Signup */}
          <p className="text-center text-slate-400 text-sm pt-2">
            {t("dontHaveAccount")}{" "}

            <Link
              to="/signup"
              className="text-cyan-400 font-semibold hover:underline"
            >
              {t("signUp")}
            </Link>
          </p>

        </div>
      </div>
    </MainLayout>
  );
};

export default Login;