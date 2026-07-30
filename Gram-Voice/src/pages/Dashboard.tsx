import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Clock, ClipboardList, CheckCircle2, AlertTriangle, ArrowUpRight, ChevronRight, FilePlus, Eye, History, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout";
import DashboardCard from "../components/dashboard/DashboardCard";

export interface CivicReport {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: "Low" | "Medium" | "High" | "Critical";
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  imagePath: string;
  status: "Submitted" | "Assigned" | "In Progress" | "Resolved";
  createdAt: string;
  trackingId: string;
  history: {
    status: string;
    timestamp: string;
    note: string;
  }[];
}

// Initial mock reports to populate the user dashboard
export const INITIAL_REPORTS: CivicReport[] = [
  {
    id: "rep-1",
    title: "Severe Road Damage & Deep Potholes",
    description: "Multiple large, deep potholes observed in the middle of a two-lane asphalt road. The damage poses a high risk to motorcyclists and can cause severe vehicle alignment issues.",
    category: "Roads & Traffic",
    urgency: "High",
    location: {
      latitude: 9.9252,
      longitude: 78.1198,
      address: "Main Bazaar Road, Ward 4, Madurai District, Tamil Nadu"
    },
    imagePath: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80",
    status: "Resolved",
    createdAt: "July 04, 2026, 09:15 AM",
    trackingId: "GV-2026-9812",
    history: [
      { status: "Submitted", timestamp: "July 04, 2026, 09:15 AM", note: "Report verified by AI and logged." },
      { status: "Assigned", timestamp: "July 04, 2026, 11:30 AM", note: "Assigned to PWD Road Maintenance Dept." },
      { status: "In Progress", timestamp: "July 05, 2026, 08:00 AM", note: "Patch repair crew dispatched to site." },
      { status: "Resolved", timestamp: "July 06, 2026, 04:30 PM", note: "Potholes filled and leveled. Verified by engineer." }
    ]
  },
  {
    id: "rep-2",
    title: "Overflowing Public Garbage Dump",
    description: "A large municipal garbage bin is overflowing onto the public pavement and road. Piles of plastic wastes, household garbage, and organic wastes are scattered around, producing a strong foul odor.",
    category: "Sanitation & Waste Management",
    urgency: "Critical",
    location: {
      latitude: 10.7905,
      longitude: 78.7047,
      address: "Near Govt School, Anna Nagar, Tiruchirappalli, Tamil Nadu"
    },
    imagePath: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80",
    status: "In Progress",
    createdAt: "July 06, 2026, 10:45 AM",
    trackingId: "GV-2026-3849",
    history: [
      { status: "Submitted", timestamp: "July 06, 2026, 10:45 AM", note: "Report verified by AI and logged." },
      { status: "Assigned", timestamp: "July 06, 2026, 02:10 PM", note: "Assigned to Zonal Sanitation Inspector." },
      { status: "In Progress", timestamp: "July 07, 2026, 09:00 AM", note: "Garbage collection vehicle dispatched." }
    ]
  },
  {
    id: "rep-3",
    title: "Non-Functional Streetlights in Residential Lane",
    description: "Two consecutive public streetlights are completely burned out, leaving a stretch of approximately 100 meters in absolute darkness. Residents report feeling unsafe walking at night.",
    category: "Electricity & Public Lighting",
    urgency: "Medium",
    location: {
      latitude: 13.0827,
      longitude: 80.2707,
      address: "2nd Street East, Gandhi Nagar, Chennai, Tamil Nadu"
    },
    imagePath: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80",
    status: "Assigned",
    createdAt: "July 07, 2026, 08:20 AM",
    trackingId: "GV-2026-1038",
    history: [
      { status: "Submitted", timestamp: "July 07, 2026, 08:20 AM", note: "Report verified by AI and logged." },
      { status: "Assigned", timestamp: "July 07, 2026, 11:00 AM", note: "Assigned to TNEB Local Grid Office." }
    ]
  }
];

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<CivicReport[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Load reports from localStorage or initialize defaults
    const stored = localStorage.getItem("gv_reports");
    if (stored) {
      setReports(JSON.parse(stored));
    } else {
      localStorage.setItem("gv_reports", JSON.stringify(INITIAL_REPORTS));
      setReports(INITIAL_REPORTS);
    }
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate status counts
  const totalReports = reports.length;
  const resolvedReports = reports.filter(r => r.status === "Resolved").length;
  const inProgressReports = reports.filter(r => r.status === "In Progress").length;
  const assignedReports = reports.filter(r => r.status === "Assigned").length;

  const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 100;

  return (
    <MainLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Welcome, {user.name}!</h2>
            <p className="text-slate-400 text-sm mt-1">Here is your local citizen action dashboard.</p>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5 animate-pulse" />
            <div className="text-sm font-bold">
              Resolution Rate: {resolutionRate}% <span className="text-xs text-slate-400 font-normal">({resolvedReports}/{totalReports} solved)</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Total Reported"
            value={totalReports}
            icon={ClipboardList}
            description="Complaints filed by you"
            trend="Active monitoring"
            trendType="neutral"
            colorClass="indigo"
          />
          <DashboardCard
            title="Resolved Issues"
            value={resolvedReports}
            icon={CheckCircle2}
            description="Successfully completed"
            trend={`${resolutionRate}% resolved`}
            trendType="positive"
            colorClass="emerald"
          />
          <DashboardCard
            title="Under Work"
            value={inProgressReports + assignedReports}
            icon={Clock}
            description="Assigned & in progress"
            trend="Monitored daily"
            trendType="neutral"
            colorClass="cyan"
          />
          <DashboardCard
            title="Spam Prevented"
            value="14"
            icon={AlertTriangle}
            description="AI Filtered submissions"
            trend="99.2% Accuracy"
            trendType="positive"
            colorClass="purple"
          />
        </div>

        {/* Middle Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Access Actions (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-white">Citizen Action Panel</h3>
            
            <div className={`grid grid-cols-1 gap-6 ${user.role === "admin" ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
              {/* File Report shortcut */}
              <Link
                to="/report"
                className="group relative overflow-hidden glass-panel p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between h-44 glow-shadow-cyan"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <FilePlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base group-hover:text-cyan-400 transition flex items-center gap-1">
                    Report New Issue <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <p className="text-slate-400 text-xs mt-1">Upload one photo & GPS gets log automatically.</p>
                </div>
              </Link>

              {/* Track Reports shortcut */}
              <Link
                to="/history"
                className="group relative overflow-hidden glass-panel p-6 rounded-2xl border border-slate-800 hover:border-purple-500/30 transition-all duration-300 flex flex-col justify-between h-44 glow-shadow-purple"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-950/50 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base group-hover:text-purple-400 transition flex items-center gap-1">
                    My Complaints <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <p className="text-slate-400 text-xs mt-1">Track timelines, assignments and logs.</p>
                </div>
              </Link>

              {/* Government Portal shortcut (Admin only) */}
              {user.role === "admin" && (
                <Link
                  to="/gov"
                  className="group relative overflow-hidden glass-panel p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between h-44"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/50 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base group-hover:text-emerald-400 transition flex items-center gap-1">
                      Government Portal <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-slate-400 text-xs mt-1">Official console to assign and resolve issues.</p>
                  </div>
                </Link>
              )}
            </div>

            {/* Performance Weekly Chart */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="font-bold text-white text-lg">District Action Time</h4>
                  <p className="text-slate-500 text-xs mt-0.5">Average days taken to resolve issues by department</p>
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Avg. Resolve: 2.1 Days
                </span>
              </div>
              
              <div className="flex items-end justify-between h-36 pt-4 border-b border-slate-850 px-2">
                {[
                  { dept: "Road Safety", days: 3.5, pct: "70%" },
                  { dept: "Sanitation", days: 1.2, pct: "24%" },
                  { dept: "Electricity", days: 1.8, pct: "36%" },
                  { dept: "Water Supply", days: 2.0, pct: "40%" },
                  { dept: "Public Parks", days: 4.0, pct: "80%" },
                  { dept: "Infrastructure", days: 5.5, pct: "100%" },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 w-12 sm:w-16 group">
                    <div className="text-slate-500 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.days}d
                    </div>
                    <div
                      style={{ height: `calc(${item.pct} * 0.9)` }}
                      className="w-full rounded-t-sm transition-all duration-500 bg-gradient-to-t from-cyan-500 to-indigo-500 shadow-md shadow-cyan-500/10"
                    ></div>
                    <div className="text-slate-400 text-[10px] font-medium truncate w-full text-center">{item.dept}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent History Feed (Right 1 col) */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Recent Submissions</h3>
              <Link to="/history" className="text-xs text-slate-400 hover:text-white flex items-center gap-0.5">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {reports.slice(0, 3).map((rep) => (
                <div key={rep.id} className="glass-panel p-4 rounded-xl border border-slate-900 flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    rep.status === "Resolved" ? "text-emerald-400 bg-emerald-950/20" :
                    rep.status === "In Progress" ? "text-cyan-400 bg-cyan-950/20" :
                    rep.status === "Assigned" ? "text-amber-400 bg-amber-950/20" :
                    "text-indigo-400 bg-indigo-950/20"
                  }`}>
                    {rep.status === "Resolved" ? <CheckCircle2 className="w-4 h-4" /> :
                     rep.status === "In Progress" ? <Clock className="w-4 h-4" /> :
                     rep.status === "Assigned" ? <Eye className="w-4 h-4" /> :
                     <ClipboardList className="w-4 h-4" />}
                  </div>
                  <div className="flex-grow space-y-1 overflow-hidden">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-bold text-slate-200 text-xs leading-tight truncate">{rep.title}</h4>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        rep.status === "Resolved" ? "text-emerald-400 bg-emerald-950/40" :
                        rep.status === "In Progress" ? "text-cyan-400 bg-cyan-950/40" :
                        rep.status === "Assigned" ? "text-amber-400 bg-amber-950/40" :
                        "text-indigo-400 bg-indigo-950/40"
                      }`}>{rep.status}</span>
                    </div>
                    <p className="text-slate-500 text-[10px]">{rep.createdAt}</p>
                    <p className="text-slate-400 text-xs truncate">{rep.location.address}</p>
                  </div>
                </div>
              ))}
              
              {reports.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No issues reported yet. Click above to report.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;