import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Failed to sign in. Please check your credentials.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password");
  };

  return (
    <MainLayout>
      <div className="relative flex items-center justify-center pt-8 pb-12">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="w-full max-w-md glass-panel p-8 rounded-2xl glow-shadow-cyan relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-white">Welcome Back</h2>
            <p className="text-slate-400 text-sm">Sign in to continue your learning journey</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
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
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:opacity-95 text-white font-semibold shadow-lg shadow-cyan-950/20 transition disabled:opacity-50 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4.5 h-4.5" /> Sign In
                </>
              )}
            </button>
          </form>

          {/* Quick Bystander Button / Guest Bypass */}
          <div className="relative flex items-center justify-center">
            <span className="absolute inset-x-0 h-px bg-slate-900"></span>
            <span className="relative px-3 bg-slate-950 text-slate-500 text-xs font-semibold uppercase tracking-wider">Demo Accounts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => fillDemoCredentials("guest@gramvoice.com")}
              className="text-left p-3 rounded-xl border border-slate-850 hover:border-cyan-500/20 bg-slate-900/10 hover:bg-slate-900/20 transition cursor-pointer group"
            >
              <div className="font-bold text-cyan-400 group-hover:underline mb-1">Citizen Login</div>
              <div className="text-slate-400 truncate">Email: <span className="text-slate-200">guest@gramvoice.com</span></div>
              <div className="text-slate-450">Pass: <span className="text-slate-300">password</span></div>
            </button>
            
            <button
              type="button"
              onClick={() => fillDemoCredentials("admin@gramvoice.com")}
              className="text-left p-3 rounded-xl border border-slate-850 hover:border-emerald-500/20 bg-slate-900/10 hover:bg-emerald-950/10 transition cursor-pointer group"
            >
              <div className="font-bold text-emerald-400 group-hover:underline mb-1">Officer Login</div>
              <div className="text-slate-400 truncate">Email: <span className="text-slate-200">admin@gramvoice.com</span></div>
              <div className="text-slate-455">Pass: <span className="text-slate-300">password</span></div>
            </button>
          </div>

          <p className="text-center text-slate-400 text-sm pt-2">
            Don't have an account?{" "}
            <Link to="/signup" className="text-cyan-400 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;