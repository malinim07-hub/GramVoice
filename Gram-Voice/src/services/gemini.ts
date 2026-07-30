export interface GeminiAnalysisResult {
  isValidCivicIssue: boolean;
  rejectionReason?: string;
  title: string;
  description: string;
  category: string;
  urgency: "Low" | "Medium" | "High" | "Critical";
  suggestedActions: string[];
}

// Pre-defined sample simulations for a smooth offline presentation demo
export const DEMO_ISSUES: Record<string, GeminiAnalysisResult & { imageName: string; imagePath: string }> = {
  pothole: {
    isValidCivicIssue: true,
    title: "Severe Road Damage & Deep Potholes",
    description: "Multiple large, deep potholes observed in the middle of a two-lane asphalt road. The damage poses a high risk to motorcyclists and can cause severe vehicle alignment issues. Water is starting to accumulate in the depressions, which will accelerate further road erosion.",
    category: "Roads & Traffic",
    urgency: "High",
    suggestedActions: [
      "Fill potholes immediately with cold mix asphalt patch.",
      "Place safety traffic cones or warning barriers around the area.",
      "Schedule complete road resurfacing for this section."
    ],
    imageName: "pothole.jpg",
    imagePath: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80"
  },
  garbage: {
    isValidCivicIssue: true,
    title: "Overflowing Public Garbage Dump",
    description: "A large municipal garbage bin is overflowing onto the public pavement and road. Piles of plastic wastes, household garbage, and organic wastes are scattered around, producing a strong foul odor and attracting stray dogs and flies, posing a severe public health hazard.",
    category: "Sanitation & Waste Management",
    urgency: "Critical",
    suggestedActions: [
      "Deploy sanitation trucks to clear the accumulated garbage immediately.",
      "Disinfect the area using bleaching powder or lime spray.",
      "Increase garbage collection frequency in this locality."
    ],
    imageName: "garbage.jpg",
    imagePath: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80"
  },
  streetlight: {
    isValidCivicIssue: true,
    title: "Non-Functional Streetlights in Residential Lane",
    description: "Two consecutive public streetlights are completely burned out, leaving a stretch of approximately 100 meters in absolute darkness. Residents report feeling unsafe walking at night, and there is an increased risk of petty crimes or pedestrians tripping on uneven sidewalks.",
    category: "Electricity & Public Lighting",
    urgency: "Medium",
    suggestedActions: [
      "Replace burnt-out sodium bulbs with new energy-efficient LED bulbs.",
      "Inspect the local wiring and distributor switchbox for circuit failures.",
      "Update municipal lighting logs for routine inspection."
    ],
    imageName: "streetlight.jpg",
    imagePath: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80"
  },
  waterleak: {
    isValidCivicIssue: true,
    title: "Major Water Main Pipe Leakage",
    description: "Clean potable water is gushing out from a ruptured underground pipe joint, flooding the sidewalk and forming large pools on the adjacent street. Hundreds of liters of water are being wasted every hour, and the surrounding ground is getting waterlogged, which could compromise road foundations.",
    category: "Water Supply & Sewage",
    urgency: "Critical",
    suggestedActions: [
      "Isolate the local water pipeline section to stop the flow.",
      "Excavate and repair the cracked pipe joint or valve.",
      "Restore water pressure and monitor for pressure drops."
    ],
    imageName: "waterleak.jpg",
    imagePath: "https://images.unsplash.com/photo-1542013936693-8848e5742383?auto=format&fit=crop&w=600&q=80"
  }
};

/**
 * Analyzes a civic issue image using Gemini multimodal REST API.
 * Falls back to simulation mode if no API key is provided, or if the API call fails.
 */
export async function analyzeCivicIssue(
  imageBase64: string,
  imageMimeType: string,
  latitude?: number,
  longitude?: number,
  demoKey?: string
): Promise<GeminiAnalysisResult> {
  const apiKey = localStorage.getItem("gv_gemini_key") || import.meta.env.VITE_GEMINI_API_KEY || "";
  
  // 1. If we are matching a demo preset, return it directly to speed up the presentation
  if (demoKey && DEMO_ISSUES[demoKey]) {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate realistic network delay
    return DEMO_ISSUES[demoKey];
  }

  // 2. If no API key is available, run simulation mode for custom uploads
  if (!apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate thinking delay
    
    // Heuristic: pick a random civic issue since we cannot analyze without a key
    const keys = Object.keys(DEMO_ISSUES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const result = { ...DEMO_ISSUES[randomKey] };
    result.title = `[Simulated] ${result.title}`;
    result.description = `[Simulation Fallback] This is a simulated AI analysis of your image because no live API key was configured. Set up your Gemini API Key in the Profile tab.\n\nDescription: ${result.description}`;
    return result;
  }

  try {
    const promptText = `
You are an expert AI municipal inspector assisting a local government. Analyze the attached image of a reported issue in a public space.
Your job is to:
1. Verify if the image shows a valid public/civic issue that a local government/municipality is responsible for (e.g. pothole, garbage dump, broken streetlight, water pipe leak, damaged sidewalk, public property vandalism, open manhole, fallen tree blocking road, etc.).
2. If the image is a selfie, meme, document, indoor private room, or unrelated to public infrastructure/sanitation, set "isValidCivicIssue" to false and explain why in "rejectionReason".
3. If it is a valid issue:
   - Provide a concise, official "title".
   - Provide a detailed "description" of the issue, including its potential risks and impacts.
   - Categorize the issue into one of these standard departments: "Roads & Traffic", "Sanitation & Waste Management", "Water Supply & Sewage", "Electricity & Public Lighting", "Public Parks & Forestry", or "General Infrastructure".
   - Grade the "urgency" level as "Low", "Medium", "High", or "Critical".
   - List 3 immediate "suggestedActions" for the maintenance crew.

Respond ONLY with a valid JSON object matching the following structure:
{
  "isValidCivicIssue": true,
  "rejectionReason": null,
  "title": "Clear issue title",
  "description": "Detailed description of the issue.",
  "category": "Department Name",
  "urgency": "Low/Medium/High/Critical",
  "suggestedActions": ["action 1", "action 2", "action 3"]
}

Contextual Location (if available): Lat ${latitude ?? "unknown"}, Lon ${longitude ?? "unknown"}.
`;

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                {
                  inlineData: {
                    mimeType: imageMimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText} (${response.status})`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini model.");
    }

    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const result: GeminiAnalysisResult = JSON.parse(cleanJson);
    return result;
  } catch (error) {
    console.error("Gemini API call failed, falling back to simulation:", error);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const result = { ...DEMO_ISSUES.pothole };
    result.title = `[Auto-recovered] Potholes and Asphalt Crack Detected`;
    result.description = `[Fall-back Simulation due to connection/API error] ${result.description}`;
    return result;
  }
}

/**
 * Translates text between languages using Gemini API.
 * Falls back to simple mock prefixing if offline or no key is present.
 */
export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const apiKey = localStorage.getItem("gv_gemini_key") || import.meta.env.VITE_GEMINI_API_KEY || "";

  if (!text.trim()) return "";

  if (!apiKey) {
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.responseData?.translatedText) {
          // If translation is successful, return it
          return data.responseData.translatedText;
        }
      }
    } catch (e) {
      console.warn("MyMemory translation fallback failed:", e);
    }

    // Hardcode some simple mock outputs for UI testing when offline and fetch fails
    const nameMap: Record<string, string> = {
      en: "English",
      ta: "Tamil",
      es: "Spanish",
      fr: "French",
      de: "German",
      ja: "Japanese",
      zh: "Chinese",
      hi: "Hindi"
    };

    const targetName = nameMap[targetLang] || targetLang;

    const lowerText = text.trim().toLowerCase().replace(/[?.,!]/g, "");
    if (lowerText === "severe road damage & deep potholes" && targetLang === "ta") {
      return "கடுமையான சாலை சேதம் மற்றும் ஆழமான பள்ளங்கள்";
    }
    if (lowerText === "overflowing public garbage dump" && targetLang === "ta") {
      return "அளவுக்கு அதிகமாக நிரம்பி வழியும் பொது குப்பை தொட்டி";
    }
    if (lowerText === "non-functional streetlights in residential lane" && targetLang === "ta") {
      return "குடியிருப்பு தெருவில் எரியாத தெரு விளக்குகள்";
    }
    if (lowerText === "major water main pipe leakage" && targetLang === "ta") {
      return "முக்கிய குடிநீர் குழாயில் பெரும் கசிவு";
    }

    if (targetLang === "ta") {
      return `[தமிழ்] ${text}`;
    }
    if (targetLang === "en") {
      // Remove mock Tamil tags if translating back
      return text.replace(/^\[தமிழ்\]\s*/, "").replace(/\s*\(மொழிபெயர்க்கப்பட்டது\)/, "");
    }
    return `[Translated to ${targetName}] ${text}`;
  }


  try {
    const sourceName = sourceLang === "ta" ? "Tamil" : sourceLang === "en" ? "English" : sourceLang;
    const targetName = targetLang === "ta" ? "Tamil" : targetLang === "en" ? "English" : targetLang;

    const promptText = `
You are a professional translator. Translate the following text from ${sourceName} to ${targetName}.
Provide a natural, accurate, and grammatically correct translation.
If translating to Tamil, use clear and readable Tamil characters (தமிழ்).
Maintain the original meaning and tone.
Return ONLY the translated text. Do not include any explanations, introduction, markdown quotes, or notes.

Text to translate:
"${text}"
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini translation API status error: ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!translatedText) {
      throw new Error("Empty response from translation model.");
    }

    return translatedText.trim();
  } catch (error) {
    console.error("Gemini translateText failed:", error);
    if (targetLang === "ta") {
      return `[தமிழ்] ${text} (Offline)`;
    }
    return `[Translation Fallback] ${text}`;
  }
}

