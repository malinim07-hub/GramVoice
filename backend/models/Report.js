const mongoose = require("mongoose");

const reportHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "Submitted",
        "Assigned",
        "In Progress",
        "Resolved",
        "Rejected",
      ],
      required: true,
    },

    note: {
      type: String,
      default: "",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const reportSchema = new mongoose.Schema(
  {
    // Unique tracking number shown to the citizen
    trackingId: {
      type: String,
      required: true,
      unique: true,
    },

    // Citizen who submitted the complaint
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Uploaded image
    imageUrl: {
      type: String,
      required: true,
    },

    // AI-generated / user-confirmed information
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Roads & Traffic",
        "Sanitation & Waste Management",
        "Electricity & Public Lighting",
        "Water Supply",
        "Drainage",
        "Public Safety",
        "Other",
      ],
    },

    urgency: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    // GPS location
    location: {
      latitude: {
        type: Number,
        required: true,
      },

      longitude: {
        type: Number,
        required: true,
      },

      address: {
        type: String,
        default: "",
      },
    },

    // Department responsible for the issue
    department: {
      type: String,
      default: "",
    },

    // Officer assigned to handle the complaint
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Current complaint status
    status: {
      type: String,
      enum: [
        "Submitted",
        "Assigned",
        "In Progress",
        "Resolved",
        "Rejected",
      ],
      default: "Submitted",
    },

    // AI information
    aiAnalysis: {
      isValid: {
        type: Boolean,
        default: true,
      },

      confidence: {
        type: Number,
        default: null,
      },

      suggestedActions: {
        type: [String],
        default: [],
      },
    },

    // Officer's additional comments
    officerRemarks: {
      type: String,
      default: "",
    },

    // Complete status history
    history: {
      type: [reportHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", reportSchema);