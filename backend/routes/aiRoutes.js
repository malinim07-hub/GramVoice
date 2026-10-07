const express = require("express");

const {
  analyzeIssue,
} = require("../controllers/aiController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/analyze",
  authMiddleware,
  analyzeIssue
);

module.exports = router;