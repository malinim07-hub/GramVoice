const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["citizen", "officer", "admin"],
      default: "citizen",
    },

    district: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    preferredLanguage: {
      type: String,
      enum: ["en", "ta"],
      default: "en",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);