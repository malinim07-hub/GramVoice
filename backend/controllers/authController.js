const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      preferredLanguage,
    } = req.body;

    // Check required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "Name, email, phone and password are required",
      });
    }

    // Validate phone number
    const cleanedPhone = phone.replace(/\D/g, "");

    if (
      cleanedPhone.length !== 10 ||
      !/^[6-9]/.test(cleanedPhone)
    ) {
      return res.status(400).json({
        message: "Please enter a valid 10-digit mobile number",
      });
    }

    // Validate preferred language
    const language =
      preferredLanguage === "ta" ? "ta" : "en";

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,

      // Public signup users are citizens
      role: "citizen",

      district: "",
      department: "",

      // Save phone number from signup
      phone: cleanedPhone,

      // Save preferred language from signup
      preferredLanguage: language,
    });

    res.status(201).json({
      message: "User registered successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        department: user.department,
        phone: user.phone,
        preferredLanguage: user.preferredLanguage,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    res.status(500).json({
      message: "Server error during registration",
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check active status
    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        department: user.department,
        phone: user.phone,
        preferredLanguage: user.preferredLanguage,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      message: "Server error during login",
    });
  }
};

// PROFILE
const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user,
    });
  } catch (error) {
    console.error("Profile Error:", error);

    res.status(500).json({
      message: "Server error while fetching profile",
    });
  }
};

module.exports = {
  register,
  login,
  profile,
};