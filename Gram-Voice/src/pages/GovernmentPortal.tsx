import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  Eye,
  LogOut,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCog,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  getGovernmentReports,
  getGovernmentOfficers,
  assignReportOfficer,
  updateReportStatus,
} from "../services/reportService";

// ======================================================
// TYPES
// ======================================================

type ReportStatus =
  | "Submitted"
  | "Assigned"
  | "In Progress"
  | "Resolved"
  | "Rejected";

type Urgency =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

interface GovernmentOfficer {
  _id: string;
  name: string;
  email: string;
  department?: string;
  district?: string;
  phone?: string;
}

interface GovernmentReport {
  _id: string;
  trackingId: string;

  imageUrl: string;

  title: string;
  description: string;

  category: string;
  urgency: Urgency;

  location: {
    latitude: number;
    longitude: number;
    address: string;
  };

  department: string;

  status: ReportStatus;

  officerRemarks?: string;

  createdAt: string;
  updatedAt: string;

  citizen?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    district?: string;
  };

  assignedOfficer?: {
    _id: string;
    name: string;
    email: string;
    department?: string;
    district?: string;
  };

  aiAnalysis?: {
    isValid: boolean;
    confidence: number | null;
    suggestedActions: string[];
  };

  history: {
    status: ReportStatus;
    note: string;
    updatedBy?: string;
    timestamp: string;
  }[];
}

// ======================================================
// CONSTANTS
// ======================================================

const API_BASE_URL = "http://localhost:5000";

const categories = [
  "All",
  "Roads & Traffic",
  "Sanitation & Waste Management",
  "Electricity & Public Lighting",
  "Water Supply",
  "Drainage",
  "Public Safety",
  "Other",
];

const statuses = [
  "All",
  "Submitted",
  "Assigned",
  "In Progress",
  "Resolved",
  "Rejected",
];

// ======================================================
// HELPERS
// ======================================================

const getImageUrl = (imageUrl: string) => {
  if (!imageUrl) return "";

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
};

const getStatusClass = (status: ReportStatus) => {
  switch (status) {
    case "Resolved":
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";

    case "In Progress":
      return "text-cyan-400 bg-cyan-400/10 border-cyan-400/20";

    case "Assigned":
      return "text-amber-400 bg-amber-400/10 border-amber-400/20";

    case "Rejected":
      return "text-rose-400 bg-rose-400/10 border-rose-400/20";

    default:
      return "text-indigo-400 bg-indigo-400/10 border-indigo-400/20";
  }
};

const getUrgencyClass = (urgency: Urgency) => {
  switch (urgency) {
    case "Critical":
      return "text-rose-400 bg-rose-400/10 border-rose-400/20";

    case "High":
      return "text-orange-400 bg-orange-400/10 border-orange-400/20";

    case "Medium":
      return "text-amber-400 bg-amber-400/10 border-amber-400/20";

    default:
      return "text-slate-400 bg-slate-400/10 border-slate-400/20";
  }
};

// ======================================================
// COMPONENT
// ======================================================

const GovernmentPortal = () => {
  const { user, loading, logout } = useAuth();

  const navigate = useNavigate();

  // ======================================================
  // REPORT STATE
  // ======================================================

  const [reports, setReports] = useState<GovernmentReport[]>([]);

  const [selectedReport, setSelectedReport] =
    useState<GovernmentReport | null>(null);

  const [loadingReports, setLoadingReports] =
    useState(false);

  const [error, setError] = useState("");

  // ======================================================
  // USER MENU STATE
  // ======================================================

  const [showUserMenu, setShowUserMenu] = useState(false);

  const userMenuRef =
    useRef<HTMLDivElement>(null);

  // ======================================================
  // FILTER STATE
  // ======================================================

  const [searchTerm, setSearchTerm] = useState("");

  const [filterCategory, setFilterCategory] =
    useState("All");

  const [filterStatus, setFilterStatus] =
    useState("All");

  // ======================================================
  // STATUS UPDATE STATE
  // ======================================================

  const [newStatus, setNewStatus] =
    useState<ReportStatus>("Submitted");

  const [officerRemarks, setOfficerRemarks] =
    useState("");

  const [isUpdating, setIsUpdating] =
    useState(false);

  // ======================================================
  // OFFICER ASSIGNMENT STATE
  // ======================================================

  const [officers, setOfficers] =
    useState<GovernmentOfficer[]>([]);

  const [selectedOfficerId, setSelectedOfficerId] =
    useState("");

  const [isAssigning, setIsAssigning] =
    useState(false);

  // ======================================================
  // CLOSE USER MENU WHEN CLICKING OUTSIDE
  // ======================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(
          event.target as Node
        )
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    console.log("Government logout clicked");

    setShowUserMenu(false);

    logout();

    localStorage.removeItem("gv_user");
    localStorage.removeItem("gv_token");

    navigate("/login", {
      replace: true,
    });
  };

  // ======================================================
  // ACCESS CONTROL
  // ======================================================

  useEffect(() => {
    if (
      !loading &&
      (!user ||
        (user.role !== "admin" &&
          user.role !== "officer"))
    ) {
      navigate("/dashboard", {
        replace: true,
      });
    }
  }, [user, loading, navigate]);

  // ======================================================
  // LOAD REPORTS + OFFICERS
  // ======================================================

  useEffect(() => {
    if (
      user &&
      (user.role === "admin" ||
        user.role === "officer")
    ) {
      loadReports();
    }
  }, [user]);

  const loadReports = async () => {
    try {
      setLoadingReports(true);
      setError("");

      // ------------------------------------------
      // LOAD GOVERNMENT REPORTS
      // ------------------------------------------

      const response =
        await getGovernmentReports();

      const fetchedReports =
        response.data?.reports || [];

      setReports(fetchedReports);

      // ------------------------------------------
      // LOAD OFFICERS
      // ADMIN ONLY
      // ------------------------------------------

      if (user?.role === "admin") {
        try {
          const officerResponse =
            await getGovernmentOfficers();

          const fetchedOfficers =
            officerResponse.data?.officers || [];

          setOfficers(fetchedOfficers);
        } catch (officerError: any) {
          console.error(
            "Officer list error:",
            officerError
          );

          setError(
            officerError?.response?.data?.message ||
              "Unable to load government officers."
          );
        }
      }

      // ------------------------------------------
      // REFRESH SELECTED REPORT
      // ------------------------------------------

      if (selectedReport) {
        const updatedSelected =
          fetchedReports.find(
            (report: GovernmentReport) =>
              report._id === selectedReport._id
          );

        setSelectedReport(
          updatedSelected || null
        );

        if (updatedSelected?.assignedOfficer) {
          setSelectedOfficerId(
            updatedSelected.assignedOfficer._id
          );
        } else {
          setSelectedOfficerId("");
        }
      }
    } catch (error: any) {
      console.error(
        "Government reports error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Unable to load citizen complaints."
      );
    } finally {
      setLoadingReports(false);
    }
  };

  // ======================================================
  // FILTERING
  // ======================================================

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const search =
        searchTerm.toLowerCase();

      const matchesSearch =
        !search ||
        report.trackingId
          .toLowerCase()
          .includes(search) ||
        report.title
          .toLowerCase()
          .includes(search) ||
        report.citizen?.name
          ?.toLowerCase()
          .includes(search);

      const matchesCategory =
        filterCategory === "All" ||
        report.category === filterCategory;

      const matchesStatus =
        filterStatus === "All" ||
        report.status === filterStatus;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    reports,
    searchTerm,
    filterCategory,
    filterStatus,
  ]);

  // ======================================================
  // METRICS
  // ======================================================

  const total = reports.length;

  const submitted = reports.filter(
    (report) =>
      report.status === "Submitted"
  ).length;

  const assigned = reports.filter(
    (report) =>
      report.status === "Assigned"
  ).length;

  const inProgress = reports.filter(
    (report) =>
      report.status === "In Progress"
  ).length;

  const resolved = reports.filter(
    (report) =>
      report.status === "Resolved"
  ).length;

  const critical = reports.filter(
    (report) =>
      report.urgency === "Critical" &&
      report.status !== "Resolved"
  ).length;

  // ======================================================
  // SELECT REPORT
  // ======================================================

  const openReport = (
    report: GovernmentReport
  ) => {
    setSelectedReport(report);

    setNewStatus(report.status);

    setOfficerRemarks(
      report.officerRemarks || ""
    );

    setSelectedOfficerId(
      report.assignedOfficer?._id || ""
    );
  };

  // ======================================================
  // ASSIGN OFFICER
  // ======================================================

  const handleAssignOfficer = async () => {
    if (!selectedReport) return;

    if (!selectedOfficerId) {
      setError(
        "Please select an officer before assigning."
      );
      return;
    }

    try {
      setIsAssigning(true);
      setError("");

      const response =
        await assignReportOfficer(
          selectedReport._id,
          selectedOfficerId
        );

      const updatedReport =
        response.data?.report;

      if (!updatedReport) {
        throw new Error(
          "Updated report was not returned."
        );
      }

      setReports((current) =>
        current.map((report) =>
          report._id === updatedReport._id
            ? updatedReport
            : report
        )
      );

      setSelectedReport(updatedReport);

      setSelectedOfficerId(
        updatedReport.assignedOfficer?._id ||
          selectedOfficerId
      );

      setNewStatus(updatedReport.status);
    } catch (error: any) {
      console.error(
        "Assign officer error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Unable to assign officer."
      );
    } finally {
      setIsAssigning(false);
    }
  };

  // ======================================================
  // UPDATE STATUS
  // ======================================================

  const handleUpdateStatus = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!selectedReport) return;

    if (!officerRemarks.trim()) {
      setError(
        "Please enter official action remarks."
      );
      return;
    }

    try {
      setIsUpdating(true);
      setError("");

      const response =
        await updateReportStatus(
          selectedReport._id,
          newStatus,
          officerRemarks.trim()
        );

      const updatedReport =
        response.data?.report;

      if (!updatedReport) {
        throw new Error(
          "Updated report was not returned."
        );
      }

      setReports((current) =>
        current.map((report) =>
          report._id === updatedReport._id
            ? updatedReport
            : report
        )
      );

      setSelectedReport(updatedReport);

      setOfficerRemarks("");

      setNewStatus(
        updatedReport.status
      );

      setSelectedOfficerId(
        updatedReport.assignedOfficer?._id ||
          ""
      );
    } catch (error: any) {
      console.error(
        "Update report error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Unable to update complaint."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (
    loading ||
    !user ||
    (user.role !== "admin" &&
      user.role !== "officer")
  ) {
    return (
      <div className="min-h-screen bg-[#050914] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-[#050914] text-white">

      {/* ================================================= */}
      {/* GOVERNMENT NAVBAR */}
      {/* ================================================= */}

      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#080e1d]/95 backdrop-blur-xl">

        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">

          {/* ================================================= */}
          {/* LOGO */}
          {/* ================================================= */}

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Building2 className="w-6 h-6 text-white" />
            </div>

            <div>
              <div className="text-lg font-extrabold tracking-tight">
                GramVoice
              </div>

              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                Government Operations Portal
              </div>
            </div>

          </div>

          {/* ================================================= */}
          {/* ADMIN / OFFICER USER MENU */}
          {/* ================================================= */}

          <div
            ref={userMenuRef}
            className="relative"
          >

            {/* USER BUTTON */}

            <button
              type="button"
              onClick={() => {
                console.log(
                  "Admin user button clicked"
                );

                setShowUserMenu(
                  (current) => !current
                );
              }}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 transition cursor-pointer"
            >

              {/* Avatar */}

              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">

                <UserRound className="w-4 h-4 text-indigo-400" />

              </div>

              {/* Name + Role */}

              <div className="text-left">

                <div className="text-xs font-semibold text-white">
                  {user.name}
                </div>

                <div className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold">
                  {user.role}
                </div>

              </div>

              {/* Arrow */}

              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                  showUserMenu
                    ? "rotate-180"
                    : ""
                }`}
              />

            </button>

            {/* ================================================= */}
            {/* USER DROPDOWN */}
            {/* ================================================= */}

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-[300]">

                {/* PROFILE */}

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);

                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition text-left"
                >

                  <UserRound className="w-4 h-4" />

                  <span>
                    My Profile / Settings
                  </span>

                </button>

                {/* GOVERNMENT PORTAL */}

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);

                    navigate("/gov");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition text-left"
                >

                  <Building2 className="w-4 h-4" />

                  <span>
                    Government Portal
                  </span>

                </button>

                {/* DIVIDER */}

                <div className="my-1 border-t border-slate-800" />

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 rounded-lg transition text-left"
                >

                  <LogOut className="w-4 h-4" />

                  <span>
                    Logout
                  </span>

                </button>

              </div>
            )}

          </div>

        </div>

      </header>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <main className="max-w-[1600px] mx-auto px-6 py-8">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">

          <div>

            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-[0.18em] mb-2">

              <Activity className="w-4 h-4" />

              Live Civic Operations

            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Government Dashboard
            </h1>

            <p className="text-slate-400 mt-2 text-sm max-w-2xl">
              Monitor citizen complaints, review AI-verified
              civic issues, and manage resolution status.
            </p>

          </div>

          <button
            onClick={loadReports}
            disabled={loadingReports}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-sm font-semibold transition disabled:opacity-50"
          >

            <RefreshCw
              className={`w-4 h-4 ${
                loadingReports
                  ? "animate-spin"
                  : ""
              }`}
            />

            {loadingReports
              ? "Refreshing..."
              : "Refresh Data"}

          </button>

        </div>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">

            <div className="flex items-center gap-2">

              <AlertTriangle className="w-4 h-4" />

              {error}

            </div>

            <button
              onClick={() =>
                setError("")
              }
              className="text-slate-500 hover:text-white"
            >

              <X className="w-4 h-4" />

            </button>

          </div>
        )}

        {/* ================================================= */}
        {/* METRICS */}
        {/* ================================================= */}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">

          <MetricCard
            title="Total Complaints"
            value={total}
            icon={ClipboardList}
            iconClass="text-indigo-400 bg-indigo-400/10"
          />

          <MetricCard
            title="New"
            value={submitted}
            icon={Clock3}
            iconClass="text-amber-400 bg-amber-400/10"
          />

          <MetricCard
            title="Assigned"
            value={assigned}
            icon={UserRound}
            iconClass="text-orange-400 bg-orange-400/10"
          />

          <MetricCard
            title="In Progress"
            value={inProgress}
            icon={Activity}
            iconClass="text-cyan-400 bg-cyan-400/10"
          />

          <MetricCard
            title="Resolved"
            value={resolved}
            icon={CheckCircle2}
            iconClass="text-emerald-400 bg-emerald-400/10"
          />

        </div>

        {/* ================================================= */}
        {/* CRITICAL ALERT */}
        {/* ================================================= */}

        {critical > 0 && (
          <div className="mb-8 rounded-2xl border border-rose-500/20 bg-gradient-to-r from-rose-500/10 to-transparent p-4 flex items-center gap-4">

            <div className="w-11 h-11 rounded-xl bg-rose-500/10 flex items-center justify-center">

              <AlertTriangle className="w-5 h-5 text-rose-400" />

            </div>

            <div>

              <div className="font-bold text-rose-300">
                {critical} critical complaint
                {critical > 1 ? "s" : ""} require
                attention
              </div>

              <div className="text-xs text-slate-400 mt-1">
                Review high-priority citizen reports
                immediately.
              </div>

            </div>

          </div>
        )}

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_440px] gap-6">

          {/* ================================================= */}
          {/* COMPLAINT LIST */}
          {/* ================================================= */}

          <section className="rounded-2xl border border-slate-800 bg-[#080e1d] overflow-hidden">

            <div className="p-5 border-b border-slate-800">

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                <div>

                  <h2 className="font-bold text-lg">
                    Citizen Complaints
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    {filteredReports.length} complaint
                    {filteredReports.length !== 1
                      ? "s"
                      : ""} displayed
                  </p>

                </div>

                <div className="flex flex-col sm:flex-row gap-2">

                  {/* SEARCH */}

                  <div className="relative">

                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

                    <input
                      value={searchTerm}
                      onChange={(e) =>
                        setSearchTerm(
                          e.target.value
                        )
                      }
                      placeholder="Search complaints..."
                      className="w-full sm:w-52 bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/40"
                    />

                  </div>

                  {/* CATEGORY */}

                  <select
                    value={filterCategory}
                    onChange={(e) =>
                      setFilterCategory(
                        e.target.value
                      )
                    }
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 outline-none"
                  >

                    {categories.map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category === "All"
                            ? "All Departments"
                            : category}
                        </option>
                      )
                    )}

                  </select>

                  {/* STATUS */}

                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(
                        e.target.value
                      )
                    }
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 outline-none"
                  >

                    {statuses.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status === "All"
                            ? "All Statuses"
                            : status}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

            </div>

            {/* COMPLAINT LIST */}

            <div className="divide-y divide-slate-800/70">

              {loadingReports ? (

                <div className="py-20 flex flex-col items-center gap-3 text-slate-500">

                  <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />

                  <span className="text-sm">
                    Loading citizen complaints...
                  </span>

                </div>

              ) : filteredReports.length === 0 ? (

                <div className="py-20 flex flex-col items-center text-center px-6">

                  <ClipboardList className="w-10 h-10 text-slate-700 mb-3" />

                  <div className="font-semibold text-slate-400">
                    No complaints found
                  </div>

                  <p className="text-xs text-slate-600 mt-1">
                    New citizen reports will appear
                    here automatically.
                  </p>

                </div>

              ) : (

                filteredReports.map(
                  (report) => (

                    <button
                      key={report._id}
                      type="button"
                      onClick={() =>
                        openReport(report)
                      }
                      className={`w-full text-left p-5 hover:bg-slate-900/60 transition ${
                        selectedReport?._id ===
                        report._id
                          ? "bg-cyan-500/[0.04] border-l-2 border-cyan-400"
                          : ""
                      }`}
                    >

                      <div className="flex gap-4">

                        {/* IMAGE */}

                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">

                          {report.imageUrl ? (

                            <img
                              src={getImageUrl(
                                report.imageUrl
                              )}
                              alt=""
                              className="w-full h-full object-cover"
                            />

                          ) : (

                            <div className="w-full h-full flex items-center justify-center">

                              <ClipboardList className="w-5 h-5 text-slate-700" />

                            </div>

                          )}

                        </div>

                        {/* CONTENT */}

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2 mb-1">

                            <span className="text-[10px] font-mono font-bold text-cyan-400">
                              {report.trackingId}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase ${getUrgencyClass(
                                report.urgency
                              )}`}
                            >
                              {report.urgency}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-md border text-[9px] font-bold ${getStatusClass(
                                report.status
                              )}`}
                            >
                              {report.status}
                            </span>

                          </div>

                          <h3 className="font-semibold text-slate-100 truncate">
                            {report.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-500">

                            <span className="flex items-center gap-1">

                              <UserRound className="w-3 h-3" />

                              {report.citizen?.name ||
                                "Unknown citizen"}

                            </span>

                            <span className="flex items-center gap-1">

                              <Building2 className="w-3 h-3" />

                              {report.category}

                            </span>

                            <span className="flex items-center gap-1">

                              <MapPin className="w-3 h-3" />

                              Location captured

                            </span>

                          </div>

                        </div>

                        <div className="hidden sm:flex items-center">

                          <Eye className="w-4 h-4 text-slate-600" />

                        </div>

                      </div>

                    </button>

                  )
                )

              )}

            </div>

          </section>

          {/* ================================================= */}
          {/* DETAILS PANEL */}
          {/* ================================================= */}

          <aside className="rounded-2xl border border-slate-800 bg-[#080e1d] overflow-hidden h-fit xl:sticky xl:top-28">

            {!selectedReport ? (

              <div className="min-h-[550px] flex flex-col items-center justify-center text-center px-8">

                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-5">

                  <Eye className="w-7 h-7 text-slate-600" />

                </div>

                <h3 className="font-bold text-slate-300">
                  Complaint Details
                </h3>

                <p className="text-xs text-slate-600 mt-2 max-w-xs leading-relaxed">
                  Select a citizen complaint from the
                  list to review evidence, citizen
                  information, AI verification and
                  current status.
                </p>

              </div>

            ) : (

              <div>

                {/* ================================================= */}
                {/* DETAIL HEADER */}
                {/* ================================================= */}

                <div className="p-5 border-b border-slate-800">

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <div className="text-[10px] font-mono font-bold text-cyan-400 mb-2">
                        {selectedReport.trackingId}
                      </div>

                      <h2 className="font-bold text-lg leading-snug">
                        {selectedReport.title}
                      </h2>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedReport(null)
                      }
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white"
                    >

                      <X className="w-4 h-4" />

                    </button>

                  </div>

                  <div className="flex gap-2 mt-3">

                    <span
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold ${getUrgencyClass(
                        selectedReport.urgency
                      )}`}
                    >
                      {selectedReport.urgency} Priority
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold ${getStatusClass(
                        selectedReport.status
                      )}`}
                    >
                      {selectedReport.status}
                    </span>

                  </div>

                </div>

                <div className="p-5 space-y-6">

                  {/* ================================================= */}
                  {/* EVIDENCE */}
                  {/* ================================================= */}

                  <div>

                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                      Evidence
                    </div>

                    <div className="h-48 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">

                      {selectedReport.imageUrl ? (

                        <img
                          src={getImageUrl(
                            selectedReport.imageUrl
                          )}
                          alt="Civic issue evidence"
                          className="w-full h-full object-cover"
                        />

                      ) : (

                        <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                          No image available
                        </div>

                      )}

                    </div>

                  </div>

                  {/* ================================================= */}
                  {/* CITIZEN */}
                  {/* ================================================= */}

                  <div>

                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

                      <UserRound className="w-3.5 h-3.5" />

                      Citizen

                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2">

                      <div className="flex justify-between gap-4 text-xs">

                        <span className="text-slate-600">
                          Name
                        </span>

                        <span className="text-slate-200 font-medium text-right">
                          {selectedReport.citizen?.name ||
                            "—"}
                        </span>

                      </div>

                      <div className="flex justify-between gap-4 text-xs">

                        <span className="text-slate-600">
                          Phone
                        </span>

                        <span className="text-slate-200 font-medium">
                          {selectedReport.citizen?.phone ||
                            "—"}
                        </span>

                      </div>

                      <div className="flex justify-between gap-4 text-xs">

                        <span className="text-slate-600">
                          Email
                        </span>

                        <span className="text-slate-300 text-right break-all">
                          {selectedReport.citizen?.email ||
                            "—"}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* ================================================= */}
                  {/* LOCATION */}
                  {/* ================================================= */}

                  <div>

                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

                      <MapPin className="w-3.5 h-3.5" />

                      Location

                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedReport.location?.address ||
                          "Address unavailable"}
                      </p>

                      <div className="mt-3 text-[10px] text-slate-600 font-mono">

                        {selectedReport.location?.latitude},
                        {" "}
                        {selectedReport.location?.longitude}

                      </div>

                    </div>

                  </div>

                  {/* ================================================= */}
                  {/* AI VERIFICATION */}
                  {/* ================================================= */}

                  <div>

                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

                      <ShieldCheck className="w-3.5 h-3.5" />

                      AI Verification

                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">

                      <div className="flex justify-between items-center">

                        <span className="text-xs text-slate-500">
                          Civic issue validity
                        </span>

                        {selectedReport.aiAnalysis?.isValid ? (

                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">

                            <CheckCircle2 className="w-3.5 h-3.5" />

                            Verified

                          </span>

                        ) : (

                          <span className="flex items-center gap-1 text-xs font-bold text-rose-400">

                            <XCircle className="w-3.5 h-3.5" />

                            Rejected

                          </span>

                        )}

                      </div>

                      {selectedReport.aiAnalysis?.confidence !==
                        null &&
                        selectedReport.aiAnalysis?.confidence !==
                          undefined && (

                          <div className="mt-3">

                            <div className="flex justify-between text-[10px] mb-1">

                              <span className="text-slate-600">
                                AI confidence
                              </span>

                              <span className="text-cyan-400 font-bold">

                                {Math.round(
                                  selectedReport
                                    .aiAnalysis
                                    .confidence *
                                    100
                                )}
                                %

                              </span>

                            </div>

                            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">

                              <div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                                style={{
                                  width: `${
                                    selectedReport
                                      .aiAnalysis
                                      .confidence *
                                    100
                                  }%`,
                                }}
                              />

                            </div>

                          </div>

                        )}

                    </div>

                  </div>

                  {/* ================================================= */}
                  {/* DESCRIPTION */}
                  {/* ================================================= */}

                  <div>

                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                      Citizen Statement
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {selectedReport.description}
                    </p>

                  </div>

                  {/* ================================================= */}
                  {/* ASSIGNED OFFICER */}
                  {/* ================================================= */}

                  <div>

                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

                      <UserCog className="w-3.5 h-3.5" />

                      Assigned Officer

                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">

                      {/* ADMIN */}

                      {user.role === "admin" ? (

                        <div className="space-y-3">

                          <select
                            value={selectedOfficerId}
                            onChange={(e) =>
                              setSelectedOfficerId(
                                e.target.value
                              )
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-200 outline-none focus:border-cyan-500/50"
                          >

                            <option value="">
                              Select an officer
                            </option>

                            {officers.map(
                              (officer) => (

                                <option
                                  key={officer._id}
                                  value={officer._id}
                                >

                                  {officer.name}

                                  {officer.department
                                    ? ` — ${officer.department}`
                                    : ""}

                                </option>

                              )
                            )}

                          </select>

                          {officers.length === 0 && (

                            <p className="text-[10px] text-amber-400">
                              No active officers available.
                            </p>

                          )}

                          <button
                            type="button"
                            onClick={
                              handleAssignOfficer
                            }
                            disabled={
                              isAssigning ||
                              !selectedOfficerId ||
                              officers.length === 0
                            }
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 font-bold text-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >

                            {isAssigning ? (

                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />

                                Assigning...
                              </>

                            ) : (

                              <>
                                <UserCog className="w-4 h-4" />

                                {selectedReport.assignedOfficer
                                  ? "Reassign Officer"
                                  : "Assign Officer"}

                              </>

                            )}

                          </button>

                          {/* CURRENT ASSIGNMENT */}

                          {selectedReport.assignedOfficer && (

                            <div className="pt-3 border-t border-slate-800">

                              <div className="text-[9px] uppercase tracking-wider text-slate-600 font-bold mb-2">
                                Currently Assigned
                              </div>

                              <div className="flex items-start gap-3">

                                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">

                                  <UserRound className="w-4 h-4 text-cyan-400" />

                                </div>

                                <div className="min-w-0">

                                  <div className="text-xs font-semibold text-slate-200">

                                    {
                                      selectedReport
                                        .assignedOfficer
                                        .name
                                    }

                                  </div>

                                  <div className="text-[10px] text-slate-500 break-all mt-0.5">

                                    {
                                      selectedReport
                                        .assignedOfficer
                                        .email
                                    }

                                  </div>

                                  {selectedReport
                                    .assignedOfficer
                                    .department && (

                                    <div className="text-[10px] text-cyan-400 mt-1">

                                      {
                                        selectedReport
                                          .assignedOfficer
                                          .department
                                      }

                                    </div>

                                  )}

                                </div>

                              </div>

                            </div>

                          )}

                        </div>

                      ) : (

                        /* OFFICER */

                        <div>

                          {selectedReport.assignedOfficer ? (

                            <div className="flex items-start gap-3">

                              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">

                                <UserRound className="w-5 h-5 text-cyan-400" />

                              </div>

                              <div className="min-w-0">

                                <div className="text-sm font-semibold text-slate-200">

                                  {
                                    selectedReport
                                      .assignedOfficer
                                      .name
                                  }

                                </div>

                                <div className="text-[10px] text-slate-500 break-all mt-1">

                                  {
                                    selectedReport
                                      .assignedOfficer
                                      .email
                                  }

                                </div>

                                {selectedReport
                                  .assignedOfficer
                                  .department && (

                                  <div className="text-[10px] text-cyan-400 mt-1">

                                    {
                                      selectedReport
                                        .assignedOfficer
                                        .department
                                    }

                                  </div>

                                )}

                                {selectedReport
                                  .assignedOfficer
                                  .district && (

                                  <div className="text-[10px] text-slate-600 mt-1">

                                    District:{" "}

                                    {
                                      selectedReport
                                        .assignedOfficer
                                        .district
                                    }

                                  </div>

                                )}

                              </div>

                            </div>

                          ) : (

                            <div className="text-xs text-slate-600">
                              No officer assigned to this complaint.
                            </div>

                          )}

                        </div>

                      )}

                    </div>

                  </div>

                  {/* ================================================= */}
                  {/* STATUS */}
                  {/* ================================================= */}

                  <div>

                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">

                      <BarChart3 className="w-3.5 h-3.5" />

                      Complaint Status

                    </div>

                    <div className="flex items-center gap-1">

                      {[
                        "Submitted",
                        "Assigned",
                        "In Progress",
                        "Resolved",
                      ].map(
                        (status, index) => {

                          const completed =
                            [
                              "Submitted",
                              "Assigned",
                              "In Progress",
                              "Resolved",
                            ].indexOf(
                              selectedReport.status
                            ) >= index;

                          return (

                            <div
                              key={status}
                              className="flex-1"
                            >

                              <div
                                className={`h-1.5 rounded-full ${
                                  completed
                                    ? "bg-cyan-400"
                                    : "bg-slate-800"
                                }`}
                              />

                              <div
                                className={`text-[8px] mt-1 ${
                                  completed
                                    ? "text-cyan-400"
                                    : "text-slate-700"
                                }`}
                              >
                                {status}
                              </div>

                            </div>

                          );
                        }
                      )}

                    </div>

                  </div>

                  {/* ================================================= */}
                  {/* ADMINISTRATIVE ACTION */}
                  {/* ================================================= */}

                  <form
                    onSubmit={
                      handleUpdateStatus
                    }
                    className="border-t border-slate-800 pt-5"
                  >

                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-3">
                      Administrative Action
                    </div>

                    <div className="space-y-3">

                      <select
                        value={newStatus}
                        onChange={(e) =>
                          setNewStatus(
                            e.target
                              .value as ReportStatus
                          )
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-200 outline-none focus:border-cyan-500/50"
                      >

                        <option value="Submitted">
                          Submitted
                        </option>

                        <option value="Assigned">
                          Assigned
                        </option>

                        <option value="In Progress">
                          In Progress
                        </option>

                        <option value="Resolved">
                          Resolved
                        </option>

                        <option value="Rejected">
                          Rejected
                        </option>

                      </select>

                      <textarea
                        value={officerRemarks}
                        onChange={(e) =>
                          setOfficerRemarks(
                            e.target.value
                          )
                        }
                        placeholder="Enter official action remarks..."
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-cyan-500/50 resize-none"
                      />

                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 font-bold text-xs transition disabled:opacity-50"
                      >

                        {isUpdating ? (

                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />

                            Updating...
                          </>

                        ) : (

                          <>
                            <CheckCircle2 className="w-4 h-4" />

                            Update Complaint
                          </>

                        )}

                      </button>

                    </div>

                  </form>

                  {/* ================================================= */}
                  {/* HISTORY */}
                  {/* ================================================= */}

                  <div>

                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-3">
                      Status History
                    </div>

                    <div className="space-y-3">

                      {selectedReport.history?.map(
                        (item, index) => (

                          <div
                            key={index}
                            className="flex gap-3"
                          >

                            <div className="flex flex-col items-center">

                              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5" />

                              {index <
                                selectedReport
                                  .history
                                  .length -
                                  1 && (

                                <div className="w-px flex-1 bg-slate-800 mt-1" />

                              )}

                            </div>

                            <div className="pb-2">

                              <div className="text-xs font-semibold text-slate-300">
                                {item.status}
                              </div>

                              <div className="text-[10px] text-slate-600 mt-0.5">
                                {new Date(
                                  item.timestamp
                                ).toLocaleString()}
                              </div>

                              <div className="text-[11px] text-slate-500 mt-1">
                                {item.note}
                              </div>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                </div>

              </div>

            )}

          </aside>

        </div>

      </main>

    </div>
  );
};

// ======================================================
// METRIC CARD
// ======================================================

interface MetricCardProps {
  title: string;
  value: number;
  icon: any;
  iconClass: string;
}

const MetricCard = ({
  title,
  value,
  icon: Icon,
  iconClass,
}: MetricCardProps) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#080e1d] p-5">

      <div className="flex items-center justify-between">

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <span className="text-[9px] uppercase tracking-wider text-slate-600 font-bold">
          Live
        </span>

      </div>

      <div className="mt-4">

        <div className="text-2xl font-black text-white">
          {value}
        </div>

        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mt-1">
          {title}
        </div>

      </div>

    </div>
  );
};

export default GovernmentPortal;