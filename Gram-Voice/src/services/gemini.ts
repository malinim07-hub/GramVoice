// src/services/gemini.ts

import api from "./api";

export interface GeminiAnalysisResult {
  isValidCivicIssue: boolean;
  rejectionReason?: string;
  title: string;
  description: string;
  category: string;
  urgency: "Low" | "Medium" | "High" | "Critical";
  suggestedActions: string[];
}

/* =========================================================
   DEMO DATA
   ========================================================= */

export const DEMO_ISSUES: Record<
  string,
  GeminiAnalysisResult & {
    imageName: string;
    imagePath: string;
  }
> = {
  pothole: {
    imageName: "Pothole / Road Damage",
    imagePath: "/demo/pothole.jpg",
    isValidCivicIssue: true,
    title: "Severe Road Damage and Deep Potholes",
    description:
      "Multiple potholes and damaged asphalt are visible on the road. " +
      "The damaged surface may create a safety risk for two-wheelers, " +
      "cars and pedestrians.",
    category: "Roads & Traffic",
    urgency: "High",
    suggestedActions: [
      "Inspect the damaged road section",
      "Repair or fill the potholes",
      "Check surrounding road surface for further damage",
      "Place temporary warning signs if required",
    ],
  },

  garbage: {
    imageName: "Garbage Accumulation",
    imagePath: "/demo/garbage.jpg",
    isValidCivicIssue: true,
    title: "Garbage Accumulation in Public Area",
    description:
      "A significant amount of waste is visible in the reported area. " +
      "The waste accumulation may create hygiene and environmental concerns.",
    category: "Sanitation & Waste Management",
    urgency: "Medium",
    suggestedActions: [
      "Remove the accumulated waste",
      "Clean and sanitize the surrounding area",
      "Inspect whether a regular waste collection schedule is available",
      "Provide or improve waste collection facilities if required",
    ],
  },

  streetlight: {
    imageName: "Broken Streetlight",
    imagePath: "/demo/streetlight.jpg",
    isValidCivicIssue: true,
    title: "Damaged Streetlight",
    description:
      "The image shows a damaged streetlight with visible issues around " +
      "the lighting fixture. This may reduce visibility during nighttime.",
    category: "Electricity & Public Lighting",
    urgency: "Medium",
    suggestedActions: [
      "Inspect the streetlight and electrical connection",
      "Repair or replace the damaged lighting fixture",
      "Check nearby streetlights for similar issues",
      "Restore proper nighttime illumination",
    ],
  },

  waterleak: {
    imageName: "Water Leakage",
    imagePath: "/demo/waterleak.jpg",
    isValidCivicIssue: true,
    title: "Water Leakage from Public Pipeline",
    description:
      "Visible water leakage is present in the reported location. " +
      "Continuous leakage may result in water wastage and damage to the road.",
    category: "Water Supply",
    urgency: "High",
    suggestedActions: [
      "Inspect the nearby water pipeline",
      "Identify and repair the leakage",
      "Check whether the surrounding road has been damaged",
      "Restore normal water flow",
    ],
  },
};

/* =========================================================
   DELAY HELPER
   ========================================================= */

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* =========================================================
   CIVIC ISSUE ANALYSIS
   ========================================================= */

export const analyzeCivicIssue = async (
  imageBase64: string,
  imageMimeType: string,
  latitude?: number,
  longitude?: number,
  demoKey?: string
): Promise<GeminiAnalysisResult> => {
  /*
   * -------------------------------------------------------
   * DEMO MODE
   * -------------------------------------------------------
   */

  if (demoKey && DEMO_ISSUES[demoKey]) {
    await delay(1500);

    return DEMO_ISSUES[demoKey];
  }

  /*
   * -------------------------------------------------------
   * LIVE GEMINI THROUGH BACKEND
   * -------------------------------------------------------
   */

  try {
    const response = await api.post("/ai/analyze", {
      imageBase64,
      imageMimeType,
      latitude,
      longitude,
    });

    /*
     * Backend response:
     *
     * {
     *   success: true,
     *   result: {...}
     * }
     *
     * So we return only result.
     */

    if (!response.data?.success || !response.data?.result) {
      throw new Error("Invalid AI response from backend");
    }

    return response.data.result;
  } catch (error) {
    console.error(
      "Gemini backend analysis failed:",
      error
    );

    /*
     * IMPORTANT:
     * Do NOT create a fake pothole result.
     *
     * If Gemini fails, stop the analysis and
     * let the UI show the actual error.
     */

    throw new Error(
      "AI analysis failed. Please try again."
    );
  }
};

/* =========================================================
   TEXT TRANSLATION
   ========================================================= */

export const translateText = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> => {
  /*
   * If both languages are the same,
   * no translation is required.
   */

  if (sourceLanguage === targetLanguage) {
    return text;
  }

  try {
    const response = await api.post("/ai/translate", {
      text,
      sourceLanguage,
      targetLanguage,
    });

    return response.data.translatedText;
  } catch (error) {
    console.error(
      "Gemini translation backend failed:",
      error
    );

    return text;
  }
};