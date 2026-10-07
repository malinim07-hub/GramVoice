const express = require("express");

const router = express.Router();

const {
  createReport,
  getMyReports,
  getReportById,
  getGovernmentReports,
  getOfficers,
  assignReportOfficer,
  updateReportStatus,
} = require("../controllers/reportController");

const authMiddleware = require("../middleware/authMiddleware");

// ==========================================
// CITIZEN REPORT ROUTES
// ==========================================

// Create a new report
router.post(
  "/",
  authMiddleware,
  createReport
);

// Get reports created by logged-in citizen
router.get(
  "/my",
  authMiddleware,
  getMyReports
);

// ==========================================
// GOVERNMENT PORTAL ROUTES
// ==========================================

// Get all reports for government portal
router.get(
  "/government",
  authMiddleware,
  getGovernmentReports
);

// Get all active officers
// Admin only — authorization is checked inside controller
router.get(
  "/officers",
  authMiddleware,
  getOfficers
);

// Assign a report to an officer
// Admin only — authorization is checked inside controller
router.put(
  "/:id/assign",
  authMiddleware,
  assignReportOfficer
);

// Update report status
router.put(
  "/:id/status",
  authMiddleware,
  updateReportStatus
);

// ==========================================
// SINGLE REPORT
// ==========================================

// Get one report
router.get(
  "/:id",
  authMiddleware,
  getReportById
);

module.exports = router;