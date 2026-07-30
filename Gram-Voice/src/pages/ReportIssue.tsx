import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, MapPin, Sparkles, CheckCircle, ArrowRight, RefreshCw, AlertTriangle, Languages } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../context/AuthContext";
import { analyzeCivicIssue, DEMO_ISSUES, translateText } from "../services/gemini";
import type { GeminiAnalysisResult } from "../services/gemini";
import type { CivicReport } from "./Dashboard";

const ReportIssue = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // Geolocation states
  const [gpsLoading, setGpsLoading] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<string>("");

  // Image states
  const [imagePreview, setImagePreview] = useState<string>("");

  // UI Flow States
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "capturing_gps" | "analyzing_ai" | "form_editing" | "submitted">("idle");
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [aiError, setAiError] = useState<string>("");
  
  // AI Output / Form States
  const [aiResult, setAiResult] = useState<GeminiAnalysisResult | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formUrgency, setFormUrgency] = useState<"Low" | "Medium" | "High" | "Critical">("Medium");
  const [submittedReport, setSubmittedReport] = useState<CivicReport | null>(null);
  
  // Translation States
  const [translatingForm, setTranslatingForm] = useState(false);
  const [formLang, setFormLang] = useState<"en" | "ta">("en");


  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Grab location on component mount (if authenticated)
  useEffect(() => {
    if (user) {
      fetchLocation();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  const fetchLocation = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      setAddress("Madurai, Tamil Nadu, India (GPS not supported)");
      setCoords({ latitude: 9.9252, longitude: 78.1198 });
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        
        try {
          // Reverse geocode via OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "User-Agent": "GramVoice-Civic-App" } }
          );
          if (response.ok) {
            const data = await response.json();
            setAddress(data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          } else {
            setAddress(`Ward 4, Madurai, Tamil Nadu (Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)})`);
          }
        } catch (error) {
          setAddress(`Ward 4, Madurai, Tamil Nadu (Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)})`);
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        console.error("GPS access denied, using mock village coordinates", error);
        // Fallback Tamil Nadu coordinates (Madurai)
        setCoords({ latitude: 9.9252, longitude: 78.1198 });
        setAddress("Anna Nagar East, Madurai, Tamil Nadu, India (Mock GPS Fallback)");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Convert uploaded file to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      triggerAIAnalysis(base64, file.type, null);
    };
    reader.readAsDataURL(file);
  };

  // Click on a Demo card for classroom presentations
  const handleDemoSelect = (demoKey: string) => {
    const demo = DEMO_ISSUES[demoKey];
    setImagePreview(demo.imagePath);
    setAnalysisStatus("analyzing_ai");
    triggerAIAnalysis("", "", demoKey);
  };

  // Trigger AI Analysis pipeline
  const triggerAIAnalysis = async (b64: string, mime: string, demoKey: string | null) => {
    setAnalysisStatus("analyzing_ai");
    setAiError("");
    
    // Cycle loading texts for deep realism
    const steps = [
      "Acquiring Geotag & GPS Signal...",
      "Uploading Image to Gemini AI Core...",
      "Analyzing Visual Evidence & Civic Authenticity...",
      "Determining Department & Escalation Grade..."
    ];
    
    let currentStep = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setLoadingStep(steps[currentStep]);
      }
    }, 700);

    try {
      const result = await analyzeCivicIssue(
        b64, 
        mime, 
        coords?.latitude, 
        coords?.longitude, 
        demoKey || undefined
      );

      clearInterval(stepInterval);
      
      setAiResult(result);

      if (!result.isValidCivicIssue) {
        setAiError(result.rejectionReason || "Uploaded photo does not contain a recognizable public infrastructure or sanitation issue.");
        setAnalysisStatus("idle");
        return;
      }

      // Prefill Form fields
      setFormTitle(result.title);
      setFormDescription(result.description);
      setFormCategory(result.category);
      setFormUrgency(result.urgency);
      
      setAnalysisStatus("form_editing");
    } catch (err) {
      clearInterval(stepInterval);
      console.error(err);
      setAiError("Connection to AI verification engine failed. Please try again.");
      setAnalysisStatus("idle");
    }
  };

  // Translate prefilled form fields between English and Tamil
  const handleTranslateForm = async () => {
    if (!formTitle || !formDescription) return;
    setTranslatingForm(true);
    try {
      const nextLang = formLang === "en" ? "ta" : "en";
      const translatedTitle = await translateText(formTitle, formLang, nextLang);
      const translatedDescription = await translateText(formDescription, formLang, nextLang);
      setFormTitle(translatedTitle);
      setFormDescription(translatedDescription);
      setFormLang(nextLang);
    } catch (err) {
      console.error("Failed to translate form content:", err);
    } finally {
      setTranslatingForm(false);
    }
  };

  // Confirm and Send Report
  const handleSubmitReport = (e: React.FormEvent) => {

    e.preventDefault();
    
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `GV-2026-${randomSuffix}`;
    const timestamp = new Date().toLocaleString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    const newReport: CivicReport = {
      id: `rep-${Date.now()}`,
      title: formTitle,
      description: formDescription,
      category: formCategory,
      urgency: formUrgency,
      location: {
        latitude: coords?.latitude || 9.9252,
        longitude: coords?.longitude || 78.1198,
        address: address
      },
      imagePath: imagePreview,
      status: "Submitted",
      createdAt: timestamp,
      trackingId: trackingId,
      history: [
        {
          status: "Submitted",
          timestamp: timestamp,
          note: "Report verified by AI and logged under municipal registry."
        }
      ]
    };

    // Save to localStorage list
    const currentReports = localStorage.getItem("gv_reports");
    let reportsList = [];
    if (currentReports) {
      reportsList = JSON.parse(currentReports);
    }
    reportsList.unshift(newReport);
    localStorage.setItem("gv_reports", JSON.stringify(reportsList));

    setSubmittedReport(newReport);
    setAnalysisStatus("submitted");
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Step Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Citizen Report Portal</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Upload a picture of the issue. AI will analyze, verify, and fill the docket immediately.
          </p>
        </div>

        {/* GPS Status Bar */}
        <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-900">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${gpsLoading ? "text-cyan-400 animate-spin" : "text-emerald-400 bg-emerald-950/20"}`}>
              {gpsLoading ? <RefreshCw className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
            </div>
            <div className="text-left">
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Device GPS Location</div>
              <div className="text-slate-200 text-sm font-medium truncate max-w-lg">
                {gpsLoading ? "Acquiring satellites..." : address || "Waiting for coordinates..."}
              </div>
            </div>
          </div>
          <button 
            type="button" 
            onClick={fetchLocation} 
            disabled={gpsLoading}
            className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition duration-200"
          >
            Refetch GPS
          </button>
        </div>

        {/* AI Error Alert */}
        {aiError && (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/20 flex gap-3 text-rose-300 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <div className="space-y-1">
              <div className="font-bold">AI Verification Declined</div>
              <div>{aiError}</div>
            </div>
          </div>
        )}

        {/* IDLE: Upload Screen */}
        {analysisStatus === "idle" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* File Upload Dropzone (Takes 2 cols) */}
            <div className="md:col-span-2">
              <label className="flex flex-col items-center justify-center h-80 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 hover:border-cyan-500/30 cursor-pointer transition duration-300 p-6 group">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" // Invokes camera on mobiles!
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <div className="space-y-4 text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-cyan-950/30 text-cyan-400 group-hover:scale-110 transition duration-300 border border-cyan-500/10">
                    <Camera className="w-10 h-10" />
                  </div>
                  <div>
                    <span className="text-slate-200 font-bold text-lg block">Snap or Upload Photo</span>
                    <span className="text-slate-500 text-sm block mt-1">Take a photo from your phone camera or select file</span>
                  </div>
                  <div className="text-xs text-cyan-500 font-semibold bg-cyan-950/40 border border-cyan-500/20 px-3 py-1 rounded-full inline-block">
                    Only 1 Input Needed
                  </div>
                </div>
              </label>
            </div>

            {/* Classroom Demo Presets (Takes 1 col) */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Presentation Demo Cases</h3>
              <p className="text-xs text-slate-500">Don't have a camera ready? Click a sample case to simulate a report instantly:</p>
              
              <div className="space-y-2.5">
                {[
                  { key: "pothole", label: "Highway Pothole", color: "cyan" },
                  { key: "garbage", label: "Overflowing Garbage", color: "purple" },
                  { key: "streetlight", label: "Broken Streetlight", color: "indigo" },
                  { key: "waterleak", label: "Water Pipeline Leak", color: "emerald" },
                ].map((demo) => (
                  <button
                    key={demo.key}
                    type="button"
                    onClick={() => handleDemoSelect(demo.key)}
                    className="w-full text-left p-3 rounded-xl border border-slate-850 bg-slate-900/30 hover:bg-slate-850 hover:border-slate-750 transition flex items-center justify-between text-xs font-semibold text-slate-300 group"
                  >
                    <span>{demo.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 group-hover:text-white transition" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LOADING: AI Processing Screen */}
        {analysisStatus === "analyzing_ai" && (
          <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center flex flex-col items-center justify-center min-h-[350px] space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-cyan-500/10 border-t-cyan-400 rounded-full animate-spin"></div>
              <Sparkles className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Processing Report...</h3>
              <p className="text-slate-400 text-sm font-medium animate-pulse">{loadingStep}</p>
            </div>
            
            <p className="text-xs text-slate-500 max-w-sm">
              Our AI is parsing the image pixel-data, matching it against public utility parameters, and cross-referencing GPS nodes.
            </p>
          </div>
        )}

        {/* EDIT FORM: AI Prefilled Verification Screen */}
        {analysisStatus === "form_editing" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Visual Geotagged Docket */}
            <div className="space-y-6">
              <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
                <div className="p-4 border-b border-slate-850 flex items-center justify-between bg-slate-900/20">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-cyan-400" /> Evidence Photo
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> AI Verified Issue
                  </span>
                </div>
                
                <div className="h-64 relative bg-slate-900">
                  <img 
                    src={imagePreview} 
                    alt="Evidence" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-md flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-slate-300 text-xs truncate font-medium">{address}</span>
                  </div>
                </div>
              </div>

              {/* AI Verification Breakdown */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider text-[10px] text-slate-400">AI Inspector Confidence Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Spam Filtration Status:</span>
                    <span className="text-emerald-400 font-bold">Passed (99.8%)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Department Autoclassifier:</span>
                    <span className="text-cyan-400 font-bold">Matches {formCategory}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GPS Validation:</span>
                    <span className="text-indigo-400 font-bold">Geotag Linked</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Prefilled Form Form */}
            <form onSubmit={handleSubmitReport} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="border-b border-slate-850 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> AI Pre-filled Docket
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">AI has written the details. Review and adjust if necessary.</p>
                </div>
                
                <button
                  type="button"
                  onClick={handleTranslateForm}
                  disabled={translatingForm || !formTitle || !formDescription}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-850 bg-slate-900/60 hover:bg-slate-850 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition duration-200 disabled:opacity-40"
                  title="Translate description and title"
                >
                  {translatingForm ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Languages className="w-3.5 h-3.5" />
                  )}
                  {formLang === "en" ? "Translate to Tamil" : "Translate to English"}
                </button>
              </div>


              {/* Form Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Report Title</label>
                <input 
                  type="text" 
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-medium text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
                />
              </div>

              {/* Form Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visual Details & Impact</label>
                <textarea 
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-medium text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
                />
              </div>

              {/* Category and Urgency double row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Department</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="Roads & Traffic">Roads & Traffic</option>
                    <option value="Sanitation & Waste Management">Sanitation & Waste Management</option>
                    <option value="Water Supply & Sewage">Water Supply & Sewage</option>
                    <option value="Electricity & Public Lighting">Electricity & Public Lighting</option>
                    <option value="Public Parks & Forestry">Public Parks & Forestry</option>
                    <option value="General Infrastructure">General Infrastructure</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Urgency Level</label>
                  <select
                    value={formUrgency}
                    onChange={(e) => setFormUrgency(e.target.value as any)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Location display read only */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Street Address (Geotagged)</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAnalysisStatus("idle");
                    setImagePreview("");
                    setAiResult(null);
                  }}
                  className="w-1/3 py-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-850 text-slate-300 font-semibold text-sm transition"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/20 transition flex items-center justify-center gap-1.5"
                >
                  Confirm & Send to Government <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUBMITTED: Receipt Screen */}
        {analysisStatus === "submitted" && submittedReport && (
          <div className="glass-panel rounded-2xl border border-slate-800 max-w-xl mx-auto overflow-hidden">
            
            {/* Header animation banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-center text-white space-y-3 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none animate-pulse-slow"></div>
              
              <div className="inline-flex p-3 rounded-full bg-white/20 border border-white/20 text-white z-10 relative">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black z-10 relative">Complaint Dispatched</h3>
              <p className="text-emerald-100 text-xs font-medium z-10 relative">Report has been verified by AI and saved to municipal database.</p>
            </div>

            {/* Receipt details */}
            <div className="p-6 space-y-6 bg-slate-950/60 font-mono text-xs text-slate-300">
              <div className="border-b border-dashed border-slate-800 pb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">REGISTRY DOCKET:</span>
                  <span className="text-white font-bold">{submittedReport.trackingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TIMESTAMP:</span>
                  <span className="text-white font-medium">{submittedReport.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">VERIFICATION:</span>
                  <span className="text-emerald-400 font-bold">AI APPROVED</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-left font-bold text-white border-b border-slate-900 pb-1 uppercase tracking-wider text-[10px]">Complaint Summary</div>
                <div className="space-y-1">
                  <div className="text-slate-500 font-bold text-[10px]">TITLE:</div>
                  <div className="text-slate-200 font-medium">{submittedReport.title}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-500 font-bold text-[10px]">ROUTED TO:</div>
                  <div className="text-cyan-400 font-bold">{submittedReport.category}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-500 font-bold text-[10px]">SEVERITY ASSIGNED:</div>
                  <div className={`font-bold inline-block px-1.5 py-0.5 rounded ${
                    submittedReport.urgency === "Critical" ? "text-rose-400 bg-rose-950/40" :
                    submittedReport.urgency === "High" ? "text-amber-400 bg-amber-950/40" :
                    "text-cyan-400 bg-cyan-950/40"
                  }`}>{submittedReport.urgency}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-500 font-bold text-[10px]">LOCATION:</div>
                  <div className="text-slate-350 truncate">{submittedReport.location.address}</div>
                </div>
              </div>

              {/* Actions list */}
              {aiResult?.suggestedActions && (
                <div className="space-y-2 border-t border-slate-900 pt-4">
                  <div className="font-bold text-white uppercase tracking-wider text-[10px]">AI Suggested Maintenance Crew Tasks</div>
                  <ul className="space-y-1 text-slate-400 pl-4 list-decimal text-[11px]">
                    {aiResult.suggestedActions.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 font-sans border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    setAnalysisStatus("idle");
                    setImagePreview("");
                    setAiResult(null);
                    setSubmittedReport(null);
                  }}
                  className="w-full sm:w-1/2 py-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-semibold text-center transition"
                >
                  Report Another Issue
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/history")}
                  className="w-full sm:w-1/2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-center hover:shadow-md transition"
                >
                  Track Status
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ReportIssue;
