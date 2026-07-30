import { Link } from "react-router-dom";
import { Megaphone, MapPin, Sparkles, CheckCircle2, ChevronRight, Building, ShieldAlert, Award, Clock } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="relative overflow-hidden pt-8 pb-16">
        {/* Background glowing gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-4xl mx-auto px-4 z-10 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Powered by Multimodal AI & GPS Verification
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            See a Problem?
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 text-glow">
              Upload One Photo.
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Report potholes, overflowing garbage, broken lights, and water leaks. Our AI validates the issue, detects coordinates, and files a verified complaint directly to government officials.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition duration-300 flex items-center justify-center gap-2 group"
            >
              {user ? "Go to Dashboard" : "Join Citizen Portal"}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/report"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800/60 text-slate-200 font-semibold transition duration-300 flex items-center justify-center gap-2"
            >
              File a Quick Report
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Zero Form Filling. Instant Action.</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Our single-input reporting mechanism ensures anyone, anywhere, can raise a civic issue in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Image Input */}
            <div className="glass-panel rounded-2xl p-8 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group cursor-pointer glow-shadow-cyan">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center border border-cyan-500/30">
                  <Megaphone className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-400 transition">One Image Input</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  No long questionnaires. Just take a picture of the issue (pothole, water leak, garbage mound) and upload it. The app handles everything else.
                </p>
              </div>
              <Link to="/report" className="mt-8 text-cyan-400 font-semibold text-sm flex items-center gap-1 group-hover:underline">
                Upload Photo <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature 2: AI Verification */}
            <div className="glass-panel rounded-2xl p-8 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group cursor-pointer glow-shadow-purple">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                  <ShieldAlert className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 group-hover:text-purple-400 transition">AI Verification</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Our advanced Multimodal AI checks the photo to verify it represents a genuine public issue. It categorizes the department and estimates severity to eliminate spam.
                </p>
              </div>
              <div className="mt-8 text-purple-400 font-semibold text-sm flex items-center gap-1">
                Verified Routing <Award className="w-4 h-4" />
              </div>
            </div>

            {/* Feature 3: GPS Tracking */}
            <div className="glass-panel rounded-2xl p-8 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group cursor-pointer">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center border border-indigo-500/30">
                  <MapPin className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 group-hover:text-indigo-400 transition">GPS Mapping</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Automatic GPS capture identifies the precise location of the issue. The exact coordinates are reverse-geocoded to map-pins for maintenance dispatch.
                </p>
              </div>
              <div className="mt-8 text-indigo-400 font-semibold text-sm flex items-center gap-1">
                Geotagged Logs <MapPin className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mt-32 border-t border-slate-900 pt-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center space-y-2 p-6 glass-panel rounded-xl">
              <div className="flex justify-center text-cyan-400"><Clock className="w-8 h-8" /></div>
              <div className="text-4xl font-extrabold text-white">45 Seconds</div>
              <div className="text-slate-400 text-sm">Average Submission Time</div>
            </div>
            <div className="text-center space-y-2 p-6 glass-panel rounded-xl">
              <div className="flex justify-center text-purple-400"><ShieldAlert className="w-8 h-8" /></div>
              <div className="text-4xl font-extrabold text-white">99.2%</div>
              <div className="text-slate-400 text-sm">AI Spam Filtration Rate</div>
            </div>
            <div className="text-center space-y-2 p-6 glass-panel rounded-xl">
              <div className="flex justify-center text-indigo-400"><Building className="w-8 h-8" /></div>
              <div className="text-4xl font-extrabold text-white">12 Districts</div>
              <div className="text-slate-400 text-sm">Active Village Council Integrations</div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-snug">
              Why traditional grievance systems fail, and GramVoice succeeds.
            </h2>
            <p className="text-slate-400 text-sm">
              Standard grievance portals require extensive forms, typing detailed reports, and finding specific ward and division names. GramVoice leverages AI and mobile hardware to make reporting accessible to everyone.
            </p>
            <div className="space-y-3">
              {[
                "No literacy barrier: Just snap a photo and click submit",
                "Reverse geocoding resolves complex ward addresses automatically",
                "Automated department tagging prevents misplaced dossiers",
                "Dual portal: Citizens track status; officers dispatch teams in one click"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative p-2 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-slate-800">
            <div className="rounded-xl overflow-hidden bg-slate-950 p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-xs text-slate-500 ml-2">GramVoice AI Inspector</span>
              </div>
              <div className="space-y-3 font-mono text-xs">
                <div className="text-slate-500">// Image Upload Analysis: pothole_image_39.jpg</div>
                <div className="p-3 bg-slate-900/80 rounded-lg text-slate-300">
                  <span className="text-cyan-400 font-bold">Image check:</span> <span className="text-emerald-400">Civic Issue Verified</span>
                </div>
                <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-lg text-cyan-300 space-y-1">
                  <div className="font-bold">AI Docket Output:</div>
                  <div>Category: Roads & Traffic Development</div>
                  <div>Severity: High (Impedes major transport lane)</div>
                  <div>Address: Main Bazaar Road, Ward 4, Madurai District</div>
                  <div className="text-slate-500">Status: Dispatched for citizen approval</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;