import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, UserPlus, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (name.length < 3) {
      setError("Full name must be at least 3 characters.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const success = await signup(name, email, password);
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Failed to create an account. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="relative flex items-center justify-center pt-8 pb-12">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="w-full max-w-md glass-panel p-8 rounded-2xl glow-shadow-purple relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
            <p className="text-slate-400 text-sm">Join GramVoice to start analyzing your English</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 pl-11 pr-4 text-white text-sm outline-none transition focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>

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
                  placeholder="•••••••• (min 6 chars)"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 pl-11 pr-4 text-white text-sm outline-none transition focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-95 text-white font-semibold shadow-lg shadow-purple-950/20 transition disabled:opacity-50 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-4.5 h-4.5" /> Sign Up
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm pt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-400 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Signup;