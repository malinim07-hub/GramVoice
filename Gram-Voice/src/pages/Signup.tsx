import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  UserPlus,
  AlertCircle,
  Phone,
  Languages,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import MainLayout from "../layouts/MainLayout";

const Signup = () => {
  const { signup } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<"en" | "ta">(
    language
  );
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLanguageChange = (newLanguage: "en" | "ta") => {
    setPreferredLanguage(newLanguage);
    setLanguage(newLanguage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!name || !email || !phone || !password) {
      setError(t("pleaseFillFields"));
      return;
    }

    // Name validation
    if (name.trim().length < 3) {
      setError(t("nameTooShort"));
      return;
    }

    // Email validation
    if (!email.includes("@")) {
      setError(t("invalidEmail"));
      return;
    }

    // Phone validation
    const cleanedPhone = phone.replace(/\D/g, "");

    if (cleanedPhone.length !== 10 || !/^[6-9]/.test(cleanedPhone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }

    setLoading(true);

    try {
      const success = await signup(
        name,
        email,
        phone,
        password,
        preferredLanguage
      );

      if (success) {
        navigate("/dashboard");
      } else {
        setError(t("signupFailed"));
      }
    } catch (err) {
      setError(t("unexpectedError"));
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

          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-white">
              {t("createAccount")}
            </h2>

            <p className="text-slate-400 text-sm">
              {t("signupDescription")}
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

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {t("fullName")}
              </label>

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

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Phone Number
              </label>

              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  maxLength={10}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 pl-11 pr-4 text-white text-sm outline-none transition focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            {/* Preferred Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Preferred Language
              </label>

              <div className="relative">
                <Languages className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 pointer-events-none" />

                <select
                  value={preferredLanguage}
                  onChange={(e) =>
                    handleLanguageChange(e.target.value as "en" | "ta")
                  }
                  className="w-full appearance-none bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 pl-11 pr-4 text-white text-sm outline-none transition focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="en" className="bg-slate-900">
                    English
                  </option>

                  <option value="ta" className="bg-slate-900">
                    தமிழ்
                  </option>
                </select>
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
                  placeholder="•••••••• (min 6 chars)"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 pl-11 pr-4 text-white text-sm outline-none transition focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-95 text-white font-semibold shadow-lg shadow-purple-950/20 transition disabled:opacity-50 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-4.5 h-4.5" />
                  {t("signUp")}
                </>
              )}
            </button>
          </form>

          {/* Login */}
          <p className="text-center text-slate-400 text-sm pt-2">
            {t("alreadyHaveAccount")}{" "}

            <Link
              to="/login"
              className="text-purple-400 font-semibold hover:underline"
            >
              {t("signIn")}
            </Link>
          </p>

        </div>
      </div>
    </MainLayout>
  );
};

export default Signup;