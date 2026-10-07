const Report = require("../models/Report");
const User = require("../models/User");

// CREATE REPORT
const createReport = async (req, res) => {
  try {
    const {
      trackingId,
      imageUrl,
      title,
      description,
      category,
      urgency,
      location,
      department,
      aiAnalysis,
    } = req.body;

    // Validate required fields
    if (
      !trackingId ||
      !imageUrl ||
      !title ||
      !description ||
      !category ||
      !location
    ) {
      return res.status(400).json({
        message: "Required report information is missing",
      });
    }

    // Create report
    const report = await Report.create({
      trackingId,
      citizen: req.user.id,

      imageUrl,

      title,
      description,
      category,
      urgency: urgency || "Medium",

      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || "",
      },

      department: department || "",

      aiAnalysis: {
        isValid:
          aiAnalysis?.isValid !== undefined
            ? aiAnalysis.isValid
            : true,

        confidence:
          aiAnalysis?.confidence !== undefined
            ? aiAnalysis.confidence
            : null,

        suggestedActions:
          aiAnalysis?.suggestedActions || [],
      },

      status: "Submitted",

      history: [
        {
          status: "Submitted",
          note: "Report submitted by citizen",
          updatedBy: req.user.id,
          timestamp: new Date(),
        },
      ],
    });

    // Return created report
    const populatedReport = await Report.findById(
      report._id
    ).populate(
      "citizen",
      "name email phone"
    );

    res.status(201).json({
      message: "Report created successfully",
      report: populatedReport,
    });
  } catch (error) {
    console.error("Create Report Error:", error);

    res.status(500).json({
      message: "Server error while creating report",
    });
  }
};

// GET MY REPORTS
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({
      citizen: req.user.id,
    })
      .populate(
        "assignedOfficer",
        "name email department"
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      reports,
    });
  } catch (error) {
    console.error("Get My Reports Error:", error);

    res.status(500).json({
      message: "Server error while fetching reports",
    });
  }
};

// GET SINGLE REPORT
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(
      req.params.id
    )
      .populate(
        "citizen",
        "name email phone"
      )
      .populate(
        "assignedOfficer",
        "name email department"
      );

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    // Citizen can only view their own report
    if (
      req.user.role === "citizen" &&
      report.citizen._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You are not allowed to view this report",
      });
    }

    res.json({
      report,
    });
  } catch (error) {
    console.error("Get Report Error:", error);

    res.status(500).json({
      message: "Server error while fetching report",
    });
  }
};

// ==========================================
// GOVERNMENT PORTAL
// ==========================================

// GET ALL REPORTS FOR GOVERNMENT
// GET REPORTS FOR GOVERNMENT
const getGovernmentReports = async (req, res) => {
  try {
    // Only officers and admins can access
    if (
      req.user.role !== "admin" &&
      req.user.role !== "officer"
    ) {
      return res.status(403).json({
        message: "You are not allowed to access the government portal",
      });
    }

    // Admin sees all reports
    // Officer sees only reports assigned to them
    const query =
      req.user.role === "officer"
        ? { assignedOfficer: req.user.id }
        : {};

    const reports = await Report.find(query)
      .populate(
        "citizen",
        "name email phone district"
      )
      .populate(
        "assignedOfficer",
        "name email department district"
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      reports,
    });
  } catch (error) {
    console.error(
      "Get Government Reports Error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching government reports",
    });
  }
};


// GET ALL ACTIVE OFFICERS
const getOfficers = async (req, res) => {
  try {
    // Only admins can get officer list
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can access the officer list",
      });
    }

    const officers = await User.find({
      role: "officer",
      isActive: true,
    }).select(
      "name email department district phone"
    );

    res.json({
      officers,
    });
  } catch (error) {
    console.error(
      "Get Officers Error:",
      error
    );

    res.status(500).json({
      message: "Server error while fetching officers",
    });
  }
};


// ASSIGN REPORT TO OFFICER
const assignReportOfficer = async (req, res) => {
  try {
    // Only admins can assign officers
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can assign officers",
      });
    }

    const { officerId } = req.body;

    if (!officerId) {
      return res.status(400).json({
        message: "Officer ID is required",
      });
    }

    // Check officer exists and is active
    const officer = await User.findOne({
      _id: officerId,
      role: "officer",
      isActive: true,
    });

    if (!officer) {
      return res.status(404).json({
        message: "Active officer not found",
      });
    }

    // Find complaint
    const report = await Report.findById(
      req.params.id
    );

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    // Assign officer
    report.assignedOfficer = officer._id;

    // Assignment changes status to Assigned
    report.status = "Assigned";

    // Add assignment to history
    report.history.push({
      status: "Assigned",
      note: `Complaint assigned to ${officer.name}`,
      updatedBy: req.user.id,
      timestamp: new Date(),
    });

    await report.save();

    // Return updated report
    const updatedReport = await Report.findById(
      report._id
    )
      .populate(
        "citizen",
        "name email phone district"
      )
      .populate(
        "assignedOfficer",
        "name email department district"
      );

    res.json({
      message: "Officer assigned successfully",
      report: updatedReport,
    });
  } catch (error) {
    console.error(
      "Assign Officer Error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while assigning officer",
    });
  }
};

// UPDATE REPORT STATUS
const updateReportStatus = async (req, res) => {
  try {
    // Only officers and admins can update
    if (
      req.user.role !== "admin" &&
      req.user.role !== "officer"
    ) {
      return res.status(403).json({
        message: "You are not allowed to update reports",
      });
    }

    const { status, officerRemarks } = req.body;

    const allowedStatuses = [
      "Submitted",
      "Assigned",
      "In Progress",
      "Resolved",
      "Rejected",
    ];

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid report status",
      });
    }

    const report = await Report.findById(
      req.params.id
    );

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    // Officer can update only reports assigned to them
if (
  req.user.role === "officer" &&
  (!report.assignedOfficer ||
    report.assignedOfficer.toString() !== req.user.id)
) {
  return res.status(403).json({
    message:
      "You can only update reports assigned to you",
  });
}

    // Update status
    report.status = status;

    // Update officer remarks if provided
    if (officerRemarks !== undefined) {
      report.officerRemarks = officerRemarks;
    }


    // Add status history
    report.history.push({
      status,
      note:
        officerRemarks ||
        `Report status changed to ${status}`,
      updatedBy: req.user.id,
      timestamp: new Date(),
    });

    await report.save();

    // Return updated report
    const updatedReport = await Report.findById(
      report._id
    )
      .populate(
        "citizen",
        "name email phone district"
      )
      .populate(
        "assignedOfficer",
        "name email department district"
      );

    res.json({
      message: "Report updated successfully",
      report: updatedReport,
    });
  } catch (error) {
    console.error(
      "Update Report Status Error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while updating report",
    });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getReportById,
  getGovernmentReports,
  getOfficers,
  assignReportOfficer,
  updateReportStatus,
};