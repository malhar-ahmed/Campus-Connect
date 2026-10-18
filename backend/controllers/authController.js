const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      studentId,
      faculty,
      password,
    } = req.body;

    if (
      !name ||
      !email ||
      !studentId ||
      !faculty ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { studentId: studentId.toUpperCase() },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or student ID is already registered",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      studentId,
      faculty,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        faculty: user.faculty,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while registering user",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        faculty: user.faculty,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while logging in",
    });
  }
};

const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      studentId: req.user.studentId,
      faculty: req.user.faculty,
      role: req.user.role,
      isActive: req.user.isActive,
      createdAt: req.user.createdAt,
    },
  });
};

const createFirstAdmin = async (req, res) => {
  try {
    const existingAdmin = await User.findOne({
      role: "admin",
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin account already exists",
      });
    }

    const {
      name,
      email,
      studentId,
      faculty,
      password,
    } = req.body;

    if (
      !name ||
      !email ||
      !studentId ||
      !faculty ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { studentId: studentId.toUpperCase() },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or student ID is already registered",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name,
      email,
      studentId,
      faculty,
      password: hashedPassword,
      role: "admin",
    });

    return res.status(201).json({
      success: true,
      message: "First admin account created successfully",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        studentId: admin.studentId,
        faculty: admin.faculty,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating admin account",
    });
  }
};

const resetPassword = async (req, res) => {
  // Email and student ID are public identifiers, not proof of account ownership.
  // Keep recovery disabled until single-use, expiring email tokens are supported.
  return res.status(403).json({
    success: false,
    message: "Password recovery is currently unavailable. Contact a campus administrator for help.",
  });
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  //createFirstAdmin,
  resetPassword,
};
