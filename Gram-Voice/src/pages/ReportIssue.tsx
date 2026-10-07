import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  MapPin,
  Sparkles,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Languages,
} from "lucide-react";

import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  analyzeCivicIssue,
  DEMO_ISSUES,
  translateText,
} from "../services/gemini";

import type { GeminiAnalysisResult } from "../services/gemini";
import type { CivicReport } from "./Dashboard";

import api from "../services/api";
import { createReport } from "../services/reportService";

const ReportIssue = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  // =========================================================
  // GPS STATES
  // =========================================================

  const [gpsLoading, setGpsLoading] = useState(false);

  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [address, setAddress] = useState<string>("");

  // =========================================================
  // IMAGE STATES
  // =========================================================

  const [imagePreview, setImagePreview] = useState<string>("");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // =========================================================
  // UI FLOW STATES
  // =========================================================

  const [analysisStatus, setAnalysisStatus] = useState<
    "idle" | "capturing_gps" | "analyzing_ai" | "form_editing" | "submitted"
  >("idle");

  const [loadingStep, setLoadingStep] = useState<string>("");

  const [aiError, setAiError] = useState<string>("");

  // =========================================================
  // AI + FORM STATES
  // =========================================================

  const [aiResult, setAiResult] =
    useState<GeminiAnalysisResult | null>(null);

  const [formTitle, setFormTitle] = useState("");

  const [formDescription, setFormDescription] = useState("");

  const [formCategory, setFormCategory] = useState("");

  const [formUrgency, setFormUrgency] = useState<
    "Low" | "Medium" | "High" | "Critical"
  >("Medium");

  const [submittedReport, setSubmittedReport] =
    useState<CivicReport | null>(null);

  // =========================================================
  // TRANSLATION STATES
  // =========================================================

  const [translatingForm, setTranslatingForm] = useState(false);

  const [formLang, setFormLang] = useState<"en" | "ta">("en");

  // =========================================================
  // AUTH REDIRECT
  // =========================================================

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // =========================================================
  // GET LOCATION WHEN USER LOGS IN
  // =========================================================

  useEffect(() => {
    if (user) {
      fetchLocation();
    }
  }, [user]);

  // =========================================================
  // GPS FUNCTION
  // =========================================================

  const fetchLocation = () => {
    setGpsLoading(true);

    if (!navigator.geolocation) {
      setGpsLoading(false);
      setAiError(
        t("gpsNotSupported")
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setCoords({
          latitude,
          longitude,
        });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                "User-Agent": "GramVoice-Civic-App",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();

            setAddress(
              data.display_name ||
                `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            );
          } else {
            setAddress(
              `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            );
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error);

          setAddress(
            `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          );
        } finally {
          setGpsLoading(false);
        }
      },

      (error) => {
        console.error("GPS access error:", error);

        setGpsLoading(false);

        setAiError(
          t("locationAccessError")
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  // =========================================================
  // FILE CHANGE
  // =========================================================

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Validate image type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setAiError(
        t("invalidImageType")
      );
      return;
    }

    // Validate size - 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setAiError(t("imageTooLarge"));
      return;
    }

    setAiError("");

    processFile(file);
  };

  // =========================================================
  // PROCESS IMAGE
  // =========================================================

  const processFile = (file: File) => {
    setSelectedImage(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = reader.result as string;

      setImagePreview(base64);

      triggerAIAnalysis(
        base64,
        file.type,
        null
      );
    };

    reader.readAsDataURL(file);
  };

  // =========================================================
  // DEMO SELECT
  // =========================================================

  const handleDemoSelect = (demoKey: string) => {
    const demo = DEMO_ISSUES[demoKey];

    if (!demo) {
      return;
    }

    setImagePreview(demo.imagePath);

    setAnalysisStatus("analyzing_ai");

    triggerAIAnalysis(
      "",
      "",
      demoKey
    );
  };

  // =========================================================
  // AI ANALYSIS
  // =========================================================

  const triggerAIAnalysis = async (
    b64: string,
    mime: string,
    demoKey: string | null
  ) => {
    setAnalysisStatus("analyzing_ai");

    setAiError("");

    const steps = [
      "Acquiring Geotag & GPS Signal...",
      "Uploading Image to Gemini AI Core...",
      "Analyzing Visual Evidence & Civic Authenticity...",
      "Determining Department & Escalation Grade...",
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

      // =====================================================
      // AI REJECTED IMAGE
      // =====================================================

      if (!result.isValidCivicIssue) {
        setAiError(
          result.rejectionReason ||
            t("invalidCivicIssue")
        );

        setAnalysisStatus("idle");

        return;
      }

      // =====================================================
      // AI ACCEPTED IMAGE
      // =====================================================

      setFormTitle(result.title);

      setFormDescription(result.description);

      setFormCategory(
        normalizeCategory(result.category)
      );

      setFormUrgency(result.urgency);

      setAnalysisStatus("form_editing");
    } catch (error) {
      clearInterval(stepInterval);

      console.error("AI analysis error:", error);

      setAiError(
        t("aiConnectionFailed")
      );

      setAnalysisStatus("idle");
    } finally {
      clearInterval(stepInterval);

      setLoadingStep("");
    }
  };

  // =========================================================
  // NORMALIZE AI CATEGORY
  // =========================================================
  //
  // Backend supports:
  //
  // Roads & Traffic
  // Sanitation & Waste Management
  // Electricity & Public Lighting
  // Water Supply
  // Drainage
  // Public Safety
  // Other
  //
  // =========================================================

  const normalizeCategory = (
    category: string
  ): string => {
    const value = category.toLowerCase().trim();

    if (
      value.includes("road") ||
      value.includes("traffic") ||
      value.includes("pothole")
    ) {
      return "Roads & Traffic";
    }

    if (
      value.includes("garbage") ||
      value.includes("waste") ||
      value.includes("sanitation")
    ) {
      return "Sanitation & Waste Management";
    }

    if (
      value.includes("electric") ||
      value.includes("streetlight") ||
      value.includes("street light") ||
      value.includes("lighting")
    ) {
      return "Electricity & Public Lighting";
    }

    if (
      value.includes("water") ||
      value.includes("pipeline") ||
      value.includes("pipe")
    ) {
      return "Water Supply";
    }

    if (
      value.includes("drain") ||
      value.includes("sewage") ||
      value.includes("sewer")
    ) {
      return "Drainage";
    }

    if (
      value.includes("safety") ||
      value.includes("danger")
    ) {
      return "Public Safety";
    }

    return "Other";
  };

  const categoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      "Roads & Traffic": t("roadsTraffic"),
      "Sanitation & Waste Management": t("sanitationWaste"),
      "Electricity & Public Lighting": t("electricityLighting"),
      "Water Supply": t("waterSupply"),
      "Drainage": t("drainage"),
      "Public Safety": t("publicSafety"),
      Other: t("other"),
    };
    return labels[category] || category;
  };

  

  // =========================================================
  // TRANSLATE FORM
  // =========================================================

  const handleTranslateForm = async () => {
    if (!formTitle || !formDescription) {
      return;
    }

    setTranslatingForm(true);

    try {
      const nextLang =
        formLang === "en"
          ? "ta"
          : "en";

      const translatedTitle =
        await translateText(
          formTitle,
          formLang,
          nextLang
        );

      const translatedDescription =
        await translateText(
          formDescription,
          formLang,
          nextLang
        );

      setFormTitle(translatedTitle);

      setFormDescription(
        translatedDescription
      );

      setFormLang(nextLang);
    } catch (error) {
      console.error(
        "Translation failed:",
        error
      );
    } finally {
      setTranslatingForm(false);
    }
  };

  // =========================================================
  // SUBMIT REPORT
  // =========================================================

  const handleSubmitReport = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!selectedImage) {
      alert(
        t("selectImageBeforeSubmit")
      );

      return;
    }

    if (!coords) {
      alert(
        t("locationRequired")
      );

      return;
    }

    if (!formTitle.trim()) {
      alert(t("reportTitleRequired"));

      return;
    }

    if (!formDescription.trim()) {
      alert(t("reportDescriptionRequired"));

      return;
    }

    if (!formCategory) {
      alert(t("departmentRequired"));

      return;
    }

    try {
      // =====================================================
      // STEP 1 - UPLOAD IMAGE
      // =====================================================

      setLoadingStep(
        t("uploadingImage")
      );

      const uploadFormData =
        new FormData();

      uploadFormData.append(
        "image",
        selectedImage
      );

      const uploadResponse =
        await api.post(
          "/uploads/image",
          uploadFormData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      const imageUrl =
        uploadResponse.data.imageUrl;

      console.log(
        "Image uploaded:",
        imageUrl
      );

      // =====================================================
      // STEP 2 - GENERATE TRACKING ID
      // =====================================================

      setLoadingStep(
        t("creatingComplaint")
      );

      const randomSuffix =
        Math.floor(
          1000 +
            Math.random() * 9000
        );

      const trackingId =
        `GV-2026-${randomSuffix}`;

      // =====================================================
      // STEP 3 - PREPARE AI DATA
      // =====================================================

      const aiAnalysis = {
        isValid:
          aiResult?.isValidCivicIssue ??
          true,

        confidence:
          null,

        suggestedActions:
          aiResult?.suggestedActions ??
          [],
      };

      // =====================================================
      // STEP 4 - SAVE REPORT TO MONGODB
      // =====================================================

      setLoadingStep(
        t("savingComplaint")
      );

      const reportResponse =
        await createReport({
          trackingId,

          imageUrl,

          title:
            formTitle.trim(),

          description:
            formDescription.trim(),

          category:
            normalizeCategory(
              formCategory
            ),

          urgency:
            formUrgency,

          location: {
            latitude:
              coords.latitude,

            longitude:
              coords.longitude,

            address:
              address ||
              `${coords.latitude.toFixed(
                4
              )}, ${coords.longitude.toFixed(
                4
              )}`,
          },

          department:
            normalizeCategory(
              formCategory
            ),

          aiAnalysis,
        });

      console.log(
        "Report saved:",
        reportResponse.data
      );

      // =====================================================
      // STEP 5 - CREATE RECEIPT DATA
      // =====================================================

      const timestamp =
        new Date().toLocaleString(
          "en-US",
          {
            month: "long",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }
        );

      const reportId =
        reportResponse.data?.report?._id ||
        `rep-${Date.now()}`;

      const newReport:
        CivicReport = {
          id: reportId,

          title:
            formTitle.trim(),

          description:
            formDescription.trim(),

          category:
            normalizeCategory(
              formCategory
            ),

          urgency:
            formUrgency,

          location: {
            latitude:
              coords.latitude,

            longitude:
              coords.longitude,

            address:
              address ||
              `${coords.latitude.toFixed(
                4
              )}, ${coords.longitude.toFixed(
                4
              )}`,
          },

          imagePath:
            `http://localhost:5000${imageUrl}`,

          status:
            "Submitted",

          createdAt:
            timestamp,

          trackingId,

          history: [
            {
              status:
                "Submitted",

              timestamp,

              note:
                t("reportVerifiedHistory"),
            },
          ],
        };

      // =====================================================
      // STEP 6 - SHOW SUCCESS SCREEN
      // =====================================================

      setSubmittedReport(
        newReport
      );

      setAnalysisStatus(
        "submitted"
      );

      setLoadingStep("");
    } catch (error: any) {
      console.error(
        "Report submission error:",
        error
      );

      setLoadingStep("");

      const message =
        error?.response?.data?.message ||
        t("submitFailed");

      alert(message);
    }
  };

  // =========================================================
  // LOADING / AUTH CHECK
  // =========================================================

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="text-center space-y-2">

          <h2 className="text-3xl font-extrabold text-white">
            {t("citizenReportPortal")}
          </h2>

          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {t("reportPortalDescription")}
            {t("reportPortalAiLine")}
            {t("reportPortalFillLine")}
          </p>

        </div>

        {/* ================================================= */}
        {/* GPS STATUS */}
        {/* ================================================= */}

        <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-900">

          <div className="flex items-center gap-3">

            <div
              className={`p-2 rounded-lg ${
                gpsLoading
                  ? "text-cyan-400 animate-spin"
                  : "text-emerald-400 bg-emerald-950/20"
              }`}
            >
              {gpsLoading ? (
                <RefreshCw className="w-5 h-5" />
              ) : (
                <MapPin className="w-5 h-5" />
              )}
            </div>

            <div className="text-left">

              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {t("deviceGpsLocation")}
              </div>

              <div className="text-slate-200 text-sm font-medium truncate max-w-lg">
                {gpsLoading
                  ? t("acquiringLocation")
                  : address ||
                    t("waitingForCoordinates")}
              </div>

            </div>

          </div>

          <button
            type="button"
            onClick={fetchLocation}
            disabled={gpsLoading}
            className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition duration-200"
          >
            {t("refetchGps")}
          </button>

        </div>

        {/* ================================================= */}
        {/* AI ERROR */}
        {/* ================================================= */}

        {aiError && (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/20 flex gap-3 text-rose-300 text-sm">

            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />

            <div className="space-y-1">

              <div className="font-bold">
                {t("verificationError")}
              </div>

              <div>
                {aiError}
              </div>

            </div>

          </div>
        )}

        {/* ================================================= */}
        {/* IDLE - UPLOAD */}
        {/* ================================================= */}

        {analysisStatus === "idle" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="md:col-span-2">

              <label className="flex flex-col items-center justify-center h-80 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 hover:border-cyan-500/30 cursor-pointer transition duration-300 p-6 group">

                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  capture="environment"
                  onChange={
                    handleFileChange
                  }
                  className="hidden"
                />

                <div className="space-y-4 text-center">

                  <div className="inline-flex p-4 rounded-2xl bg-cyan-950/30 text-cyan-400 group-hover:scale-110 transition duration-300 border border-cyan-500/10">

                    <Camera className="w-10 h-10" />

                  </div>

                  <div>

                    <span className="text-slate-200 font-bold text-lg block">
                      {t("snapOrUploadPhoto")}
                    </span>

                    <span className="text-slate-500 text-sm block mt-1">
                      {t("takeOrSelectPhotoLine1")}
                      {t("takeOrSelectPhotoLine2")}
                    </span>

                  </div>

                  <div className="text-xs text-cyan-500 font-semibold bg-cyan-950/40 border border-cyan-500/20 px-3 py-1 rounded-full inline-block">
                    {t("maximum5MB")}
                  </div>

                </div>

              </label>

            </div>

            {/* DEMO CASES */}

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">

              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                {t("presentationDemoCases")}
              </h3>

              <p className="text-xs text-slate-500">
                {t("sampleCaseLine1")}
                {t("sampleCaseLine2")}
              </p>

              <div className="space-y-2.5">

                {[
                  {
                    key: "pothole",
                    label: t("highwayPothole"),
                  },
                  {
                    key: "garbage",
                    label: t("overflowingGarbage"),
                  },
                  {
                    key: "streetlight",
                    label: t("brokenStreetlight"),
                  },
                  {
                    key: "waterleak",
                    label: t("waterPipelineLeak"),
                  },
                ].map((demo) => (

                  <button
                    key={demo.key}
                    type="button"
                    onClick={() =>
                      handleDemoSelect(
                        demo.key
                      )
                    }
                    className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-900/30 hover:bg-slate-800 transition flex items-center justify-between text-xs font-semibold text-slate-300 group"
                  >

                    <span>
                      {demo.label}
                    </span>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 group-hover:text-white transition" />

                  </button>

                ))}

              </div>

            </div>

          </div>
        )}

        {/* ================================================= */}
        {/* AI PROCESSING */}
        {/* ================================================= */}

        {analysisStatus === "analyzing_ai" && (

          <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center flex flex-col items-center justify-center min-h-[350px] space-y-6">

            <div className="relative">

              <div className="w-16 h-16 border-4 border-cyan-500/10 border-t-cyan-400 rounded-full animate-spin"></div>

              <Sparkles className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />

            </div>

            <div className="space-y-2">

              <h3 className="text-lg font-bold text-white">
                {t("processingReport")}
              </h3>

              <p className="text-slate-400 text-sm font-medium animate-pulse">
                {loadingStep}
              </p>

            </div>

            <p className="text-xs text-slate-500 max-w-sm">
              {t("aiAnalyzingLine1")}
              {t("aiAnalyzingLine2")}
              {t("aiAnalyzingLine3")}
            </p>

          </div>

        )}

        {/* ================================================= */}
        {/* FORM EDITING */}
        {/* ================================================= */}

        {analysisStatus === "form_editing" && (

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* IMAGE */}

            <div className="space-y-6">

              <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">

                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">

                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">

                    <Camera className="w-4 h-4 text-cyan-400" />

                    {t("evidencePhoto")}

                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 flex items-center gap-1">

                    <CheckCircle className="w-3 h-3" />

                    {t("aiVerifiedIssue")}

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

                    <span className="text-slate-300 text-xs truncate font-medium">
                      {address}
                    </span>

                  </div>

                </div>

              </div>

              {/* AI DETAILS */}

              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">

                <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  {t("aiVerification")}
                </h4>

                <div className="space-y-2">

                  <div className="flex justify-between text-slate-400">

                    <span>
                      {t("verification")}
                    </span>

                    <span className="text-emerald-400 font-bold">
                      {t("passed")}
                    </span>

                  </div>

                  <div className="flex justify-between text-slate-400">

                    <span>
                      {t("department")}
                    </span>

                    <span className="text-cyan-400 font-bold">
                      {categoryLabel(formCategory)}
                    </span>

                  </div>

                  <div className="flex justify-between text-slate-400">

                    <span>
                      {t("gps")}
                    </span>

                    <span className="text-indigo-400 font-bold">
                      {t("linked")}
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSubmitReport
              }
              className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6"
            >

              <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                <div>

                  <h3 className="text-lg font-bold text-white flex items-center gap-2">

                    <Sparkles className="w-4 h-4 text-cyan-400" />

                    {t("aiPrefilledDocket")}

                  </h3>

                  <p className="text-xs text-slate-500 mt-0.5">
                    {t("reviewAiLine1")}
                    {t("reviewAiLine2")}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    handleTranslateForm
                  }
                  disabled={
                    translatingForm ||
                    !formTitle ||
                    !formDescription
                  }
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-bold text-cyan-400 transition disabled:opacity-40"
                >

                  {translatingForm ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Languages className="w-3.5 h-3.5" />
                  )}

                  {formLang === "en"
                    ? t("translateToTamil")
                    : t("translateToEnglish")}

                </button>

              </div>

              {/* TITLE */}

              <div className="space-y-1.5">

                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t("reportTitle")}
                </label>

                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) =>
                    setFormTitle(
                      e.target.value
                    )
                  }
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-medium text-sm focus:outline-none focus:border-cyan-500/50"
                />

              </div>

              {/* DESCRIPTION */}

              <div className="space-y-1.5">

                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t("visualDetailsImpact")}
                </label>

                <textarea
                  value={
                    formDescription
                  }
                  onChange={(e) =>
                    setFormDescription(
                      e.target.value
                    )
                  }
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-medium text-sm focus:outline-none focus:border-cyan-500/50"
                />

              </div>

              {/* CATEGORY + URGENCY */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="space-y-1.5">

                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t("assignedDepartment")}
                  </label>

                  <select
                    value={
                      formCategory
                    }
                    onChange={(e) =>
                      setFormCategory(
                        e.target.value
                      )
                    }
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500/50"
                  >

                    <option value="Roads & Traffic">
                      {t("roadsTraffic")}
                    </option>

                    <option value="Sanitation & Waste Management">
                      {t("sanitationWaste")}
                    </option>

                    <option value="Electricity & Public Lighting">
                      {t("electricityLighting")}
                    </option>

                    <option value="Water Supply">
                      {t("waterSupply")}
                    </option>

                    <option value="Drainage">
                      {t("drainage")}
                    </option>

                    <option value="Public Safety">
                      {t("publicSafety")}
                    </option>

                    <option value="Other">
                      {t("other")}
                    </option>

                  </select>

                </div>

                <div className="space-y-1.5">

                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t("urgencyLevel")}
                  </label>

                  <select
                    value={
                      formUrgency
                    }
                    onChange={(e) =>
                      setFormUrgency(
                        e.target.value as
                          | "Low"
                          | "Medium"
                          | "High"
                          | "Critical"
                      )
                    }
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500/50"
                  >

                    <option value="Low">
                      {t("low")}
                    </option>

                    <option value="Medium">
                      {t("medium")}
                    </option>

                    <option value="High">
                      {t("high")}
                    </option>

                    <option value="Critical">
                      {t("critical")}
                    </option>

                  </select>

                </div>

              </div>

              {/* LOCATION */}

              <div className="space-y-1.5">

                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t("streetAddressGeotagged")}
                </label>

                <input
                  type="text"
                  value={address}
                  readOnly
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs focus:outline-none"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex gap-4 pt-2">

                <button
                  type="button"
                  onClick={() => {
                    setAnalysisStatus(
                      "idle"
                    );

                    setImagePreview("");

                    setSelectedImage(
                      null
                    );

                    setAiResult(null);

                    setAiError("");

                    setFormTitle("");

                    setFormDescription(
                      ""
                    );

                    setFormCategory("");

                    setFormUrgency(
                      "Medium"
                    );
                  }}
                  className="w-1/3 py-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition"
                >
                  {t("discard")}
                </button>

                <button
                  type="submit"
                  className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-sm hover:shadow-lg transition flex items-center justify-center gap-1.5"
                >

                  {t("confirmAndSend")}

                  <ArrowRight className="w-4 h-4" />

                </button>

              </div>

            </form>

          </div>
        )}

        {/* ================================================= */}
        {/* SUBMITTED */}
        {/* ================================================= */}

        {analysisStatus === "submitted" &&
          submittedReport && (

            <div className="glass-panel rounded-2xl border border-slate-800 max-w-xl mx-auto overflow-hidden">

              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-center text-white space-y-3">

                <div className="inline-flex p-3 rounded-full bg-white/20 border border-white/20">

                  <CheckCircle className="w-10 h-10" />

                </div>

                <h3 className="text-2xl font-black">
                  {t("complaintDispatched")}
                </h3>

                <p className="text-emerald-100 text-xs font-medium">
                  {t("reportSavedLine1")}
                  {t("reportSavedLine2")}
                  {t("reportSavedLine3")}
                </p>

              </div>

              <div className="p-6 space-y-6 bg-slate-950/60 font-mono text-xs text-slate-300">

                <div className="border-b border-dashed border-slate-800 pb-4 space-y-2">

                  <div className="flex justify-between">

                    <span className="text-slate-500">
                      {t("registryDocket")}
                    </span>

                    <span className="text-white font-bold">
                      {
                        submittedReport.trackingId
                      }
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-slate-500">
                      {t("timestamp")}
                    </span>

                    <span className="text-white font-medium">
                      {
                        submittedReport.createdAt
                      }
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-slate-500">
                      {t("verificationLabel")}
                    </span>

                    <span className="text-emerald-400 font-bold">
                      {t("aiVerified")}
                    </span>

                  </div>

                </div>

                <div className="space-y-3">

                  <div className="text-left font-bold text-white border-b border-slate-900 pb-1 uppercase tracking-wider text-[10px]">
                    {t("complaintSummary")}
                  </div>

                  <div className="space-y-1">

                    <div className="text-slate-500 font-bold text-[10px]">
                      {t("titleLabel")}
                    </div>

                    <div className="text-slate-200 font-medium">
                      {
                        submittedReport.title
                      }
                    </div>

                  </div>

                  <div className="space-y-1">

                    <div className="text-slate-500 font-bold text-[10px]">
                      {t("routedTo")}
                    </div>

                    <div className="text-cyan-400 font-bold">
                      {
                        submittedReport.category
                      }
                    </div>

                  </div>

                  <div className="space-y-1">

                    <div className="text-slate-500 font-bold text-[10px]">
                      {t("severity")}
                    </div>

                    <div className="text-cyan-400 font-bold">
                      {
                        submittedReport.urgency
                      }
                    </div>

                  </div>

                  <div className="space-y-1">

                    <div className="text-slate-500 font-bold text-[10px]">
                      {t("locationLabel")}
                    </div>

                    <div className="text-slate-300 truncate">
                      {
                        submittedReport
                          .location
                          .address
                      }
                    </div>

                  </div>

                </div>

                {/* AI ACTIONS */}

                {aiResult?.suggestedActions &&
                  aiResult.suggestedActions
                    .length > 0 && (

                    <div className="space-y-2 border-t border-slate-900 pt-4">

                      <div className="font-bold text-white uppercase tracking-wider text-[10px]">
                        {t("aiSuggestedTasks")}
                      </div>

                      <ul className="space-y-1 text-slate-400 pl-4 list-decimal text-[11px]">

                        {aiResult.suggestedActions.map(
                          (
                            action,
                            index
                          ) => (
                            <li
                              key={index}
                            >
                              {action}
                            </li>
                          )
                        )}

                      </ul>

                    </div>

                  )}

                {/* ACTION BUTTONS */}

                <div className="flex flex-col sm:flex-row gap-3 pt-6 font-sans border-t border-slate-900">

                  <button
                    type="button"
                    onClick={() => {

                      setAnalysisStatus(
                        "idle"
                      );

                      setImagePreview("");

                      setSelectedImage(
                        null
                      );

                      setAiResult(null);

                      setSubmittedReport(
                        null
                      );

                      setAiError("");

                      setFormTitle("");

                      setFormDescription(
                        ""
                      );

                      setFormCategory("");

                      setFormUrgency(
                        "Medium"
                      );

                    }}
                    className="w-full sm:w-1/2 py-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-semibold text-center transition"
                  >
                    {t("reportAnotherIssue")}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/history"
                      )
                    }
                    className="w-full sm:w-1/2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-center hover:shadow-md transition"
                  >
                    {t("trackStatus")}
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