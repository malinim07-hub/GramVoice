const {
  analyzeCivicIssue,
} = require("../services/geminiService");

const analyzeIssue = async (req, res) => {
  try {
    const {
      imageBase64,
      imageMimeType,
      latitude,
      longitude,
    } = req.body;

    if (!imageBase64 || !imageMimeType) {
      return res.status(400).json({
        message: "Image data is required",
      });
    }

    const result = await analyzeCivicIssue(
      imageBase64,
      imageMimeType,
      latitude,
      longitude
    );

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("AI Analysis Error:", error);

    res.status(500).json({
      success: false,
      message: "AI analysis failed",
    });
  }
};

module.exports = {
  analyzeIssue,
};