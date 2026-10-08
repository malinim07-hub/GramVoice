const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

// Primary model first, fallback model second
const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
];

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const analyzeCivicIssue = async (
  imageBase64,
  imageMimeType,
  latitude,
  longitude
) => {
  /*
   * Remove Base64 data URL prefix if frontend sends:
   *
   * data:image/jpeg;base64,XXXXXX
   *
   * Gemini needs only:
   *
   * XXXXXX
   */

  const cleanBase64 = imageBase64
    .replace(
      /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
      ""
    )
    .replace(/\s/g, "");

  if (!cleanBase64) {
    throw new Error(
      "Invalid or empty image Base64 data"
    );
  }

  const prompt = `
You are an AI assistant helping a municipal civic issue reporting system.

Analyze the uploaded image as a municipal inspector.

Determine whether the image contains a genuine public/civic infrastructure issue.

Possible issues include:
- potholes
- damaged roads
- garbage accumulation
- broken streetlights
- water leakage
- drainage problems
- public safety infrastructure problems
- other public infrastructure problems

Do NOT invent details that are not visible.

Return ONLY valid JSON.

Required structure:

{
  "isValidCivicIssue": true,
  "rejectionReason": null,
  "title": "Short issue title",
  "description": "Clear factual description",
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
1. Only mark isValidCivicIssue true when a real civic issue is visible.
2. If unrelated to civic infrastructure, set isValidCivicIssue false.
3. Provide rejectionReason when invalid.
4. Do not identify private individuals.
5. Base the analysis primarily on visible evidence.
6. Give practical municipal actions.
7. Keep title short.
8. Keep description factual.
9. Return JSON only.

Location:
Latitude: ${latitude ?? "Not available"}
Longitude: ${longitude ?? "Not available"}
`;

  let lastError;

  for (const modelName of GEMINI_MODELS) {
    // Retry each model up to 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(
          `Trying Gemini model: ${modelName} | Attempt: ${attempt}`
        );

        const model = genAI.getGenerativeModel({
          model: modelName,
        });

        const result = await model.generateContent([
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: imageMimeType,
              data: cleanBase64,
            },
          },
        ]);

        const response = result.response;
        const text = response.text();

        console.log("Gemini raw response:", text);

        const cleanJson = text
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

        const parsed = JSON.parse(cleanJson);

        return {
          isValidCivicIssue:
            parsed.isValidCivicIssue === true,

          rejectionReason:
            parsed.rejectionReason || undefined,

          title:
            parsed.title ||
            "Civic Issue Detected",

          description:
            parsed.description ||
            "Civic issue detected from the image.",

          category:
            parsed.category || "Other",

          urgency: [
            "Low",
            "Medium",
            "High",
            "Critical",
          ].includes(parsed.urgency)
            ? parsed.urgency
            : "Medium",

          suggestedActions:
            Array.isArray(
              parsed.suggestedActions
            )
              ? parsed.suggestedActions
              : [],
        };
      } catch (error) {
        lastError = error;

        console.error(
          `Gemini model ${modelName} failed on attempt ${attempt}:`,
          error.message
        );

        /*
         * Retry only temporary server/capacity errors.
         *
         * 503 = model temporarily unavailable
         * 429 = rate limit / temporary capacity issue
         */

        const isTemporaryError =
          error.message.includes("503") ||
          error.message.includes("429") ||
          error.message
            .toLowerCase()
            .includes("high demand") ||
          error.message
            .toLowerCase()
            .includes("temporarily unavailable");

        if (!isTemporaryError) {
          // Don't waste retries on permanent errors
          break;
        }

        // If this was the final attempt,
        // move to the fallback model.
        if (attempt === 3) {
          console.log(
            `Moving to next Gemini model after ${modelName} failures...`
          );
          break;
        }

        // Exponential backoff:
        // Attempt 1 → wait 2 sec
        // Attempt 2 → wait 4 sec
        const waitTime =
          2000 * Math.pow(2, attempt - 1);

        console.log(
          `Temporary Gemini error. Retrying in ${
            waitTime / 1000
          } seconds...`
        );

        await sleep(waitTime);
      }
    }
  }

  throw new Error(
    `Gemini analysis failed: ${
      lastError?.message || "Unknown error"
    }`
  );
};

module.exports = {
  analyzeCivicIssue,
};