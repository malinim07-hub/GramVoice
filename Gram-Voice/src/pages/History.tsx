import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  History as HistoryIcon,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  ClipboardList,
  MapPin,
  FolderSync,
  ChevronDown,
  ChevronUp,
  UserRound,
  Building2,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout";
import type { CivicReport } from "./Dashboard";
import { getMyReports } from "../services/reportService";

interface HistoryReport extends CivicReport {
  department?: string;
  assignedOfficer?: {
    _id: string;
    name: string;
    email?: string;
    department?: string;
  } | null;
  aiAnalysis?: {
    isValid: boolean;
    confidence: number | null;
    suggestedActions: string[];
  };
  officerRemarks?: string;
}

const History = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState<HistoryReport[]>([]);
  const [filter, setFilter] = useState<
    "all" | "Submitted" | "Assigned" | "In Progress" | "Resolved" | "Rejected"
  >("all");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingReports, setLoadingReports] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------
  // LOGIN CHECK
  // --------------------------------
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // --------------------------------
  // LOAD REPORTS
  // --------------------------------
  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;

      try {
        setLoadingReports(true);
        setError("");

        const response = await getMyReports();

        const backendReports = response.data?.reports || [];

        const formattedReports: HistoryReport[] = backendReports.map(
          (report: any) => ({
            id: report._id,

            title: report.title || "Untitled Complaint",

            description:
              report.description || "No description available.",

            category: report.category || "Other",

            urgency: report.urgency || "Low",

            location: {
              latitude: report.location?.latitude || 0,
              longitude: report.location?.longitude || 0,
              address:
                report.location?.address || "Location unavailable",
            },

            imagePath: report.imageUrl
              ? `http://localhost:5000${report.imageUrl}`
              : "",

            status: report.status || "Submitted",

            createdAt: report.createdAt
              ? new Date(report.createdAt).toLocaleString("en-US", {
                  month: "long",
                  day: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : "Unknown date",

            trackingId: report.trackingId || "N/A",

            history: Array.isArray(report.history)
              ? report.history.map((hist: any) => ({
                  status: hist.status,
                  timestamp: hist.timestamp
                    ? new Date(hist.timestamp).toLocaleString(
                        "en-US",
                        {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )
                    : "",
                  note: hist.note || "",
                }))
              : [],

            department: report.department || "",

            assignedOfficer: report.assignedOfficer
              ? {
                  _id: report.assignedOfficer._id,
                  name: report.assignedOfficer.name,
                  email: report.assignedOfficer.email,
                  department:
                    report.assignedOfficer.department || "",
                }
              : null,

            aiAnalysis: report.aiAnalysis
              ? {
                  isValid: report.aiAnalysis.isValid,
                  confidence:
                    report.aiAnalysis.confidence ?? null,
                  suggestedActions:
                    report.aiAnalysis.suggestedActions || [],
                }
              : undefined,

            officerRemarks: report.officerRemarks || "",
          })
        );

        setReports(formattedReports);
      } catch (err) {
        console.error("Failed to load reports:", err);

        setError(
          "Unable to load your reports. Please check your connection and try again."
        );
      } finally {
        setLoadingReports(false);
      }
    };

    fetchReports();
  }, [user]);

  // --------------------------------
  // LOADING SCREEN
  // --------------------------------
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  // --------------------------------
  // EXPAND / COLLAPSE
  // --------------------------------
  const toggleExpand = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  // --------------------------------
  // FILTER
  // --------------------------------
  const filteredReports = reports.filter(
    (rep) => filter === "all" || rep.status === filter
  );

  // --------------------------------
  // STATUS COLOR
  // --------------------------------
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-emerald-950/30 text-emerald-400 border-emerald-500/20";

      case "In Progress":
        return "bg-cyan-950/30 text-cyan-400 border-cyan-500/20";

      case "Assigned":
        return "bg-amber-950/30 text-amber-400 border-amber-500/20";

      case "Rejected":
        return "bg-rose-950/30 text-rose-400 border-rose-500/20";

      default:
        return "bg-indigo-950/30 text-indigo-400 border-indigo-500/20";
    }
  };

  // --------------------------------
  // URGENCY COLOR
  // --------------------------------
  const getUrgencyClass = (urgency: string) => {
    switch (urgency) {
      case "Critical":
        return "text-rose-400 bg-rose-950/40 border-rose-500/20";

      case "High":
        return "text-amber-400 bg-amber-950/40 border-amber-500/20";

      case "Medium":
        return "text-cyan-400 bg-cyan-950/40 border-cyan-500/20";

      default:
        return "text-slate-400 bg-slate-950/40 border-slate-800";
    }
  };

  // --------------------------------
  // TIMELINE NODE
  // --------------------------------
  const getTimelineNodeClass = (status: string) => {
    switch (status) {
      case "Resolved":
        return "border-emerald-500 text-emerald-400";

      case "In Progress":
        return "border-cyan-500 text-cyan-400";

      case "Assigned":
        return "border-amber-500 text-amber-400";

      case "Rejected":
        return "border-rose-500 text-rose-400";

      default:
        return "border-indigo-500 text-indigo-400";
    }
  };

  // --------------------------------
  // TIMELINE ICON
  // --------------------------------
  const getTimelineIcon = (status: string) => {
    switch (status) {
      case "Resolved":
        return <CheckCircle2 className="w-2.5 h-2.5" />;

      case "In Progress":
        return <Clock className="w-2.5 h-2.5" />;

      case "Assigned":
        return <Eye className="w-2.5 h-2.5" />;

      case "Rejected":
        return <AlertTriangle className="w-2.5 h-2.5" />;

      default:
        return <ClipboardList className="w-2.5 h-2.5" />;
    }
  };

  // --------------------------------
  // REPORTS LOADING
  // --------------------------------
  if (loadingReports) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-10 h-10 mx-auto border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>

            <p className="text-slate-400 text-sm">
              Loading your reported issues...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8 max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="border-b border-slate-900 pb-6 flex items-center justify-between flex-wrap gap-4">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <HistoryIcon className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-white">
                My Reported Issues
              </h2>

              <p className="text-slate-400 text-sm mt-1">
                Track the resolution progress and official timeline of your
                complaints.
              </p>
            </div>

          </div>

          {/* FILTER */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto max-w-full">

            {(
              [
                "all",
                "Submitted",
                "Assigned",
                "In Progress",
                "Resolved",
                "Rejected",
              ] as const
            ).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  filter === type
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {type === "all" ? "All" : type}
              </button>
            ))}

          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* EMPTY STATE */}
        {!error && filteredReports.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-slate-900 text-center text-slate-500 space-y-3">

            <HistoryIcon className="w-12 h-12 mx-auto opacity-35" />

            <h4 className="font-semibold text-slate-300">
              No Complaints Found
            </h4>

            <p className="text-xs max-w-xs mx-auto">
              You haven't filed any reports matching this status filter.
            </p>

          </div>
        ) : (

          /* REPORT LIST */
          <div className="space-y-4">

            {filteredReports.map((rep) => {

              const isExpanded = expandedId === rep.id;

              return (
                <div
                  key={rep.id}
                  onClick={() => toggleExpand(rep.id)}
                  className={`glass-panel border rounded-2xl transition duration-300 cursor-pointer overflow-hidden ${
                    isExpanded
                      ? "border-slate-700 bg-slate-900/40"
                      : "border-slate-900 hover:border-slate-800"
                  }`}
                >

                  {/* SUMMARY */}
                  <div className="p-5 flex items-center justify-between gap-4 flex-wrap">

                    <div className="flex items-center gap-4 min-w-[280px]">

                      {/* IMAGE */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0">

                        {rep.imagePath ? (
                          <img
                            src={rep.imagePath}
                            alt={rep.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <ClipboardList className="w-5 h-5" />
                          </div>
                        )}

                      </div>

                      {/* TITLE */}
                      <div className="space-y-1 text-left">

                        <div className="flex items-center gap-2 flex-wrap">

                          <h4 className="font-bold text-white text-sm leading-snug">
                            {rep.title}
                          </h4>

                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getUrgencyClass(
                              rep.urgency
                            )}`}
                          >
                            {rep.urgency}
                          </span>

                        </div>

                        <p className="text-slate-400 text-xs flex items-center gap-1">

                          <FolderSync className="w-3.5 h-3.5 text-indigo-400" />

                          {rep.category}

                        </p>

                      </div>

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex items-center gap-4 ml-auto sm:ml-0">

                      {/* STATUS */}
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-lg border ${getStatusClass(
                          rep.status
                        )}`}
                      >
                        {rep.status}
                      </span>

                      {/* DATE */}
                      <div className="items-center gap-1.5 text-xs text-slate-500 font-mono hidden sm:flex">

                        <Calendar className="w-3.5 h-3.5" />

                        {rep.createdAt.split(",")[0]}

                      </div>

                      {/* ARROW */}
                      <div className="text-slate-500">

                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}

                      </div>

                    </div>

                  </div>

                  {/* EXPANDED DETAILS */}
                  {isExpanded && (
                    <div
                      className="px-5 pb-6 pt-4 border-t border-slate-900 bg-slate-950/40 text-xs space-y-6 cursor-default text-left"
                      onClick={(e) => e.stopPropagation()}
                    >

                      {/* IMAGE */}
                      {rep.imagePath && (
                        <div className="rounded-xl overflow-hidden border border-slate-800 max-h-72 bg-slate-900">

                          <img
                            src={rep.imagePath}
                            alt={rep.title}
                            className="w-full h-full object-cover max-h-72"
                          />

                        </div>
                      )}

                      {/* TOP INFORMATION */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* LEFT */}
                        <div className="space-y-4">

                          {/* TRACKING ID */}
                          <div>

                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Tracking ID
                            </span>

                            <p className="text-white font-mono text-xs font-semibold mt-1">
                              {rep.trackingId}
                            </p>

                          </div>

                          {/* LOCATION */}
                          <div>

                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Location
                            </span>

                            <p className="text-slate-300 font-medium mt-1 flex items-start gap-1.5 leading-relaxed">

                              <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />

                              {rep.location.address}

                            </p>

                          </div>

                          {/* DESCRIPTION */}
                          <div>

                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Detailed Description
                            </span>

                            <p className="text-slate-400 mt-1 leading-relaxed">
                              {rep.description}
                            </p>

                          </div>

                          {/* DEPARTMENT */}
                          <div>

                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Department
                            </span>

                            <p className="text-slate-300 mt-1 flex items-center gap-2">

                              <Building2 className="w-3.5 h-3.5 text-cyan-400" />

                              {rep.department || "Not assigned yet"}

                            </p>

                          </div>

                        </div>

                        {/* RIGHT */}
                        <div className="space-y-4">

                          {/* AI VERIFICATION */}
                          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4">

                            <div className="flex items-center gap-2 mb-3">

                              <ShieldCheck className="w-4 h-4 text-emerald-400" />

                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                                AI Verification
                              </span>

                            </div>

                            {rep.aiAnalysis ? (
                              <div className="space-y-2">

                                <div className="flex justify-between">

                                  <span className="text-slate-500">
                                    Result
                                  </span>

                                  <span className="text-emerald-400 font-semibold">
                                    {rep.aiAnalysis.isValid
                                      ? "Verified"
                                      : "Not Verified"}
                                  </span>

                                </div>

                                {rep.aiAnalysis.confidence !== null && (
                                  <div className="flex justify-between">

                                    <span className="text-slate-500">
                                      Confidence
                                    </span>

                                    <span className="text-slate-300 font-semibold">
                                      {Math.round(
                                        rep.aiAnalysis.confidence <= 1
                                          ? rep.aiAnalysis.confidence * 100
                                          : rep.aiAnalysis.confidence
                                      )}
                                      %
                                    </span>

                                  </div>
                                )}

                                {rep.aiAnalysis.suggestedActions
                                  ?.length > 0 && (
                                  <div className="pt-2">

                                    <p className="text-slate-500 mb-1">
                                      Suggested Action
                                    </p>

                                    <ul className="space-y-1">

                                      {rep.aiAnalysis.suggestedActions.map(
                                        (
                                          action: string,
                                          index: number
                                        ) => (
                                          <li
                                            key={index}
                                            className="text-slate-400 leading-relaxed"
                                          >
                                            • {action}
                                          </li>
                                        )
                                      )}

                                    </ul>

                                  </div>
                                )}

                              </div>
                            ) : (
                              <p className="text-slate-500">
                                AI analysis information unavailable.
                              </p>
                            )}

                          </div>

                          {/* ASSIGNED OFFICER */}
                          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/10 p-4">

                            <div className="flex items-center gap-2 mb-3">

                              <UserRound className="w-4 h-4 text-indigo-400" />

                              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                                Assigned Officer
                              </span>

                            </div>

                            {rep.assignedOfficer ? (
                              <div className="space-y-1">

                                <p className="text-white font-semibold">
                                  {rep.assignedOfficer.name}
                                </p>

                                {rep.assignedOfficer.department && (
                                  <p className="text-slate-500">
                                    {rep.assignedOfficer.department}
                                  </p>
                                )}

                              </div>
                            ) : (
                              <p className="text-slate-500">
                                Officer not assigned yet.
                              </p>
                            )}

                          </div>

                          {/* OFFICER REMARKS */}
                          {rep.officerRemarks && (
                            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">

                              <div className="flex items-center gap-2 mb-2">

                                <MessageSquare className="w-4 h-4 text-cyan-400" />

                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Officer Remarks
                                </span>

                              </div>

                              <p className="text-slate-400 leading-relaxed">
                                {rep.officerRemarks}
                              </p>

                            </div>
                          )}

                        </div>

                      </div>

                      {/* TIMELINE */}
                      <div className="space-y-4">

                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Official Audit Trail
                        </span>

                        {rep.history.length > 0 ? (
                          <div className="relative pl-6 border-l border-slate-800 space-y-5">

                            {rep.history.map((hist, index) => (

                              <div
                                key={`${hist.status}-${index}`}
                                className="relative"
                              >

                                {/* NODE */}
                                <div
                                  className={`absolute -left-[31px] top-0.5 w-[15px] h-[15px] rounded-full border-2 bg-slate-950 flex items-center justify-center ${getTimelineNodeClass(
                                    hist.status
                                  )}`}
                                >
                                  {getTimelineIcon(hist.status)}
                                </div>

                                {/* CONTENT */}
                                <div className="space-y-1">

                                  <div className="flex justify-between items-center gap-2 flex-wrap">

                                    <span className="font-bold text-white text-xs">
                                      {hist.status}
                                    </span>

                                    <span className="text-[9px] text-slate-500 font-mono">
                                      {hist.timestamp}
                                    </span>

                                  </div>

                                  <p className="text-slate-400 text-[11px] leading-relaxed">
                                    {hist.note || "Status updated."}
                                  </p>

                                </div>

                              </div>

                            ))}

                          </div>
                        ) : (
                          <div className="text-slate-500 text-xs">
                            No timeline information available.
                          </div>
                        )}

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