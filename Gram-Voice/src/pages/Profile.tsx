import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Check, Eye, EyeOff, ClipboardList, CheckCircle2, ShieldAlert, Award } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout";

const Profile = () => {
  const { user, loading, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [district, setDistrict] = useState("Madurai");
  const [geminiKey, setGeminiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [success, setSuccess] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    streak: 3
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    } else if (user) {
      setName(user.name);
      setDistrict(user.district || "Madurai");
      setGeminiKey(localStorage.getItem("gv_gemini_key") || "");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem("gv_reports");
      if (stored) {
        const reportsList = JSON.parse(stored);
        const resolved = reportsList.filter((r: any) => r.status === "Resolved").length;
        const total = reportsList.length;
        setStats({
          total,
          resolved,
          pending: total - resolved,
          streak: user.streak || 1
        });
      } else {
        setStats({
          total: 0,
          resolved: 0,
          pending: 0,
          streak: user.streak || 1
        });
      }
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      district,
    });
    localStorage.setItem("gv_gemini_key", geminiKey);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-slate-900 pb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-white">Profile Settings</h2>
            <p className="text-slate-400 text-sm mt-1">Manage display details, district location, and Gemini credentials.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Settings form (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold text-white">Account Details</h3>

              {success && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-sm">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span>Changes saved successfully!</span>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-5">
                {/* Full name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 px-4 text-white text-sm outline-none transition focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>

                {/* District Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">District / Local Council</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 px-4 text-white text-sm outline-none transition"
                  >
                    <option value="Madurai">Madurai District</option>
                    <option value="Chennai">Chennai District</option>
                    <option value="Tiruchirappalli">Tiruchirappalli District</option>
                    <option value="Coimbatore">Coimbatore District</option>
                    <option value="Salem">Salem District</option>
                    <option value="Tirunelveli">Tirunelveli District</option>
                    <option value="Kanyakumari">Kanyakumari District</option>
                    <option value="Thanjavur">Thanjavur District</option>
                    <option value="Others">Others / Local Council</option>
                  </select>
                </div>

                {/* Gemini API Key */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gemini API Key</label>
                    <span className="text-[10px] text-cyan-400 font-medium bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-500/10">Powers Live AI Verification</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AI Analysis works in Demo/Simulation mode if left blank..."
                      className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 pl-4 pr-12 text-white text-sm outline-none transition focus:ring-2 focus:ring-cyan-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    This key is stored locally on your device in your browser's LocalStorage and is sent directly to Google's Gemini servers to analyze your uploaded civic photos.
                  </p>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:opacity-95 text-white font-semibold text-sm shadow-md transition"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>

          {/* Lifetime stats sidebar (1 col) */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Citizen Engagement</h3>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              {/* Stat card items */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-950/30 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Citizen Streak</span>
                    <p className="text-white font-bold text-base leading-tight">{stats.streak} Days Active</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Total Reports</span>
                    <p className="text-white font-bold text-base leading-tight">{stats.total} Complaints</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Issues Resolved</span>
                    <p className="text-white font-bold text-base leading-tight">{stats.resolved} Solved</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-950/30 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Pending Action</span>
                    <p className="text-white font-bold text-base leading-tight">{stats.pending} Under Review</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;