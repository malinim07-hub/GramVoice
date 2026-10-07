// src/services/gemini.ts

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
   HELPERS
   ========================================================= */

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));


const getGeminiApiKey = (): string => {
  const localKey = localStorage.getItem("gv_gemini_key");

  const envKey = import.meta.env.VITE_GEMINI_API_KEY;

  return (localKey || envKey || "").trim();
};


/*
 * Models are tried one by one.
 */
const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash",
];


/* =========================================================
   GEMINI API CALL
   ========================================================= */

const callGemini = async (
  promptText: string,
  imageBase64: string,
  imageMimeType: string
): Promise<GeminiAnalysisResult> => {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error("Gemini API key is missing.");
  }

  /*
   * Remove the Base64 data URL prefix.
   *
   * Example:
   *
   * data:image/jpeg;base64,XXXXXXXX
   *
   * becomes:
   *
   * XXXXXXXX
   */
  const base64Data = imageBase64.replace(
    /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
    ""
  );

  let lastError = "";

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`Trying Gemini model: ${model}`);

      const url =
        `https://generativelanguage.googleapis.com/v1beta/models/` +
        `${model}:generateContent`;

      const response = await fetch(url, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          /*
           * Gemini API key
           */
          "x-goog-api-key": apiKey,
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptText,
                },
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
      });

      /*
       * If Gemini returns an error,
       * capture the complete error response.
       */
      if (!response.ok) {
        const errorText = await response.text();

        lastError =
          `Model ${model} failed with ${response.status}: ${errorText}`;

        console.error(lastError);

        continue;
      }

      const data = await response.json();

      console.log(`Gemini model succeeded: ${model}`);

      const responseText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        throw new Error(
          `Gemini returned an empty response from model ${model}.`
        );
      }

      /*
       * Remove markdown code fences if Gemini returns them.
       */
      const cleanJson = responseText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const result = JSON.parse(cleanJson);

      return {
        isValidCivicIssue:
          result.isValidCivicIssue === true,

        rejectionReason:
          result.rejectionReason || undefined,

        title:
          result.title || "Civic Issue Detected",

        description:
          result.description ||
          "Civic issue detected from the image.",

        category:
          result.category || "Other",

        urgency:
          ["Low", "Medium", "High", "Critical"].includes(
            result.urgency
          )
            ? result.urgency
            : "Medium",

        suggestedActions:
          Array.isArray(result.suggestedActions)
            ? result.suggestedActions
            : [],
      };
    } catch (error) {
      lastError =
        error instanceof Error
          ? error.message
          : String(error);

      console.error(
        `Gemini request failed for ${model}:`,
        error
      );

      continue;
    }
  }

  throw new Error(
    `All Gemini models failed. Last error: ${lastError}`
  );
};


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

  const apiKey = getGeminiApiKey();

  /*
   * -------------------------------------------------------
   * NO API KEY
   * -------------------------------------------------------
   */

  if (!apiKey) {
    console.warn(
      "Gemini API key not configured. Using simulation mode."
    );

    await delay(2500);

    const keys = Object.keys(DEMO_ISSUES);

    const randomKey =
      keys[Math.floor(Math.random() * keys.length)];

    const demoResult = {
      ...DEMO_ISSUES[randomKey],
    };

    return {
      isValidCivicIssue:
        demoResult.isValidCivicIssue,

      rejectionReason:
        demoResult.rejectionReason,

      title:
        `[Simulated] ${demoResult.title}`,

      description:
        `[Simulation Fallback] This is a simulated AI analysis ` +
        `because no live Gemini API key was configured.\n\n` +
        `${demoResult.description}`,

      category:
        demoResult.category,

      urgency:
        demoResult.urgency,

      suggestedActions:
        demoResult.suggestedActions,
    };
  }

  /* =======================================================
     LIVE GEMINI PROMPT
     ======================================================= */

  const promptText = `
You are an AI assistant helping a municipal civic issue reporting system.

Analyze the uploaded image as a municipal inspector.

Your task is to determine whether the image contains a genuine
public/civic infrastructure issue that should be reported to
a government or local authority.

Possible civic issues include:

- potholes
- damaged roads
- garbage accumulation
- broken streetlights
- water leakage
- drainage problems
- public safety infrastructure problems
- other public infrastructure problems

Do NOT invent details that are not visible in the image.

Return ONLY valid JSON.

The JSON must have exactly this structure:

{
  "isValidCivicIssue": true,
  "rejectionReason": null,
  "title": "Short issue title",
  "description": "Clear description of what is visible",
  "category": "Roads & Traffic",
  "urgency": "Low",
  "suggestedActions": [
    "Action 1",
    "Action 2"
  ]
}

Allowed category values:

- Roads & Traffic
- Sanitation & Waste Management
- Electricity & Public Lighting
- Water Supply
- Drainage
- Public Safety
- Other

Allowed urgency values:

- Low
- Medium
- High
- Critical

Rules:

1. Only mark isValidCivicIssue true when a real civic/public issue
   is visible in the image.

2. If the image is unrelated to civic infrastructure, set:
   "isValidCivicIssue": false

3. If the issue is invalid, provide a short rejectionReason.

4. Do not identify private individuals.

5. Do not make medical or legal conclusions.

6. Base the analysis primarily on visible evidence.

7. Give practical actions that a municipal department could take.

8. Keep the title short and clear.

9. Keep the description factual.

10. Return JSON only.
    No markdown.
    No explanation outside JSON.

Location context:

Latitude: ${latitude ?? "Not available"}

Longitude: ${longitude ?? "Not available"}
`;

  try {
    const result = await callGemini(
      promptText,
      imageBase64,
      imageMimeType
    );

    console.log(
      "Live Gemini analysis result:",
      result
    );

    return result;

  } catch (error) {

    /*
     * Keep fallback behavior so the application
     * doesn't completely break if Gemini fails.
     */

    console.error(
      "Gemini API call failed. Falling back to simulation:",
      error
    );

    await delay(1500);

    const fallback = {
      ...DEMO_ISSUES.pothole,
    };

    return {
      isValidCivicIssue: true,

      title:
        "[Auto-recovered] Potholes and Asphalt Crack Detected",

      description:
        "[Fallback Simulation due to Gemini API error] " +
        fallback.description,

      category:
        fallback.category,

      urgency:
        fallback.urgency,

      suggestedActions:
        fallback.suggestedActions,
    };
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

  const apiKey = getGeminiApiKey();

  /*
   * -------------------------------------------------------
   * NO API KEY
   * -------------------------------------------------------
   */

  if (!apiKey) {
    console.warn(
      "Gemini API key not available for translation."
    );

    return text;
  }

  /*
   * -------------------------------------------------------
   * TRANSLATION PROMPT
   * -------------------------------------------------------
   */

  const prompt = `
Translate the following civic issue text from ${sourceLanguage}
to ${targetLanguage}.

Requirements:

- Preserve the original meaning.
- Use simple language that ordinary citizens can understand.
- Do not add new information.
- Do not remove important information.
- Return only the translated text.

Text:

${text}
`;

  /*
   * -------------------------------------------------------
   * GEMINI TRANSLATION
   * -------------------------------------------------------
   */

  for (const model of GEMINI_MODELS) {
    try {
      console.log(
        `Trying Gemini translation model: ${model}`
      );

      const url =
        `https://generativelanguage.googleapis.com/v1beta/models/` +
        `${model}:generateContent`;

      const response = await fetch(url, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],

          generationConfig: {
            temperature: 0.2,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          `Translation failed using ${model}:`,
          errorText
        );

        continue;
      }

      const data = await response.json();

      const translatedText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (translatedText) {
        return translatedText.trim();
      }

    } catch (error) {

      console.error(
        `Translation error using ${model}:`,
        error
      );
    }
  }

  /*
   * If every Gemini model fails,
   * return the original text.
   */
  return text;
};