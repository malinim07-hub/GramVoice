import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Clock, CheckCircle2, MapPin, Eye, Building, Filter, RefreshCw, CheckSquare, MessageSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout";
import { INITIAL_REPORTS } from "./Dashboard";
import type { CivicReport } from "./Dashboard";

const GovernmentPortal = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null);
  
  // Filter states
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  
  // Status update states
  const [newStatus, setNewStatus] = useState<CivicReport["status"]>("Submitted");
  const [officerRemarks, setOfficerRemarks] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && user.role === "admin") {
      loadReports();
    }
  }, [user]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  const loadReports = () => {
    const stored = localStorage.getItem("gv_reports");
    if (stored) {
      setReports(JSON.parse(stored));
    } else {
      localStorage.setItem("gv_reports", JSON.stringify(INITIAL_REPORTS));
      setReports(INITIAL_REPORTS);
    }
  };

  // Handle status update
  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setIsUpdating(true);
    
    setTimeout(() => {
      const timestamp = new Date().toLocaleString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });

      const updatedHistoryItem = {
        status: newStatus,
        timestamp: timestamp,
        note: officerRemarks || `Status updated to ${newStatus} by Zonal Officer.`
      };

      const updatedReport: CivicReport = {
        ...selectedReport,
        status: newStatus,
        history: [...selectedReport.history, updatedHistoryItem]
      };

      // Update in reports list
      const updatedReports = reports.map((r) => (r.id === selectedReport.id ? updatedReport : r));
      localStorage.setItem("gv_reports", JSON.stringify(updatedReports));
      
      setReports(updatedReports);
      setSelectedReport(updatedReport);
      setOfficerRemarks("");
      setIsUpdating(false);
    }, 1000); // Simulate network delay
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    const matchDept = filterDept === "All" || r.category === filterDept;
    const matchStatus = filterStatus === "All" || r.status === filterStatus;
    return matchDept && matchStatus;
  });

  // Calculate counts
  const total = reports.length;
  const pending = reports.filter((r) => r.status === "Submitted").length;
  const inProgress = reports.filter((r) => r.status === "In Progress" || r.status === "Assigned").length;
  const resolved = reports.filter((r) => r.status === "Resolved").length;

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Portal Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-white">Government Officer Console</h2>
              <p className="text-slate-400 text-sm mt-0.5">Municipal Corporation Grid Operations & Dispatch.</p>
            </div>
          </div>
          <button 
            onClick={loadReports}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-sm font-semibold text-slate-200 transition"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Grid
          </button>
        </div>

        {/* Officer Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-850 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{total}</div>
              <div className="text-slate-450 text-[10px] uppercase font-bold tracking-wider">Total Received</div>
            </div>
          </div>
          
          <div className="glass-panel p-5 rounded-2xl border border-slate-850 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-955/20 border border-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-indigo-400">{pending}</div>
              <div className="text-slate-450 text-[10px] uppercase font-bold tracking-wider">Awaiting Review</div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-850 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-955/20 border border-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-cyan-400">{inProgress}</div>
              <div className="text-slate-450 text-[10px] uppercase font-bold tracking-wider">Work Dispatched</div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-850 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-955/20 border border-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">{resolved}</div>
              <div className="text-slate-450 text-[10px] uppercase font-bold tracking-wider">Issues Closed</div>
            </div>
          </div>
        </div>

        {/* Split Grid List & Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Grid List & Filters (Takes 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Filters Row */}
            <div className="glass-panel p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between border border-slate-900">
              <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold">
                <Filter className="w-4 h-4 text-cyan-400" /> Filters:
              </div>
              
              <div className="flex flex-wrap gap-4 items-center">
                {/* Department filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Dept:</span>
                  <select 
                    value={filterDept} 
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="bg-slate-900 border border-slate-850 rounded-lg text-slate-200 text-xs px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="All">All Departments</option>
                    <option value="Roads & Traffic">Roads & Traffic</option>
                    <option value="Sanitation & Waste Management">Sanitation & Waste Management</option>
                    <option value="Water Supply & Sewage">Water Supply & Sewage</option>
                    <option value="Electricity & Public Lighting">Electricity & Public Lighting</option>
                    <option value="Public Parks & Forestry">Public Parks & Forestry</option>
                    <option value="General Infrastructure">General Infrastructure</option>
                  </select>
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Status:</span>
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-900 border border-slate-850 rounded-lg text-slate-200 text-xs px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Submitted">Awaiting Review</option>
                    <option value="Assigned">Assigned Officer</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Complaints Listing Table */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-slate-850">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-900/40 text-slate-400 uppercase font-semibold tracking-wider">
                      <th className="p-4">Tracking ID</th>
                      <th className="p-4">Complaint Title</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Urgency</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((rep) => (
                      <tr 
                        key={rep.id} 
                        onClick={() => {
                          setSelectedReport(rep);
                          setNewStatus(rep.status);
                        }}
                        className={`border-b border-slate-900/60 hover:bg-slate-900/35 cursor-pointer transition ${
                          selectedReport?.id === rep.id ? "bg-slate-900/60 border-l-2 border-l-indigo-400" : ""
                        }`}
                      >
                        <td className="p-4 font-mono font-bold text-white">{rep.trackingId}</td>
                        <td className="p-4 font-medium text-slate-200 truncate max-w-[160px]">{rep.title}</td>
                        <td className="p-4 text-slate-400 font-medium">{rep.category}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            rep.urgency === "Critical" ? "text-rose-450 bg-rose-955/20 border border-rose-500/10" :
                            rep.urgency === "High" ? "text-amber-450 bg-amber-955/20 border border-amber-500/10" :
                            "text-cyan-400 bg-cyan-955/20 border border-cyan-500/10"
                          }`}>{rep.urgency}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                            rep.status === "Resolved" ? "text-emerald-400 bg-emerald-950/40" :
                            rep.status === "In Progress" ? "text-cyan-400 bg-cyan-950/40" :
                            rep.status === "Assigned" ? "text-amber-400 bg-amber-950/40" :
                            "text-indigo-405 bg-indigo-950/40"
                          }`}>{rep.status}</span>
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            type="button" 
                            className="p-1 text-slate-400 hover:text-white rounded bg-slate-900 border border-slate-800 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredReports.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-slate-500 font-medium">
                          No reports match selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: Detail Inspector Panel (Takes 1 col) */}
          <div className="lg:col-span-1">
            {selectedReport ? (
              <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-6">
                
                {/* Details Header */}
                <div className="border-b border-slate-850 pb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold font-mono text-indigo-400 bg-indigo-955/40 border border-indigo-500/20 px-2 py-0.5 rounded">
                      {selectedReport.trackingId}
                    </span>
                    <span className="text-slate-500 text-[10px]">{selectedReport.createdAt}</span>
                  </div>
                  <h3 className="text-md font-bold text-white mt-3 leading-snug">{selectedReport.title}</h3>
                </div>

                {/* Evidence Image with geo link */}
                <div className="space-y-3">
                  <div className="h-40 rounded-xl overflow-hidden border border-slate-900">
                    <img 
                      src={selectedReport.imagePath} 
                      alt="Evidence Docket" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850 text-slate-350 text-xs flex items-start gap-2 leading-relaxed">
                    <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>{selectedReport.location.address}</div>
                  </div>
                </div>

                {/* Full Description */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-550 uppercase tracking-wider">Citizen Statement</div>
                  <p className="text-slate-300 text-xs leading-relaxed">{selectedReport.description}</p>
                </div>

                {/* Change Status Form */}
                <form onSubmit={handleUpdateStatus} className="border-t border-slate-850 pt-5 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-cyan-400" /> Action Dispatch Panel
                  </h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operational Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs px-3.5 py-2.5 focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="Submitted">Review Queue (Submitted)</option>
                      <option value="Assigned">Assign Maintenance Crew</option>
                      <option value="In Progress">Crew Dispatched (In Progress)</option>
                      <option value="Resolved">Close Docket (Resolved)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Official Action Remarks</label>
                    <textarea
                      value={officerRemarks}
                      onChange={(e) => setOfficerRemarks(e.target.value)}
                      placeholder="e.g. Dispatched Road crew with cold-mix asphalt, repair scheduled for 2 PM."
                      rows={3}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs p-3 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-xs hover:shadow-lg transition flex items-center justify-center gap-1"
                  >
                    {isUpdating ? "Saving..." : "Update Docket & Dispatch"}
                  </button>
                </form>

                {/* Tracking History Timeline */}
                <div className="border-t border-slate-850 pt-5 space-y-3">
                  <div className="text-[10px] font-bold text-slate-550 uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Action Audit Trail
                  </div>
                  
                  <div className="space-y-3 max-h-36 overflow-y-auto pr-1">
                    {selectedReport.history.map((hist, i) => (
                      <div key={i} className="flex gap-2 text-[10px] border-l border-slate-800 pl-3 relative ml-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute -left-[4px] top-1"></span>
                        <div className="flex-grow space-y-0.5">
                          <div className="flex justify-between text-slate-450 font-semibold">
                            <span className="text-slate-200">{hist.status}</span>
                            <span>{hist.timestamp}</span>
                          </div>
                          <p className="text-slate-450 text-[10px] italic leading-tight">{hist.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="glass-panel rounded-2xl border border-slate-800 p-8 text-center flex flex-col items-center justify-center min-h-[350px] text-slate-500 space-y-3">
                <Building className="w-8 h-8 text-slate-655" />
                <div className="text-xs font-semibold">Select a complaint from the grid to audit and dispatch action.</div>
              </div>
            )}
          </div>

        </div>

      </div>
    </MainLayout>
  );
};

export default GovernmentPortal;
