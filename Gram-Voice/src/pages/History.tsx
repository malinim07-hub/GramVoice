import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { History as HistoryIcon, Calendar, CheckCircle2, Clock, Eye, ClipboardList, Trash2, MapPin, FolderSync, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout";
import type { CivicReport } from "./Dashboard";

const History = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [filter, setFilter] = useState<"all" | "Assigned" | "In Progress" | "Resolved">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const stored = localStorage.getItem("gv_reports");
    if (stored) {
      setReports(JSON.parse(stored));
    }
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = reports.filter((rep) => rep.id !== id);
    setReports(updated);
    localStorage.setItem("gv_reports", JSON.stringify(updated));
    if (expandedId === id) setExpandedId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredReports = reports.filter((rep) => filter === "all" || rep.status === filter);

  return (
    <MainLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-slate-900 pb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-white">My Reported Issues</h2>
              <p className="text-slate-400 text-sm mt-1">Track the resolution progress and timeline of your submitted complaints.</p>
            </div>
          </div>

          {/* Filtering */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto max-w-full">
            {(["all", "Assigned", "In Progress", "Resolved"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition ${
                  filter === type
                    ? "bg-slate-850 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {type === "all" ? "All" : type}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints Timeline List */}
        {filteredReports.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-slate-900 text-center text-slate-500 space-y-3">
            <HistoryIcon className="w-12 h-12 mx-auto opacity-35" />
            <h4 className="font-semibold text-slate-300">No Complaints Found</h4>
            <p className="text-xs max-w-xs mx-auto">
              You haven't filed any reports matching this status filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((rep) => {
              const isExpanded = expandedId === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => toggleExpand(rep.id)}
                  className={`glass-panel border rounded-2xl transition duration-300 cursor-pointer overflow-hidden ${
                    isExpanded ? "border-slate-700 bg-slate-900/40" : "border-slate-900 hover:border-slate-800"
                  }`}
                >
                  {/* Summary Bar */}
                  <div className="p-5 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4 min-w-[280px]">
                      {/* Image Thumbnail */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-855 flex-shrink-0">
                        <img src={rep.imagePath} alt={rep.title} className="w-full h-full object-cover" />
                      </div>

                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white text-sm leading-snug">{rep.title}</h4>
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            rep.urgency === "Critical" ? "text-rose-455 bg-rose-950/40 border border-rose-500/20" :
                            rep.urgency === "High" ? "text-amber-400 bg-amber-950/40 border border-amber-500/20" :
                            rep.urgency === "Medium" ? "text-cyan-400 bg-cyan-950/40 border border-cyan-500/20" :
                            "text-slate-400 bg-slate-950/40 border border-slate-800"
                          }`}>
                            {rep.urgency}
                          </span>
                        </div>
                        <p className="text-slate-450 text-xs flex items-center gap-1">
                          <FolderSync className="w-3.5 h-3.5 text-indigo-400" />
                          {rep.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto sm:ml-0">
                      {/* Status badge */}
                      <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                        rep.status === "Resolved" ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/20" :
                        rep.status === "In Progress" ? "bg-cyan-950/30 text-cyan-400 border-cyan-500/20" :
                        rep.status === "Assigned" ? "bg-amber-950/30 text-amber-400 border-amber-500/20" :
                        "bg-indigo-950/30 text-indigo-400 border-indigo-500/20"
                      }`}>
                        {rep.status}
                      </span>

                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono hidden sm:flex">
                        <Calendar className="w-3.5 h-3.5" />
                        {rep.createdAt.split(",")[0]}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={(e) => handleDelete(rep.id, e)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-955/10 transition"
                        title="Withdraw Complaint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Toggle arrow */}
                      <div className="text-slate-550">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable details segment */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-4 border-t border-slate-900 bg-slate-950/40 text-xs space-y-5 cursor-default text-left" onClick={(e) => e.stopPropagation()}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider">Tracking ID:</span>
                            <p className="text-white font-mono text-xs font-semibold mt-0.5">{rep.trackingId}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Location:</span>
                            <p className="text-slate-350 font-medium mt-0.5 flex items-start gap-1.5 leading-relaxed">
                              <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                              {rep.location.address}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Detailed Description:</span>
                            <p className="text-slate-400 mt-1 leading-relaxed text-xs">{rep.description}</p>
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-4">
                          <span className="text-[10px] font-bold text-slate-555 uppercase tracking-wider block">Official Audit Trail</span>
                          
                          <div className="relative pl-6 border-l border-slate-800 space-y-5">
                            {rep.history.map((hist, index) => {
                              return (
                                <div key={index} className="relative">
                                  {/* Timeline node icon */}
                                  <div className={`absolute -left-[31px] top-0.5 w-[15px] h-[15px] rounded-full border-2 bg-slate-950 flex items-center justify-center ${
                                    hist.status === "Resolved" ? "border-emerald-500 text-emerald-450" :
                                    hist.status === "In Progress" ? "border-cyan-500 text-cyan-400" :
                                    hist.status === "Assigned" ? "border-amber-500 text-amber-400" :
                                    "border-indigo-500 text-indigo-400"
                                  }`}>
                                    {hist.status === "Resolved" ? <CheckCircle2 className="w-2.5 h-2.5" /> :
                                     hist.status === "In Progress" ? <Clock className="w-2.5 h-2.5" /> :
                                     hist.status === "Assigned" ? <Eye className="w-2.5 h-2.5" /> :
                                     <ClipboardList className="w-2.5 h-2.5" />}
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center gap-2 flex-wrap">
                                      <span className="font-bold text-white text-xs">{hist.status}</span>
                                      <span className="text-[9px] text-slate-500 font-mono">{hist.timestamp}</span>
                                    </div>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">{hist.note}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default History;